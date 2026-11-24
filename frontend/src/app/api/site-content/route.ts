import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public endpoint: the site reads editable content, image overrides and
// settings from here. Falls back to empty objects (bundled defaults) if the
// database is unreachable, so public pages never break.
export async function GET() {
  const DEFAULTS = {
    overrides: {},
    images: {},
    settings: {
      siteName: "Asmyne Group",
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
    return NextResponse.json({
      overrides: content?.overrides ?? {},
      images: content?.images ?? {},
      settings: { ...DEFAULTS.settings, ...(settings?.settings ?? {}) },
    });
  } catch {
    return NextResponse.json(DEFAULTS);
  }
}
