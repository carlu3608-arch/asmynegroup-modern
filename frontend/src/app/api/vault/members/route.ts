import { NextRequest } from "next/server";
import { C, hidden, json, requireApiMember, toPublic, vaultDb, type VaultMember } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const me = await requireApiMember(request);
  if (!me) return hidden();
  const db = await vaultDb();
  const list = await db
    .collection<VaultMember>(C.members)
    .find({ status: "active" }, { projection: { passwordHash: 0, email: 0 } })
    .sort({ name: 1 })
    .limit(500)
    .toArray();
  return json({ members: list.map(toPublic) });
}
