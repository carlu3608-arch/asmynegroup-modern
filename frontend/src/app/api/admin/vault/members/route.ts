import { NextRequest } from "next/server";
import { C, json, vaultDb } from "@/lib/vault";
import { requireVaultAdmin } from "@/lib/vaultAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!requireVaultAdmin(request)) return json({ error: "No autorizado." }, 401);
  const db = await vaultDb();
  const list = await db
    .collection(C.members)
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ createdAt: -1 })
    .limit(1000)
    .toArray();
  return json({
    members: list.map((m) => ({
      id: String(m._id),
      email: m.email,
      name: m.name,
      status: m.status,
      headline: m.headline || "",
      createdAt: m.createdAt,
      approvedAt: m.approvedAt || null,
      expelledAt: m.expelledAt || null,
      lastLoginAt: m.lastLoginAt || null,
    })),
  });
}
