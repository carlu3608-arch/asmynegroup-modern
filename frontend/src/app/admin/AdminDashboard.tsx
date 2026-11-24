"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  dictionaries,
  editableContent,
  pagesContent,
  locales,
  type EditableGroup,
  localeNames,
  type Locale,
} from "@/i18n/dictionaries";
import {
  defaultServices,
  emptyServiceTexts,
  slugify,
  type Branding,
  type CmsService,
  type ServiceTexts,
  DEFAULT_BRANDING,
} from "@/lib/cms";

type Tab = "contenido" | "paginas" | "servicios" | "marca" | "solicitudes" | "config";
type Overrides = Partial<Record<Locale, Record<string, string>>>;

type ServiceRequest = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
  status?: string;
  createdAt?: string;
};

type Settings = {
  siteName?: string;
  contactEmail?: string;
  supportPhone?: string;
  marketplaceUrl?: string;
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

async function uploadDataUrl(dataUrl: string, filename: string, folder = "cms"): Promise<string> {
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl, filename, folder }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al subir");
  return data.url as string;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

function ImageUploadButton({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onPick(file: File | null) {
    if (!file) return;
    setErr("");
    setBusy(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const url = await uploadDataUrl(dataUrl, file.name);
      onChange(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-upload">
      <div className="admin-upload-row">
        {value ? <img src={value} alt="" className="admin-thumb" /> : <div className="admin-thumb empty">—</div>}
        <div className="admin-upload-actions">
          <button type="button" className="admin-btn-ghost" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? "Subiendo…" : label}
          </button>
          {value && (
            <button type="button" className="admin-del" onClick={() => onChange("")}>Quitar</button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={(e) => onPick(e.target.files?.[0] || null)}
          />
          {value && <div className="admin-sub" style={{ wordBreak: "break-all" }}>{value}</div>}
          {err && <div className="admin-error">{err}</div>}
        </div>
      </div>
    </div>
  );
}

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
          <span className="admin-dot" /> Asmyne <b>CMS</b>
        </div>
        <nav>
          <button className={tab === "contenido" ? "active" : ""} onClick={() => setTab("contenido")}>📝 Textos de la portada</button>
          <button className={tab === "paginas" ? "active" : ""} onClick={() => setTab("paginas")}>📄 Páginas de servicios</button>
          <button className={tab === "servicios" ? "active" : ""} onClick={() => setTab("servicios")}>🧩 Servicios</button>
          <button className={tab === "marca" ? "active" : ""} onClick={() => setTab("marca")}>🎨 Marca e imágenes</button>
          <button className={tab === "solicitudes" ? "active" : ""} onClick={() => setTab("solicitudes")}>📥 Solicitudes</button>
          <button className={tab === "config" ? "active" : ""} onClick={() => setTab("config")}>⚙️ Configuración</button>
        </nav>
        <div className="admin-side-foot">
          <div className="admin-who">{adminEmail}</div>
          <a className="admin-logout" href="/" target="_blank" rel="noreferrer" style={{ display: "block", textAlign: "center", marginBottom: 8 }}>Ver sitio ↗</a>
          <button className="admin-logout" onClick={logout}>Cerrar sesión</button>
        </div>
      </aside>

      <main className="admin-main">
        {toast && <div className={`admin-toast ${toast.ok ? "ok" : "err"}`}>{toast.msg}</div>}
        {tab === "contenido" && (
          <ContentEditor
            flash={flash}
            groups={editableContent}
            title="Textos de la portada"
            subtitle="Edita cualquier texto de la portada por idioma. Campo vacío = texto por defecto del sitio."
          />
        )}
        {tab === "paginas" && (
          <ContentEditor
            flash={flash}
            groups={pagesContent}
            title="Páginas de servicios"
            subtitle="Edita los textos e imagen principal de cada página de servicio, por idioma. Campo vacío = texto por defecto."
          />
        )}
        {tab === "servicios" && <ServicesManager flash={flash} />}
        {tab === "marca" && <BrandPanel flash={flash} />}
        {tab === "solicitudes" && <RequestsManager flash={flash} />}
        {tab === "config" && <SettingsPanel flash={flash} />}
      </main>
    </div>
  );
}

/* ------------------------------ Contenido ------------------------------ */
function ContentEditor({
  flash,
  groups,
  title,
  subtitle,
}: {
  flash: (ok: boolean, msg: string) => void;
  groups: EditableGroup[];
  title: string;
  subtitle: string;
}) {
  const [overrides, setOverrides] = useState<Overrides>({});
  const [images, setImages] = useState<Record<string, string>>({});
  const hasImages = groups.some((g) => g.image);
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
        if (d.dbUnavailable) setWarn("La base de datos no está disponible. Puedes editar, pero no se guardará hasta que la conexión funcione.");
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
        body: JSON.stringify(hasImages ? { overrides, images } : { overrides }),
      });
      const d = await res.json();
      if (!res.ok) flash(false, d.error ?? "No se pudo guardar.");
      else flash(true, "Cambios guardados. Recarga el sitio para verlos.");
    } catch {
      flash(false, "Error de red al guardar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="admin-loading">Cargando textos…</p>;

  return (
    <section>
      <header className="admin-head">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <button className="admin-btn-gold" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar textos"}</button>
      </header>
      {warn && <div className="admin-warn">{warn}</div>}
      <div className="admin-locale-tabs">
        {locales.map((l) => (
          <button key={l} className={l === activeLocale ? "active" : ""} onClick={() => setActiveLocale(l)}>{localeNames[l]}</button>
        ))}
      </div>
      {groups.map((group) => (
        <div key={group.group} className="admin-card">
          <h2>
            {group.group}
            {group.path && (
              <a href={group.path} target="_blank" rel="noreferrer" className="admin-page-link">Ver página ↗</a>
            )}
          </h2>
          {group.image && (
            <div style={{ marginBottom: 14 }}>
              <div className="admin-field"><span>{group.image.label} (todas las lenguas)</span></div>
              <ImageUploadButton
                label="Cambiar imagen"
                value={images[group.image.key] || group.image.fallback}
                onChange={(url) => setImages((p) => ({ ...p, [group.image!.key]: url }))}
              />
            </div>
          )}
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
      <div className="admin-save-bar">
        <button className="admin-btn-gold" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar textos"}</button>
      </div>
    </section>
  );
}

/* ------------------------------ Servicios ------------------------------ */
function ServicesManager({ flash }: { flash: (ok: boolean, msg: string) => void }) {
  const [items, setItems] = useState<CmsService[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);
  const [activeLocale, setActiveLocale] = useState<Locale>("es");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/services")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.services ?? defaultServices());
        if (d.dbUnavailable) setWarn("DB no disponible: los cambios no se guardarán.");
      })
      .catch(() => setWarn("No se pudieron cargar los servicios."))
      .finally(() => setLoading(false));
  }, []);

  function update(id: string, patch: Partial<CmsService>) {
    setItems((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function updateTexts(id: string, locale: Locale, patch: Partial<ServiceTexts>) {
    setItems((list) =>
      list.map((s) =>
        s.id === id
          ? { ...s, texts: { ...s.texts, [locale]: { ...s.texts[locale], ...patch } } }
          : s,
      ),
    );
  }

  function move(id: string, dir: -1 | 1) {
    setItems((list) => {
      const idx = list.findIndex((s) => s.id === id);
      const j = idx + dir;
      if (idx < 0 || j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[idx], next[j]] = [next[j], next[idx]];
      return next.map((s, i) => ({ ...s, order: i }));
    });
  }

  function addService() {
    const id = `custom-${Date.now()}`;
    const title = "Nuevo servicio";
    const slug = slugify(`${title}-${Date.now().toString().slice(-4)}`);
    const blank = emptyServiceTexts();
    const texts = {
      es: { ...blank, title, desc: "Describe este servicio." },
      en: { ...blank, title: "New service", desc: "Describe this service." },
      fr: { ...blank, title: "Nouveau service", desc: "Décrivez ce service." },
    };
    const svc: CmsService = {
      id,
      slug,
      enabled: true,
      order: items.length,
      builtin: false,
      iconUrl: "/asmyne-group-logo.png",
      heroUrl: "",
      photoUrl: "",
      texts,
    };
    setItems((list) => [...list, svc]);
    setOpenId(id);
  }

  function removeService(id: string) {
    const target = items.find((s) => s.id === id);
    if (!target) return;
    if (target.builtin) {
      // Hide instead of hard-delete builtins
      update(id, { enabled: false });
      flash(true, "Servicio integrado ocultado (puedes volver a activarlo).");
      return;
    }
    if (!confirm("¿Eliminar este servicio personalizado?")) return;
    setItems((list) => list.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i })));
  }

  async function save() {
    setSaving(true);
    try {
      const payload = items.map((s, i) => ({
        ...s,
        order: i,
        slug: slugify(s.slug || s.texts.es.title || `servicio-${i}`),
      }));
      const res = await fetch("/api/admin/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: payload }),
      });
      const d = await res.json();
      if (!res.ok) flash(false, d.error ?? "No se pudo guardar.");
      else {
        setItems(d.services ?? payload);
        flash(true, "Servicios guardados. Ya aparecen en la portada y tienen su página.");
      }
    } catch {
      flash(false, "Error de red al guardar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="admin-loading">Cargando servicios…</p>;

  return (
    <section>
      <header className="admin-head">
        <div>
          <h1>Servicios</h1>
          <p>Agrega, oculta, reordena y edita cada servicio (textos, foto, bullets). Los nuevos reciben su propia página en /services/…</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="admin-btn-ghost" onClick={addService}>+ Agregar servicio</button>
          <button className="admin-btn-gold" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar servicios"}</button>
        </div>
      </header>
      {warn && <div className="admin-warn">{warn}</div>}

      <div className="admin-locale-tabs">
        {locales.map((l) => (
          <button key={l} className={l === activeLocale ? "active" : ""} onClick={() => setActiveLocale(l)}>{localeNames[l]}</button>
        ))}
      </div>

      {items.map((s, idx) => {
        const open = openId === s.id;
        const t = s.texts[activeLocale] || emptyServiceTexts();
        return (
          <div key={s.id} className="admin-card">
            <div className="admin-svc-head">
              <label className="admin-toggle" style={{ margin: 0 }}>
                <input type="checkbox" checked={s.enabled} onChange={(e) => update(s.id, { enabled: e.target.checked })} />
                <span>{s.enabled ? "Visible" : "Oculto"}</span>
              </label>
              <strong style={{ flex: 1 }}>{t.title || s.slug}</strong>
              <span className="admin-sub">/{s.slug}</span>
              <button className="admin-btn-ghost" type="button" onClick={() => move(s.id, -1)} disabled={idx === 0}>↑</button>
              <button className="admin-btn-ghost" type="button" onClick={() => move(s.id, 1)} disabled={idx === items.length - 1}>↓</button>
              <button className="admin-btn-ghost" type="button" onClick={() => setOpenId(open ? null : s.id)}>{open ? "Cerrar" : "Editar"}</button>
              <button className="admin-del" type="button" onClick={() => removeService(s.id)}>{s.builtin ? "Ocultar" : "Eliminar"}</button>
            </div>
            {open && (
              <div className="admin-svc-body">
                <div className="admin-grid2">
                  <label className="admin-field">
                    <span>Slug (URL)</span>
                    <input value={s.slug} disabled={s.builtin} onChange={(e) => update(s.id, { slug: slugify(e.target.value) })} />
                  </label>
                  <label className="admin-field">
                    <span>Título ({localeNames[activeLocale]})</span>
                    <input value={t.title} onChange={(e) => updateTexts(s.id, activeLocale, { title: e.target.value })} />
                  </label>
                  <label className="admin-field admin-col2">
                    <span>Descripción corta (tarjeta de portada)</span>
                    <textarea rows={2} value={t.desc} onChange={(e) => updateTexts(s.id, activeLocale, { desc: e.target.value })} />
                  </label>
                  <label className="admin-field">
                    <span>Eyebrow / etiqueta</span>
                    <input value={t.eyebrow || ""} onChange={(e) => updateTexts(s.id, activeLocale, { eyebrow: e.target.value })} />
                  </label>
                  <label className="admin-field">
                    <span>CTA / botón</span>
                    <input value={t.cta || ""} onChange={(e) => updateTexts(s.id, activeLocale, { cta: e.target.value })} />
                  </label>
                  <label className="admin-field">
                    <span>Título hero</span>
                    <input value={t.heroTitle || ""} onChange={(e) => updateTexts(s.id, activeLocale, { heroTitle: e.target.value })} />
                  </label>
                  <label className="admin-field">
                    <span>Subtítulo hero</span>
                    <input value={t.heroLead || ""} onChange={(e) => updateTexts(s.id, activeLocale, { heroLead: e.target.value })} />
                  </label>
                  <label className="admin-field admin-col2">
                    <span>Título «por qué elegir»</span>
                    <input value={t.whyTitle || ""} onChange={(e) => updateTexts(s.id, activeLocale, { whyTitle: e.target.value })} />
                  </label>
                  <label className="admin-field admin-col2">
                    <span>Intro «por qué elegir»</span>
                    <textarea rows={2} value={t.whyLead || ""} onChange={(e) => updateTexts(s.id, activeLocale, { whyLead: e.target.value })} />
                  </label>
                  <label className="admin-field admin-col2">
                    <span>Texto largo</span>
                    <textarea rows={3} value={t.whyBody || ""} onChange={(e) => updateTexts(s.id, activeLocale, { whyBody: e.target.value })} />
                  </label>
                  <label className="admin-field admin-col2">
                    <span>Bullets (uno por línea)</span>
                    <textarea
                      rows={4}
                      value={(t.bullets || []).join("\n")}
                      onChange={(e) =>
                        updateTexts(s.id, activeLocale, {
                          bullets: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean),
                        })
                      }
                    />
                  </label>
                </div>
                <div className="admin-grid2" style={{ marginTop: 12 }}>
                  <div>
                    <div className="admin-field"><span>Icono (tarjeta)</span></div>
                    <ImageUploadButton label="Subir icono" value={s.iconUrl} onChange={(url) => update(s.id, { iconUrl: url })} />
                  </div>
                  <div>
                    <div className="admin-field"><span>Imagen / foto de sección</span></div>
                    <ImageUploadButton label="Subir foto" value={s.photoUrl || s.heroUrl} onChange={(url) => update(s.id, { photoUrl: url, heroUrl: url })} />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="admin-save-bar">
        <button className="admin-btn-ghost" onClick={addService}>+ Agregar servicio</button>
        <button className="admin-btn-gold" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar servicios"}</button>
      </div>
    </section>
  );
}

/* ------------------------------ Marca ------------------------------ */
function BrandPanel({ flash }: { flash: (ok: boolean, msg: string) => void }) {
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/branding").then((r) => r.json()),
      fetch("/api/admin/content").then((r) => r.json()),
    ])
      .then(([b, c]) => {
        setBranding(b.branding ?? DEFAULT_BRANDING);
        setImages(c.images ?? {});
        if (b.dbUnavailable || c.dbUnavailable) setWarn("DB no disponible: los cambios no se guardarán.");
      })
      .catch(() => setWarn("No se pudo cargar la marca."))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const [bRes, cRes] = await Promise.all([
        fetch("/api/admin/branding", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branding }),
        }),
        fetch("/api/admin/content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images }),
        }),
      ]);
      const b = await bRes.json();
      const c = await cRes.json();
      if (!bRes.ok) flash(false, b.error ?? "No se pudo guardar la marca.");
      else if (!cRes.ok) flash(false, c.error ?? "No se pudieron guardar las imágenes.");
      else flash(true, "Marca e imágenes guardadas.");
    } catch {
      flash(false, "Error de red al guardar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="admin-loading">Cargando marca…</p>;

  return (
    <section>
      <header className="admin-head">
        <div>
          <h1>Marca e imágenes</h1>
          <p>Cambia el nombre del sitio, el logo y las imágenes de sección. El logo se refleja en header, footer y título de la página.</p>
        </div>
        <button className="admin-btn-gold" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar marca"}</button>
      </header>
      {warn && <div className="admin-warn">{warn}</div>}

      <div className="admin-card">
        <h2>Identidad</h2>
        <label className="admin-field">
          <span>Nombre del sitio</span>
          <input value={branding.siteName} onChange={(e) => setBranding({ ...branding, siteName: e.target.value })} />
        </label>
        <div className="admin-field"><span>Logo</span></div>
        <ImageUploadButton
          label="Subir logo"
          value={branding.logoUrl}
          onChange={(url) => setBranding({ ...branding, logoUrl: url || DEFAULT_BRANDING.logoUrl })}
        />
      </div>

      <div className="admin-card">
        <h2>Imágenes de sección (portada)</h2>
        <p className="admin-hint">Opcional. Claves libres; se usan como override de iconos de servicio si coinciden con el slug.</p>
        {["about", "city", "office", "hero"].map((key) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <div className="admin-field"><span>{key}</span></div>
            <ImageUploadButton
              label={`Subir imagen «${key}»`}
              value={images[key] || ""}
              onChange={(url) => setImages((p) => ({ ...p, [key]: url }))}
            />
          </div>
        ))}
      </div>

      <div className="admin-save-bar">
        <button className="admin-btn-gold" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar marca"}</button>
      </div>
    </section>
  );
}

/* ----------------------------- Solicitudes ----------------------------- */
function RequestsManager({ flash }: { flash: (ok: boolean, msg: string) => void }) {
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [warn, setWarn] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/requests")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.requests ?? []);
        if (d.dbUnavailable) setWarn("DB no disponible.");
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
    if (res.ok) { flash(true, "Actualizada."); load(); }
    else flash(false, "No se pudo actualizar.");
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta solicitud?")) return;
    const res = await fetch(`/api/admin/requests/${id}`, { method: "DELETE" });
    if (res.ok) { flash(true, "Eliminada."); load(); }
    else flash(false, "No se pudo eliminar.");
  }

  return (
    <section>
      <header className="admin-head">
        <div>
          <h1>Solicitudes</h1>
          <p>Gestiona las solicitudes de los servicios (migratoria, empresarial, etc.).</p>
        </div>
        <button className="admin-btn-ghost" onClick={load}>Actualizar</button>
      </header>
      {warn && <div className="admin-warn">{warn}</div>}
      <div className="admin-card">
        <h2>Listado ({items.length})</h2>
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
                    </td>
                    <td>{r.service ?? "general"}</td>
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
        if (d.dbUnavailable) setWarn("DB no disponible.");
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

  if (loading) return <p className="admin-loading">Cargando…</p>;
  const social = s.social ?? {};

  return (
    <section>
      <header className="admin-head">
        <div>
          <h1>Configuración</h1>
          <p>Contacto, marketplace y redes sociales.</p>
        </div>
        <button className="admin-btn-gold" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button>
      </header>
      {warn && <div className="admin-warn">{warn}</div>}
      <div className="admin-card">
        <h2>Contacto</h2>
        <label className="admin-field"><span>Correo</span><input type="email" value={s.contactEmail ?? ""} onChange={(e) => setS({ ...s, contactEmail: e.target.value })} /></label>
        <label className="admin-field"><span>Teléfono</span><input value={s.supportPhone ?? ""} onChange={(e) => setS({ ...s, supportPhone: e.target.value })} /></label>
      </div>
      <div className="admin-card">
        <h2>Marketplace Global</h2>
        <label className="admin-field"><span>URL del marketplace</span><input type="url" placeholder="https://market.asmynegroup.com" value={s.marketplaceUrl ?? ""} onChange={(e) => setS({ ...s, marketplaceUrl: e.target.value })} /></label>
        <p style={{ opacity: 0.7, fontSize: "0.85rem", margin: "6px 0 0" }}>Todos los enlaces de Marketplace del sitio redirigen a esta dirección. Cámbiala a https://market.asmynegroup.com cuando el DNS esté listo.</p>
      </div>
      <div className="admin-card">
        <h2>Redes</h2>
        {["facebook", "instagram", "tiktok", "youtube", "whatsapp"].map((net) => (
          <label key={net} className="admin-field">
            <span style={{ textTransform: "capitalize" }}>{net}</span>
            <input value={social[net] ?? ""} onChange={(e) => setS({ ...s, social: { ...social, [net]: e.target.value } })} />
          </label>
        ))}
      </div>
    </section>
  );
}
