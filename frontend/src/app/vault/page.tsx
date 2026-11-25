import { redirect } from "next/navigation";
import { getPageMember } from "@/lib/vault";
import VaultGate from "./VaultGate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function VaultDoor() {
  const member = await getPageMember();
  if (member) redirect("/vault/salon");
  return <VaultGate />;
}
