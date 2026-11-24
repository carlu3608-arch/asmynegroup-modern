import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Db } from "mongodb";

export const ADMIN_COOKIE = "asmyne_admin";

export type AdminTokenPayload = {
  sub: string;
  email: string;
  role: "admin";
};

export function signAdminToken(payload: AdminTokenPayload): string | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return jwt.sign(payload, secret, { expiresIn: "2d" });
}

export function verifyAdminToken(token: string | undefined | null): AdminTokenPayload | null {
  if (!token) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const decoded = jwt.verify(token, secret) as AdminTokenPayload;
    if (decoded && decoded.role === "admin") return decoded;
    return null;
  } catch {
    return null;
  }
}

/**
 * Ensures an admin account exists based on ADMIN_EMAIL / ADMIN_PASSWORD env vars.
 * Credentials never live in source. Returns the admin user document or null.
 */
export async function ensureAdminUser(db: Db) {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const users = db.collection("users");

  if (!email || !password) {
    // No seed configured; still allow an existing admin to log in.
    return null;
  }

  const existing = await users.findOne({ email });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 12);
    const res = await users.insertOne({
      email,
      name: "Administrador",
      passwordHash,
      role: "admin",
      createdAt: new Date(),
    });
    return { _id: res.insertedId, email, name: "Administrador", role: "admin", passwordHash };
  }

  // Make sure the configured account carries the admin role and current password.
  const updates: Record<string, unknown> = {};
  if (existing.role !== "admin") updates.role = "admin";
  const hasHash = typeof existing.passwordHash === "string" && existing.passwordHash.length > 0;
  if (!hasHash) {
    updates.passwordHash = await bcrypt.hash(password, 12);
  }
  if (Object.keys(updates).length > 0) {
    await users.updateOne({ _id: existing._id }, { $set: updates, $unset: { password: "" } });
  }
  return { ...existing, ...updates };
}
