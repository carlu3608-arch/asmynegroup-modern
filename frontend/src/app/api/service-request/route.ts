import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public endpoint for contact / service forms to create a service request
// that an admin can then manage from the dashboard.
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`service-req:${ip}`, 6, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Espera un momento." }, { status: 429 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const name = String(body.name ?? "").slice(0, 200).trim();
  const email = String(body.email ?? "").slice(0, 200).trim();
  if (!name || !email) {
    return NextResponse.json({ error: "Nombre y correo son obligatorios." }, { status: 400 });
  }
  const doc = {
    name,
    email,
    phone: String(body.phone ?? "").slice(0, 60),
    service: String(body.service ?? "general").slice(0, 80),
    message: String(body.message ?? "").slice(0, 4000),
    status: "pending",
    source: "web",
    ip,
    createdAt: new Date(),
  };
  try {
    const db = await getMongoDb();
    const res = await db.collection("serviceRequests").insertOne(doc);
    return NextResponse.json({ ok: true, id: res.insertedId.toString() }, { status: 201 });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: "No se pudo registrar tu solicitud ahora mismo.", detail }, { status: 503 });
  }
}
