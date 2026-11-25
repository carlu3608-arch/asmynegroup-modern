"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PublicMember } from "@/lib/vault";
import type { VaultMessage } from "@/lib/vaultData";

export default function Chat({ member, initial }: { member: PublicMember; initial: VaultMessage[] }) {
  const [msgs, setMsgs] = useState(initial);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const end = useRef<HTMLDivElement>(null);

  async function refresh() {
    const res = await fetch(`/api/vault/messages/${member.id}`, { cache: "no-store" });
    if (res.ok) setMsgs((await res.json()).messages);
  }

  useEffect(() => {
    const t = setInterval(refresh, 6000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member.id]);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [msgs.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setErr("");
    const res = await fetch(`/api/vault/messages/${member.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return setErr(d.error || "No se pudo enviar.");
    }
    setText("");
    refresh();
  }

  return (
    <section className="v-card v-chat">
      <header className="v-chat-head">
        <Link href="/vault/mensajes" className="v-link">←</Link>
        <span className="v-avatar">{member.name.charAt(0).toUpperCase()}</span>
        <div>
          <Link href={`/vault/miembros/${member.id}`}><h3>{member.name}</h3></Link>
          <p className="v-muted">{member.headline}</p>
        </div>
      </header>
      <div className="v-chat-body">
        {msgs.length === 0 && <p className="v-empty">Escribe el primer mensaje. Es privado entre ustedes dos.</p>}
        {msgs.map((m) => (
          <div key={m.id} className={`v-bubble ${m.fromMe ? "me" : ""}`}>
            <p>{m.body}</p>
            <time>{new Date(m.createdAt).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}</time>
          </div>
        ))}
        <div ref={end} />
      </div>
      <form className="v-chat-form" onSubmit={send}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje privado…" maxLength={2000} aria-label="Mensaje" />
        <button className="v-btn" disabled={!text.trim()}>Enviar</button>
      </form>
      {err && <p className="v-err">{err}</p>}
    </section>
  );
}
