"use client";

import HomeFooter from "./HomeFooter";
import ServicesSection from "./ServicesSection";
import SiteEffects from "@/components/SiteEffects";
import GoldParticles from "@/components/GoldParticles";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroGlobeR3F = dynamic(() => import("@/components/HeroGlobeR3F"), { ssr: false });

const nav = [
  { href: "/", label: "Inicio" },
  { href: "/services/marketplace-global", label: "Marketplace" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contacto" },
];

const whyCards = [
  {
    title: "Asesoría Migratoria",
    desc: "Asesoría migratoria profesional y acompañamiento personalizado para ayudarte a entender cada proceso y tomar decisiones con seguridad y confianza.",
  },
  {
    title: "Consejos Empresariales",
    desc: "Consejos empresariales para ayudarte a crecer, emprender y fortalecer tu negocio con estrategias efectivas y mejores decisiones para tu futuro.",
  },
  {
    title: "Soluciones de Belleza",
    desc: "Soluciones de belleza y Soluciones capilares adaptadas a tus necesidades para resaltar tu estilo, tu confianza y tu bienestar personal.",
  },
  {
    title: "Yontikonsey Blog",
    desc: "Plataforma de blog y contenido útil con “Yontikonsey Blog”, donde compartimos consejos, información y experiencias que te inspiran y te ayudan a avanzar.",
  },
  {
    title: "Agencia de Viajes",
    desc: "Servicios de agencia de viajes y asistencia internacional para que vivas experiencias increíbles con tranquilidad, seguridad y el mejor acompañamiento.",
  },
  {
    title: "Red Social",
    desc: "Espacio de red social para conectar con otras personas, compartir ideas, crear relaciones y formar parte de una comunidad activa y positiva.",
  },
];

const faqs = [
  {
    q: "¿Cómo puedo iniciar mi proceso con Asmyne Group?",
    a: "Puedes comenzar escribiéndonos por WhatsApp o desde el formulario de contacto. Evaluamos tu necesidad y te guiamos con un plan personalizado.",
  },
  {
    q: "¿Cuánto tiempo tarda una asesoría migratoria?",
    a: "Depende del tipo de trámite y de la documentación disponible. En la primera consulta te damos una estimación clara de tiempos y pasos.",
  },
  {
    q: "¿Qué documentos necesito para comenzar?",
    a: "Generalmente: pasaporte vigente, actas civiles, antecedentes y formularios según el caso. Te entregamos una lista exacta antes de iniciar.",
  },
];

export default function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.toggle("menu-open", mobileNavOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("menu-open");
    };
  }, [mobileNavOpen]);

  return (
    <div className="asmyne-home min-h-screen w-full overflow-x-hidden text-white">
      <SiteEffects />

      <header data-header className="site-header">
        <div className="header-inner">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <Image src="/asmyne-group-logo.png" alt="Logo Asmyne Group" width={48} height={48} className="h-11 w-11 object-contain" />
            <span className="text-lg md:text-xl font-semibold tracking-wide whitespace-nowrap">
              Asmyne <span className="text-accent">Group</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/services/conseil-migratoire" className="hidden md:inline-flex btn-gold">
              Comenzar Aquí
            </Link>
            <button
              type="button"
              className="burger md:hidden"
              data-burger
              aria-label={mobileNavOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((v) => !v)}
            >
              <span className={mobileNavOpen ? "is-open" : ""} />
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-drawer ${mobileNavOpen ? "is-open" : ""}`} aria-hidden={!mobileNavOpen}>
        <div className="mobile-drawer-backdrop" onClick={() => setMobileNavOpen(false)} />
        <nav className="mobile-drawer-panel">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileNavOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/services/conseil-migratoire" className="btn-gold mt-4 justify-center" onClick={() => setMobileNavOpen(false)}>
            Comenzar Aquí
          </Link>
        </nav>
      </div>

      <section data-home-hero className="hero">
        <GoldParticles className="hero-particles" quantity={56} />
        <div className="hero-shade" />
        <div className="hero-grid">
          <div className="hero-copy">
            <p data-fade className="eyebrow">
              Un solo lugar, infinitas soluciones.
            </p>
            <h1 data-split className="hero-title font-display">
              Todas tus soluciones digitales en un solo ecosistema
            </h1>
            <div data-fade className="hero-actions">
              <Link href="/services/conseil-migratoire" className="btn-gold">
                Comenzar Aquí
              </Link>
              <a
                href="https://embed.app.guidde.com/playbooks/rLrBGTRBbpjVwVjLuNqBWh?mode=videoOnly"
                target="_blank"
                rel="noreferrer noopener"
                className="btn-ghost"
              >
                Ver la demostración
              </a>
            </div>
          </div>
          <HeroGlobeR3F>
            <div className="globe-logo">
              <Image
                src="/asmyne-group-logo.png"
                alt="Logo Asmyne Group"
                width={420}
                height={420}
                className="logo-float h-auto w-full object-contain"
                priority
              />
            </div>
          </HeroGlobeR3F>
        </div>
      </section>

      <ServicesSection />

      <section className="stats-row" data-stagger>
        <div className="stat">
          <div className="stat-num" data-count="10K+">10K+</div>
          <div className="stat-label">Clientes satisfechos</div>
        </div>
        <div className="stat">
          <div className="stat-num" data-count="150+">150+</div>
          <div className="stat-label">Países atendidos</div>
        </div>
        <div className="stat">
          <div className="stat-num" data-count="99.9%">99.9%</div>
          <div className="stat-label">Seguridad garantizada</div>
        </div>
        <div className="stat">
          <div className="stat-num">24/7</div>
          <div className="stat-label">Soporte disponible</div>
        </div>
      </section>

      <section className="about-section">
        <div data-reveal className="about-photo" data-ripple>
          <img src="/asmyne-pierre.jpg" alt="Asmyne Pierre" data-parallax />
        </div>
        <div className="about-copy" data-fade>
          <div className="eyebrow">Sobre nosotros</div>
          <h2 className="font-display section-title">Somos una plataforma integral</h2>
          <p className="font-semibold text-white">
            Somos una plataforma integral dedicada a ofrecer asesoría migratoria, empresarial y soluciones digitales innovadoras para personas y negocios. Nuestro objetivo es brindar un acompañamiento profesional, confiable y personalizado que ayude a nuestros clientes a crecer, regularizar sus procesos y alcanzar nuevas oportunidades.
          </p>
          <p>
            También ofrecemos servicios de viajes, contenido informativo, soluciones de belleza y herramientas digitales adaptadas a las necesidades actuales. Trabajamos con compromiso, responsabilidad y visión para conectar a cada persona con soluciones efectivas y modernas.
          </p>
          <Link href="/blog" className="btn-gold mt-2 w-fit">
            READ MORE
          </Link>
        </div>
      </section>

      <section className="why-section">
        <h2 data-split className="font-display section-title text-center">Por qué elegir Asmyne Group</h2>
        <p data-fade className="section-lead">
          Ayuda y orientación en todo tu camino para tomar las mejores decisiones.
        </p>
        <div className="why-grid" data-stagger>
          {whyCards.map((card) => (
            <article key={card.title} className="glass-card" data-tilt>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="office-band">
        <img src="/cta-office-bg.png" alt="Bureau" data-parallax />
      </section>

      <section className="city-section">
        <div data-fade>
          <h2 className="font-display section-title">
            Somos verdaderamente excelentes en servicios en la ciudad
          </h2>
          <p>
            Somos una agencia familiar con experiencia empírica, combinando generaciones de trabajo práctico con análisis basados en datos para ofrecer los mejores resultados a nuestros clientes.
          </p>
          <div className="hero-actions mt-6">
            <Link href="/contact" className="btn-gold">Habla con un experto</Link>
            <a href="tel:+18093086370" className="btn-ghost">Call: +1-(809) 308-6370</a>
          </div>
        </div>
        <div data-reveal data-ripple className="city-photo">
          <img src="/images/real-estate-building.png" alt="Real Estate Building" />
        </div>
      </section>

      <section className="features-section">
        <h2 data-split className="features-word font-display">FEATURES</h2>
        <div className="features-grid" data-stagger>
          <div className="feature">
            <div className="stat-num" data-count="2007">2007</div>
            <div className="stat-label">Year of Establishment</div>
          </div>
          <div className="feature">
            <div className="stat-num" data-count="547">547</div>
            <div className="stat-label">Successful Projects</div>
          </div>
          <div className="feature">
            <div className="stat-num" data-count="45+">45+</div>
            <div className="stat-label">Global Partners</div>
          </div>
          <div className="feature">
            <div className="stat-num" data-count="1500">1500</div>
            <div className="stat-label">Team Members</div>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div data-fade className="faq-intro">
          <div className="eyebrow">Preguntas Frecuentes Generales (FAQ)</div>
          <h2 className="font-display section-title">
            ¿Tienes dudas?<br />Revisa las FAQ o contáctanos
          </h2>
          <p>
            Aquí encontrarás respuestas rápidas sobre nuestros servicios digitales, asesorías y procesos. Si necesitas ayuda personalizada, nuestro equipo está listo para orientarte paso a paso.
          </p>
          <Link href="/faq" className="btn-gold w-fit">Ver más preguntas frecuentes</Link>
        </div>
        <div className="faq-list">
          {faqs.map((item, i) => {
            const open = openFaq === i;
            return (
              <div key={item.q} className={`faq-item ${open ? "is-open" : ""}`}>
                <button type="button" onClick={() => setOpenFaq(open ? -1 : i)}>
                  <span>{item.q}</span>
                  <span className="faq-icon">{open ? "–" : "+"}</span>
                </button>
                {open && <p>{item.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <HomeFooter />
    </div>
  );
}
