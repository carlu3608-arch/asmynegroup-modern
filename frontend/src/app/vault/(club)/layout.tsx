import { requireMember } from "@/lib/vaultPage";
import VaultShell from "./VaultShell";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ClubLayout({ children }: { children: React.ReactNode }) {
  const me = await requireMember();
  return <VaultShell name={me.name}>{children}</VaultShell>;
}
