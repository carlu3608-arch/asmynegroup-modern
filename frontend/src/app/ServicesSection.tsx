"use client";

import Image from "next/image";
import Link from "next/link";
import { MouseEvent } from "react";

const services = [
  { icon: "/service-migratoire.png", title: "Asesoría migratoria", desc: "Conseil juridique et accompagnement pour vos démarches migratoires.", slug: "conseil-migratoire" },
  { icon: "/service-entrepreneurial.png", title: "Asesoría empresarial", desc: "Accompagnement pour la création et la gestion d'entreprise.", slug: "conseil-entrepreneurial" },
  { icon: "/service-hair.png", title: "Soluciones capilares", desc: "Vente de produits capillaires et dropshipping.", slug: "hair-solutions" },
  { icon: "/service-blog.png", title: "Yontikonsey Blog", desc: "Blog, conseils, communauté active et SEO optimisé.", slug: "yontikonsey-blog" },
  { icon: "/service-voyage.png", title: "Agencia de viajes", desc: "Réservation de vols, hôtels, excursions, location de voitures, Airbnb.", slug: "agence-voyage" },
  { icon: "/service-reseau.png", title: "Red social", desc: "Profils, publications, likes, commentaires, messagerie privée.", slug: "reseau-social" },
  { icon: "/service-dating.png", title: "Encuentros", desc: "Matching, chat privé, sécurité et modération.", slug: "dating" },
  { icon: "/service-chatbot.png", title: "Chatbot inteligente", desc: "Support client 24/7, aide à la navigation, assistance IA.", slug: "chatbot-intelligent" },
  { icon: "/service-marketplace.png", title: "Mercado global", desc: "Achetez, vendez et gérez vos produits et services dans le monde entier.", slug: "marketplace-global" },
  { icon: "/service-monetisation.png", title: "Plataforma de monetización", desc: "Abonnements, coms, revenus automatiques.", slug: "systeme-monetisation" },
];

export default function ServicesSection() {
  const handleRedSocialClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.open("/services/dating", "_blank", "noopener,noreferrer");
    window.location.href = "/services/reseau-social";
  };

  return (
    <section className="services-section">
      <div className="services-grid" data-stagger>
        {services.map((s) => {
          const isRedSocial = s.slug === "reseau-social";
          return (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="service-card glass-card"
              data-tilt
              data-ripple
              onClick={isRedSocial ? handleRedSocialClick : undefined}
            >
              <div className="service-icon">
                <Image src={s.icon} alt={s.title} width={128} height={128} className="object-contain" />
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
