import { NextRequest } from "next/server";
import { C, cleanText, cleanUrl, hidden, isSameOrigin, json, logActivity, requireApiMember, toPublic, vaultDb } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const me = await requireApiMember(request);
  if (!me) return hidden();
  return json({ member: { ...toPublic(me), email: me.email } });
}

export async function PUT(request: NextRequest) {
  const me = await requireApiMember(request);
  if (!me) return hidden();
  if (!isSameOrigin(request)) return json({ error: "Solicitud rechazada." }, 403);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }
  const update = {
    name: cleanText(body.name, 80) || me.name,
    headline: cleanText(body.headline, 120),
    company: cleanText(body.company, 100),
    city: cleanText(body.city, 80),
    bio: cleanText(body.bio, 1500),
    website: cleanUrl(body.website),
  };
  const db = await vaultDb();
  await db.collection(C.members).updateOne({ _id: me._id }, { $set: update });
  await logActivity(db, "profile.updated", { memberId: me._id });
  return json({ ok: true, member: { ...toPublic({ ...me, ...update }), email: me.email } });
}
