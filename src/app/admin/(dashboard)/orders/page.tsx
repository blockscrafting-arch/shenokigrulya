import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";

const PAGE_SIZE = 30;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: { items: true },
    }),
    prisma.order.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold">Заказы</h1>
      <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 bg-black/5">
              <th className="px-4 py-2 text-left font-medium">№</th>
              <th className="px-4 py-2 text-left font-medium">Дата</th>
              <th className="px-4 py-2 text-left font-medium">Клиент</th>
              <th className="px-4 py-2 text-left font-medium">Телефон</th>
              <th className="px-4 py-2 text-left font-medium">Сумма</th>
              <th className="px-4 py-2 text-left font-medium">Оплата</th>
              <th className="px-4 py-2 text-left font-medium">Статус</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-black/5 hover:bg-black/5">
                <td className="px-4 py-2">
                  <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline">
                    #{order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-2 text-text-muted">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-2">{order.customerName}</td>
                <td className="px-4 py-2">{order.customerPhone}</td>
                <td className="px-4 py-2">{formatPrice(order.totalAmount)}</td>
                <td className="px-4 py-2">{order.paymentStatus}</td>
                <td className="px-4 py-2">{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="p-8 text-center text-text-muted">Заказов пока нет</p>
        )}
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">
            Стр. {page} из {totalPages} · всего {total} заказов
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/orders?page=${page - 1}`}
                className="rounded-lg border border-black/10 px-3 py-1.5 hover:bg-black/5"
              >
                ← Назад
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/orders?page=${page + 1}`}
                className="rounded-lg border border-black/10 px-3 py-1.5 hover:bg-black/5"
              >
                Вперёд →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
