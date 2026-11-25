/**
 * Asmyne Vault — private, invite-only members club.
 *
 * Isolation rules:
 *  - Member data lives ONLY in vault_* collections (never in `users`, where admins live).
 *  - Member sessions are opaque random tokens (cookie `asmyne_vault`), stored hashed in
 *    `vault_sessions`. Admin sessions are the existing JWT cookie `asmyne_admin`.
 *    A vault session can never satisfy an admin check and vice versa.
 *  - Every vault page and every /api/vault/* handler resolves the session on the SERVER.
 */
import crypto from "crypto";
import { ObjectId, type Db } from "mongodb";
import { NextResponse, type NextRequest } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export const VAULT_COOKIE = "asmyne_vault";
export const VAULT_SESSION_DAYS = 7;

export const C = {
  members: "vault_members",
  invites: "vault_invites",
  sessions: "vault_sessions",
  posts: "vault_posts",
  messages: "vault_messages",
  activity: "vault_activity",
} as const;

export type MemberStatus = "pending" | "active" | "expelled";

export type VaultMember = {
  _id: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  status: MemberStatus;
  headline?: string;
  company?: string;
  city?: string;
  bio?: string;
  website?: string;
  createdAt: Date;
  approvedAt?: Date;
  expelledAt?: Date;
  lastLoginAt?: Date;
  inviteId?: ObjectId;
};

export type PublicMember = {
  id: string;
  name: string;
  headline: string;
  company: string;
  city: string;
  bio: string;
  website: string;
  since: string;
};

export function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
export function generateInviteCode() {
  const bytes = crypto.randomBytes(12);
  let raw = "";
  for (let i = 0; i < 12; i++) raw += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return `AV-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

export function normalizeInviteCode(input: string) {
  const clean = String(input || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = clean.startsWith("AV") ? clean.slice(2) : clean;
  if (body.length !== 12) return null;
  return `AV-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}`;
}

let indexesReady: Promise<void> | null = null;
export async function vaultDb(): Promise<Db> {
  const db = await getMongoDb();
  if (!indexesReady) {
    indexesReady = (async () => {
      await Promise.all([
        db.collection(C.members).createIndex({ email: 1 }, { unique: true }),
        db.collection(C.invites).createIndex({ codeHash: 1 }, { unique: true }),
        db.collection(C.sessions).createIndex({ tokenHash: 1 }, { unique: true }),
        db.collection(C.sessions).createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
        db.collection(C.sessions).createIndex({ memberId: 1 }),
        db.collection(C.posts).createIndex({ createdAt: -1 }),
        db.collection(C.messages).createIndex({ from: 1, to: 1, createdAt: 1 }),
        db.collection(C.activity).createIndex({ at: -1 }),
      ]);
    })().catch((e) => {
      indexesReady = null;
      throw e;
    });
  }
  await indexesReady;
  return db;
}

export async function logActivity(
  db: Db,
  type: string,
  data: { memberId?: ObjectId | null; actor?: string; meta?: Record<string, unknown>; ip?: string } = {},
) {
  try {
    await db.collection(C.activity).insertOne({
      type,
      memberId: data.memberId ?? null,
      actor: data.actor ?? null,
      meta: data.meta ?? {},
      ipHash: data.ip ? sha256(`vault-ip:${data.ip}`).slice(0, 16) : null,
      at: new Date(),
    });
  } catch {
    /* activity logging must never break the request */
  }
}

/* ------------------------------ sessions ------------------------------ */

export async function createSession(db: Db, memberId: ObjectId) {
  const token = randomToken(32);
  const now = new Date();
  await db.collection(C.sessions).insertOne({
    tokenHash: sha256(token),
    memberId,
    createdAt: now,
    expiresAt: new Date(now.getTime() + VAULT_SESSION_DAYS * 86400_000),
  });
  return token;
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(VAULT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: VAULT_SESSION_DAYS * 86400,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(VAULT_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

/** Resolve a raw cookie token into an ACTIVE member, or null. */
export async function memberFromToken(token: string | undefined | null): Promise<VaultMember | null> {
  if (!token || token.length < 20 || token.length > 200) return null;
  let db: Db;
  try {
    db = await vaultDb();
  } catch {
    return null;
  }
  const session = await db
    .collection(C.sessions)
    .findOne<{ memberId: ObjectId; expiresAt: Date }>({ tokenHash: sha256(token) });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;
  const member = await db.collection<VaultMember>(C.members).findOne({ _id: session.memberId });
  if (!member || member.status !== "active") return null;
  return member;
}

/** For server components (pages). */
export async function getPageMember(): Promise<VaultMember | null> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  return memberFromToken(store.get(VAULT_COOKIE)?.value);
}

/** Generic "nothing here" response used for every unauthenticated vault API call. */
export function hidden() {
  return NextResponse.json({ error: "Not found" }, { status: 404, headers: noIndexHeaders() });
}

export function noIndexHeaders(): Record<string, string> {
  return {
    "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
    "Cache-Control": "no-store, private",
  };
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: noIndexHeaders() });
}

/** For route handlers: returns the active member or null. */
export async function requireApiMember(request: NextRequest) {
  return memberFromToken(request.cookies.get(VAULT_COOKIE)?.value);
}

/**
 * CSRF guard for state-changing requests, consistent with the marketplace fix:
 * browsers send Sec-Fetch-Site / Origin; reject cross-site. Cookie is also SameSite=Strict.
 */
export function isSameOrigin(request: NextRequest) {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return false;
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return false;
    } catch {
      return false;
    }
  }
  return true;
}

export function toPublic(m: VaultMember): PublicMember {
  return {
    id: m._id.toString(),
    name: m.name,
    headline: m.headline || "",
    company: m.company || "",
    city: m.city || "",
    bio: m.bio || "",
    website: m.website || "",
    since: (m.approvedAt || m.createdAt).toISOString(),
  };
}

export function parseId(id: string | undefined | null): ObjectId | null {
  if (!id || !/^[a-f0-9]{24}$/i.test(id)) return null;
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

/* ------------------------------ validation ------------------------------ */

export function cleanText(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  // strip control chars except newline/tab
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}

export function validEmail(email: string) {
  return email.length <= 160 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function validPassword(pw: unknown): pw is string {
  return typeof pw === "string" && pw.length >= 10 && pw.length <= 128;
}

export function cleanUrl(value: unknown) {
  const v = cleanText(value, 200);
  if (!v) return "";
  try {
    const u = new URL(v.startsWith("http") ? v : `https://${v}`);
    if (u.protocol !== "https:" && u.protocol !== "http:") return "";
    return u.toString();
  } catch {
    return "";
  }
}

export const POST_KINDS = ["oferta", "servicio", "oportunidad"] as const;
export type PostKind = (typeof POST_KINDS)[number];
