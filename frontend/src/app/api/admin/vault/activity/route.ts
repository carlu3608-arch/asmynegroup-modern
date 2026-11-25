import { NextRequest } from "next/server";
import { C, json, vaultDb } from "@/lib/vault";
import { requireVaultAdmin } from "@/lib/vaultAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!requireVaultAdmin(request)) return json({ error: "No autorizado." }, 401);
  const db = await vaultDb();
  const rows = await db.collection(C.activity).find({}).sort({ at: -1 }).limit(200).toArray();
  const ids = rows.map((r) => r.memberId).filter(Boolean);
  const members = await db.collection(C.members).find({ _id: { $in: ids } }, { projection: { name: 1, email: 1 } }).toArray();
  const byId = new Map(members.map((m) => [String(m._id), m]));
  const [total, active, pending, expelled, posts, messages, openInvites] = await Promise.all([
    db.collection(C.members).countDocuments({}),
    db.collection(C.members).countDocuments({ status: "active" }),
    db.collection(C.members).countDocuments({ status: "pending" }),
    db.collection(C.members).countDocuments({ status: "expelled" }),
    db.collection(C.posts).countDocuments({}),
    db.collection(C.messages).countDocuments({}),
    db.collection(C.invites).countDocuments({ status: "active" }),
  ]);
  return json({
    stats: { total, active, pending, expelled, posts, messages, openInvites },
    activity: rows.map((r) => ({
      id: String(r._id),
      type: r.type,
      at: r.at,
      actor: r.actor || null,
      member: r.memberId ? { name: byId.get(String(r.memberId))?.name || "—", email: byId.get(String(r.memberId))?.email || "" } : null,
      meta: r.meta || {},
    })),
  });
}
