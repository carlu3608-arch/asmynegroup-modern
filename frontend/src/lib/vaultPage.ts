import { redirect } from "next/navigation";
import { getPageMember } from "@/lib/vault";

/** Server-side guard for every Vault interior page. Without an active member session nothing renders. */
export async function requireMember() {
  const member = await getPageMember();
  if (!member) redirect("/vault");
  return member;
}
