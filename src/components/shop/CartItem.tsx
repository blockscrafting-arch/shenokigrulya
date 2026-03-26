"use client";

import Image from "next/image";
import type { CartItem as CartItemType } from "@/types";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex flex-col sm:flex-row gap-5 rounded-3xl border border-line/40 bg-surface-card p-5 transition-shadow hover:shadow-sm">
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-surface-alt">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            unoptimized={
              item.image.startsWith("http") || item.image.startsWith("/uploads")
            }
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-ink-muted">
            &mdash;
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center min-w-0">
        <h3 className="font-heading text-lg font-bold text-ink leading-tight">
          {item.title}
        </h3>
        <p className="mt-1.5 text-[15px] font-medium text-ink-secondary">
          {formatPrice(item.price)} <span className="text-sm font-normal text-ink-muted">за шт.</span>
        </p>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center rounded-xl border border-line/60 bg-surface p-1">
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink transition-colors hover:bg-line/50 active:scale-95"
            >
              &minus;
            </button>
            <span className="w-10 text-center text-[15px] font-semibold text-ink">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink transition-colors hover:bg-line/50 active:scale-95"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            className="text-sm font-medium text-red-500 transition-colors hover:text-red-600 active:text-red-700"
          >
            Удалить
          </button>
        </div>
      </div>

      <div className="flex sm:flex-col sm:items-end justify-between items-center sm:justify-start pt-2 sm:pt-0">
        <div className="text-xl font-bold tracking-tight text-ink">
          {formatPrice(item.price * item.quantity)}
        </div>
      </div>
    </div>
  );
}
