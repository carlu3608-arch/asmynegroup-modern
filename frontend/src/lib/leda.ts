// Server-only helper for the LEDA assistant widget.
// The LEDA app token lives only in the server env (LEDA_APP_TOKEN) and is never sent to the browser.

export type LedaLocale = "es" | "en" | "fr";
export type LedaTurn = { role: "user" | "assistant"; content: string };

export const LEDA_API_URL = (process.env.LEDA_API_URL || "https://leda-core-v5-production.up.railway.app").replace(/\/$/, "");

export function ledaToken(): string {
  return (process.env.LEDA_APP_TOKEN || "").trim();
}

export function ledaConfigured(): boolean {
  return ledaToken().length >= 16;
}

const SERVICES = [
  "Asesoría migratoria (visas, residencia, regularización, nacionalidad, documentos en República Dominicana) — /services/conseil-migratoire",
  "Asesoría empresarial (creación de empresas, planes de negocio, estrategia) — /services/conseil-entrepreneurial",
  "Soluciones capilares (prótesis y tratamientos capilares) — /services/hair-solutions",
  "Blog Yontikonsey (artículos y consejos) — /services/yontikonsey-blog",
  "Agencia de viajes (paquetes, boletos, reservas) — /services/agence-voyage",
  "Red social de la comunidad Asmyne — /services/reseau-social",
  "Encuentros (citas y conexiones) — /services/dating",
  "Chatbot inteligente — /services/chatbot-intelligent",
  "Marketplace Global (comprar y vender productos, estilo Mercado Libre) — /services/marketplace-global",
  "Plataforma de monetización para creadores — /services/systeme-monetisation",
];

const LANG_NAME: Record<LedaLocale, string> = { es: "español", en: "English", fr: "français" };

export function asmyneContext(locale: LedaLocale, siteName = "Asmyne Group", contactEmail = "contact@asmyne.com", phone = "+1-(809) 308-6370"): string {
  return [
    `Contexto (no lo repitas literalmente): estás atendiendo el chat de la página web de ${siteName}, como asistente virtual de la empresa.`,
    `Responde siempre en ${LANG_NAME[locale]}, breve (máximo 4–5 frases), cordial y profesional. Nada de temas íntimos ni personales.`,
    `Servicios de ${siteName}:`,
    ...SERVICES.map((s) => `- ${s}`),
    `Para solicitar un servicio, el visitante usa el formulario de la página del servicio o la página /contact. Contacto: ${contactEmail}, tel./WhatsApp ${phone}.`,
    "No inventes precios, plazos ni garantías: si no sabes algo, invita a dejar sus datos en /contact para que un asesor lo atienda.",
    "No pidas contraseñas ni datos de tarjetas.",
  ].join("\n");
}

const ACK: Record<LedaLocale, string> = {
  es: "Entendido. Atenderé a los visitantes de la web como asistente de la empresa.",
  en: "Understood. I will assist the website visitors as the company's assistant.",
  fr: "Compris. J'accompagnerai les visiteurs du site en tant qu'assistante de l'entreprise.",
};

export async function askLeda(params: {
  locale: LedaLocale;
  history: LedaTurn[];
  conversationId: string;
  siteName?: string;
  contactEmail?: string;
  phone?: string;
}): Promise<{ ok: true; text: string } | { ok: false; status: number; error: string }> {
  const token = ledaToken();
  if (!token) return { ok: false, status: 503, error: "leda_unconfigured" };
  const context = asmyneContext(params.locale, params.siteName, params.contactEmail, params.phone);
  // LEDA strips "system" turns for limited (user-profile) app tokens, so the context goes as the opening turn.
  const messages = [
    { role: "system", content: context },
    { role: "user", content: context },
    { role: "assistant", content: ACK[params.locale] },
    ...params.history,
  ];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);
  try {
    const res = await fetch(`${LEDA_API_URL}/api/core/think`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        messages,
        retention: "none",
        locale: params.locale,
        conversationId: params.conversationId,
        surface: "pregunta",
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    const data = (await res.json().catch(() => null)) as { response?: { content?: string }; error?: string } | null;
    if (!res.ok) return { ok: false, status: res.status, error: data?.error || `leda_http_${res.status}` };
    const text = (data?.response?.content || "").trim();
    if (!text) return { ok: false, status: 502, error: "leda_empty" };
    return { ok: true, text };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return { ok: false, status: aborted ? 504 : 502, error: aborted ? "leda_timeout" : "leda_unreachable" };
  } finally {
    clearTimeout(timer);
  }
}
