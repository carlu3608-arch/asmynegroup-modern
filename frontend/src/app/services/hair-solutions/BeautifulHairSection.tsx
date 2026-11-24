"use client";
import React from "react";

export default function BeautifulHairSection() {
  return (
    <section className="w-full flex flex-col md:flex-row items-center justify-center gap-16 py-20 px-4 rounded-2xl max-w-6xl mx-auto shadow-2xl" style={{background: "linear-gradient(120deg, #0C1220 0%, #E6D2A8 100%)"}}>
      <div className="w-full md:w-1/2 flex justify-center">
        <img
          src="/images/beautiful-hair.png"
          alt="Naturally Beautiful Hair"
          className="rounded-2xl object-cover w-full max-w-[600px] h-auto"
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
        <h2 className="text-5xl font-extrabold mb-6 text-[#C9A96E]">UN CABELLO HERMOSO Y NATURAL</h2>
        <p className="text-2xl text-[#E6D2A8] max-w-xl">
          Una rutina capilar limpia, nutritiva y fortalecida por la naturaleza para mejorar el brillo, la fuerza y la confianza diaria.
        </p>
      </div>
    </section>
  );
}
