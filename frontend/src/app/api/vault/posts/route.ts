import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  C, POST_KINDS, cleanText, hidden, isSameOrigin, json, logActivity, requireApiMember, vaultDb, type PostKind,
} from "@/lib/vault";
import { listPosts } from "@/lib/vaultData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const me = await requireApiMember(request);
  if (!me) return hidden();
  const kind = request.nextUrl.searchParams.get("kind");
  const db = await vaultDb();
  const posts = await listPosts(db, me._id, POST_KINDS.includes(kind as PostKind) ? (kind as PostKind) : null);
  return json({ posts });
}

export async function POST(request: NextRequest) {
  const me = await requireApiMember(request);
  if (!me) return hidden();
  if (!isSameOrigin(request)) return json({ error: "Solicitud rechazada." }, 403);
  const rate = checkRateLimit(`vault-post:${me._id}`, 10, 60 * 60_000);
  if (!rate.allowed) return json({ error: "Has publicado demasiado en poco tiempo." }, 429);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }
  const kind = String(body.kind || "");
  const title = cleanText(body.title, 140);
  const text = cleanText(body.body, 3000);
  if (!POST_KINDS.includes(kind as PostKind)) return json({ error: "Tipo no válido." }, 400);
  if (title.length < 3) return json({ error: "Escribe un título." }, 400);
  if (text.length < 3) return json({ error: "Escribe una descripción." }, 400);
  const db = await vaultDb();
  const doc = { _id: new ObjectId(), authorId: me._id, kind, title, body: text, createdAt: new Date() };
  await db.collection(C.posts).insertOne(doc);
  await logActivity(db, "post.created", { memberId: me._id, meta: { kind, title } });
  return json({ ok: true, id: doc._id.toString() }, 201);
}
