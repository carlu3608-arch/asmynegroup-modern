import Link from "next/link";
import { notFound } from "next/navigation";
import AccordionGallery from "../../shared/AccordionGallery";
import ImmigrationFooter from "./ImmigrationFooter";
import ImmigrationNavbar from "./ImmigrationNavbar";
import MiniMigrationAssistant from "./MiniMigrationAssistant";
import { getMongoDb } from "@/lib/mongodb";
import { defaultServices, mergeServices, type CmsService } from "@/lib/cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadServices(): Promise<CmsService[]> {
  try {
    const db = await getMongoDb();
    const doc = await db.collection("siteContent").findOne({ _id: "services" as never });
    return mergeServices(doc?.services as CmsService[] | undefined);
  } catch {
    return defaultServices();
  }
}

function CarouselCards() {
  const carouselData = [
    { img: "/images/Asly Lico Charles P Administrador.png", title: "Asly Lico Charles P.", desc: "Administrador" },
    { img: "/images/Genesis.png", title: "Génesis Gabriela Pérez Sánchez ", desc: "Community Manager y Relaciones Públicas" },
    { img: "/images/Charles.png", title: "Charles Frantzo", desc: "Customers Services superviseur" },
    { img: "/images/blog-hero.jpeg", title: "Asmyne Pierre", desc: "C.E.O" },
  ];
  const loopData = [...carouselData, ...carouselData];
  return (
    <section className="w-full py-16 bg-gradient-to-b from-[#0C1220] to-[#050810]">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-[#C9A96E] mb-3">Nuestro Equipo</h2>
        <p className="text-center text-[#E6D2A8]/90 mb-10">Nuestro compromiso es brindarte la mejor asistencia en cada paso..</p>
        <div className="overflow-hidden">
          <div className="flex w-max gap-6 carousel-cards-track">
            {loopData.map((item, idx) => (
              <article key={`${item.title}-${idx}`} className="w-[250px] md:w-[280px] shrink-0 rounded-3xl overflow-hidden bg-white/90 shadow-xl transition-transform duration-300 hover:-translate-y-1">
                <img src={item.img} alt={item.title} className="h-[260px] w-full object-cover" />
                <div className="p-5 bg-[#e6eef8]">
                  <h3 className="text-4xl font-extrabold tracking-tight text-[#050810] mb-3">{item.title}</h3>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-[#C9A96E] text-white">{item.desc}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ImmigrationPage({ service }: { service: CmsService }) {
  const t = service.texts.es;
  const hero = service.heroUrl || service.photoUrl || "/heroes/asesoria-migratoria.png";
  const photo = service.photoUrl || "/blog-header.jpg";
  return (
    <div className="bg-[#050810] min-h-screen w-full font-sans overflow-x-hidden text-[#F5F0E6]">
      <ImmigrationNavbar />
      <section
        className="w-full min-h-[600px] md:min-h-[900px] bg-center bg-cover flex items-center justify-center relative animate-fade-in"
        style={{ backgroundImage: `url(${hero})`, backgroundPosition: "center", backgroundSize: "cover" }}
      >
        <div className="text-center z-10 px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#C9A96E] drop-shadow-lg mb-4">{t.heroTitle || t.title}</h1>
          <p className="text-lg md:text-2xl text-[#F5F0E6]/90 font-medium mb-8">{t.heroLead || t.desc}</p>
          <a
            href="https://wa.me/18093086370?text=Hola%2C%20quiero%20hablar%20con%20un%20asesor%20migratorio."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 rounded-full bg-[#C9A96E] text-[#050810] font-bold text-lg shadow-lg hover:bg-[#E6D2A8] transition-all duration-300"
          >
            {t.cta || "Descubrir más"}
          </a>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050810]/80 pointer-events-none" />
      </section>

      <section className="w-full py-16 bg-[#0C1220] animate-fade-in">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-12 items-start md:items-stretch">
          <div className="flex-1 min-w-[260px] flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-[#C9A96E] uppercase mb-2 tracking-wide">{t.eyebrow || "Construyendo tu visión"}</h3>
            <h2 className="text-3xl md:text-4xl font-light text-[#F5F0E6] mb-6">{t.whyTitle || "¿Por qué elegir a Asmyne Group?"}</h2>
            <div className="border-t border-[#C9A96E]/40 my-4 w-3/4" />
            <p className="text-[#E6D2A8] mb-4">{t.whyLead}</p>
            <ul className="text-[#E6D2A8] mb-6 space-y-1">
              {(t.bullets || []).map((b) => (
                <li key={b}>✔ {b}</li>
              ))}
            </ul>
            {t.whyBody && <p className="text-[#9A9488] text-sm">{t.whyBody}</p>}
          </div>
          <div className="flex-1 flex flex-col md:flex-row gap-8 w-full items-stretch justify-center">
            <div className="flex-1 flex flex-col items-center justify-center min-w-[220px] max-w-full p-0" style={{ minHeight: "340px" }}>
              <img src={photo} alt={t.title} className="h-[400px] w-full object-cover rounded-xl mb-0" />
            </div>
          </div>
        </div>
      </section>

      <section id="misiones" className="w-full py-20 animate-fade-in">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center text-[#C9A96E] mb-4">Nuestras principales misiones</h2>
          <p className="text-center text-[#E6D2A8]/90 mb-16 max-w-2xl mx-auto">
            Descubre cómo nuestra consultora migratoria te acompaña en cada etapa: trámites administrativos, preparación para el viaje e integración exitosa.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { img: "/images/service-migratoire.png", title: "Asistencia administrativa", desc: "Te ayudamos a reunir todos los documentos necesarios para tus trámites migratorios: pasaporte, visas y formularios oficiales." },
              { img: "/images/service-voyage.png", title: "Preparación para el viaje", desc: "Asesoría personalizada para organizar tu viaje: boletos de avión, seguro, lista de verificación y acompañamiento logístico." },
              { img: "/images/service-entrepreneurial.png", title: "Integración y formación", desc: "Te acompañamos en tu integración: aprendizaje del idioma, descubrimiento de la cultura y consejos prácticos para lograr una instalación exitosa." },
            ].map((m) => (
              <div key={m.title} className="flex flex-col items-center text-center bg-[#0C1220]/80 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 group">
                <div className="mb-6 transition-transform duration-300 group-hover:scale-110">
                  <img src={m.img} alt={m.title} className="h-14 w-14 object-contain" />
                </div>
                <h3 className="text-xl font-bold text-[#C9A96E] mb-2 group-hover:text-[#F5F0E6]">{m.title}</h3>
                <p className="text-[#E6D2A8]/90 mb-4">{m.desc}</p>
                <a href="/services/yontikonsey-blog" className="font-bold text-[#C9A96E]">En savoir plus</a>
              </div>
            ))}
          </div>
        </div>
      </section>
      <AccordionGallery />
      <CarouselCards />
      <MiniMigrationAssistant />
      <ImmigrationFooter />
    </div>
  );
}

function GenericServicePage({ service }: { service: CmsService }) {
  const t = service.texts.es;
  const hero = service.heroUrl || service.photoUrl || service.iconUrl || "/asmyne-group-logo.png";
  return (
    <div className="min-h-screen bg-[#050810] text-[#F5F0E6]">
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand"><span className="brand-mono">A</span> Asmyne <b>Group</b></Link>
          <Link href="/" className="btn-gold">Volver al inicio</Link>
        </div>
      </header>
      <section
        className="w-full min-h-[420px] md:min-h-[560px] bg-center bg-cover flex items-end relative"
        style={{ backgroundImage: `linear-gradient(180deg, rgba(5,8,16,0.2), rgba(5,8,16,0.92)), url(${hero})` }}
      >
        <div className="max-w-5xl mx-auto px-4 pb-12 w-full">
          {t.eyebrow && <div className="text-[#C9A96E] uppercase tracking-widest text-sm mb-3">{t.eyebrow}</div>}
          <h1 className="font-display text-4xl md:text-6xl text-[#F5F0E6] mb-3">{t.heroTitle || t.title}</h1>
          <p className="text-[#E6D2A8] text-lg max-w-2xl">{t.heroLead || t.desc}</p>
          {t.cta && (
            <a href="/contact" className="btn-gold mt-6 inline-flex">{t.cta}</a>
          )}
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-4 py-14 grid gap-10 md:grid-cols-2 items-start">
        <div>
          <h2 className="font-display text-3xl text-[#C9A96E] mb-4">{t.whyTitle || `¿Por qué elegir ${t.title}?`}</h2>
          {t.whyLead && <p className="text-[#E6D2A8] mb-4">{t.whyLead}</p>}
          {(t.bullets || []).length > 0 && (
            <ul className="space-y-2 text-[#E6D2A8]">
              {t.bullets!.map((b) => (
                <li key={b}>✔ {b}</li>
              ))}
            </ul>
          )}
          {t.whyBody && <p className="text-[#9A9488] mt-6">{t.whyBody}</p>}
        </div>
        <div className="rounded-2xl overflow-hidden border border-[#C9A96E]/25 bg-[#0C1220]">
          <img src={service.photoUrl || service.iconUrl || hero} alt={t.title} className="w-full h-[360px] object-cover" />
        </div>
      </section>
      <footer className="border-t border-white/10 py-8 text-center text-[#9A9488] text-sm">
        <Link href="/" className="text-[#C9A96E]">← Volver a Asmyne Group</Link>
      </footer>
    </div>
  );
}

export default async function ServiceSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const services = await loadServices();
  const service = services.find((s) => s.slug === slug && s.enabled);
  if (!service) notFound();

  // Dedicated folders exist for most builtins; [slug] is used for conseil-migratoire + custom.
  if (service.slug === "conseil-migratoire" || service.builtin === false) {
    if (service.slug === "conseil-migratoire") return <ImmigrationPage service={service} />;
    return <GenericServicePage service={service} />;
  }

  // Fallback for any other slug that somehow hits this route
  return <GenericServicePage service={service} />;
}
