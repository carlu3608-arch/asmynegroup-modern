import { requireMember } from "@/lib/vaultPage";
import { vaultDb } from "@/lib/vault";
import { listPosts } from "@/lib/vaultData";
import PostsBoard from "./PostsBoard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Salon() {
  const me = await requireMember();
  const posts = await listPosts(await vaultDb(), me._id, null);
  return (
    <>
      <div className="v-head">
        <p className="v-eyebrow">Solo miembros</p>
        <h1>El Salón</h1>
        <p className="v-lead">Ofertas, servicios y oportunidades compartidas entre miembros del círculo.</p>
      </div>
      <PostsBoard initial={posts} />
    </>
  );
}
