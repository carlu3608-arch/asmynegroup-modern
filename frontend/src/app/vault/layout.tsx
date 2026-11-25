import type { Metadata } from "next";
import "./vault.css";

export const metadata: Metadata = {
  title: "Asmyne",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  referrer: "no-referrer",
};

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return <div className="vault-root">{children}</div>;
}
