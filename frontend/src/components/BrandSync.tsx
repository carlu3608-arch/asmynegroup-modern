"use client";
import { useEffect } from "react";
import { useI18n } from "@/i18n/LanguageProvider";

export default function BrandSync() {
  const { branding } = useI18n();
  useEffect(() => {
    const name = branding.siteName || "Asmyne Group";
    document.title = `${name} — Soluciones digitales`;
    const icon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (branding.logoUrl && icon) {
      // keep default favicon unless it's a custom uploaded logo we can use
    }
  }, [branding.siteName, branding.logoUrl]);
  return null;
}
