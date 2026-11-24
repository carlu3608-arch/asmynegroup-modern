import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminAuth";
import { DEFAULT_BRANDING } from "@/lib/cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOC_ID = "branding";

function guard(request: NextRequest) {
  return verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

export async function GET(request: NextRequest) {
  if (!guard(request)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  try {
    const db = await getMongoDb();
    const doc = await db.collection("siteContent").findOne({ _id: DOC_ID as never });
    return NextResponse.json({ branding: { ...DEFAULT_BRANDING, ...(doc?.branding ?? {}) } });
  } catch {
    return NextResponse.json({ branding: DEFAULT_BRANDING, dbUnavailable: true });
  }
}

export async function PUT(request: NextRequest) {
  if (!guard(request)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  let body: { branding?: { siteName?: string; logoUrl?: string } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const branding = {
    siteName: String(body.branding?.siteName ?? DEFAULT_BRANDING.siteName).slice(0, 80) || DEFAULT_BRANDING.siteName,
    logoUrl: String(body.branding?.logoUrl ?? DEFAULT_BRANDING.logoUrl).slice(0, 500) || DEFAULT_BRANDING.logoUrl,
  };
  try {
    const db = await getMongoDb();
    await db.collection("siteContent").updateOne(
      { _id: DOC_ID as never },
      { $set: { branding, updatedAt: new Date() } },
      { upsert: true },
    );
    return NextResponse.json({ ok: true, branding });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: "No se pudo guardar (DB no disponible).", detail }, { status: 503 });
  }
}
