import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminAuth";
import { defaultServices, ensureServiceShape, mergeServices, slugify, type CmsService } from "@/lib/cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOC_ID = "services";

function guard(request: NextRequest) {
  return verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

async function readServices() {
  try {
    const db = await getMongoDb();
    const doc = await db.collection("siteContent").findOne({ _id: DOC_ID as never });
    return { services: mergeServices(doc?.services as CmsService[] | undefined), dbUnavailable: false };
  } catch {
    return { services: defaultServices(), dbUnavailable: true };
  }
}

export async function GET(request: NextRequest) {
  if (!guard(request)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const data = await readServices();
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  if (!guard(request)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  let body: { services?: CmsService[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  if (!Array.isArray(body.services)) {
    return NextResponse.json({ error: "Se espera un arreglo de servicios." }, { status: 400 });
  }
  const services = body.services.map((s, i) => {
    const shaped = ensureServiceShape(s, i);
    shaped.slug = slugify(shaped.slug || shaped.texts.es.title || `servicio-${i}`);
    shaped.order = i;
    return shaped;
  });
  try {
    const db = await getMongoDb();
    await db.collection("siteContent").updateOne(
      { _id: DOC_ID as never },
      { $set: { services, updatedAt: new Date() } },
      { upsert: true },
    );
    return NextResponse.json({ ok: true, services: mergeServices(services) });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: "No se pudo guardar (DB no disponible).", detail }, { status: 503 });
  }
}
