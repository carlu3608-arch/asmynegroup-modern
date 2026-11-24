"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  dictionaries,
  editableContent,
  locales,
  localeNames,
  serviceSlugs,
  type Locale,
} from "@/i18n/dictionaries";

type Tab = "contenido" | "solicitudes" | "config";

type Overrides = Partial<Record<Locale, Record<string, string>>>;

type ServiceRequest = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
  status?: string;
  note?: string;
  createdAt?: string;
};

type Settings = {
  siteName?: string;
  contactEmail?: string;
  supportPhone?: string;
  social?: Record<string, string>;
  sectionsEnabled?: Record<string, boolean>;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  approved: "Aprobada",
  rejected: "Rechazada",
  done: "Completada",
};

const SERVICE_TITLES: Record<string, string> = {
  "conseil-migratoire": "Asesoría migratoria",
  "conseil-entrepreneurial": "Asesoría empresarial",
  "hair-solutions": "Soluciones capilares",
  "yontikonsey-blog": "Yontikonsey Blog",
  "agence-voyage": "Agencia de viajes",
  "reseau-social": "Red social",
  "dating": "Encuentros",
  "chatbot-intelligent": "Chatbot inteligente",
  "marketplace-global": "Mercado global",
  "systeme-monetisation": "Plataforma de monetización",
};

export default function AdminDashboard({ adminEmail }: { adminEmail: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("contenido");
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const flash = useCallback((ok: boolean, msg: string) => {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 3500);
  }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="admin-brand">
          <span className="admin-dot" /> Asmyne <b>Admin</b>
        </div>
        <nav>
          <button className={tab === "contenido" ? "active" : ""} onClick={() => setTab("contenido")}>📝 Contenido de la página</button>
          <button className={tab === "solicitudes" ? "active" : ""} onClick={() => setTab("solicitudes")}>📥 Servicios y solicitudes</button>
          <button className={tab === "config" ? "active" : ""} onClick={() => setTab("config")}>⚙️ Configuración</button>
        </nav>
        <div className="admin-side-foot">
          <div className="admin-who">{adminEmail}</div>
          <button className="admin-logout" onClick={logout}>Cerrar sesión</button>
        </div>
      </aside>

      <main className="admin-main">
        {toast && <div className={`admin-toast ${toast.ok ? "ok" : "err"}`}>{toast.msg}</div>}
        {tab === "contenido" && <ContentEditor flash={flash} />}
        {tab === "solicitudes" && <RequestsManager flash={flash} />}
        {tab === "config" && <SettingsPanel flash={flash} />}
      </main>
    </div>
  );
}

