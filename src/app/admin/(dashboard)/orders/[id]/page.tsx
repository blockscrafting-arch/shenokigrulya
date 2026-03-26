import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold">Заказ #{order.orderNumber}</h1>
      <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-black/10 bg-white p-6">
          <h2 className="mb-4 font-medium">Покупатель</h2>
          <p>{order.customerName}</p>
          <p>{order.customerPhone}</p>
          <p>{order.customerEmail}</p>
          {order.comment && <p className="mt-2 text-text-muted">{order.comment}</p>}
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-6">
          <h2 className="mb-4 font-medium">Доставка СДЭК</h2>
          <p>Тип: {order.deliveryType === "CDEK_PVZ" ? "ПВЗ" : "Курьер до двери"}</p>
          {order.cdekPvzCode && <p className="text-sm text-text-muted">Код ПВЗ: {order.cdekPvzCode}</p>}
          {order.cdekPvzAddress && <p>{order.cdekPvzAddress}</p>}
          {order.deliveryAddress && <p>{order.deliveryAddress}</p>}
          <p>Стоимость доставки: {formatPrice(order.deliveryCost)}</p>
          {order.cdekTrackNumber && (
            <p className="mt-2">
              Трек-номер:{" "}
              <a
                href={`https://www.cdek.ru/ru/tracking?order_id=${order.cdekTrackNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono font-semibold text-blue-600 underline"
              >
                {order.cdekTrackNumber}
              </a>
            </p>
          )}
          {order.cdekFulfillmentOrderUuid && (
            <p className="mt-1 text-sm text-text-muted">
              FF UUID: <span className="font-mono">{order.cdekFulfillmentOrderUuid}</span>
            </p>
          )}
        </div>
      </div>
      <div className="rounded-xl border border-black/10 bg-white p-6">
        <h2 className="mb-4 font-medium">Товары</h2>
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>
                {item.product.title} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-semibold">Итого: {formatPrice(order.totalAmount)}</p>
        <p className="mt-2 text-sm text-text-muted">
          Оплата: {order.paymentStatus} {order.paidAt && formatDate(order.paidAt)}
        </p>
      </div>
    </div>
  );
}
