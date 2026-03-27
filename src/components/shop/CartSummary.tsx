"use client";
// NOTE: компонент не используется в текущем UI (вытеснен инлайн-версткой в cart/page.tsx)
// Зарезервирован на случай возврата к отдельной странице корзины.

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";

interface CartSummaryProps {
  deliveryCost?: number;
  isCheckout?: boolean;
}

export function CartSummary({
  deliveryCost,
  isCheckout = false,
}: CartSummaryProps) {
  const { totalPrice } = useCart();
  const delivery = deliveryCost ?? 0;
  const totalWithDelivery = totalPrice + delivery;

  return (
    <div className="rounded-3xl border border-line/60 bg-surface px-6 py-8 shadow-sm">
      <h2 className="mb-6 font-heading text-2xl font-bold text-ink">Итого</h2>

      <div className="space-y-4 text-[15px]">
        <div className="flex justify-between items-center text-ink-secondary">
          <span className="font-medium">Товары</span>
          <span className="font-bold text-ink">{formatPrice(totalPrice)}</span>
        </div>
        {isCheckout && (
          <div className="flex justify-between items-center text-ink-secondary">
            <span className="font-medium">Доставка</span>
            <span className="font-bold text-ink">
              {formatPrice(delivery)}
            </span>
          </div>
        )}
      </div>

      <div className="my-6 border-t border-line/60" />

      <div className="flex items-end justify-between">
        <span className="text-base font-semibold text-ink-secondary">К оплате</span>
        <span className="text-3xl font-bold tracking-tight text-ink">
          {formatPrice(totalWithDelivery)}
        </span>
      </div>

      {!isCheckout && (
        <>
          <p className="mt-5 text-center text-xs font-medium text-ink-muted">
            Стоимость доставки будет рассчитана при оформлении заказа.
          </p>
          <Link
            href="/checkout"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-4 text-base font-bold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand-dark hover:shadow-xl hover:shadow-brand/30 active:scale-[0.98]"
          >
            Перейти к оформлению
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </>
      )}
    </div>
  );
}
