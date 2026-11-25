"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Emblem from "../Emblem";

const NAV = [
  { href: "/vault/salon", label: "Salón" },
  { href: "/vault/miembros", label: "Miembros" },
  { href: "/vault/mensajes", label: "Mensajes" },
  { href: "/vault/perfil", label: "Mi perfil" },
];

export default function VaultShell({ name, children }: { name: string; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch("/api/vault/logout", { method: "POST" });
    router.replace("/vault");
    router.refresh();
  }
  return (
    <div className="v-shell">
      <header className="v-top">
        <Link href="/vault/salon" className="v-brand">
          <Emblem size={38} />
          <span>Asmyne <em>Vault</em></span>
        </Link>
        <nav className="v-nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={path?.startsWith(n.href) ? "on" : ""}>{n.label}</Link>
          ))}
        </nav>
        <div className="v-me">
          <span className="v-me-name">{name}</span>
          <button onClick={logout} className="v-btn-ghost">Salir</button>
        </div>
      </header>
      <main className="v-main">{children}</main>
    </div>
  );
}
