import { NextResponse } from "next/server";

const COOKIE_NAME = "admin_token";

/** Сброс httpOnly-cookie (с клиента через document.cookie недоступно) */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const cookieSecure =
    process.env.NODE_ENV === "production" && appUrl.startsWith("https://");
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  return res;
}
