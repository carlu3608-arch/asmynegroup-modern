"use client";

import Image from "next/image";
import Link from "next/link";
import { MouseEvent } from "react";
import { useI18n } from "@/i18n/LanguageProvider";

export default function ServicesSection() {
  const { locale, services, image } = useI18n();

  const handleRedSocialClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.open("/services/dating", "_blank", "noopener,noreferrer");
    window.location.href = "/services/reseau-social";
  };

  const visible = services.filter((s) => s.enabled).sort((a, b) => a.order - b.order);

  return (
    <section className="services-section">
      <div className="services-grid" data-stagger>
        {visible.map((s) => {
          const texts = s.texts[locale] || s.texts.es;
          const title = texts.title;
          const desc = texts.desc;
          const icon = image(s.slug) || s.iconUrl || "/asmyne-group-logo.png";
          const isRedSocial = s.slug === "reseau-social";
          return (
            <Link
              key={s.id || s.slug}
              href={`/services/${s.slug}`}
              className="service-card glass-card"
              data-tilt
              data-ripple
              onClick={isRedSocial ? handleRedSocialClick : undefined}
            >
              <div className="service-icon">
                <Image src={icon} alt={title} width={128} height={128} className="object-contain" unoptimized={icon.startsWith("/api/media/")} />
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
