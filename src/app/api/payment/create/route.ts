import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createPayment, getPayment } from "@/lib/yookassa";
import { signOrderId } from "@/lib/successSign";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function returnUrl(orderId: string): string {
  const sig = signOrderId(orderId);
  return `${BASE_URL}/checkout/success?orderId=${encodeURIComponent(orderId)}&sig=${sig}`;
}

export async function POST(request: Request) {
  const body = await request.json();
  const orderId = body.orderId as string | undefined;
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  type Result =
    | { status: 404 }
    | { status: "alreadyPaid"; confirmationUrl: string }
    | { status: "existing"; confirmationUrl: string }
    | { status: "created"; confirmationUrl: string };

  let result: Result;
  try {
    result = await prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw(Prisma.sql`SELECT id FROM "Order" WHERE id = ${orderId} FOR UPDATE`);
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: { include: { product: true } } },
        });
        if (!order) return { status: 404 as const };
        if (order.paymentStatus === "PAID") {
          return { status: "alreadyPaid" as const, confirmationUrl: returnUrl(order.id) };
        }
        if (order.yookassaId) {
          const existing = await getPayment(order.yookassaId);
          if (existing?.status === "succeeded") {
            await tx.order.update({
              where: { id: order.id },
              data: { paymentStatus: "PAID", paidAt: new Date() },
            });
            return { status: "alreadyPaid" as const, confirmationUrl: returnUrl(order.id) };
          }
          if (existing?.status === "pending" && existing.confirmation?.confirmation_url) {
            return { status: "existing" as const, confirmationUrl: existing.confirmation.confirmation_url };
          }
        }
        const { confirmationUrl, paymentId } = await createPayment({
          amount: order.totalAmount,
          orderId: order.id,
          description: `Заказ #${order.orderNumber}`,
          returnUrl: returnUrl(order.id),
          customerEmail: order.customerEmail,
          items: order.items.map((i) => ({
            title: i.product.title,
            quantity: i.quantity,
            price: i.price,
          })),
        });
        await tx.order.update({
          where: { id: order.id },
          data: { yookassaId: paymentId },
        });
        return { status: "created" as const, confirmationUrl };
      },
      { timeout: 15000 }
    );
  } catch (e) {
    console.error("YooKassa createPayment error:", e);
    return NextResponse.json(
      { error: "Не удалось создать платёж. Попробуйте позже." },
      { status: 500 }
    );
  }

  if (result.status === 404) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const payload =
    result.status === "alreadyPaid"
      ? { confirmationUrl: result.confirmationUrl, alreadyPaid: true }
      : { confirmationUrl: result.confirmationUrl };
  return NextResponse.json(payload);
}
