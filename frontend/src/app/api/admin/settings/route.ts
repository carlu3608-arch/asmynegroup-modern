import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminAuth";
import { DEFAULT_MARKETPLACE_URL, sanitizeMarketplaceUrl, clearMarketplaceUrlCache } from "@/lib/marketplaceUrl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SETTINGS_ID = "settings";

const DEFAULT_SETTINGS = {
  siteName: "Asmyne Group",
  contactEmail: "contact@asmyne.com",
  supportPhone: "+1-(809) 308-6370",
  marketplaceUrl: DEFAULT_MARKETPLACE_URL,
  ledaWidget: true,
  social: {
    facebook: "https://www.facebook.com/share/1KGpFstMcy/",
    instagram: "https://www.instagram.com/asmynegroup",
    tiktok: "https://www.tiktok.com/@asmynegroup",
    youtube: "https://www.youtube.com/@asmynegroup",
    whatsapp: "https://whatsapp.com/channel/0029Vb77mjJLtOjIa8b3Bn3x",
  },
  sectionsEnabled: {
    "conseil-migratoire": true,
    "conseil-entrepreneurial": true,
    "hair-solutions": true,
    "yontikonsey-blog": true,
    "agence-voyage": true,
    "reseau-social": true,
    "dating": true,
    "chatbot-intelligent": true,
    "marketplace-global": true,
    "systeme-monetisation": true,
  },
};

function guard(request: NextRequest) {
  return verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

export async function GET(request: NextRequest) {
  if (!guard(request)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  try {
    const db = await getMongoDb();
    const doc = await db.collection("siteContent").findOne({ _id: SETTINGS_ID as never });
    return NextResponse.json({ settings: { ...DEFAULT_SETTINGS, ...(doc?.settings ?? {}) } });
  } catch {
    return NextResponse.json({ settings: DEFAULT_SETTINGS, dbUnavailable: true });
  }
}

export async function PUT(request: NextRequest) {
  if (!guard(request)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  let body: { settings?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const settings = { ...DEFAULT_SETTINGS, ...(body.settings ?? {}) };
  if ("marketplaceUrl" in settings) {
    const clean = sanitizeMarketplaceUrl(settings.marketplaceUrl);
    if (!clean) return NextResponse.json({ error: "URL del marketplace inválida (usa https://...)." }, { status: 400 });
    settings.marketplaceUrl = clean;
  }
  try {
    const db = await getMongoDb();
    await db.collection("siteContent").updateOne(
      { _id: SETTINGS_ID as never },
      { $set: { settings, updatedAt: new Date() } },
      { upsert: true },
    );
    clearMarketplaceUrlCache();
    return NextResponse.json({ ok: true, settings });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: "No se pudo guardar (base de datos no disponible).", detail }, { status: 503 });
  }
}
