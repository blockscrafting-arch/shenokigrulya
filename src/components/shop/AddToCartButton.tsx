"use client";

import type { Product } from "@prisma/client";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { items, addItem } = useCart();
  const isInCart = items.some(
    (item) => item.productId === product.id && item.quantity > 0
  );

  if (isInCart) {
    return (
      <Link
        href="/cart"
        className="flex w-full items-center justify-center gap-2 rounded-[1rem] border-2 border-brand bg-white px-8 py-[18px] font-heading text-xl font-bold uppercase tracking-wide text-brand transition-all hover:bg-brand-light/60 hover:scale-[1.02] active:scale-[0.98]"
      >
        <svg
          className="h-[18px] w-[18px]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
        В корзине
      </Link>
    );
  }

  const handleClick = () => {
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.images[0] ?? null,
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-[1rem] bg-brand px-8 py-[18px] font-heading text-xl font-bold uppercase tracking-wide text-white transition-all hover:bg-brand-dark hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-brand/30"
      )}
    >
      Добавить в корзину
    </button>
  );
}
