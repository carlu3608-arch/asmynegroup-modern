import type { Locale } from "@/i18n/dictionaries";
import { locales } from "@/i18n/dictionaries";

export type ServiceTexts = {
  title: string;
  desc: string;
  eyebrow?: string;
  cta?: string;
  bullets?: string[];
  whyTitle?: string;
  whyLead?: string;
  whyBody?: string;
  heroTitle?: string;
  heroLead?: string;
};

export type CmsService = {
  id: string;
  slug: string;
  enabled: boolean;
  order: number;
  builtin: boolean;
  iconUrl: string;
  heroUrl: string;
  photoUrl?: string;
  texts: Record<Locale, ServiceTexts>;
};

export type Branding = {
  siteName: string;
  logoUrl: string;
};

export const DEFAULT_BRANDING: Branding = {
  siteName: "Asmyne Group",
  logoUrl: "/asmyne-group-logo.png",
};

const ICONS: Record<string, string> = {
  "conseil-migratoire": "/service-migratoire.png",
  "conseil-entrepreneurial": "/service-entrepreneurial.png",
  "hair-solutions": "/service-hair.png",
  "yontikonsey-blog": "/service-blog.png",
  "agence-voyage": "/service-voyage.png",
  "reseau-social": "/service-reseau.png",
  dating: "/service-dating.png",
  "chatbot-intelligent": "/service-chatbot.png",
  "marketplace-global": "/service-marketplace.png",
  "systeme-monetisation": "/service-monetisation.png",
};

const HEROES: Record<string, string> = {
  "conseil-migratoire": "/heroes/asesoria-migratoria.png",
  "conseil-entrepreneurial": "/heroes/conseil-entrepreneurial.png",
  "hair-solutions": "/heroes/hair-solutions.png",
  "yontikonsey-blog": "/heroes/yontikonsey-blog.png",
  "agence-voyage": "/heroes/agence-voyage.png",
  "reseau-social": "/heroes/reseau-social.png",
  dating: "/heroes/dating.png",
  "chatbot-intelligent": "/heroes/chatbot-intelligent.png",
  "marketplace-global": "/heroes/marketplace-global.png",
  "systeme-monetisation": "/heroes/systeme-monetisation.png",
};

type Seed = {
  slug: string;
  es: ServiceTexts;
  en: ServiceTexts;
  fr: ServiceTexts;
};

