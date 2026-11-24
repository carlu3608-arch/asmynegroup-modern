
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Outfit, Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

import CartProviderBridge from "./shared/CartProviderBridge";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import BrandSync from "@/components/BrandSync";
import ClientToastWrapper from "./shared/ClientToastWrapper";
import { verifyAuthToken } from "@/lib/jwt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Asmyne Group — Soluciones digitales",
  description: "Asmyne Group ofrece asesoría migratoria, empresarial y servicios digitales adaptados para clientes internacionales.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("asmyne_auth")?.value;
  const session = sessionToken ? verifyAuthToken(sessionToken) : null;
  const cartPrefix = session && typeof session !== "string" && session.sub ? `cart:${session.sub}` : "cart:guest";

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${display.variable} ${manrope.variable} h-full antialiased`}
    >
      <head />
      <body className="relative min-h-full flex flex-col overflow-x-hidden text-gray-800 bg-gray-50">
        <LanguageProvider>
          <BrandSync />
          <ClientToastWrapper>
          <CartProviderBridge userCartPrefix={cartPrefix}>
            <div className="relative z-10">
              {children}
            </div>
          </CartProviderBridge>
          </ClientToastWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}
