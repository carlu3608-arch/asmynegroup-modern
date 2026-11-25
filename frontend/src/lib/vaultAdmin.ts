import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminAuth";

/** Owner/admin only: relies on the existing admin JWT cookie, never on a vault session. */
export function requireVaultAdmin(request: NextRequest) {
  return verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}
