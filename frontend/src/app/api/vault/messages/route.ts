import { NextRequest } from "next/server";
import { hidden, json, requireApiMember, vaultDb } from "@/lib/vault";
import { listThreads } from "@/lib/vaultData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const me = await requireApiMember(request);
  if (!me) return hidden();
  const db = await vaultDb();
  return json({ threads: await listThreads(db, me._id) });
}
