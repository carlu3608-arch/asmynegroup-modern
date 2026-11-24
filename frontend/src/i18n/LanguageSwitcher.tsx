"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "./LanguageProvider";
import { locales, localeNames, localeFlags, type Locale } from "./dictionaries";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="lang-switcher" ref={ref}>
      <button
        type="button"
        className="lang-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden>{localeFlags[locale]}</span>
        <span className="lang-code">{locale.toUpperCase()}</span>
        {!compact && <span className="lang-name">{localeNames[locale]}</span>}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <ul className="lang-menu" role="listbox">
          {locales.map((l: Locale) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === locale}
                className={l === locale ? "is-active" : ""}
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
              >
                <span aria-hidden>{localeFlags[l]}</span>
                <span>{localeNames[l]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
