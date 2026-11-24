import { NextResponse, type NextRequest } from "next/server";
import { getMarketplaceUrl } from "@/lib/marketplaceUrl";

// Marketplace Global now lives in its own app. Every old entry point redirects there.
export async function proxy(request: NextRequest) {
  const target = await getMarketplaceUrl();
  return NextResponse.redirect(target + "/", 307);
}

export const config = {
  matcher: ["/services/marketplace-global", "/services/marketplace-global/:path*", "/marketplace", "/marketplace/:path*"],
};
