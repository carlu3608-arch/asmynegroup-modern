"use client";

import { useCallback, useEffect, useState } from "react";

type Member = { id: string; email: string; name: string; status: "pending" | "active" | "expelled"; headline: string; createdAt: string; lastLoginAt: string | null };
type Invite = { id: string; hint: string; label: string; autoApprove: boolean; status: string; createdAt: string; expiresAt: string | null; usedAt: string | null; usedBy: { name: string; email: string } | null };
type Activity = { id: string; type: string; at: string; actor: string | null; member: { name: string; email: string } | null; meta: Record<string, unknown> };
type Stats = { total: number; active: number; pending: number; expelled: number; posts: number; messages: number; openInvites: number };

const STATUS: Record<string, string> = { pending: "Pendiente", active: "Activo", expelled: "Expulsado", used: "Usado", revoked: "Revocado", expired: "Vencido" };
const ACT: Record<string, string> = {
  "invite.redeemed": "Canjeó invitación",
  "invite.rejected": "Código rechazado",
  "login.ok": "Inició sesión",
  "login.failed": "Login fallido",
  "profile.updated": "Actualizó perfil",
  "post.created": "Publicó",
  "post.deleted": "Eliminó publicación",
  "message.sent": "Envió mensaje",
  "admin.invite.created": "Admin creó código",
  "admin.invite.revoked": "Admin revocó código",
  "admin.member.approve": "Admin aprobó miembro",
  "admin.member.reinstate": "Admin readmitió miembro",
  "admin.member.expel": "Admin expulsó miembro",
};

const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString("es", { dateStyle: "short", timeStyle: "short" }) : "—");

