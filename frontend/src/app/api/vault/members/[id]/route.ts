import { NextRequest } from "next/server";
import { C, hidden, json, parseId, requireApiMember, toPublic, vaultDb, type VaultMember } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const me = await requireApiMember(request);
  if (!me) return hidden();
  const id = parseId((await ctx.params).id);
  if (!id) return json({ error: "No encontrado." }, 404);
  const db = await vaultDb();
  const m = await db.collection<VaultMember>(C.members).findOne({ _id: id, status: "active" });
  if (!m) return json({ error: "No encontrado." }, 404);
  return json({ member: toPublic(m) });
}
