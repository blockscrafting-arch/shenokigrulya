import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { createOrderSchema } from "@/lib/validators";
import { sendOrderNotification } from "@/lib/telegram";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { items: { include: { product: true } } },
    }),
    prisma.order.count(),
  ]);

  return NextResponse.json({ orders, total, page, limit });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const productIds = [...new Set(data.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const orderItems: { productId: string; quantity: number; price: number }[] = [];
  let itemsTotal = 0;
  for (const item of data.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Товар не найден или недоступен: ${item.productId}` },
        { status: 400 }
      );
    }
    const price = product.price;
    orderItems.push({ productId: product.id, quantity: item.quantity, price });
    itemsTotal += price * item.quantity;
  }

  const totalAmount = itemsTotal + data.deliveryCost;

  const order = await prisma.order.create({
    data: {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      comment: data.comment ?? null,
      deliveryType: data.deliveryType,
      deliveryAddress: data.deliveryAddress ?? null,
      cdekPvzCode: data.cdekPvzCode ?? null,
      cdekPvzAddress: data.cdekPvzAddress ?? null,
      deliveryCost: data.deliveryCost,
      totalAmount,
      items: {
        create: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber });
}
