import { NextRequest } from "next/server";
import { C, isSameOrigin, json, logActivity, parseId, vaultDb } from "@/lib/vault";
import { requireVaultAdmin } from "@/lib/vaultAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Revoke an unused code. */
export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = requireVaultAdmin(request);
  if (!admin) return json({ error: "No autorizado." }, 401);
  if (!isSameOrigin(request)) return json({ error: "Solicitud rechazada." }, 403);
  const id = parseId((await ctx.params).id);
  if (!id) return json({ error: "No encontrado." }, 404);
  const db = await vaultDb();
  const r = await db
    .collection(C.invites)
    .findOneAndUpdate({ _id: id, status: "active" }, { $set: { status: "revoked", revokedAt: new Date(), revokedBy: admin.email } });
  if (!r) return json({ error: "El código no existe o ya no está activo." }, 409);
  await logActivity(db, "admin.invite.revoked", { actor: admin.email, meta: { hint: r.hint } });
  return json({ ok: true });
}
