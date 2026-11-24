import { NextRequest, NextResponse } from "next/server";
import { Binary, ObjectId } from "mongodb";
import { getMongoDb } from "@/lib/mongodb";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024; // 4MB
const ALLOWED = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]);

export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let body: { dataUrl?: string; filename?: string; folder?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const dataUrl = body.dataUrl || "";
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\n\r]+)$/);
  if (!match) return NextResponse.json({ error: "Imagen inválida." }, { status: 400 });
  const mimeType = match[1].toLowerCase();
  if (!ALLOWED.has(mimeType)) return NextResponse.json({ error: "Tipo de imagen no permitido." }, { status: 400 });
  const buffer = Buffer.from(match[2].replace(/\s+/g, ""), "base64");
  if (!buffer.length || buffer.length > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen es demasiado grande (máx. 4 MB)." }, { status: 400 });
  }

  try {
    const db = await getMongoDb();
    const doc = {
      mimeType,
      filename: String(body.filename || "upload").slice(0, 120),
      folder: String(body.folder || "cms").slice(0, 40),
      size: buffer.length,
      data: new Binary(buffer),
      createdAt: new Date(),
    };
    const res = await db.collection("uploads").insertOne(doc);
    const url = `/api/media/${res.insertedId.toString()}`;
    return NextResponse.json({ ok: true, url, id: res.insertedId.toString(), mimeType, size: buffer.length });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: "No se pudo guardar la imagen (DB no disponible).", detail }, { status: 503 });
  }
}
