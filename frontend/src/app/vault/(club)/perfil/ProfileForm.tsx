"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicMember } from "@/lib/vault";

export default function ProfileForm({ initial, email }: { initial: PublicMember; email: string }) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof PublicMember) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/vault/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMsg({ ok: false, t: d.error || "No se pudo guardar." });
    setF(d.member);
    setMsg({ ok: true, t: "Perfil guardado." });
    router.refresh();
  }

  return (
    <form className="v-card v-form v-profile-form" onSubmit={save}>
      <p className="v-muted">Cuenta: {email}</p>
      <label>Nombre<input value={f.name} onChange={set("name")} maxLength={80} required /></label>
      <label>Titular<input value={f.headline} onChange={set("headline")} maxLength={120} placeholder="Ej. Inversionista inmobiliario" /></label>
      <div className="v-row">
        <label>Empresa<input value={f.company} onChange={set("company")} maxLength={100} /></label>
        <label>Ciudad<input value={f.city} onChange={set("city")} maxLength={80} /></label>
      </div>
      <label>Sitio web<input value={f.website} onChange={set("website")} maxLength={200} placeholder="https://" /></label>
      <label>Sobre mí<textarea value={f.bio} onChange={set("bio")} maxLength={1500} rows={5} /></label>
      {msg && <p className={msg.ok ? "v-ok" : "v-err"}>{msg.t}</p>}
      <div className="v-row v-end"><button className="v-btn" disabled={busy}>{busy ? "Guardando…" : "Guardar"}</button></div>
    </form>
  );
}
