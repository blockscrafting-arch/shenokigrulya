"use client";

import React, { useState } from "react";
import type { Product } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";
import { OzonButton } from "./OzonButton";

interface ProductInfoProps {
  product: Product;
}

const BADGE_BG = "bg-white border border-black/[0.1] shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

/* ── Иконки бейджей — единый стиль Emoji (как Холистик / Без глютена) ── */

/** Emoji-иконка: выглядит как в ТЗ на всех современных браузерах */
function Emoji({ ch }: { ch: string }) {
  return (
    <span
      aria-hidden
      className="select-none leading-none"
      style={{ fontFamily: "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif", fontSize: 18 }}
    >
      {ch}
    </span>
  );
}

const BADGE_CONFIG: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
  "Гипоаллергенный": { icon: <Emoji ch="🛡️" />,      bg: BADGE_BG, text: "text-ink-dark" },
  "Холистик":        { icon: <Emoji ch="🥩" />,      bg: BADGE_BG, text: "text-ink-dark" },
  "37,5% мяса":      { icon: <Emoji ch="🥩" />,      bg: BADGE_BG, text: "text-ink-dark" },
  "37.5% мяса":      { icon: <Emoji ch="🥩" />,      bg: BADGE_BG, text: "text-ink-dark" },
  "Без глютена":     { icon: <Emoji ch="🌿" />,      bg: BADGE_BG, text: "text-ink-dark" },
  "Натуральный":     { icon: <Emoji ch="🌿" />,      bg: BADGE_BG, text: "text-ink-dark" },
};

const DEFAULT_BADGE = {
  icon: <Emoji ch="✅" />,
  bg: BADGE_BG,
  text: "text-ink-dark",
} as const;

function getBadgeConfig(label: string) {
  const t = label.trim();
  if (BADGE_CONFIG[t]) return BADGE_CONFIG[t];
  const lower = t.toLowerCase();
  const key = (Object.keys(BADGE_CONFIG) as (keyof typeof BADGE_CONFIG)[]).find(
    (k) => k.toLowerCase() === lower
  );
  if (key) return BADGE_CONFIG[key];
  return { ...DEFAULT_BADGE };
}

function CompositionBlock({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);

  // Убираем «СОСТАВ:» из начала строки, если оно там есть
  const cleaned = content.replace(/^состав\s*:?\s*/i, "").trim();
  const words = cleaned.split(/\s+/);
  const PREVIEW = 40; // слов в свёрнутом виде
  const hasMore = words.length > PREVIEW;
  const displayText = expanded || !hasMore ? cleaned : words.slice(0, PREVIEW).join(" ");

  return (
    <div className="min-w-0 w-full">
      <p className="text-[15px] leading-[1.65] text-ink-secondary">
        <span className="font-subheading text-[17px] font-bold uppercase leading-[28.05px] tracking-[-0.43px] text-ink-dark">
          СОСТАВ:{" "}
        </span>
        {displayText}
        {!expanded && hasMore && "…"}
      </p>
      {hasMore && (
        <div className="mt-2 flex items-center relative">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full border-t border-line" />
          </div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="relative bg-white pr-4 text-sm font-black uppercase tracking-widest text-ink-dark hover:text-brand transition-colors"
          >
            {expanded ? "Свернуть" : "Развернуть"}
          </button>
        </div>
      )}
    </div>
  );
}

export function ProductInfo({ product }: ProductInfoProps) {
  // Remove 'состав', 'состав:', 'состав: ' etc. from the very beginning of the whole product.title
  const cleanTitle = product.title.replace(/^(состав|состав\s*:)\s*/i, "").trim();

  // If the title contains a newline or a specific pattern, we can split it into a bold title and a normal description
  // But for now, we'll just format it to allow newlines
  const titleParts = cleanTitle.split('\n').filter(p => p.trim());

  return (
    <div className="relative z-0 flex min-h-0 min-w-0 w-full max-w-full flex-col text-left lg:pl-4">
      {/* Title */}
      <h1 className="max-w-full break-words font-heading text-2xl font-bold uppercase leading-[1.1] tracking-wide text-ink-dark sm:text-3xl lg:text-4xl">
        {titleParts[0]}
      </h1>

      {/* Description Paragraph */}
      {titleParts.length > 1 && (
        <div className="mt-4 max-w-full text-base font-medium leading-snug tracking-tight text-ink-dark sm:text-[17px] text-balance">
          {titleParts.slice(1).map((part, index, arr) => (
            <React.Fragment key={index}>
              {part}
              {index < arr.length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Price */}
      <div className="mt-7 flex flex-col gap-1">
        <span className="text-2xl font-black tracking-tight text-brand sm:text-3xl">
          {formatPrice(product.price)}
        </span>
      </div>

      {/* Badges */}
      {product.badges.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2.5">
          {product.badges.map((label) => {
            const config = getBadgeConfig(label);
            return (
              <span
                key={label}
                className={`inline-flex min-w-0 max-w-full items-center gap-2 rounded-[14px] ${config.bg} px-3.5 py-2 text-[15px] font-bold tracking-normal ${config.text}`}
              >
                <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center [&>svg]:block [&>svg]:h-[22px] [&>svg]:w-[22px]">
                  {config.icon}
                </span>
                <span className="min-w-0">{label.trim()}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Composition */}
      {product.composition && (
        <div className="mt-2.5 mb-5">
          <CompositionBlock content={product.composition} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-3 w-full mt-1">
        <AddToCartButton product={product} />
        <p className="font-body text-[16px] font-normal leading-6 tracking-[0.8px] text-ink-secondary uppercase text-center mb-1">
          Цена ниже, чем на маркетплейсах
        </p>
        {product.ozonUrl && <OzonButton url={product.ozonUrl} />}
      </div>
    </div>
  );
}
