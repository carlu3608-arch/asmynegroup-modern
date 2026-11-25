"use client";

import Link from "next/link";
import { useState } from "react";
import type { VaultPost } from "@/lib/vaultData";

const KINDS = [
  { id: "", label: "Todo" },
  { id: "oferta", label: "Ofertas" },
  { id: "servicio", label: "Servicios" },
  { id: "oportunidad", label: "Oportunidades" },
] as const;

const KIND_LABEL: Record<string, string> = { oferta: "Oferta", servicio: "Servicio", oportunidad: "Oportunidad" };

export default function PostsBoard({ initial, hideComposer = false }: { initial: VaultPost[]; hideComposer?: boolean }) {
  const [posts, setPosts] = useState(initial);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({ kind: "oferta", title: "", body: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function reload(kind = filter) {
    const res = await fetch(`/api/vault/posts${kind ? `?kind=${kind}` : ""}`);
    if (res.ok) setPosts((await res.json()).posts);
  }

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch("/api/vault/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(data.error || "No se pudo publicar.");
    setForm({ ...form, title: "", body: "" });
    reload();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta publicación?")) return;
    const res = await fetch(`/api/vault/posts/${id}`, { method: "DELETE" });
    if (res.ok) setPosts((p) => p.filter((x) => x.id !== id));
  }

  return (
    <div className="v-board">
      {!hideComposer && (
        <form className="v-card v-compose" onSubmit={publish}>
          <div className="v-row">
            <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} aria-label="Tipo">
              <option value="oferta">Oferta</option>
              <option value="servicio">Servicio</option>
              <option value="oportunidad">Oportunidad</option>
            </select>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título" maxLength={140} required />
          </div>
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Describe tu oferta, servicio u oportunidad…" maxLength={3000} rows={3} required />
          {err && <p className="v-err">{err}</p>}
          <div className="v-row v-end"><button className="v-btn" disabled={busy}>{busy ? "Publicando…" : "Publicar"}</button></div>
        </form>
      )}

      {!hideComposer && (
        <div className="v-chips">
          {KINDS.map((k) => (
            <button key={k.id} className={filter === k.id ? "on" : ""} onClick={() => { setFilter(k.id); reload(k.id); }}>{k.label}</button>
          ))}
        </div>
      )}

      {posts.length === 0 && <p className="v-empty">Aún no hay publicaciones.</p>}
      <div className="v-grid">
        {posts.map((p) => (
          <article key={p.id} className="v-card v-post">
            <div className="v-post-top">
              <span className={`v-tag v-tag-${p.kind}`}>{KIND_LABEL[p.kind]}</span>
              <time>{new Date(p.createdAt).toLocaleDateString("es", { day: "numeric", month: "short" })}</time>
            </div>
            <h3>{p.title}</h3>
            <p className="v-post-body">{p.body}</p>
            <div className="v-post-foot">
              {p.author && <Link href={`/vault/miembros/${p.author.id}`} className="v-author">{p.author.name}</Link>}
              {p.mine ? (
                <button className="v-link-danger" onClick={() => remove(p.id)}>Eliminar</button>
              ) : (
                p.author && <Link className="v-link" href={`/vault/mensajes/${p.author.id}`}>Escribir →</Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
