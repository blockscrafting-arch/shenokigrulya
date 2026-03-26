import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { updateOrderStatusSchema } from "@/lib/validators";
import { getFulfillmentOrder } from "@/lib/cdek";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  // Если у заказа есть FF UUID но нет трека — пробуем подтянуть
  if (order.cdekFulfillmentOrderUuid && !order.cdekTrackNumber) {
    const ffInfo = await getFulfillmentOrder(order.cdekFulfillmentOrderUuid);
    const track = ffInfo?.cdek_number ?? ffInfo?.track_number ?? null;
    if (track) {
      await prisma.order.update({ where: { id }, data: { cdekTrackNumber: track } });
      return NextResponse.json({ ...order, cdekTrackNumber: track });
    }
  }

  return NextResponse.json(order);
}
