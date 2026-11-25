import { ObjectId, type Db } from "mongodb";
import { C, toPublic, type PostKind, type PublicMember, type VaultMember } from "@/lib/vault";

export type VaultPost = {
  id: string;
  kind: PostKind;
  title: string;
  body: string;
  createdAt: string;
  mine: boolean;
  author: { id: string; name: string; headline: string } | null;
};

export async function listPosts(db: Db, meId: ObjectId, kind: PostKind | null, authorId?: ObjectId): Promise<VaultPost[]> {
  const filter: Record<string, unknown> = {};
  if (kind) filter.kind = kind;
  if (authorId) filter.authorId = authorId;
  const posts = await db.collection(C.posts).find(filter).sort({ createdAt: -1 }).limit(200).toArray();
  const ids = [...new Set(posts.map((p) => String(p.authorId)))].map((s) => new ObjectId(s));
  const authors = await db
    .collection<VaultMember>(C.members)
    .find({ _id: { $in: ids }, status: "active" }, { projection: { name: 1, headline: 1 } })
    .toArray();
  const byId = new Map(authors.map((a) => [a._id.toString(), a]));
  return posts
    .filter((p) => byId.has(String(p.authorId))) // hide posts from expelled/pending members
    .map((p) => {
      const a = byId.get(String(p.authorId))!;
      return {
        id: String(p._id),
        kind: p.kind,
        title: p.title,
        body: p.body,
        createdAt: new Date(p.createdAt).toISOString(),
        mine: String(p.authorId) === meId.toString(),
        author: { id: a._id.toString(), name: a.name, headline: a.headline || "" },
      };
    });
}

export type VaultThread = { member: PublicMember; last: string; lastAt: string; lastFromMe: boolean; unread: number };

export async function listThreads(db: Db, meId: ObjectId): Promise<VaultThread[]> {
  const rows = await db
    .collection(C.messages)
    .aggregate([
      { $match: { $or: [{ from: meId }, { to: meId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { $cond: [{ $eq: ["$from", meId] }, "$to", "$from"] },
          last: { $first: "$body" },
          lastAt: { $first: "$createdAt" },
          lastFrom: { $first: "$from" },
          unread: {
            $sum: { $cond: [{ $and: [{ $eq: ["$to", meId] }, { $eq: ["$readAt", null] }] }, 1, 0] },
          },
        },
      },
      { $sort: { lastAt: -1 } },
      { $limit: 100 },
    ])
    .toArray();
  const members = await db
    .collection<VaultMember>(C.members)
    .find({ _id: { $in: rows.map((r) => r._id) }, status: "active" })
    .toArray();
  const byId = new Map(members.map((m) => [m._id.toString(), m]));
  return rows
    .filter((r) => byId.has(String(r._id)))
    .map((r) => ({
      member: toPublic(byId.get(String(r._id))!),
      last: String(r.last).slice(0, 140),
      lastAt: new Date(r.lastAt).toISOString(),
      lastFromMe: String(r.lastFrom) === meId.toString(),
      unread: r.unread,
    }));
}

export type VaultMessage = { id: string; body: string; createdAt: string; fromMe: boolean };

/** Messages strictly between `meId` and `otherId`. Marks incoming as read. */
export async function getConversation(db: Db, meId: ObjectId, otherId: ObjectId) {
  const other = await db.collection<VaultMember>(C.members).findOne({ _id: otherId, status: "active" });
  if (!other || other._id.equals(meId)) return null;
  const msgs = await db
    .collection(C.messages)
    .find({
      $or: [
        { from: meId, to: otherId },
        { from: otherId, to: meId },
      ],
    })
    .sort({ createdAt: 1 })
    .limit(500)
    .toArray();
  await db.collection(C.messages).updateMany({ from: otherId, to: meId, readAt: null }, { $set: { readAt: new Date() } });
  return {
    member: toPublic(other),
    messages: msgs.map<VaultMessage>((m) => ({
      id: String(m._id),
      body: m.body,
      createdAt: new Date(m.createdAt).toISOString(),
      fromMe: String(m.from) === meId.toString(),
    })),
  };
}
