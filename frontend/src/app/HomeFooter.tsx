"use client";
import React from "react";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube, FaWhatsapp } from "react-icons/fa";

export default function HomeFooter() {
  return (
    <footer className="home-footer">
      <div className="footer-grid">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Image src="/asmyne-group-logo.png" alt="Logo Asmyne Group" width={40} height={40} className="h-10 w-10 object-contain" />
            <span className="text-2xl font-extrabold tracking-wide">Asmyne Group</span>
          </div>
          <div className="text-white/70 mb-1">Adresse :</div>
          <div className="mb-3 font-semibold leading-relaxed">
            Casa 12 Calle primera Urb Mirador Isabela Sector Villa Mella Próximo a la avenida Jacobo Majluta Santo Domingo Norte Rep. Dom.
          </div>
          <div className="mb-2 text-white/70">
            Support 24/7 : <a className="font-semibold text-white hover:text-accent" href="tel:+18093086370">1-(809) 308-6370</a>
          </div>
          <div className="mb-2 text-white/70">
            Email : <a className="font-semibold text-white hover:text-accent" href="mailto:contact@asmyne.com">contact@asmyne.com</a>
          </div>
        </div>
        <div>
          <div className="font-bold mb-3 text-lg">Suscribirse</div>
          <div className="text-white/70 mb-3">Suscríbete para recibir nuestras últimas novedades.</div>
          <form className="footer-form" action="#" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Votre email" className="footer-input" />
            <button type="submit" aria-label="Suscribirse" className="footer-submit">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </form>
          <div className="text-xs text-white/50 mt-3">
            En vous inscrivant, vous acceptez les <a href="#" className="underline">Conditions d&apos;utilisation</a> et la <a href="#" className="underline">Politique de confidentialité</a>.
          </div>
        </div>
        <div>
          <div className="font-bold mb-3 text-lg">Nos Services</div>
          <ul className="footer-links">
            <li><a href="/services/asesoria-migratoria">Conseil Migratoire</a></li>
            <li><a href="/services/empresa">Services aux Entreprises</a></li>
            <li><a href="/marketplace">Marketplace</a></li>
            <li><a href="/services/agence-voyage">Agence de Voyage</a></li>
            <li><a href="/services/hair-solutions">Soluciones Capilares</a></li>
            <li><a href="/services/reseau-social">Réseau Social</a></li>
          </ul>
        </div>
        <div>
          <div className="font-bold mb-3 text-lg">Liens Rapides</div>
          <ul className="footer-links">
            <li><a href="/">Accueil</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/about">À propos</a></li>
          </ul>
        </div>
      </div>
      <hr className="my-8 border-white/10" />
      <div className="footer-bottom">
        <div>©2026 Asmyne Group. Tous droits réservés.</div>
        <div className="flex gap-4">
          <a href="https://www.facebook.com/share/1KGpFstMcy/" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><FaFacebookF size={20} /></a>
          <a href="https://www.instagram.com/asmynegroup?igsh=M3FpNzA2dTZzdXl4" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><FaInstagram size={20} /></a>
          <a href="https://www.tiktok.com/@asmynegroup?_r=1&_t=ZS-98GMg7lSOjB" aria-label="TikTok" target="_blank" rel="noopener noreferrer"><FaTiktok size={20} /></a>
          <a href="https://www.youtube.com/@asmynegroup" aria-label="YouTube" target="_blank" rel="noopener noreferrer"><FaYoutube size={20} /></a>
          <a href="https://whatsapp.com/channel/0029Vb77mjJLtOjIa8b3Bn3x" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><FaWhatsapp size={20} /></a>
        </div>
      </div>
    </footer>
  );
}
