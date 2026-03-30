import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

const COOKIE_NAME = "admin_token";
/** «unknown» IP при прямых вызовах с localhost — общий счётчик на все E2E; 80 хватает на длинный прогон */
const MAX_ATTEMPTS = 80;
const WINDOW_MS = 60_000;

const rateLimit = new Map<string, { count: number; resetAt: number }>();

// Периодическая очистка устаревших записей (каждые 5 минут)
// предотвращает неограниченный рост Map на долгоживущем PM2-процессе
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimit) {
    if (now > entry.resetAt) rateLimit.delete(key);
  }
}, 5 * 60_000);

function checkRateLimit(ip: string): boolean {
  if (process.env.E2E_RELAX_LOGIN_RATELIMIT === "1") return true;
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const cookieSecure =
    process.env.NODE_ENV === "production" && appUrl.startsWith("https://");
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  return res;
}
