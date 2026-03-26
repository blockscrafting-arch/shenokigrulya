import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyOrderId } from "@/lib/successSign";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; sig?: string }>;
}) {
  const { orderId, sig } = await searchParams;
  let orderNumber: number | null = null;
  if (orderId && verifyOrderId(orderId, sig ?? null)) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { orderNumber: true, paymentStatus: true },
    });
    if (order?.paymentStatus === "PAID") orderNumber = order.orderNumber;
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-20 text-center md:px-8">
      <div className="mx-auto max-w-md">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <svg
            className="h-8 w-8 text-emerald-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        <h1 className="mb-4 font-heading text-3xl font-bold text-ink">
          Спасибо за заказ!
        </h1>
        {orderNumber != null && (
          <p className="mb-2 text-lg font-semibold text-brand">
            Номер заказа: #{orderNumber}
          </p>
        )}
        <p className="mb-8 text-ink-secondary">
          Вы получите уведомление на email, когда заказ будет отправлен.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand-dark"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
