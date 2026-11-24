import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminAuth";
import { locales } from "@/i18n/dictionaries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTENT_ID = "site";

function guard(request: NextRequest) {
  return verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

export async function GET(request: NextRequest) {
  if (!guard(request)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  try {
    const db = await getMongoDb();
    const doc = await db.collection("siteContent").findOne({ _id: CONTENT_ID as never });
    return NextResponse.json({
      overrides: doc?.overrides ?? {},
      images: doc?.images ?? {},
    });
  } catch {
    return NextResponse.json({ overrides: {}, images: {}, dbUnavailable: true });
  }
}

export async function PUT(request: NextRequest) {
  if (!guard(request)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  let body: { overrides?: Record<string, Record<string, string>>; images?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const $set: Record<string, unknown> = { updatedAt: new Date() };

  if (body.overrides) {
    const overrides: Record<string, Record<string, string>> = {};
    for (const l of locales) {
      if (body.overrides?.[l] && typeof body.overrides[l] === "object") {
        overrides[l] = {};
        for (const [k, v] of Object.entries(body.overrides[l])) {
          if (typeof v === "string") overrides[l][k] = v;
        }
      }
    }
    $set.overrides = overrides;
  }

  if (body.images) {
    const images: Record<string, string> = {};
    if (typeof body.images === "object") {
      for (const [k, v] of Object.entries(body.images)) {
        if (typeof v === "string" && v.trim()) images[k] = v.trim();
      }
    }
    $set.images = images;
  }

  try {
    const db = await getMongoDb();
    await db.collection("siteContent").updateOne(
      { _id: CONTENT_ID as never },
      { $set },
      { upsert: true },
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: "No se pudo guardar (base de datos no disponible).", detail }, { status: 503 });
  }
}