export default function VaultAdmin({ flash }: { flash: (ok: boolean, msg: string) => void }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [newCode, setNewCode] = useState<string>("");
  const [form, setForm] = useState({ label: "", days: 30, autoApprove: false });

  const load = useCallback(async () => {
    const [m, i, a] = await Promise.all([
      fetch("/api/admin/vault/members").then((r) => r.json()),
      fetch("/api/admin/vault/invites").then((r) => r.json()),
      fetch("/api/admin/vault/activity").then((r) => r.json()),
    ]);
    setMembers(m.members || []);
    setInvites(i.invites || []);
    setActivity(a.activity || []);
    setStats(a.stats || null);
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function createInvite() {
    const res = await fetch("/api/admin/vault/invites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = await res.json();
    if (!res.ok) return flash(false, d.error || "Error");
    setNewCode(d.code);
    flash(true, "Código creado. Cópialo ahora: no se volverá a mostrar.");
    load();
  }

  async function revoke(id: string) {
    if (!confirm("¿Revocar este código?")) return;
    const res = await fetch(`/api/admin/vault/invites/${id}`, { method: "DELETE" });
    const d = await res.json();
    flash(res.ok, res.ok ? "Código revocado." : d.error || "Error");
    load();
  }

  async function act(id: string, action: "approve" | "expel" | "reinstate") {
    if (action === "expel" && !confirm("¿Expulsar a este miembro? Perderá el acceso de inmediato.")) return;
    const res = await fetch(`/api/admin/vault/members/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    const d = await res.json();
    flash(res.ok, res.ok ? "Hecho." : d.error || "Error");
    load();
  }

  return (
    <div>
      <div className="admin-head">
        <h1>🔐 Asmyne Vault</h1>
        <p className="admin-sub">Club privado por invitación. Entrada oculta: <code>/vault</code> o mantener pulsado el logo 1,5 s en la portada.</p>
      </div>

      {stats && (
        <div className="admin-card" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <b>Miembros activos: {stats.active}</b>
          <span>Pendientes: {stats.pending}</span>
          <span>Expulsados: {stats.expelled}</span>
          <span>Publicaciones: {stats.posts}</span>
          <span>Mensajes: {stats.messages}</span>
          <span>Códigos abiertos: {stats.openInvites}</span>
        </div>
      )}

      <section className="admin-card">
        <h2>Códigos de invitación</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label className="admin-field" style={{ flex: "1 1 220px" }}>
            <span>Etiqueta (para quién es)</span>
            <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} maxLength={80} placeholder="Ej. Juan Pérez" />
          </label>
          <label className="admin-field" style={{ width: 140 }}>
            <span>Vence en (días, 0 = nunca)</span>
            <input type="number" min={0} max={365} value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })} />
          </label>
          <label style={{ display: "flex", gap: 6, alignItems: "center", paddingBottom: 10 }}>
            <input type="checkbox" checked={form.autoApprove} onChange={(e) => setForm({ ...form, autoApprove: e.target.checked })} /> Aprobar automáticamente
          </label>
          <button className="admin-btn-gold" onClick={createInvite}>+ Crear código</button>
        </div>
        {newCode && (
          <div className="admin-toast ok" style={{ position: "static", marginTop: 12 }}>
            Nuevo código (se muestra una sola vez): <code data-testid="vault-new-code" style={{ fontSize: 18, letterSpacing: 2 }}>{newCode}</code>{" "}
            <button className="admin-btn-ghost" onClick={() => navigator.clipboard?.writeText(newCode)}>Copiar</button>
          </div>
        )}
        <div className="admin-table-wrap"><table className="admin-table" style={{ marginTop: 14, width: "100%" }}>
          <thead><tr><th>Código</th><th>Etiqueta</th><th>Estado</th><th>Creado</th><th>Vence</th><th>Usado por</th><th /></tr></thead>
          <tbody>
            {invites.map((i) => (
              <tr key={i.id}>
                <td>…{i.hint}</td>
                <td>{i.label || "—"}{i.autoApprove ? " · auto" : ""}</td>
                <td>{STATUS[i.status] || i.status}</td>
                <td>{fmt(i.createdAt)}</td>
                <td>{fmt(i.expiresAt)}</td>
                <td>{i.usedBy ? `${i.usedBy.name} (${i.usedBy.email})` : "—"}</td>
                <td>{i.status === "active" && <button className="admin-del" onClick={() => revoke(i.id)}>Revocar</button>}</td>
              </tr>
            ))}
            {invites.length === 0 && <tr><td colSpan={7}>Sin códigos todavía.</td></tr>}
          </tbody>
        </table></div>
      </section>

      <section className="admin-card">
        <h2>Miembros</h2>
        <div className="admin-table-wrap"><table className="admin-table" style={{ width: "100%" }}>
          <thead><tr><th>Nombre</th><th>Correo</th><th>Estado</th><th>Alta</th><th>Último acceso</th><th /></tr></thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.email}</td>
                <td>{STATUS[m.status]}</td>
                <td>{fmt(m.createdAt)}</td>
                <td>{fmt(m.lastLoginAt)}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {m.status === "pending" && <button className="admin-btn-gold" onClick={() => act(m.id, "approve")}>Aprobar</button>}{" "}
                  {m.status !== "expelled" && <button className="admin-del" onClick={() => act(m.id, "expel")}>Expulsar</button>}
                  {m.status === "expelled" && <button className="admin-btn-ghost" onClick={() => act(m.id, "reinstate")}>Readmitir</button>}
                </td>
              </tr>
            ))}
            {members.length === 0 && <tr><td colSpan={6}>Sin miembros todavía.</td></tr>}
          </tbody>
        </table></div>
      </section>

      <section className="admin-card">
        <h2>Actividad reciente</h2>
        <p className="admin-sub">Por privacidad no se registra el contenido de los mensajes ni el destinatario.</p>
        <div className="admin-table-wrap"><table className="admin-table" style={{ width: "100%" }}>
          <thead><tr><th>Fecha</th><th>Evento</th><th>Miembro / admin</th><th>Detalle</th></tr></thead>
          <tbody>
            {activity.map((a) => (
              <tr key={a.id}>
                <td>{fmt(a.at)}</td>
                <td>{ACT[a.type] || a.type}</td>
                <td>{a.member ? a.member.name : a.actor || "—"}</td>
                <td>{a.meta?.title ? String(a.meta.title) : a.meta?.hint ? `…${a.meta.hint}` : a.meta?.status ? String(a.meta.status) : ""}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </section>
    </div>
  );
}
