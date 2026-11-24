import { NextRequest, NextResponse } from "next/server";
import { ObjectId, Binary } from "mongodb";
import { getMongoDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  let _id: ObjectId;
  try {
    _id = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }
  try {
    const db = await getMongoDb();
    const doc = await db.collection("uploads").findOne({ _id });
    if (!doc || !doc.data) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
    const bin = doc.data as Binary;
    const buffer = Buffer.isBuffer(bin) ? bin : Buffer.from(bin.buffer);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": String(doc.mimeType || "application/octet-stream"),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(buffer.length),
      },
    });
  } catch {
    return NextResponse.json({ error: "No disponible." }, { status: 503 });
  }
}
