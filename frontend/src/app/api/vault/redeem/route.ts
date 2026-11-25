import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import {
  C, cleanText, createSession, isSameOrigin, json, logActivity, normalizeInviteCode,
  setSessionCookie, sha256, validEmail, validPassword, vaultDb,
} from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GENERIC = "Código no válido o ya utilizado.";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return json({ error: "Solicitud rechazada." }, 403);
  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`vault-redeem:${ip}`, 5, 10 * 60_000);
  if (!rate.allowed) return json({ error: "Demasiados intentos. Espera unos minutos." }, 429);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }

  const code = normalizeInviteCode(String(body.code ?? ""));
  const email = cleanText(body.email, 160).toLowerCase();
  const name = cleanText(body.name, 80);
  const password = body.password;

  if (!code) return json({ error: GENERIC }, 400);
  if (!validEmail(email)) return json({ error: "Correo no válido." }, 400);
  if (name.length < 2) return json({ error: "Escribe tu nombre." }, 400);
  if (!validPassword(password)) return json({ error: "La contraseña debe tener entre 10 y 128 caracteres." }, 400);

  let db;
  try {
    db = await vaultDb();
  } catch {
    return json({ error: "Servicio no disponible." }, 503);
  }

  const members = db.collection(C.members);
  if (await members.findOne({ email }, { projection: { _id: 1 } })) {
    // Do not burn the code; generic answer to avoid revealing membership.
    return json({ error: "No se pudo completar el registro con esos datos." }, 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();
  const memberId = new ObjectId();

  // Atomic single-use claim: only one request can flip status active -> used.
  const invite = await db.collection(C.invites).findOneAndUpdate(
    {
      codeHash: sha256(code),
      status: "active",
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    },
    { $set: { status: "used", usedAt: now, usedBy: memberId } },
    { returnDocument: "after" },
  );
  if (!invite) {
    await logActivity(db, "invite.rejected", { ip, meta: { reason: "invalid_used_revoked_or_expired" } });
    return json({ error: GENERIC }, 400);
  }

  const status = invite.autoApprove ? "active" : "pending";
  try {
    await members.insertOne({
      _id: memberId,
      email,
      name,
      passwordHash,
      status,
      headline: "",
      company: "",
      city: "",
      bio: "",
      website: "",
      createdAt: now,
      ...(status === "active" ? { approvedAt: now } : {}),
      inviteId: invite._id,
    });
  } catch {
    // Race on the email: give the code back.
    await db.collection(C.invites).updateOne(
      { _id: invite._id, usedBy: memberId },
      { $set: { status: "active" }, $unset: { usedAt: "", usedBy: "" } },
    );
    return json({ error: "No se pudo completar el registro con esos datos." }, 409);
  }

  await logActivity(db, "invite.redeemed", { memberId, ip, meta: { invite: invite.hint, status } });

  if (status !== "active") {
    return json({ ok: true, status: "pending", message: "Invitación aceptada. Tu acceso será aprobado por el administrador." });
  }
  const token = await createSession(db, memberId);
  const res = json({ ok: true, status: "active" });
  setSessionCookie(res, token);
  return res;
}
