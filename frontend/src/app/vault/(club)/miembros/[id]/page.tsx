import Link from "next/link";
import { notFound } from "next/navigation";
import { requireMember } from "@/lib/vaultPage";
import { C, parseId, toPublic, vaultDb, type VaultMember } from "@/lib/vault";
import { listPosts } from "@/lib/vaultData";
import PostsBoard from "../../salon/PostsBoard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MemberProfile({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireMember();
  const id = parseId((await params).id);
  if (!id) notFound();
  const db = await vaultDb();
  const doc = await db.collection<VaultMember>(C.members).findOne({ _id: id, status: "active" });
  if (!doc) notFound();
  const m = toPublic(doc);
  const posts = await listPosts(db, me._id, null, id);
  const isMe = id.equals(me._id);
  return (
    <>
      <section className="v-card v-profile">
        <span className="v-avatar v-avatar-lg">{m.name.charAt(0).toUpperCase()}</span>
        <div className="v-profile-main">
          <h1>{m.name}</h1>
          <p className="v-lead">{m.headline}</p>
          <p className="v-muted">{[m.company, m.city].filter(Boolean).join(" · ")}</p>
          {m.bio && <p className="v-bio">{m.bio}</p>}
          {m.website && <a className="v-link" href={m.website} target="_blank" rel="noopener noreferrer nofollow">{m.website.replace(/^https?:\/\//, "")}</a>}
        </div>
        {isMe ? (
          <Link href="/vault/perfil" className="v-btn-ghost">Editar perfil</Link>
        ) : (
          <Link href={`/vault/mensajes/${m.id}`} className="v-btn">Enviar mensaje</Link>
        )}
      </section>
      <h2 className="v-h2">Publicaciones</h2>
      <PostsBoard initial={posts} hideComposer />
    </>
  );
}
