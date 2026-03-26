"use client";

import Image from "next/image";
import { motion } from "motion/react";

interface HeroSectionProps {
  title: string;
  description?: string | null;
  heroImage?: string;
  price: number;
  badges: string[];
}

export function HeroSection({
  title,
  description,
  heroImage,
  price,
  badges,
}: HeroSectionProps) {
  const formattedPrice = new Intl.NumberFormat("ru-RU").format(price / 100);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-surface via-surface-alt/40 to-brand-light/20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid min-h-[85vh] grid-cols-1 items-center gap-8 py-16 lg:grid-cols-2 lg:gap-16 lg:py-0">
          {/* Text content */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <div className="mb-6 flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center rounded-full border border-brand/20 bg-brand-light px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-dark"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <h1 className="font-heading text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.5rem]">
                Забота, которой
                <br />
                <span className="bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
                  он достоин
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-secondary">
                {description || title}
                {" "}
                Натуральные ингредиенты, проверенный состав, счастливый питомец.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <a
                  href="#product"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand-dark hover:shadow-xl hover:shadow-brand/30 active:scale-[0.98]"
                >
                  Заказать за {formattedPrice}&nbsp;&#8381;
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
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
                </a>
                <a
                  href="#product"
                  className="inline-flex items-center justify-center rounded-full border-2 border-ink/10 px-8 py-4 text-base font-semibold text-ink transition-all hover:border-ink/20 hover:bg-ink/[0.03]"
                >
                  Узнать состав
                </a>
              </div>
            </motion.div>
          </div>

          {/* Hero image */}
          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.9,
              delay: 0.15,
              ease: [0.25, 0.4, 0.25, 1],
            }}
          >
            <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-[2rem] bg-surface-alt shadow-2xl shadow-ink/10 lg:max-w-full">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt="Корм Щенок Игруля"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-ink-muted">
                  Фото товара
                </div>
              )}
              <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
              <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-brand/15 blur-3xl" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Soft wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="block w-full"
        >
          <path
            d="M0 56V28C360 0 720 0 1080 28C1260 42 1350 49 1440 56H0Z"
            fill="var(--surface-card)"
          />
        </svg>
      </div>
    </section>
  );
}
