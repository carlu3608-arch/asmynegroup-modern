import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  return NextResponse.json({ email: admin.email, role: admin.role });
}
