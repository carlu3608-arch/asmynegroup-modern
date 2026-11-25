import { NextResponse, type NextRequest } from "next/server";
import { getMarketplaceUrl } from "@/lib/marketplaceUrl";
import { VAULT_COOKIE, memberFromToken } from "@/lib/vault";

const VAULT_PRIVATE_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
  "Cache-Control": "no-store, private",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Asmyne Vault interior: real server-side gate (307 to the door) before any rendering.
  // Pages and API handlers re-check the session themselves; this is the first layer.
  if (pathname === "/vault") {
    // Door: members already inside skip straight to the salon.
    const member = await memberFromToken(request.cookies.get(VAULT_COOKIE)?.value);
    const res = member ? NextResponse.redirect(new URL("/vault/salon", request.url), 307) : NextResponse.next();
    for (const [k, v] of Object.entries(VAULT_PRIVATE_HEADERS)) res.headers.set(k, v);
    return res;
  }
  if (pathname.startsWith("/vault/")) {
    const member = await memberFromToken(request.cookies.get(VAULT_COOKIE)?.value);
    if (!member) {
      const res = NextResponse.redirect(new URL("/vault", request.url), 307);
      for (const [k, v] of Object.entries(VAULT_PRIVATE_HEADERS)) res.headers.set(k, v);
      return res;
    }
    return NextResponse.next();
  }

  // Marketplace Global now lives in its own app. Every old entry point redirects there.
  const target = await getMarketplaceUrl();
  return NextResponse.redirect(target + "/", 307);
}

export const config = {
  matcher: [
    "/services/marketplace-global",
    "/services/marketplace-global/:path*",
    "/marketplace",
    "/marketplace/:path*",
    "/vault",
    "/vault/:path+",
  ],
};
