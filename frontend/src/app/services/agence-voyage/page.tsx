"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function AgenceVoyage() {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

		if (!isClient) return null;

	return (
		<div className="min-h-screen w-full bg-white font-sans overflow-x-hidden" style={{ background: '#fff' }}>
			{/* Barra de navegación */}
			<nav className="w-full bg-blue-900 text-white py-4 px-8 flex items-center justify-between shadow">
				<div className="flex items-center gap-3">
					<Image src="/asmyne-group-logo.png" alt="Asmyne Group" width={48} height={48} className="object-contain" />
					<span className="text-2xl font-extrabold tracking-tight">Asmyne Viajes</span>
				</div>
				<div className="hidden md:flex gap-8 text-lg font-semibold">
					<a href="#vols" className="hover:underline">Vuelos</a>
					  	<a href="/voitures" className="hover:underline">Coches</a>
					</div>
				<div className="text-sm">Contacto: Asmyne Group</div>
			</nav>
			<section className="w-full min-h-[28rem] flex flex-col items-center justify-center relative m-0 p-0 overflow-hidden">
			  {/* Imagen de fondo */}
			<Image
				src="/heroes/agence-voyage.png"
				alt="Agencia de viajes"
			    fill
			    className="object-cover w-full h-full absolute inset-0 z-0"
			    priority
			  />
			  {/* Contenido del hero sobre la imagen */}
			  <div className="relative z-20 flex flex-col items-center justify-center w-full h-full min-h-[28rem]">
			    <a href="/contact" className="relative z-20 mt-6 inline-flex rounded-full bg-blue-900 px-8 py-3 font-semibold text-white shadow">Contactar para reservar</a>
			    
			  </div>
			</section>
		</div>
			);
}
