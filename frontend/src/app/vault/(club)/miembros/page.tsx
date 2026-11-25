import Link from "next/link";
import { requireMember } from "@/lib/vaultPage";
import { C, toPublic, vaultDb, type VaultMember } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Members() {
  const me = await requireMember();
  const db = await vaultDb();
  const list = (await db.collection<VaultMember>(C.members).find({ status: "active" }).sort({ name: 1 }).limit(500).toArray()).map(toPublic);
  return (
    <>
      <div className="v-head">
        <p className="v-eyebrow">{list.length} miembros</p>
        <h1>Directorio</h1>
        <p className="v-lead">Solo visible para miembros activos del Vault.</p>
      </div>
      <div className="v-grid">
        {list.map((m) => (
          <Link key={m.id} href={`/vault/miembros/${m.id}`} className="v-card v-member">
            <span className="v-avatar">{m.name.charAt(0).toUpperCase()}</span>
            <div>
              <h3>{m.name}{m.id === me._id.toString() && <small> · tú</small>}</h3>
              <p>{m.headline || "Miembro"}</p>
              <p className="v-muted">{[m.company, m.city].filter(Boolean).join(" · ")}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
