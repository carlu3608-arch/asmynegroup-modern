import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { C, cleanText, hidden, isSameOrigin, json, logActivity, parseId, requireApiMember, vaultDb } from "@/lib/vault";
import { getConversation } from "@/lib/vaultData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Only the two participants can read: the query is always scoped to the session member. */
export async function GET(request: NextRequest, ctx: { params: Promise<{ memberId: string }> }) {
  const me = await requireApiMember(request);
  if (!me) return hidden();
  const other = parseId((await ctx.params).memberId);
  if (!other) return json({ error: "No encontrado." }, 404);
  const db = await vaultDb();
  const convo = await getConversation(db, me._id, other);
  if (!convo) return json({ error: "No encontrado." }, 404);
  return json(convo);
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ memberId: string }> }) {
  const me = await requireApiMember(request);
  if (!me) return hidden();
  if (!isSameOrigin(request)) return json({ error: "Solicitud rechazada." }, 403);
  const other = parseId((await ctx.params).memberId);
  if (!other || other.equals(me._id)) return json({ error: "Destinatario no válido." }, 400);
  const rate = checkRateLimit(`vault-msg:${me._id}`, 30, 60_000);
  if (!rate.allowed) return json({ error: "Vas muy rápido. Espera un momento." }, 429);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }
  const text = cleanText(body.body, 2000);
  if (!text) return json({ error: "Mensaje vacío." }, 400);
  const db = await vaultDb();
  const target = await db.collection(C.members).findOne({ _id: other, status: "active" }, { projection: { _id: 1 } });
  if (!target) return json({ error: "Destinatario no válido." }, 400);
  await db.collection(C.messages).insertOne({ from: me._id, to: other, body: text, createdAt: new Date(), readAt: null });
  // Activity records that a message was sent, never its content or recipient.
  await logActivity(db, "message.sent", { memberId: me._id });
  return json({ ok: true }, 201);
}