const SEEDS: Seed[] = [
  {
    slug: "conseil-migratoire",
    es: {
      title: "Asesoría migratoria",
      desc: "Asesoría jurídica y acompañamiento para tus trámites migratorios.",
      eyebrow: "Construyendo tu visión",
      heroTitle: "Consultora Migratoria",
      heroLead: "Tu aliado en cada etapa del viaje",
      cta: "Descubrir más",
      whyTitle: "¿Por qué elegir a Asmyne Group?",
      whyLead:
        "Con más de 25 años de experiencia en República Dominicana, Asmyne Group ofrece una asesoría migratoria integral, clara y enfocada en resultados.",
      whyBody:
        "Si necesitas apoyo con tus trámites migratorios en República Dominicana, recibirás orientación especializada para residencia, visas, regularización migratoria, nacionalidad y documentación legal.",
      bullets: [
        "Experiencia sólida en procesos migratorios",
        "Atención personalizada en cada etapa",
        "Transparencia, ética y responsabilidad profesional",
        "Acompañamiento paso a paso hasta la resolución del trámite",
        "Confidencialidad y compromiso con cada cliente",
      ],
    },
    en: {
      title: "Immigration Advisory",
      desc: "Legal advice and support for your immigration procedures.",
      eyebrow: "Building your vision",
      heroTitle: "Immigration Consulting",
      heroLead: "Your ally at every stage of the journey",
      cta: "Learn more",
      whyTitle: "Why choose Asmyne Group?",
      whyLead:
        "With more than 25 years of experience in the Dominican Republic, Asmyne Group offers clear, results-focused immigration advisory.",
      whyBody:
        "If you need support with immigration procedures in the Dominican Republic, you will receive specialized guidance for residency, visas, regularization, nationality and legal documentation.",
      bullets: [
        "Solid experience in immigration processes",
        "Personalized attention at every stage",
        "Transparency, ethics and professional responsibility",
        "Step-by-step support until the case is resolved",
        "Confidentiality and commitment to every client",
      ],
    },
    fr: {
      title: "Conseil migratoire",
      desc: "Conseil juridique et accompagnement pour vos démarches migratoires.",
      eyebrow: "Construire votre vision",
      heroTitle: "Consultante migratoire",
      heroLead: "Votre allié à chaque étape du voyage",
      cta: "En savoir plus",
      whyTitle: "Pourquoi choisir Asmyne Group ?",
      whyLead:
        "Avec plus de 25 ans d'expérience en République dominicaine, Asmyne Group offre un conseil migratoire clair et orienté résultats.",
      whyBody:
        "Si vous avez besoin d'aide pour vos démarches migratoires en République dominicaine, vous recevrez une orientation spécialisée pour la résidence, les visas, la régularisation, la nationalité et la documentation légale.",
      bullets: [
        "Expérience solide des processus migratoires",
        "Attention personnalisée à chaque étape",
        "Transparence, éthique et responsabilité professionnelle",
        "Accompagnement pas à pas jusqu'à la résolution",
        "Confidentialité et engagement envers chaque client",
      ],
    },
  },
  {
    slug: "conseil-entrepreneurial",
    es: { title: "Asesoría empresarial", desc: "Acompañamiento para la creación y la gestión de empresas." },
    en: { title: "Business Advisory", desc: "Support for company creation and management." },
    fr: { title: "Conseil entrepreneurial", desc: "Accompagnement pour la création et la gestion d'entreprise." },
  },
  {
    slug: "hair-solutions",
    es: { title: "Soluciones capilares", desc: "Venta de productos capilares y dropshipping." },
    en: { title: "Hair Solutions", desc: "Hair product sales and dropshipping." },
    fr: { title: "Solutions capillaires", desc: "Vente de produits capillaires et dropshipping." },
  },
  {
    slug: "yontikonsey-blog",
    es: { title: "Yontikonsey Blog", desc: "Blog, consejos, comunidad activa y SEO optimizado." },
    en: { title: "Yontikonsey Blog", desc: "Blog, tips, an active community and optimized SEO." },
    fr: { title: "Yontikonsey Blog", desc: "Blog, conseils, communauté active et SEO optimisé." },
  },
  {
    slug: "agence-voyage",
    es: { title: "Agencia de viajes", desc: "Reserva de vuelos, hoteles, excursiones, alquiler de autos y Airbnb." },
    en: { title: "Travel Agency", desc: "Book flights, hotels, tours, car rentals and Airbnb." },
    fr: { title: "Agence de voyage", desc: "Réservation de vols, hôtels, excursions, location de voitures, Airbnb." },
  },
  {
    slug: "reseau-social",
    es: { title: "Red social", desc: "Perfiles, publicaciones, likes, comentarios y mensajería privada." },
    en: { title: "Social Network", desc: "Profiles, posts, likes, comments and private messaging." },
    fr: { title: "Réseau social", desc: "Profils, publications, likes, commentaires, messagerie privée." },
  },
  {
    slug: "dating",
    es: { title: "Encuentros", desc: "Matching, chat privado, seguridad y moderación." },
    en: { title: "Dating", desc: "Matching, private chat, safety and moderation." },
    fr: { title: "Rencontres", desc: "Matching, chat privé, sécurité et modération." },
  },
  {
    slug: "chatbot-intelligent",
    es: { title: "Chatbot inteligente", desc: "Soporte al cliente 24/7, ayuda a la navegación y asistencia con IA." },
    en: { title: "Smart Chatbot", desc: "24/7 customer support, navigation help and AI assistance." },
    fr: { title: "Chatbot intelligent", desc: "Support client 24/7, aide à la navigation, assistance IA." },
  },
  {
    slug: "marketplace-global",
    es: { title: "Mercado global", desc: "Compra, vende y gestiona tus productos y servicios en todo el mundo." },
    en: { title: "Global Market", desc: "Buy, sell and manage your products and services worldwide." },
    fr: { title: "Marché mondial", desc: "Achetez, vendez et gérez vos produits et services dans le monde entier." },
  },
  {
    slug: "systeme-monetisation",
    es: { title: "Plataforma de monetización", desc: "Suscripciones, comisiones e ingresos automáticos." },
    en: { title: "Monetization Platform", desc: "Subscriptions, commissions and automatic revenue." },
    fr: { title: "Plateforme de monétisation", desc: "Abonnements, commissions, revenus automatiques." },
  },
];

