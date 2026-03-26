import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendOrderNotification } from "@/lib/telegram";
import { getPayment } from "@/lib/yookassa";
import { createFulfillmentOrder, getFulfillmentOrder } from "@/lib/cdek";

/** Официальные IP ЮKassa для webhook (yookassa.ru/developers/using-api/webhooks) */
const YOOKASSA_IP_RANGES = [
  (ip: string) => ip.startsWith("77.75.153."),
  (ip: string) => ip.startsWith("77.75.154."),
  (ip: string) => ip === "77.75.156.11" || ip === "77.75.156.35",
  (ip: string) => /^185\.71\.(76\.(0|[1-9]|[12]\d|3[0-1])|77\.(0|[1-9]|[12]\d|3[0-1]))$/.test(ip),
  (ip: string) => ip.startsWith("2a02:5180:"),
];
const ALLOWED_IPS = process.env.YOOKASSA_WEBHOOK_IP_WHITELIST?.split(",").map((s) => s.trim()).filter(Boolean);

function isAllowedIp(ip: string | null): boolean {
  if (!ip) return false;
  if (ALLOWED_IPS?.length) return ALLOWED_IPS.includes(ip);
  return YOOKASSA_IP_RANGES.some((fn) => fn(ip));
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? null;
  if (!isAllowedIp(ip)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { type?: string; object?: { id: string; status: string } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.type !== "notification" || !body.object) {
    return NextResponse.json({ ok: true });
  }

  const { id: paymentId } = body.object;
  const payment = await getPayment(paymentId);
  if (!payment) {
    return NextResponse.json({ ok: true });
  }
  if (payment.status !== "succeeded") {
    if (payment.status === "canceled" || payment.status === "cancelled") {
      await prisma.order.updateMany({
        where: { yookassaId: paymentId },
        data: { paymentStatus: "FAILED" },
      });
    }
    return NextResponse.json({ ok: true });
  }

  // Блокировка через FOR UPDATE предотвращает двойное создание фулфилмента
  // при повторных webhook-ах от ЮKassa (ретраи в течение 24 часов)
  const txResult = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw(Prisma.sql`SELECT id FROM "Order" WHERE "yookassaId" = ${paymentId} FOR UPDATE`);

    const found = await tx.order.findFirst({
      where: { yookassaId: paymentId },
      include: { items: { include: { product: true } } },
    });
    if (!found) return { status: "not_found" as const };
    if (found.paymentStatus === "PAID") return { status: "already_paid" as const };
    return { status: "ok" as const, order: found };
  }, { timeout: 15000 });

  if (txResult.status !== "ok") return NextResponse.json({ ok: true });

  const { order } = txResult;

  const ffItems = order.items
    .filter((i) => i.product.cdekFulfillmentProductId)
    .map((i) => ({
      fulfillmentProductId: i.product.cdekFulfillmentProductId!,
      quantity: i.quantity,
    }));

  let cdekFulfillmentOrderUuid: string | null = null;
  let cdekTrackNumber: string | null = null;

  if (ffItems.length > 0) {
    const ffOrder = await createFulfillmentOrder({
      recipient: { name: order.customerName, phone: order.customerPhone },
      pvzCode: order.cdekPvzCode ?? undefined,
      pvzAddress: order.cdekPvzAddress ?? undefined,
      address: order.deliveryAddress ?? undefined,
      items: ffItems,
    });
    if (ffOrder) {
      cdekFulfillmentOrderUuid = ffOrder.orderUuid;
      // FF может вернуть трек не сразу — пробуем через 3 секунды
      await new Promise((r) => setTimeout(r, 3000));
      const ffInfo = await getFulfillmentOrder(ffOrder.orderUuid);
      cdekTrackNumber = ffInfo?.cdek_number ?? ffInfo?.track_number ?? null;
    }
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "PAID",
      paidAt: new Date(),
      status: cdekFulfillmentOrderUuid ? "PROCESSING" : undefined,
      ...(cdekFulfillmentOrderUuid && { cdekFulfillmentOrderUuid }),
      ...(cdekTrackNumber && { cdekTrackNumber }),
    },
  });

  await sendOrderNotification({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    items: order.items.map((i) => ({
      title: i.product.title,
      quantity: i.quantity,
      price: i.price,
    })),
    totalAmount: order.totalAmount,
    deliveryAddress: order.cdekPvzAddress ?? order.deliveryAddress ?? undefined,
    comment: order.comment ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