/* ------------------------------ Contenido ------------------------------ */
function ContentEditor({ flash }: { flash: (ok: boolean, msg: string) => void }) {
  const [overrides, setOverrides] = useState<Overrides>({});
  const [images, setImages] = useState<Record<string, string>>({});
  const [activeLocale, setActiveLocale] = useState<Locale>("es");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((d) => {
        setOverrides(d.overrides ?? {});
        setImages(d.images ?? {});
        if (d.dbUnavailable) setWarn("La base de datos no está disponible desde el servidor. Puedes editar, pero no se guardará hasta que la conexión funcione.");
      })
      .catch(() => setWarn("No se pudo cargar el contenido."))
      .finally(() => setLoading(false));
  }, []);

  function setValue(locale: Locale, key: string, value: string) {
    setOverrides((prev) => ({ ...prev, [locale]: { ...(prev[locale] ?? {}), [key]: value } }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrides, images }),
      });
      const d = await res.json();
      if (!res.ok) flash(false, d.error ?? "No se pudo guardar.");
      else flash(true, "Contenido guardado.");
    } catch {
      flash(false, "Error de red al guardar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="admin-loading">Cargando contenido…</p>;

  return (
    <section>
      <header className="admin-head">
        <div>
          <h1>Contenido de la página</h1>
          <p>Edita textos e imágenes de la portada. Cada idioma se edita por separado; si dejas un campo vacío se usa el texto por defecto.</p>
        </div>
        <button className="admin-btn-gold" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</button>
      </header>

      {warn && <div className="admin-warn">{warn}</div>}

      <div className="admin-locale-tabs">
        {locales.map((l) => (
          <button key={l} className={l === activeLocale ? "active" : ""} onClick={() => setActiveLocale(l)}>{localeNames[l]}</button>
        ))}
      </div>

      {editableContent.map((group) => (
        <div key={group.group} className="admin-card">
          <h2>{group.group}</h2>
          {group.keys.map(({ key, label, multiline }) => {
            const val = overrides[activeLocale]?.[key] ?? "";
            const placeholder = dictionaries[activeLocale]?.[key] ?? "";
            return (
              <label key={key} className="admin-field">
                <span>{label}</span>
                {multiline ? (
                  <textarea rows={3} value={val} placeholder={placeholder} onChange={(e) => setValue(activeLocale, key, e.target.value)} />
                ) : (
                  <input type="text" value={val} placeholder={placeholder} onChange={(e) => setValue(activeLocale, key, e.target.value)} />
                )}
              </label>
            );
          })}
        </div>
      ))}

      <div className="admin-card">
        <h2>Imágenes de los servicios (URL)</h2>
        <p className="admin-hint">Compartidas entre idiomas. Deja vacío para usar la imagen por defecto.</p>
        {serviceSlugs.map((slug) => (
          <label key={slug} className="admin-field">
            <span>{SERVICE_TITLES[slug] ?? slug}</span>
            <input type="text" value={images[slug] ?? ""} placeholder={`/service-...png`} onChange={(e) => setImages((p) => ({ ...p, [slug]: e.target.value }))} />
          </label>
        ))}
      </div>

      <div className="admin-save-bar">
        <button className="admin-btn-gold" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</button>
      </div>
    </section>
  );
}

/* ----------------------------- Solicitudes ----------------------------- */
function RequestsManager({ flash }: { flash: (ok: boolean, msg: string) => void }) {
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [warn, setWarn] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "general", message: "" });

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/requests")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.requests ?? []);
        if (d.dbUnavailable) setWarn("La base de datos no está disponible desde el servidor. No se pueden listar ni gestionar solicitudes hasta que la conexión funcione.");
        else setWarn(null);
      })
      .catch(() => setWarn("No se pudieron cargar las solicitudes."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { flash(true, "Solicitud actualizada."); load(); }
    else flash(false, "No se pudo actualizar.");
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta solicitud?")) return;
    const res = await fetch(`/api/admin/requests/${id}`, { method: "DELETE" });
    if (res.ok) { flash(true, "Solicitud eliminada."); load(); }
    else flash(false, "No se pudo eliminar.");
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      flash(true, "Solicitud creada.");
      setForm({ name: "", email: "", phone: "", service: "general", message: "" });
      load();
    } else flash(false, "No se pudo crear.");
  }

  return (
    <section>
      <header className="admin-head">
        <div>
          <h1>Servicios y solicitudes</h1>
          <p>Gestiona las solicitudes de asesoría legal, empresarial, capilar, migratoria y demás servicios.</p>
        </div>
        <button className="admin-btn-ghost" onClick={load}>Actualizar</button>
      </header>

      {warn && <div className="admin-warn">{warn}</div>}

      <div className="admin-card">
        <h2>Nueva solicitud (manual)</h2>
        <form className="admin-grid2" onSubmit={create}>
          <label className="admin-field"><span>Nombre</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label className="admin-field"><span>Correo</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
          <label className="admin-field"><span>Teléfono</span><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label className="admin-field"><span>Servicio</span>
            <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
              <option value="general">General</option>
              {serviceSlugs.map((s) => <option key={s} value={s}>{SERVICE_TITLES[s]}</option>)}
            </select>
          </label>
          <label className="admin-field admin-col2"><span>Mensaje</span><textarea rows={2} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
          <div className="admin-col2"><button className="admin-btn-gold" type="submit">Crear solicitud</button></div>
        </form>
      </div>

      <div className="admin-card">
        <h2>Solicitudes ({items.length})</h2>
        {loading ? <p className="admin-loading">Cargando…</p> : items.length === 0 ? (
          <p className="admin-empty">No hay solicitudes todavía.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Fecha</th><th>Nombre</th><th>Contacto</th><th>Servicio</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r._id}>
                    <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("es-DO") : "—"}</td>
                    <td>{r.name ?? "—"}</td>
                    <td>
                      <div>{r.email}</div>
                      {r.phone && <div className="admin-sub">{r.phone}</div>}
                      {r.message && <div className="admin-sub" title={r.message}>{r.message.slice(0, 48)}{r.message.length > 48 ? "…" : ""}</div>}
                    </td>
                    <td>{SERVICE_TITLES[r.service ?? ""] ?? r.service ?? "general"}</td>
                    <td>
                      <select value={r.status ?? "pending"} onChange={(e) => updateStatus(r._id, e.target.value)}>
                        {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </td>
                    <td><button className="admin-del" onClick={() => remove(r._id)}>Eliminar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

/* ----------------------------- Configuración ----------------------------- */
function SettingsPanel({ flash }: { flash: (ok: boolean, msg: string) => void }) {
  const [s, setS] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        setS(d.settings ?? {});
        if (d.dbUnavailable) setWarn("La base de datos no está disponible desde el servidor. Puedes editar, pero no se guardará hasta que la conexión funcione.");
      })
      .catch(() => setWarn("No se pudo cargar la configuración."))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: s }),
      });
      const d = await res.json();
      if (!res.ok) flash(false, d.error ?? "No se pudo guardar.");
      else flash(true, "Configuración guardada.");
    } catch {
      flash(false, "Error de red al guardar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="admin-loading">Cargando configuración…</p>;

  const social = s.social ?? {};
  const sections = s.sectionsEnabled ?? {};

  return (
    <section>
      <header className="admin-head">
        <div>
          <h1>Configuración del sistema</h1>
          <p>Ajustes generales del sitio, contacto, redes sociales y visibilidad de secciones.</p>
        </div>
        <button className="admin-btn-gold" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button>
      </header>

      {warn && <div className="admin-warn">{warn}</div>}

      <div className="admin-card">
        <h2>General</h2>
        <label className="admin-field"><span>Nombre del sitio</span><input value={s.siteName ?? ""} onChange={(e) => setS({ ...s, siteName: e.target.value })} /></label>
        <label className="admin-field"><span>Correo de contacto</span><input type="email" value={s.contactEmail ?? ""} onChange={(e) => setS({ ...s, contactEmail: e.target.value })} /></label>
        <label className="admin-field"><span>Teléfono de soporte</span><input value={s.supportPhone ?? ""} onChange={(e) => setS({ ...s, supportPhone: e.target.value })} /></label>
      </div>

      <div className="admin-card">
        <h2>Redes sociales</h2>
        {["facebook", "instagram", "tiktok", "youtube", "whatsapp"].map((net) => (
          <label key={net} className="admin-field">
            <span style={{ textTransform: "capitalize" }}>{net}</span>
            <input value={social[net] ?? ""} onChange={(e) => setS({ ...s, social: { ...social, [net]: e.target.value } })} placeholder={`https://…`} />
          </label>
        ))}
      </div>

      <div className="admin-card">
        <h2>Secciones visibles</h2>
        <p className="admin-hint">Activa o desactiva cada servicio en la portada.</p>
        <div className="admin-toggles">
          {serviceSlugs.map((slug) => (
            <label key={slug} className="admin-toggle">
              <input
                type="checkbox"
                checked={sections[slug] !== false}
                onChange={(e) => setS({ ...s, sectionsEnabled: { ...sections, [slug]: e.target.checked } })}
              />
              <span>{SERVICE_TITLES[slug] ?? slug}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="admin-save-bar">
        <button className="admin-btn-gold" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button>
      </div>
    </section>
  );
}
