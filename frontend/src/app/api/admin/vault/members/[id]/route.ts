import { NextRequest } from "next/server";
import { C, isSameOrigin, json, logActivity, parseId, vaultDb } from "@/lib/vault";
import { requireVaultAdmin } from "@/lib/vaultAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = requireVaultAdmin(request);
  if (!admin) return json({ error: "No autorizado." }, 401);
  if (!isSameOrigin(request)) return json({ error: "Solicitud rechazada." }, 403);
  const id = parseId((await ctx.params).id);
  if (!id) return json({ error: "No encontrado." }, 404);
  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }
  const db = await vaultDb();
  const now = new Date();
  let set: Record<string, unknown>;
  if (body.action === "approve" || body.action === "reinstate") set = { status: "active", approvedAt: now };
  else if (body.action === "expel") set = { status: "expelled", expelledAt: now };
  else return json({ error: "Acción no válida." }, 400);

  const r = await db.collection(C.members).updateOne({ _id: id }, { $set: set });
  if (!r.matchedCount) return json({ error: "No encontrado." }, 404);
  if (body.action === "expel") {
    // Kill every live session immediately.
    await db.collection(C.sessions).deleteMany({ memberId: id });
  }
  await logActivity(db, `admin.member.${body.action}`, { memberId: id, actor: admin.email });
  return json({ ok: true });
}
