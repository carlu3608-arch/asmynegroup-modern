import { NextRequest } from "next/server";
import { C, VAULT_COOKIE, clearSessionCookie, isSameOrigin, json, sha256, vaultDb } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return json({ error: "Solicitud rechazada." }, 403);
  const token = request.cookies.get(VAULT_COOKIE)?.value;
  if (token) {
    try {
      const db = await vaultDb();
      await db.collection(C.sessions).deleteOne({ tokenHash: sha256(token) });
    } catch {
      /* ignore */
    }
  }
  const res = json({ ok: true });
  clearSessionCookie(res);
  return res;
}
