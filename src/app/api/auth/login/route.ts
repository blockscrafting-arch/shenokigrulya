import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

const COOKIE_NAME = "admin_token";
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;

const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= MAX_ATTEMPTS;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Слишком много попыток" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const admin = await prisma.admin.findUnique({
    where: { login: parsed.data.login },
  });
  if (!admin || !(await verifyPassword(parsed.data.password, admin.password))) {
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
  }

  const token = generateToken({ adminId: admin.id, login: admin.login });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  return res;
}
