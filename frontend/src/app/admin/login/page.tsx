"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo iniciar sesión.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-auth">
      <div className="admin-auth-card">
        <div className="admin-auth-head">
          <Image src="/asmyne-group-logo.png" alt="Asmyne Group" width={56} height={56} className="h-14 w-14 object-contain" />
          <h1>Panel de administración</h1>
          <p>Acceso exclusivo para administradores de Asmyne Group.</p>
        </div>
        <form onSubmit={onSubmit} className="admin-form">
          <label>
            <span>Correo</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@asmyne.com" autoComplete="username" />
          </label>
          <label>
            <span>Contraseña</span>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          </label>
          {error && <p className="admin-error">{error}</p>}
          <button type="submit" className="admin-btn-gold" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
