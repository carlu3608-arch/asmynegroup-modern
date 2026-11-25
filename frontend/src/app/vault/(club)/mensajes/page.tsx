import Link from "next/link";
import { requireMember } from "@/lib/vaultPage";
import { vaultDb } from "@/lib/vault";
import { listThreads } from "@/lib/vaultData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Inbox() {
  const me = await requireMember();
  const threads = await listThreads(await vaultDb(), me._id);
  return (
    <>
      <div className="v-head">
        <p className="v-eyebrow">Privado · 1 a 1</p>
        <h1>Mensajes</h1>
        <p className="v-lead">Solo tú y la otra persona pueden leer cada conversación. Para empezar, abre el perfil de un miembro.</p>
      </div>
      {threads.length === 0 && <p className="v-empty">Aún no tienes conversaciones. <Link className="v-link" href="/vault/miembros">Ver miembros →</Link></p>}
      <div className="v-list">
        {threads.map((t) => (
          <Link key={t.member.id} href={`/vault/mensajes/${t.member.id}`} className="v-card v-thread">
            <span className="v-avatar">{t.member.name.charAt(0).toUpperCase()}</span>
            <div className="v-thread-main">
              <h3>{t.member.name}</h3>
              <p className="v-muted">{t.lastFromMe ? "Tú: " : ""}{t.last}</p>
            </div>
            {t.unread > 0 && <span className="v-badge">{t.unread}</span>}
          </Link>
        ))}
      </div>
    </>
  );
}
