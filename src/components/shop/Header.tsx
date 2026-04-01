"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { AnimatePresence, motion } from "motion/react";

export function Header() {
  const { totalItems } = useCart();

  return (
    <header className="w-full border-b border-line bg-white">
      <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="flex items-center" aria-label="На главную">
          <Image
            src="/logo/logo-color.svg"
            alt="Щенок Игруля"
            width={172}
            height={52}
            priority
          />
        </Link>

        <Link
          href="/cart"
          className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-secondary transition-colors hover:text-brand"
          aria-label="Корзина"
        >
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <AnimatePresence>
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute right-0 -top-1 flex h-[24px] w-[24px] items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white"
              >
                {totalItems}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>
    </header>
  );
}
