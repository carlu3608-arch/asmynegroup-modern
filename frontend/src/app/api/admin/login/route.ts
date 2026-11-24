import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getMongoDb } from "@/lib/mongodb";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { ADMIN_COOKIE, ensureAdminUser, signAdminToken } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`admin-login:${ip}`, 8, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  if (!process.env.JWT_SECRET) {
    return NextResponse.json(
      { error: "Configuración incompleta: falta JWT_SECRET en el servidor." },
      { status: 500 },
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "Correo y contraseña obligatorios." }, { status: 400 });
  }

  let db;
  try {
    db = await getMongoDb();
  } catch {
    return NextResponse.json(
      { error: "No se pudo conectar con la base de datos. Inténtalo más tarde." },
      { status: 503 },
    );
  }

  try {
    await ensureAdminUser(db);
    const user = await db.collection("users").findOne<{
      _id: { toString: () => string };
      email: string;
      role?: string;
      passwordHash?: string;
      password?: string;
    }>({ email });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Credenciales inválidas o sin permiso de administrador." }, { status: 401 });
    }

    let ok = false;
    if (user.passwordHash) ok = await bcrypt.compare(password, user.passwordHash);
    else if (user.password) ok = password === user.password;

    if (!ok) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    const token = signAdminToken({ sub: user._id.toString(), email: user.email, role: "admin" });
    if (!token) {
      return NextResponse.json({ error: "No se pudo generar la sesión." }, { status: 500 });
    }

    const res = NextResponse.json({ ok: true, email: user.email });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 2,
    });
    return res;
  } catch (e) {
    const detail = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: "Error del servidor.", detail }, { status: 500 });
  }
}
