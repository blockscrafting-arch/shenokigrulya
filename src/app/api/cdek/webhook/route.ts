import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapCdekStatusToOrderStatus } from "@/lib/cdek";

/**
 * Webhook СДЭК API v2 — приём уведомлений о смене статуса заказа.
 * Подписка: POST https://api.cdek.ru/v2/webhooks { url, type: "ORDER_STATUS" }
 * Документация: https://api-docs.cdek.ru (Webhooks)
 *
 * Аутентификация: shared secret в query string (?secret=...).
 * Задать в env CDEK_WEBHOOK_SECRET. Без него эндпоинт открыт (только для dev).
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.CDEK_WEBHOOK_SECRET;
  if (webhookSecret) {
    const { searchParams } = new URL(request.url);
    const provided = searchParams.get("secret");
    if (provided !== webhookSecret) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  let body: {
    type?: string;
    uuid?: string;
    attributes?: {
      cdek_number?: string;
      number?: string;
      status_code?: string;
      status_date_time?: string;
      is_return?: boolean;
      is_reverse?: boolean;
    };
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.type !== "ORDER_STATUS" || !body.attributes?.status_code) {
    return NextResponse.json({ ok: true });
  }

  const { cdek_number, status_code } = body.attributes;
  if (!cdek_number) return NextResponse.json({ ok: true });

  const newStatus = mapCdekStatusToOrderStatus(status_code);
  if (!newStatus) return NextResponse.json({ ok: true });

  const order = await prisma.order.findFirst({
    where: { cdekTrackNumber: cdek_number },
  });

  if (!order) return NextResponse.json({ ok: true });

  await prisma.order.updateMany({
    where: { cdekTrackNumber: cdek_number },
    data: { status: newStatus },
  });

  return NextResponse.json({ ok: true });
}
