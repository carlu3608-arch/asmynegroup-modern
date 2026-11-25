import { NextRequest } from "next/server";
import { C, hidden, isSameOrigin, json, logActivity, parseId, requireApiMember, vaultDb } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const me = await requireApiMember(request);
  if (!me) return hidden();
  if (!isSameOrigin(request)) return json({ error: "Solicitud rechazada." }, 403);
  const id = parseId((await ctx.params).id);
  if (!id) return json({ error: "No encontrado." }, 404);
  const db = await vaultDb();
  const r = await db.collection(C.posts).deleteOne({ _id: id, authorId: me._id });
  if (!r.deletedCount) return json({ error: "No encontrado." }, 404);
  await logActivity(db, "post.deleted", { memberId: me._id });
  return json({ ok: true });
}
