/**
 * Прокси для виджета @cdek-it/widget (замена service.php).
 * Документация: https://github.com/cdek-it/widget/wiki
 * Поддерживает action: offices (список ПВЗ), calculate (расчёт тарифов).
 */
import { NextResponse } from "next/server";
import { getCdekToken } from "@/lib/cdek";

const CDEK_API = process.env.CDEK_API_URL ?? "https://api.cdek.ru/v2";

// Простой rate limiter: не более 60 запросов/мин с одного IP
const widgetRateLimit = new Map<string, { count: number; resetAt: number }>();
const WIDGET_RL_WINDOW_MS = 60_000;
const WIDGET_RL_MAX = 60;

// Очистка устаревших записей каждые 5 минут
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of widgetRateLimit) {
    if (now > entry.resetAt) widgetRateLimit.delete(key);
  }
}, 5 * 60_000);

function checkWidgetRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = widgetRateLimit.get(ip);
  if (!entry) {
    widgetRateLimit.set(ip, { count: 1, resetAt: now + WIDGET_RL_WINDOW_MS });
    return true;
  }
  if (now > entry.resetAt) {
    widgetRateLimit.set(ip, { count: 1, resetAt: now + WIDGET_RL_WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= WIDGET_RL_MAX;
}

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkWidgetRateLimit(ip)) {
    return NextResponse.json({ message: "Too Many Requests" }, { status: 429 });
  }
  return handleRequest(request, Object.fromEntries(new URL(request.url).searchParams));
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkWidgetRateLimit(ip)) {
    return NextResponse.json({ message: "Too Many Requests" }, { status: 429 });
  }
  let body: Record<string, unknown> = {};
  try {
    const raw = await request.text();
    if (raw) body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  const params = Object.fromEntries(new URL(request.url).searchParams);
  return handleRequest(request, { ...params, ...body });
}

async function handleRequest(
  _request: Request,
  requestData: Record<string, unknown>
): Promise<NextResponse> {
  const action = requestData.action as string | undefined;
  if (!action) {
    return NextResponse.json({ message: "Action is required" }, { status: 400 });
  }

  let token: string;
  try {
    token = await getCdekToken();
  } catch (e) {
    console.error("CDEK widget auth error:", e);
    return NextResponse.json(
      { message: "CDEK auth failed" },
      { status: 502 }
    );
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-App-Name": "widget_pvz",
    "X-App-Version": "3.11.1",
    "X-Service-Version": "3.11.1",
  };

  if (action === "offices") {
    const { action: _a, ...query } = requestData;
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "")
        qs.set(k, String(v));
    }
    const url = `${CDEK_API}/deliverypoints?${qs.toString()}`;
    const res = await fetch(url, { headers: { ...headers, "Content-Type": "application/json" } });
    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { message: text || "CDEK offices error" },
        { status: res.status }
      );
    }
    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "application/json", "X-Service-Version": "3.11.1" },
    });
  }

  if (action === "calculate") {
    const { action: _a, ...body } = requestData;
    const res = await fetch(`${CDEK_API}/calculator/tarifflist`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { message: text || "CDEK calculate error" },
        { status: res.status }
      );
    }
    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "application/json", "X-Service-Version": "3.11.1" },
    });
  }

  return NextResponse.json({ message: "Unknown action" }, { status: 400 });
}
