"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/LanguageProvider";

type Turn = { role: "user" | "assistant"; content: string };
type L = "es" | "en" | "fr";

const TXT: Record<L, Record<string, string>> = {
  es: {
    open: "Abrir asistente", close: "Cerrar", title: "Asistente LEDA", status: "En línea · responde al instante",
    hello: "¡Hola! Soy LEDA, la asistente de {site}. ¿En qué te ayudo? Puedo orientarte sobre nuestros servicios y cómo solicitarlos.",
    placeholder: "Escribe tu mensaje…", send: "Enviar", error: "No pude responder ahora. Inténtalo de nuevo en un momento o escríbenos en Contacto.",
    limit: "Has enviado muchos mensajes seguidos. Espera un momento, por favor.", reset: "Nueva conversación",
    s1: "¿Qué servicios ofrecen?", s2: "Necesito asesoría migratoria", s3: "¿Cómo vendo en el Marketplace?",
  },
  en: {
    open: "Open assistant", close: "Close", title: "LEDA Assistant", status: "Online · replies instantly",
    hello: "Hi! I'm LEDA, {site}'s assistant. How can I help? I can guide you through our services and how to request them.",
    placeholder: "Type your message…", send: "Send", error: "I couldn't answer right now. Please try again shortly or reach us through Contact.",
    limit: "You've sent many messages in a row. Please wait a moment.", reset: "New conversation",
    s1: "What services do you offer?", s2: "I need immigration advice", s3: "How do I sell on the Marketplace?",
  },
  fr: {
    open: "Ouvrir l'assistante", close: "Fermer", title: "Assistante LEDA", status: "En ligne · répond aussitôt",
    hello: "Bonjour ! Je suis LEDA, l'assistante de {site}. Comment puis-je vous aider ? Je peux vous orienter sur nos services et comment les demander.",
    placeholder: "Écrivez votre message…", send: "Envoyer", error: "Je n'ai pas pu répondre. Réessayez dans un instant ou écrivez-nous via Contact.",
    limit: "Vous avez envoyé beaucoup de messages d'affilée. Patientez un instant.", reset: "Nouvelle conversation",
    s1: "Quels services proposez-vous ?", s2: "J'ai besoin d'un conseil migratoire", s3: "Comment vendre sur le Marketplace ?",
  },
};

// Pages that already have their own floating assistant, or the admin.
const HIDDEN = [/^\/admin/, /^\/services\/conseil-migratoire/, /^\/services\/conseil-entrepreneurial/];
const STORE = "asmyne_leda_chat";

function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export default function LedaWidget() {
  const pathname = usePathname() || "/";
  const { locale, settings, branding } = useI18n();
  const lang: L = locale === "en" || locale === "fr" ? locale : "es";
  const t = TXT[lang];
  const site = branding?.siteName || "Asmyne Group";
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [convId, setConvId] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const enabledInSettings = (settings as { ledaWidget?: boolean }).ledaWidget !== false;

  useEffect(() => {
    let alive = true;
    fetch("/api/leda", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => alive && setAvailable(Boolean(d?.available)))
      .catch(() => alive && setAvailable(false));
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE) || "null") as { id?: string; turns?: Turn[] } | null;
      setConvId(saved?.id || newId());
      if (Array.isArray(saved?.turns)) setTurns(saved!.turns!.slice(-20));
    } catch {
      setConvId(newId());
    }
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!convId) return;
    try { sessionStorage.setItem(STORE, JSON.stringify({ id: convId, turns: turns.slice(-20) })); } catch { /* ignore */ }
  }, [turns, convId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  if (!available || !enabledInSettings || HIDDEN.some((r) => r.test(pathname))) return null;

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next: Turn[] = [...turns, { role: "user", content }];
    setTurns(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/leda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-10), locale: lang, conversationId: convId }),
      });
      const d = await res.json().catch(() => ({}));
      const reply = res.ok && typeof d.reply === "string" ? d.reply : res.status === 429 && d.error === "rate_limited" ? t.limit : t.error;
      setTurns((cur) => [...cur, { role: "assistant", content: reply }]);
    } catch {
      setTurns((cur) => [...cur, { role: "assistant", content: t.error }]);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setTurns([]);
    setConvId(newId());
  }

  return (
    <div className="leda-widget" data-open={open ? "1" : "0"}>
      {open && (
        <div className="leda-panel" role="dialog" aria-label={t.title}>
          <header className="leda-head">
            <div className="leda-avatar" aria-hidden>L</div>
            <div className="leda-head-txt">
              <strong>{t.title}</strong>
              <span><i className="leda-dot" />{t.status}</span>
            </div>
            <button type="button" className="leda-icon" onClick={reset} title={t.reset} aria-label={t.reset}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
            </button>
            <button type="button" className="leda-icon" onClick={() => setOpen(false)} aria-label={t.close}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </header>
          <div className="leda-list" ref={listRef}>
            <div className="leda-msg leda-bot">{t.hello.replace("{site}", site)}</div>
            {turns.length === 0 && (
              <div className="leda-chips">
                {[t.s1, t.s2, t.s3].map((s) => (
                  <button key={s} type="button" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}
            {turns.map((m, i) => (
              <div key={i} className={`leda-msg ${m.role === "user" ? "leda-me" : "leda-bot"}`}>{m.content}</div>
            ))}
            {busy && (
              <div className="leda-msg leda-bot leda-typing" aria-label="…"><span /><span /><span /></div>
            )}
          </div>
          <form className="leda-form" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={1000}
              placeholder={t.placeholder}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label={t.send}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" /></svg>
            </button>
          </form>
        </div>
      )}
      <button type="button" className="leda-bubble" onClick={() => setOpen((o) => !o)} aria-label={open ? t.close : t.open} aria-expanded={open}>
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6 6 18M6 6l12 12" /></svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /><path d="M8.5 12h.01M12 12h.01M15.5 12h.01" strokeWidth="2.6" strokeLinecap="round" /></svg>
        )}
      </button>
    </div>
  );
}
