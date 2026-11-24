
"use client";
import React from "react";
import { useRouter } from "next/navigation";

const products = [
  {
    name: "Shebas Hair Solutions ✨",
    price: "RD$750",
    image: "/uploads/cover/shebas-hair-solutions.jpeg",
    description: (
      <>
        <ul className="text-left list-disc ml-6 mb-2">
          <li>✔️ Ayuda al crecimiento del cabello</li>
          <li>✔️ Regenera y fortalece el pelo</li>
          <li>✔️ Ayuda a frenar la caída</li>
          <li>✔️ Nutre profundamente desde la raíz</li>
          <li>✔️ Protege y da brillo natural</li>
        </ul>
        <div className="italic text-[#8C6B3E] font-semibold text-center mt-2">“Shebas Hair Solutions — Crecimiento, fuerza y belleza natural.”</div>
      </>
    ),
    slug: "shebas-hair-solutions"
  },
  {
    name: "Shebas Hair Solutions ✨ (Pomada)",
    price: "RD$500",
    image: "/uploads/cover/pomada.png",
    description: (
      <>
        <ul className="text-left list-disc ml-6 mb-2">
          <li>✔️ Ayuda al crecimiento del cabello</li>
          <li>✔️ Regenera y fortalece el pelo</li>
          <li>✔️ Ayuda a frenar la caída</li>
          <li>✔️ Nutre profundamente desde la raíz</li>
          <li>✔️ Protege y da brillo natural</li>
        </ul>
        <div className="italic text-[#8C6B3E] font-semibold text-center mt-2">“Shebas Hair Solutions — Crecimiento, fuerza y belleza natural.”</div>
      </>
    ),
    slug: "shebas-hair-solutions-pomada"
  },
  {
    name: "Shebas Hair Solutions ✨ (Aceite)",
    price: "RD$850",
    image: "/uploads/cover/aceite.png",
    description: (
      <>
        <ul className="text-left list-disc ml-6 mb-2">
          <li>✔️ Ayuda al crecimiento del cabello</li>
          <li>✔️ Regenera y fortalece el pelo</li>
          <li>✔️ Ayuda a frenar la caída</li>
          <li>✔️ Nutre profundamente desde la raíz</li>
          <li>✔️ Protege y da brillo natural</li>
        </ul>
        <div className="italic text-[#8C6B3E] font-semibold text-center mt-2">“Shebas Hair Solutions — Crecimiento, fuerza y belleza natural.”</div>
      </>
    ),
    slug: "shebas-hair-solutions-aceite"
  },
];

export default function BestSellersSection() {
  const router = useRouter();
  // Le composant doit être marqué comme client ("use client") pour utiliser useRouter
  return (
    <section className="w-full flex flex-col items-center py-16 rounded-2xl max-w-6xl mx-auto mt-16 shadow-2xl" style={{background: "linear-gradient(120deg, #0C1220 0%, #E6D2A8 100%)"}}>
      <h2 className="text-5xl font-extrabold mb-2 text-[#C9A96E] text-center">LOS MÁS VENDIDOS</h2>
      <p className="text-lg text-[#E6D2A8] mb-10 text-center">Nuestros esenciales para un cabello hermoso y saludable.</p>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product, idx) => (
          <button
            key={idx}
            className="bg-white/80 rounded-2xl shadow-lg flex flex-col items-center p-6 transition-transform hover:scale-105 focus:outline-none cursor-pointer"
            style={{ textDecoration: 'none' }}
            onClick={() => router.push(`/services/hair-solutions/produit/${product.slug}`)}
          >
            <img src={product.image} alt={product.name} className="rounded-xl object-contain w-full max-w-[260px] h-[260px] mb-4" />
            <div className="text-xl font-semibold text-[#8C6B3E] text-center mb-2">{product.name}</div>
            <div className="text-lg font-bold text-[#8C6B3E] mt-auto">{product.price}</div>
          </button>
        ))}
      </div>
      <div className="w-24 border-b-4 border-[#C9A96E] mt-10" />
    </section>
  );
}