export function defaultServices(): CmsService[] {
  return SEEDS.map((seed, index) => ({
    id: seed.slug,
    slug: seed.slug,
    enabled: true,
    order: index,
    builtin: true,
    iconUrl: ICONS[seed.slug] || "/asmyne-group-logo.png",
    heroUrl: HEROES[seed.slug] || "/heroes/asesoria-migratoria.png",
    photoUrl: "",
    texts: { es: seed.es, en: seed.en, fr: seed.fr },
  }));
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || `servicio-${Date.now()}`;
}

export function emptyServiceTexts(): ServiceTexts {
  return { title: "", desc: "", bullets: [] };
}

export function ensureServiceShape(raw: Partial<CmsService>, fallbackIndex = 0): CmsService {
  const slug = raw.slug || `servicio-${fallbackIndex}`;
  const texts = { es: emptyServiceTexts(), en: emptyServiceTexts(), fr: emptyServiceTexts() } as Record<Locale, ServiceTexts>;
  for (const l of locales) {
    const t = (raw.texts?.[l] || {}) as Partial<ServiceTexts>;
    texts[l] = {
      title: t.title || "",
      desc: t.desc || "",
      eyebrow: t.eyebrow || "",
      cta: t.cta || "",
      bullets: Array.isArray(t.bullets) ? t.bullets.map(String) : [],
      whyTitle: t.whyTitle || "",
      whyLead: t.whyLead || "",
      whyBody: t.whyBody || "",
      heroTitle: t.heroTitle || "",
      heroLead: t.heroLead || "",
    };
  }
  return {
    id: String(raw.id || slug),
    slug,
    enabled: raw.enabled !== false,
    order: typeof raw.order === "number" ? raw.order : fallbackIndex,
    builtin: Boolean(raw.builtin),
    iconUrl: raw.iconUrl || ICONS[slug] || "/asmyne-group-logo.png",
    heroUrl: raw.heroUrl || HEROES[slug] || "",
    photoUrl: raw.photoUrl || "",
    texts,
  };
}

function mergeTexts(base: ServiceTexts, over?: Partial<ServiceTexts>): ServiceTexts {
  if (!over) return base;
  return {
    title: over.title?.trim() ? over.title : base.title,
    desc: over.desc?.trim() ? over.desc : base.desc,
    eyebrow: over.eyebrow?.trim() ? over.eyebrow : base.eyebrow,
    cta: over.cta?.trim() ? over.cta : base.cta,
    bullets: over.bullets && over.bullets.length ? over.bullets : base.bullets,
    whyTitle: over.whyTitle?.trim() ? over.whyTitle : base.whyTitle,
    whyLead: over.whyLead?.trim() ? over.whyLead : base.whyLead,
    whyBody: over.whyBody?.trim() ? over.whyBody : base.whyBody,
    heroTitle: over.heroTitle?.trim() ? over.heroTitle : base.heroTitle,
    heroLead: over.heroLead?.trim() ? over.heroLead : base.heroLead,
  };
}

export function mergeServices(stored: CmsService[] | null | undefined): CmsService[] {
  if (!stored || !Array.isArray(stored) || stored.length === 0) return defaultServices();
  const defaults = defaultServices();
  const bySlug = new Map(stored.map((s) => [s.slug, ensureServiceShape(s)]));
  const result: CmsService[] = [];
  for (const d of defaults) {
    const s = bySlug.get(d.slug);
    if (!s) {
      result.push(d);
      continue;
    }
    bySlug.delete(d.slug);
    result.push({
      ...d,
      ...s,
      builtin: true,
      iconUrl: s.iconUrl || d.iconUrl,
      heroUrl: s.heroUrl || d.heroUrl,
      texts: {
        es: mergeTexts(d.texts.es, s.texts.es),
        en: mergeTexts(d.texts.en, s.texts.en),
        fr: mergeTexts(d.texts.fr, s.texts.fr),
      },
    });
  }
  for (const extra of bySlug.values()) {
    result.push({ ...extra, builtin: false });
  }
  return result.sort((a, b) => a.order - b.order);
}
