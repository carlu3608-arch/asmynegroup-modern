"use client";

import React from "react";
import MagazineMarquee from "./MagazineMarquee";
import HairSolutionsNavbar from "./HairSolutionsNavbar";
import HairSolutionsFooter from "./HairSolutionsFooter";
import { useI18n } from "@/i18n/LanguageProvider";

export default function HairSolutionsPage() {
  const { t, image } = useI18n();
  return (
    <div className="min-h-screen w-full font-sans flex flex-col items-center" style={{background: "linear-gradient(120deg, #0C1220 0%, #E6D2A8 100%)"}}>
      {/* Navbar Shebas dynamique */}
      <HairSolutionsNavbar />


      {/* Hero Shebas */}
      <section className="w-full flex flex-col items-center justify-center min-h-[100vh] px-0 relative overflow-hidden">
        <img src={image("page.hair.hero") || "/heroes/hair-solutions.png"} alt="Soluciones capilares" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{zIndex:0}} />
        {/* Hero sans images de produits */}
        <div className="relative z-10 w-full h-0" />
      </section>

      {/* Bandeau magazines défilant */}
      <MagazineMarquee />

      {/* Section services (conserve l'existant) */}
      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 px-4">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-xl border border-[#E6D2A8]">
          <div className="text-5xl mb-4">🧴</div>
          <div className="font-bold text-2xl mb-2 text-[#8C6B3E]">{t("page.hair.card1.title")}</div>
          <div className="text-[#8C6B3E]/80 text-center">{t("page.hair.card1.desc")}</div>
        </div>
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-xl border border-[#E6D2A8]">
          <div className="text-5xl mb-4">💆‍♀️</div>
          <div className="font-bold text-2xl mb-2 text-[#8C6B3E]">{t("page.hair.card2.title")}</div>
          <div className="text-[#8C6B3E]/80 text-center">{t("page.hair.card2.desc")}</div>
        </div>
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-xl border border-[#E6D2A8]">
          <div className="text-5xl mb-4">🌱</div>
          <div className="font-bold text-2xl mb-2 text-[#8C6B3E]">{t("page.hair.card3.title")}</div>
          <div className="text-[#8C6B3E]/80 text-center">{t("page.hair.card3.desc")}</div>
        </div>
      </section>
      {/* Bandeau magazines défilant inversé en bas */}
      <div className="mt-16 w-full">
        {/* Bandeau magazines défilant inversé juste avant la section Beautiful Hair */}
        <div className="w-full">
          <MagazineMarqueeReverse />
        </div>
        {/* Section Beautiful Hair */}
        <BeautifulHairSection />
        {/* Section Best Sellers */}
        <BestSellersSection />
        {/* Section Power of Nature */}
        <PowerOfNatureSection />
        {/* Section Reviews défilants */}
        <ReviewsMarqueeSection />
        {/* Section FAQ */}
        <FaqSection />

      </div>
      <FooterSection />
    </div>
  );
}
import MagazineMarqueeReverse from "./MagazineMarqueeReverse";
import BeautifulHairSection from "./BeautifulHairSection";
import BestSellersSection from "./BestSellersSection";
import PowerOfNatureSection from "./PowerOfNatureSection";
import ReviewsMarqueeSection from "./ReviewsMarqueeSection";
import FaqSection from "./FaqSection";
import FooterSection from "./FooterSection";
