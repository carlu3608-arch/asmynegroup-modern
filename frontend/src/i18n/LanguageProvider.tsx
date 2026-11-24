"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  dictionaries,
  locales,
  type Dict,
  type Locale,
} from "./dictionaries";

type Overrides = Partial<Record<Locale, Dict>>;

type SiteSettings = {
  siteName?: string;
  contactEmail?: string;
  supportPhone?: string;
  social?: Record<string, string>;
  sectionsEnabled?: Record<string, boolean>;
};

type LanguageContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: string) => string;
  image: (slug: string) => string | undefined;
  settings: SiteSettings;
  ready: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "asmyne_locale";

function detectLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && locales.includes(saved)) return saved;
  } catch {
    /* ignore */
  }
  const candidates = [
    ...(navigator.languages ?? []),
    navigator.language,
  ].filter(Boolean);
  for (const raw of candidates) {
    const code = raw.slice(0, 2).toLowerCase();
    if (locales.includes(code as Locale)) return code as Locale;
  }
  return DEFAULT_LOCALE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [overrides, setOverrides] = useState<Overrides>({});
  const [images, setImages] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<SiteSettings>({});
  const [ready, setReady] = useState(false);

  // Detect language on first visit.
  useEffect(() => {
    const detected = detectLocale();
    setLocaleState(detected);
    if (typeof document !== "undefined") {
      document.documentElement.lang = detected;
    }
    setReady(true);
  }, []);

  // Load editable content + settings from the DB (graceful if unavailable).
  useEffect(() => {
    let active = true;
    fetch("/api/site-content", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data) return;
        if (data.overrides) setOverrides(data.overrides as Overrides);
        if (data.images) setImages(data.images as Record<string, string>);
        if (data.settings) setSettings(data.settings as SiteSettings);
      })
      .catch(() => {
        /* keep bundled defaults */
      });
    return () => {
      active = false;
    };
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = next;
    }
  }, []);

  const t = useCallback(
    (key: string) => {
      const ov = overrides[locale]?.[key];
      if (ov != null && ov !== "") return ov;
      const dict = dictionaries[locale]?.[key];
      if (dict != null) return dict;
      const fallback = dictionaries[DEFAULT_LOCALE]?.[key];
      return fallback ?? key;
    },
    [locale, overrides],
  );

  const image = useCallback((slug: string) => images[slug], [images]);

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, t, image, settings, ready }),
    [locale, setLocale, t, image, settings, ready],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Safe fallback so components never crash if used outside the provider.
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (key: string) => dictionaries[DEFAULT_LOCALE]?.[key] ?? key,
      image: () => undefined,
      settings: {} as SiteSettings,
      ready: false,
    } satisfies LanguageContextValue;
  }
  return ctx;
}
