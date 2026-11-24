"use client";

import Image from "next/image";
import Link from "next/link";
import { MouseEvent } from "react";
import { useI18n } from "@/i18n/LanguageProvider";
import { serviceSlugs } from "@/i18n/dictionaries";

const DEFAULT_ICON: Record<string, string> = {
  "conseil-migratoire": "/service-migratoire.png",
  "conseil-entrepreneurial": "/service-entrepreneurial.png",
  "hair-solutions": "/service-hair.png",
  "yontikonsey-blog": "/service-blog.png",
  "agence-voyage": "/service-voyage.png",
  "reseau-social": "/service-reseau.png",
  "dating": "/service-dating.png",
  "chatbot-intelligent": "/service-chatbot.png",
  "marketplace-global": "/service-marketplace.png",
  "systeme-monetisation": "/service-monetisation.png",
};

export default function ServicesSection() {
  const { t, image, settings } = useI18n();
  const enabled = settings.sectionsEnabled ?? {};

  const handleRedSocialClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.open("/services/dating", "_blank", "noopener,noreferrer");
    window.location.href = "/services/reseau-social";
  };

  return (
    <section className="services-section">
      <div className="services-grid" data-stagger>
        {serviceSlugs
          .filter((slug) => enabled[slug] !== false)
          .map((slug) => {
            const title = t(`services.${slug}.title`);
            const desc = t(`services.${slug}.desc`);
            const icon = image(slug) || DEFAULT_ICON[slug] || "/asmyne-group-logo.png";
            const isRedSocial = slug === "reseau-social";
            return (
              <Link
                key={slug}
                href={`/services/${slug}`}
                className="service-card glass-card"
                data-tilt
                data-ripple
                onClick={isRedSocial ? handleRedSocialClick : undefined}
              >
                <div className="service-icon">
                  <Image src={icon} alt={title} width={128} height={128} className="object-contain" />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </Link>
            );
          })}
      </div>
    </section>
  );
}
