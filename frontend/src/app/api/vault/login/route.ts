import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import {
  C, cleanText, createSession, isSameOrigin, json, logActivity, setSessionCookie, vaultDb, type VaultMember,
} from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Real bcrypt hash of a random value, so unknown emails cost the same time as real ones.
let dummyHash: string | null = null;
function getDummyHash() {
  if (!dummyHash) dummyHash = bcrypt.hashSync(Math.random().toString(36) + Date.now(), 12);
  return dummyHash;
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return json({ error: "Solicitud rechazada." }, 403);
  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`vault-login:${ip}`, 8, 60_000);
  if (!rate.allowed) return json({ error: "Demasiados intentos. Espera un momento." }, 429);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }
  const email = cleanText(body.email, 160).toLowerCase();
  const password = typeof body.password === "string" ? body.password.slice(0, 128) : "";
  if (!email || !password) return json({ error: "Credenciales inválidas." }, 401);

  const perEmail = checkRateLimit(`vault-login-email:${email}`, 10, 15 * 60_000);
  if (!perEmail.allowed) return json({ error: "Demasiados intentos. Espera unos minutos." }, 429);

  let db;
  try {
    db = await vaultDb();
  } catch {
    return json({ error: "Servicio no disponible." }, 503);
  }

  const member = await db.collection<VaultMember>(C.members).findOne({ email });
  const ok = await bcrypt.compare(password, member?.passwordHash || getDummyHash());
  if (!member || !ok) {
    await logActivity(db, "login.failed", { ip });
    return json({ error: "Credenciales inválidas." }, 401);
  }
  if (member.status === "pending") {
    return json({ error: "Tu acceso aún está pendiente de aprobación." }, 403);
  }
  if (member.status !== "active") {
    return json({ error: "Credenciales inválidas." }, 401);
  }

  await db.collection(C.members).updateOne({ _id: member._id }, { $set: { lastLoginAt: new Date() } });
  const token = await createSession(db, member._id);
  await logActivity(db, "login.ok", { memberId: member._id, ip });
  const res = json({ ok: true });
  setSessionCookie(res, token);
  return res;
}
