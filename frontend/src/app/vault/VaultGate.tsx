"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Emblem from "./Emblem";

type Mode = "login" | "invite";

export default function VaultGate() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [f, setF] = useState({ email: "", password: "", code: "", name: "" });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setInfo("");
    setBusy(true);
    try {
      const res = await fetch(mode === "login" ? "/api/vault/login" : "/api/vault/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "login" ? { email: f.email, password: f.password } : f),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || "No fue posible entrar.");
        return;
      }
      if (data.status === "pending") {
        setInfo(data.message || "Invitación aceptada. Espera la aprobación.");
        setMode("login");
        setF({ ...f, code: "", password: "" });
        return;
      }
      router.replace("/vault/salon");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={`v-gate ${open ? "is-open" : ""}`}>
      <div className="v-gate-stars" aria-hidden="true" />
      <button
        type="button"
        className="v-door"
        aria-label="Entrar"
        onClick={() => setOpen(true)}
        aria-expanded={open}
      >
        <span className="v-door-ring" aria-hidden="true" />
        <Emblem size={open ? 120 : 210} />
      </button>
      <h1 className="v-title">Asmyne <em>Vault</em></h1>
      <p className="v-sub">{open ? "Acceso privado para miembros" : "Toca la A para entrar"}</p>

      {open && (
        <section className="v-card v-gate-card">
          <div className="v-tabs" role="tablist">
            <button role="tab" aria-selected={mode === "login"} className={mode === "login" ? "on" : ""} onClick={() => { setMode("login"); setErr(""); }}>
              Soy miembro
            </button>
            <button role="tab" aria-selected={mode === "invite"} className={mode === "invite" ? "on" : ""} onClick={() => { setMode("invite"); setErr(""); }}>
              Tengo una invitación
            </button>
          </div>
          <form onSubmit={submit} className="v-form" autoComplete="on">
            {mode === "invite" && (
              <>
                <label>Código de invitación
                  <input value={f.code} onChange={set("code")} placeholder="AV-XXXX-XXXX-XXXX" required autoComplete="off" spellCheck={false} maxLength={24} />
                </label>
                <label>Nombre
                  <input value={f.name} onChange={set("name")} required maxLength={80} autoComplete="name" />
                </label>
              </>
            )}
            <label>Correo
              <input type="email" value={f.email} onChange={set("email")} required maxLength={160} autoComplete="email" />
            </label>
            <label>Contraseña
              <input type="password" value={f.password} onChange={set("password")} required minLength={mode === "invite" ? 10 : 1} maxLength={128} autoComplete={mode === "invite" ? "new-password" : "current-password"} />
            </label>
            {mode === "invite" && <p className="v-hint">Mínimo 10 caracteres. El código solo funciona una vez.</p>}
            {err && <p className="v-err" role="alert">{err}</p>}
            {info && <p className="v-ok" role="status">{info}</p>}
            <button className="v-btn" disabled={busy}>{busy ? "Verificando…" : mode === "login" ? "Entrar" : "Canjear invitación"}</button>
          </form>
        </section>
      )}
    </main>
  );
}
