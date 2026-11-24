import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function guard(request: NextRequest) {
  return verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

// Lists service requests. Pulls from `serviceRequests`, and also surfaces
// marketplace `orders` as read-only context when present.
export async function GET(request: NextRequest) {
  if (!guard(request)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  try {
    const db = await getMongoDb();
    const requests = await db
      .collection("serviceRequests")
      .find({})
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();
    return NextResponse.json({
      requests: requests.map((r) => ({ ...r, _id: r._id?.toString?.() ?? String(r._id) })),
    });
  } catch {
    return NextResponse.json({ requests: [], dbUnavailable: true });
  }
}

// Allows an admin to create a request manually from the dashboard.
export async function POST(request: NextRequest) {
  if (!guard(request)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  try {
    const db = await getMongoDb();
    const doc = {
      name: String(body.name ?? "").slice(0, 200),
      email: String(body.email ?? "").slice(0, 200),
      phone: String(body.phone ?? "").slice(0, 60),
      service: String(body.service ?? "general").slice(0, 80),
      message: String(body.message ?? "").slice(0, 4000),
      status: "pending",
      source: "admin",
      createdAt: new Date(),
    };
    const res = await db.collection("serviceRequests").insertOne(doc);
    return NextResponse.json({ ok: true, id: res.insertedId.toString() });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: "No se pudo crear (DB no disponible).", detail }, { status: 503 });
  }
}
