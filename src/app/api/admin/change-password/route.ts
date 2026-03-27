import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, verifyPassword, hashPassword } from "@/lib/auth";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const changePasswordRateLimit = new Map<string, { count: number; resetAt: number }>();

// Периодическая очистка устаревших записей (каждые 5 минут)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of changePasswordRateLimit) {
    if (now > entry.resetAt) changePasswordRateLimit.delete(key);
  }
}, 5 * 60_000);

function checkChangePasswordRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = changePasswordRateLimit.get(key);
  if (!entry) {
    changePasswordRateLimit.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (now > entry.resetAt) {
    changePasswordRateLimit.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX_ATTEMPTS;
}

const schema = z.object({
  currentPassword: z.string().min(1, "Введите текущий пароль"),
  newPassword: z.string().min(8, "Новый пароль не менее 8 символов"),
});

export async function POST(request: Request) {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimitKey = `admin:${admin.adminId}`;
  if (!checkChangePasswordRateLimit(rateLimitKey)) {
    return NextResponse.json(
      { error: "Слишком много попыток. Попробуйте через минуту." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const record = await prisma.admin.findUnique({ where: { id: admin.adminId } });
  if (!record || !(await verifyPassword(parsed.data.currentPassword, record.password))) {
    return NextResponse.json({ error: "Неверный текущий пароль" }, { status: 400 });
  }

  const hashed = await hashPassword(parsed.data.newPassword);
  await prisma.admin.update({
    where: { id: admin.adminId },
    data: { password: hashed },
  });
  return NextResponse.json({ ok: true });
}
