"use client";

import Image from "next/image";
import Link from "next/link";

export default function VoituresPage() {
  return (
    <>
      <nav className="w-full bg-black text-white py-4 px-8 flex items-center justify-between shadow z-30 relative">
        <div className="flex items-center gap-3">
          <img src="/asmyne-group-logo.png" alt="Asmyne Group" width={48} style={{height: "auto"}} className="object-contain" />
          <span className="text-2xl font-extrabold tracking-tight">Asmyne Viajes</span>
        </div>
        <div className="hidden md:flex gap-8 text-lg font-semibold">
          <a href="/services/agence-voyage" className="hover:underline">Inicio</a>
          <a href="/voitures" className="hover:underline underline">Coches</a>
        </div>
        <div className="text-sm">Contacto: Asmyne Group</div>
      </nav>
      <div className="min-h-screen w-full font-sans overflow-x-hidden flex flex-col items-center justify-center p-0 relative">
        <Image
          src="/images/rentcar.png"
          alt="Alquiler de coches"
          fill
          className="object-cover w-full h-full absolute inset-0 z-0"
          priority
        />
        <div className="relative z-20 w-full flex flex-col items-center justify-center px-4">
          <h1 className="text-3xl font-bold mb-6 text-white drop-shadow">Alquiler de coches</h1>
          <Link href="/contact" className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded shadow-lg text-lg transition">
            Contactar para reservar
          </Link>
        </div>
      </div>
    </>
  );
}
