"use client";

import HomeFooter from "./HomeFooter";
import ServicesSection from "./ServicesSection";
import SiteEffects from "@/components/SiteEffects";
import GoldParticles from "@/components/GoldParticles";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/LanguageProvider";
import LanguageSwitcher from "@/i18n/LanguageSwitcher";

export default function Home() {
  const { t } = useI18n();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const nav = [
    { href: "/", label: t("nav.inicio") },
    { href: "/services/marketplace-global", label: t("nav.marketplace") },
    { href: "/blog", label: t("nav.blog") },
    { href: "/contact", label: t("nav.contacto") },
  ];

  const whyCards = [1, 2, 3, 4, 5, 6].map((i) => ({
    title: t(`why.card${i}.title`),
    desc: t(`why.card${i}.desc`),
  }));

  const faqs = [1, 2, 3].map((i) => ({ q: t(`faq.q${i}`), a: t(`faq.a${i}`) }));

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
          <Link href="/" className="brand">
            <span className="brand-mono" aria-hidden="true">A</span>
            Asmyne <b>Group</b>
          </Link>
          <nav className="header-links">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={item.href === "/" ? "nav-link is-active" : "nav-link"}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="header-right">
            <LanguageSwitcher inline />
            <Link href="/services/conseil-migratoire" className="btn-gold nav-cta">
              {t("nav.cta")}
            </Link>
            <button
              type="button"
              className="burger"
              data-burger
              aria-label={mobileNavOpen ? t("nav.closeMenu") : t("nav.openMenu")}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((v) => !v)}
            >
              <i /><i />
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
          <div className="mt-4"><LanguageSwitcher /></div>
          <Link href="/services/conseil-migratoire" className="btn-gold mt-4 justify-center" onClick={() => setMobileNavOpen(false)}>
            {t("nav.cta")}
          </Link>
        </nav>
      </div>

      <section data-home-hero className="hero">
        <GoldParticles className="hero-particles" quantity={40} />
        <div className="hero-shade" />
        <div className="hero-grid">
          <div className="hero-copy">
            <p data-fade className="eyebrow">{t("hero.eyebrow")}</p>
            <h1 data-fade className="hero-title font-display">
              {t("hero.titlePrefix")} <em>{t("hero.titleAccent")}</em>
            </h1>
            <p data-fade className="hero-lead">{t("hero.lead")}</p>
            <div data-fade className="hero-actions">
              <Link href="/services/conseil-migratoire" className="btn-gold">
                {t("hero.cta")} <span aria-hidden="true">→</span>
              </Link>
              <a
                href="https://embed.app.guidde.com/playbooks/rLrBGTRBbpjVwVjLuNqBWh?mode=videoOnly"
                target="_blank"
                rel="noreferrer noopener"
                className="btn-ghost"
              >
                <span className="play" aria-hidden="true">▶</span>
                {t("hero.demo")}
              </a>
            </div>
            <div data-fade className="hero-stats">
              <div>+10<span>{t("hero.statServices")}</span></div>
              <div>24/7<span>{t("hero.statSupport")}</span></div>
              <div>1<span>{t("hero.statEcosystem")}</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <img src="/globe-premium.jpg" alt="Asmyne Group" />
            <div className="hero-tag">
              {t("hero.tag")}
              <br />
              <b>{t("hero.tag2")}</b>
            </div>
          </div>
        </div>
      </section>

      <ServicesSection />

      <section className="stats-row" data-stagger>
        <div className="stat">
          <div className="stat-num" data-count="10K+">10K+</div>
          <div className="stat-label">{t("stats.clients")}</div>
        </div>
        <div className="stat">
          <div className="stat-num" data-count="150+">150+</div>
          <div className="stat-label">{t("stats.countries")}</div>
        </div>
        <div className="stat">
          <div className="stat-num" data-count="99.9%">99.9%</div>
          <div className="stat-label">{t("stats.security")}</div>
        </div>
        <div className="stat">
          <div className="stat-num">24/7</div>
          <div className="stat-label">{t("stats.support")}</div>
        </div>
      </section>

      <section className="about-section">
        <div data-reveal className="about-photo" data-ripple>
          <img src="/asmyne-pierre.jpg" alt="Asmyne Pierre" data-parallax />
        </div>
        <div className="about-copy" data-fade>
          <div className="eyebrow">{t("about.eyebrow")}</div>
          <h2 className="font-display section-title">{t("about.title")}</h2>
          <p className="font-semibold text-white">{t("about.p1")}</p>
          <p>{t("about.p2")}</p>
          <Link href="/blog" className="btn-gold mt-2 w-fit">{t("about.more")}</Link>
        </div>
      </section>

      <section className="why-section">
        <h2 data-split className="font-display section-title text-center">{t("why.title")}</h2>
        <p data-fade className="section-lead">{t("why.lead")}</p>
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
          <h2 className="font-display section-title">{t("city.title")}</h2>
          <p>{t("city.p")}</p>
          <div className="hero-actions mt-6">
            <Link href="/contact" className="btn-gold">{t("city.cta1")}</Link>
            <a href="tel:+18093086370" className="btn-ghost">{t("city.cta2")}</a>
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
            <div className="stat-label">{t("stats2.year")}</div>
          </div>
          <div className="feature">
            <div className="stat-num" data-count="547">547</div>
            <div className="stat-label">{t("stats2.projects")}</div>
          </div>
          <div className="feature">
            <div className="stat-num" data-count="45+">45+</div>
            <div className="stat-label">{t("stats2.partners")}</div>
          </div>
          <div className="feature">
            <div className="stat-num" data-count="1500">1500</div>
            <div className="stat-label">{t("stats2.team")}</div>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div data-fade className="faq-intro">
          <div className="eyebrow">{t("faq.eyebrow")}</div>
          <h2 className="font-display section-title">
            {t("faq.title.l1")}<br />{t("faq.title.l2")}
          </h2>
          <p>{t("faq.p")}</p>
          <Link href="/faq" className="btn-gold w-fit">{t("faq.cta")}</Link>
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
