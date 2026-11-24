import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { DEFAULT_BRANDING, defaultServices, mergeServices, type CmsService } from "@/lib/cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const DEFAULTS = {
    overrides: {},
    images: {},
    branding: DEFAULT_BRANDING,
    services: defaultServices(),
    settings: {
      siteName: DEFAULT_BRANDING.siteName,
      contactEmail: "contact@asmyne.com",
      supportPhone: "+1-(809) 308-6370",
      social: {},
      sectionsEnabled: {},
    },
  };
  try {
    const db = await getMongoDb();
    const content = await db.collection("siteContent").findOne({ _id: "site" as never });
    const settings = await db.collection("siteContent").findOne({ _id: "settings" as never });
    const servicesDoc = await db.collection("siteContent").findOne({ _id: "services" as never });
    const brandingDoc = await db.collection("siteContent").findOne({ _id: "branding" as never });
    const branding = { ...DEFAULT_BRANDING, ...(brandingDoc?.branding ?? {}) };
    return NextResponse.json({
      overrides: content?.overrides ?? {},
      images: content?.images ?? {},
      branding,
      services: mergeServices(servicesDoc?.services as CmsService[] | undefined),
      settings: {
        ...DEFAULTS.settings,
        ...(settings?.settings ?? {}),
        siteName: branding.siteName || DEFAULTS.settings.siteName,
      },
    });
  } catch {
    return NextResponse.json(DEFAULTS);
  }
}
