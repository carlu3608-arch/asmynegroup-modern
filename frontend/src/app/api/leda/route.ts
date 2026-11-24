import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { checkRateLimit } from "@/lib/rateLimit";
import { askLeda, ledaConfigured, type LedaLocale, type LedaTurn } from "@/lib/leda";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Settings = { ledaWidget?: boolean; siteName?: string; contactEmail?: string; supportPhone?: string };

let cache: { at: number; settings: Settings } | null = null;
async function readSettings(): Promise<Settings> {
  if (cache && Date.now() - cache.at < 30_000) return cache.settings;
  let settings: Settings = {};
  try {
    const read = (async () => {
      const db = await getMongoDb();
      const doc = await db.collection("siteContent").findOne({ _id: "settings" as never });
      return ((doc as { settings?: Settings } | null)?.settings ?? {}) as Settings;
    })();
    settings = (await Promise.race([read, new Promise<Settings>((r) => setTimeout(() => r({}), 1500))])) ?? {};
  } catch {
    settings = {};
  }
  cache = { at: Date.now(), settings };
  return settings;
}

function clientIp(req: NextRequest): string {
  const real = (req.headers.get("x-real-ip") || "").trim();
  if (real) return real;
  const fwd = req.headers.get("x-forwarded-for") || "";
  return fwd.split(",")[0]?.trim() || "anon";
}

export async function GET() {
  const settings = await readSettings();
  const enabled = settings.ledaWidget !== false;
  return NextResponse.json(
    { available: ledaConfigured() && enabled, configured: ledaConfigured(), enabled },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(req: NextRequest) {
  if (!ledaConfigured()) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  const settings = await readSettings();
  if (settings.ledaWidget === false) return NextResponse.json({ error: "disabled" }, { status: 503 });

  const ip = clientIp(req);
  const burst = checkRateLimit(`leda:min:${ip}`, 6, 60_000);
  const daily = checkRateLimit(`leda:day:${ip}`, 60, 24 * 60 * 60_000);
  const global = checkRateLimit("leda:global:hour", 400, 60 * 60_000);
  if (!global.allowed) {
    return NextResponse.json({ error: "busy" }, { status: 429, headers: { "retry-after": String(global.retryAfterSeconds) } });
  }
  if (!burst.allowed || !daily.allowed) {
    const retry = Math.max(burst.retryAfterSeconds, daily.allowed ? 0 : daily.retryAfterSeconds);
    return NextResponse.json({ error: "rate_limited", retryAfter: retry }, { status: 429, headers: { "retry-after": String(retry) } });
  }

  let body: { messages?: unknown; locale?: unknown; conversationId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const locale: LedaLocale = body.locale === "en" || body.locale === "fr" ? body.locale : "es";
  const raw = Array.isArray(body.messages) ? body.messages : [];
  const history: LedaTurn[] = raw
    .filter((m): m is LedaTurn =>
      !!m && typeof m === "object" &&
      ((m as LedaTurn).role === "user" || (m as LedaTurn).role === "assistant") &&
      typeof (m as LedaTurn).content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }))
    .slice(-10);
  const last = history[history.length - 1];
  if (!last || last.role !== "user" || !last.content.trim()) {
    return NextResponse.json({ error: "message_required" }, { status: 400 });
  }
  const conv = typeof body.conversationId === "string" && /^[a-zA-Z0-9-]{8,64}$/.test(body.conversationId)
    ? body.conversationId
    : "web";

  const result = await askLeda({
    locale,
    history,
    conversationId: `asmyne-web:${conv}`,
    siteName: settings.siteName,
    contactEmail: settings.contactEmail,
    phone: settings.supportPhone,
  });
  if (!result.ok) {
    const status = result.status === 429 ? 429 : 502;
    return NextResponse.json({ error: result.status === 429 ? "busy" : "upstream" }, { status });
  }
  return NextResponse.json({ reply: result.text }, { headers: { "cache-control": "no-store" } });
}
