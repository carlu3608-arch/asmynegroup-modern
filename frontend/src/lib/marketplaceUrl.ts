import { getMongoDb } from "@/lib/mongodb";

/** Default public URL of the independent Marketplace Global app.
 *  Override with env MARKETPLACE_URL, or (preferred) in Admin → Configuración → Marketplace Global. */
export const DEFAULT_MARKETPLACE_URL =
  process.env.MARKETPLACE_URL || "https://marketplace-production-39bdf8a2.up.railway.app";

export function sanitizeMarketplaceUrl(v: unknown): string | null {
  if (typeof v !== "string" || !v.trim()) return null;
  try {
    const u = new URL(v.trim());
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

let cache: { url: string; at: number } | null = null;
const TTL = 60_000;

export function clearMarketplaceUrlCache() {
  cache = null;
}

export async function getMarketplaceUrl(): Promise<string> {
  if (cache && Date.now() - cache.at < TTL) return cache.url;
  let url = DEFAULT_MARKETPLACE_URL;
  try {
    const read = (async () => {
      const db = await getMongoDb();
      const doc = await db.collection("siteContent").findOne({ _id: "settings" as never });
      return sanitizeMarketplaceUrl((doc as { settings?: { marketplaceUrl?: string } } | null)?.settings?.marketplaceUrl);
    })();
    const fromDb = await Promise.race([read, new Promise<null>((r) => setTimeout(() => r(null), 1500))]);
    if (fromDb) url = fromDb;
  } catch {
    /* DB unavailable: use default */
  }
  cache = { url, at: Date.now() };
  return url;
}
