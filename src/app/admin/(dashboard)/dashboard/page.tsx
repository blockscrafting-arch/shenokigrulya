import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [todayCount, weekCount, monthSum, recentOrders] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.order.aggregate({
      where: {
        paymentStatus: "PAID",
        paidAt: { gte: new Date(new Date().setDate(1)) },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
  ]);

  const monthSumValue = monthSum._sum.totalAmount ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-2xl font-semibold">Дашборд</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-black/10 bg-white p-4">
          <p className="text-sm text-text-muted">Заказов сегодня</p>
          <p className="text-2xl font-semibold">{todayCount}</p>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-4">
          <p className="text-sm text-text-muted">Заказов за неделю</p>
          <p className="text-2xl font-semibold">{weekCount}</p>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-4">
          <p className="text-sm text-text-muted">Продажи за месяц</p>
          <p className="text-2xl font-semibold">{formatPrice(monthSumValue)}</p>
        </div>
      </div>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Последние заказы</h2>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">
            Все заказы
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-black/5">
                <th className="px-4 py-2 text-left font-medium">№</th>
                <th className="px-4 py-2 text-left font-medium">Дата</th>
                <th className="px-4 py-2 text-left font-medium">Клиент</th>
                <th className="px-4 py-2 text-left font-medium">Сумма</th>
                <th className="px-4 py-2 text-left font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-black/5 hover:bg-black/5">
                  <td className="px-4 py-2">
                    <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline">
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-text-muted">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-2">{order.customerName}</td>
                  <td className="px-4 py-2">{formatPrice(order.totalAmount)}</td>
                  <td className="px-4 py-2">{order.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && (
            <p className="p-4 text-center text-text-muted">Заказов пока нет</p>
          )}
        </div>
      </div>
    </div>
  );
}
