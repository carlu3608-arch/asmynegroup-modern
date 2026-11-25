import { requireMember } from "@/lib/vaultPage";
import { toPublic } from "@/lib/vault";
import ProfileForm from "./ProfileForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MyProfile() {
  const me = await requireMember();
  return (
    <>
      <div className="v-head">
        <p className="v-eyebrow">Privado</p>
        <h1>Mi perfil</h1>
        <p className="v-lead">Tu perfil solo lo ven otros miembros. Tu correo nunca se muestra.</p>
      </div>
      <ProfileForm initial={toPublic(me)} email={me.email} />
    </>
  );
}
