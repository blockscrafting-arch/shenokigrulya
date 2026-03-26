import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware:
 * 1. Добавляет security-заголовки ко всем ответам
 * 2. Перенаправляет неаутентифицированных пользователей с /admin/* на /admin/login
 *
 * Полная проверка JWT происходит в route-handler-ах через getAdminFromRequest().
 * Middleware — быстрая UX-защита: если куки нет, нет смысла грузить страницу.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ─── Security Headers ────────────────────────────────────────────────────
  // CSP: CDEK-виджет + Яндекс.Карты v3. *.host не покрывает сам host — нужны yastatic.net, yandex.ru и т.д. явно
  const csp = [
    "default-src 'self'",
    // Яндекс.Карты требуют unsafe-eval; бандлы с yastatic.net (в т.ч. корень без субдомена)
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net yastatic.net *.yastatic.net yandex.ru *.yandex.ru yandex.net *.yandex.net *.yandexcloud.net",
    // Яндекс.Карты v3: Web Workers из blob/data — без worker-src fallback на script-src блокирует их
    "worker-src 'self' blob: data:",
    "style-src 'self' 'unsafe-inline' yastatic.net *.yastatic.net yandex.ru *.yandex.ru yandex.net *.yandex.net cdn.jsdelivr.net",
    "img-src * data: blob:",
    "font-src 'self' data: yastatic.net *.yastatic.net yandex.ru *.yandex.ru yandex.net *.yandex.net",
    "connect-src 'self' api.cdek.ru yastatic.net *.yastatic.net yandex.ru *.yandex.ru yandex.net *.yandex.net *.yandexcloud.net api.yookassa.ru",
    "frame-src api.yookassa.ru yandex.ru *.yandex.ru yandex.net *.yandex.net *.yandexcloud.net",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // HSTS только в production (Nginx тоже должен ставить)
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  // ─── Admin Route Protection ──────────────────────────────────────────────
  // Пропускаем страницу логина и API-роуты аутентификации
  const isAdminPage = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  const isAuthApi = pathname.startsWith("/api/auth/");

  if (isAdminPage && !isLoginPage && !isAuthApi) {
    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Применяем ко всем маршрутам кроме Next.js internal, статики, и favicon
    "/((?!_next/static|_next/image|favicon.ico|uploads/).*)",
  ],
};
