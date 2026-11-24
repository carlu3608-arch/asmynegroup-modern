import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getMongoDb } from "@/lib/mongodb";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function guard(request: NextRequest) {
  return verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

function toId(id: string) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

const ALLOWED_STATUS = ["pending", "in_progress", "approved", "rejected", "done"];

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!guard(request)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { id } = await context.params;
  const _id = toId(id);
  if (!_id) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

  let body: { status?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (body.status && ALLOWED_STATUS.includes(body.status)) set.status = body.status;
  if (typeof body.note === "string") set.note = body.note.slice(0, 2000);

  try {
    const db = await getMongoDb();
    const res = await db.collection("serviceRequests").updateOne({ _id }, { $set: set });
    if (res.matchedCount === 0) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: "No se pudo actualizar (DB no disponible).", detail }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!guard(request)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { id } = await context.params;
  const _id = toId(id);
  if (!_id) return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  try {
    const db = await getMongoDb();
    const res = await db.collection("serviceRequests").deleteOne({ _id });
    if (res.deletedCount === 0) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: "No se pudo eliminar (DB no disponible).", detail }, { status: 503 });
  }
}
