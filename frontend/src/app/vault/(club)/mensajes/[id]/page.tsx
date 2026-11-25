import { notFound } from "next/navigation";
import { requireMember } from "@/lib/vaultPage";
import { parseId, vaultDb } from "@/lib/vault";
import { getConversation } from "@/lib/vaultData";
import Chat from "./Chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Conversation({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireMember();
  const other = parseId((await params).id);
  if (!other || other.equals(me._id)) notFound();
  const convo = await getConversation(await vaultDb(), me._id, other);
  if (!convo) notFound();
  return <Chat member={convo.member} initial={convo.messages} />;
}
