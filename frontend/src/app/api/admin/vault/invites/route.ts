import { NextRequest } from "next/server";
import { C, cleanText, generateInviteCode, isSameOrigin, json, logActivity, sha256, vaultDb } from "@/lib/vault";
import { requireVaultAdmin } from "@/lib/vaultAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!requireVaultAdmin(request)) return json({ error: "No autorizado." }, 401);
  const db = await vaultDb();
  const list = await db.collection(C.invites).find({}, { projection: { codeHash: 0 } }).sort({ createdAt: -1 }).limit(500).toArray();
  const usedByIds = list.map((i) => i.usedBy).filter(Boolean);
  const members = await db.collection(C.members).find({ _id: { $in: usedByIds } }, { projection: { name: 1, email: 1 } }).toArray();
  const byId = new Map(members.map((m) => [String(m._id), m]));
  const now = Date.now();
  return json({
    invites: list.map((i) => ({
      id: String(i._id),
      hint: i.hint,
      label: i.label || "",
      autoApprove: !!i.autoApprove,
      status: i.status === "active" && i.expiresAt && new Date(i.expiresAt).getTime() < now ? "expired" : i.status,
      createdAt: i.createdAt,
      expiresAt: i.expiresAt || null,
      usedAt: i.usedAt || null,
      usedBy: i.usedBy ? { name: byId.get(String(i.usedBy))?.name || "", email: byId.get(String(i.usedBy))?.email || "" } : null,
    })),
  });
}

/** Creates a single-use code. The plain code is returned ONCE; only its SHA-256 is stored. */
export async function POST(request: NextRequest) {
  const admin = requireVaultAdmin(request);
  if (!admin) return json({ error: "No autorizado." }, 401);
  if (!isSameOrigin(request)) return json({ error: "Solicitud rechazada." }, 403);
  let body: { label?: string; days?: number; autoApprove?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    /* defaults */
  }
  const days = Math.min(365, Math.max(0, Math.floor(Number(body.days) || 0)));
  const db = await vaultDb();
  const code = generateInviteCode();
  const now = new Date();
  const res = await db.collection(C.invites).insertOne({
    codeHash: sha256(code),
    hint: code.slice(-4),
    label: cleanText(body.label, 80),
    autoApprove: !!body.autoApprove,
    status: "active",
    createdAt: now,
    createdBy: admin.email,
    expiresAt: days ? new Date(now.getTime() + days * 86400_000) : null,
  });
  await logActivity(db, "admin.invite.created", { actor: admin.email, meta: { hint: code.slice(-4) } });
  return json({ ok: true, id: String(res.insertedId), code }, 201);
}
