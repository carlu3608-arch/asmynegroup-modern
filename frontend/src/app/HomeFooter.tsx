"use client";
import React from "react";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube, FaWhatsapp } from "react-icons/fa";
import { useI18n } from "@/i18n/LanguageProvider";

export default function HomeFooter() {
  const { t, settings, branding } = useI18n();
  const social = settings.social ?? {};
  const email = settings.contactEmail || "contact@asmyne.com";
  const phone = settings.supportPhone || "1-(809) 308-6370";
  const siteName = branding.siteName || settings.siteName || "Asmyne Group";

  return (
    <footer className="home-footer">
      <div className="footer-grid">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Image src={branding.logoUrl || "/asmyne-group-logo.png"} alt="Logo Asmyne Group" width={40} height={40} className="h-10 w-10 object-contain" unoptimized={(branding.logoUrl || "").startsWith("/api/media/")} />
            <span className="text-2xl font-extrabold tracking-wide">{siteName}</span>
          </div>
          <div className="text-white/70 mb-1">{t("footer.address.label")}</div>
          <div className="mb-3 font-semibold leading-relaxed">{t("footer.address")}</div>
          <div className="mb-2 text-white/70">
            {t("footer.support")} <a className="font-semibold text-white hover:text-accent" href={`tel:${phone.replace(/[^0-9+]/g, "")}`}>{phone}</a>
          </div>
          <div className="mb-2 text-white/70">
            {t("footer.email")} <a className="font-semibold text-white hover:text-accent" href={`mailto:${email}`}>{email}</a>
          </div>
        </div>
        <div>
          <div className="font-bold mb-3 text-lg">{t("footer.subscribe.title")}</div>
          <div className="text-white/70 mb-3">{t("footer.subscribe.lead")}</div>
          <form className="footer-form" action="#" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder={t("footer.subscribe.placeholder")} className="footer-input" />
            <button type="submit" aria-label={t("footer.subscribe.title")} className="footer-submit">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </form>
          <div className="text-xs text-white/50 mt-3">
            {t("footer.subscribe.terms.pre")} <a href="#" className="underline">{t("footer.subscribe.terms.tos")}</a> {t("footer.subscribe.terms.and")} <a href="#" className="underline">{t("footer.subscribe.terms.privacy")}</a>.
          </div>
        </div>
        <div>
          <div className="font-bold mb-3 text-lg">{t("footer.services.title")}</div>
          <ul className="footer-links">
            <li><a href="/services/conseil-migratoire">{t("services.conseil-migratoire.title")}</a></li>
            <li><a href="/services/conseil-entrepreneurial">{t("services.conseil-entrepreneurial.title")}</a></li>
            <li><a href="/services/marketplace-global">{t("services.marketplace-global.title")}</a></li>
            <li><a href="/services/agence-voyage">{t("services.agence-voyage.title")}</a></li>
            <li><a href="/services/hair-solutions">{t("services.hair-solutions.title")}</a></li>
            <li><a href="/services/reseau-social">{t("services.reseau-social.title")}</a></li>
          </ul>
        </div>
        <div>
          <div className="font-bold mb-3 text-lg">{t("footer.quick.title")}</div>
          <ul className="footer-links">
            <li><a href="/">{t("footer.link.home")}</a></li>
            <li><a href="/blog">{t("footer.link.blog")}</a></li>
            <li><a href="/contact">{t("footer.link.contact")}</a></li>
            <li><a href="/faq">{t("footer.link.faq")}</a></li>
            <li><a href="/about">{t("footer.link.about")}</a></li>
          </ul>
        </div>
      </div>
      <hr className="my-8 border-white/10" />
      <div className="footer-bottom">
        <div>{t("footer.rights")}</div>
        <div className="flex gap-4">
          {social.facebook !== "" && <a href={social.facebook || "https://www.facebook.com/share/1KGpFstMcy/"} aria-label="Facebook" target="_blank" rel="noopener noreferrer"><FaFacebookF size={20} /></a>}
          {social.instagram !== "" && <a href={social.instagram || "https://www.instagram.com/asmynegroup"} aria-label="Instagram" target="_blank" rel="noopener noreferrer"><FaInstagram size={20} /></a>}
          {social.tiktok !== "" && <a href={social.tiktok || "https://www.tiktok.com/@asmynegroup"} aria-label="TikTok" target="_blank" rel="noopener noreferrer"><FaTiktok size={20} /></a>}
          {social.youtube !== "" && <a href={social.youtube || "https://www.youtube.com/@asmynegroup"} aria-label="YouTube" target="_blank" rel="noopener noreferrer"><FaYoutube size={20} /></a>}
          {social.whatsapp !== "" && <a href={social.whatsapp || "https://whatsapp.com/channel/0029Vb77mjJLtOjIa8b3Bn3x"} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><FaWhatsapp size={20} /></a>}
        </div>
      </div>
    </footer>
  );
}
