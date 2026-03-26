"use client";

import { FadeIn } from "./FadeIn";

const BENEFITS = [
  {
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
    title: "Гипоаллергенный",
    description:
      "Подходит для собак с чувствительным пищеварением и склонностью к аллергии",
  },
  {
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
        />
      </svg>
    ),
    title: "Натуральный состав",
    description:
      "25% дегидрированного мяса индейки и 12,5% свежего мяса — основа рациона",
  },
  {
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
        />
      </svg>
    ),
    title: "Класс Холистик",
    description:
      "Премиальные ингредиенты без искусственных добавок, красителей и ароматизаторов",
  },
  {
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    ),
    title: "Без глютена",
    description:
      "Рацион на базе цельнозернового риса и картофеля — легко усваивается",
  },
];

export function BenefitsSection() {
  return (
    <section id="benefits" className="bg-surface py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <FadeIn>
          <div className="mb-14 text-center">
            <h2 className="font-heading text-3xl font-bold leading-tight text-ink md:text-4xl">
              Почему тысячи хозяев выбирают нас
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit, i) => (
            <FadeIn key={benefit.title} delay={i * 0.08}>
              <div className="group relative h-full rounded-2xl border border-line/60 bg-surface-card p-6 transition-all duration-300 hover:border-brand/20 hover:shadow-xl hover:shadow-brand/[0.06]">
                <div className="mb-5 inline-flex rounded-xl bg-brand-light p-3 text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                  {benefit.icon}
                </div>
                <h3 className="mb-2 text-base font-bold text-ink">
                  {benefit.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-secondary">
                  {benefit.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <div className="mt-16 text-center md:mt-20">
            <a
              href="#product"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand px-10 py-4 text-base font-bold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand-dark hover:shadow-xl hover:shadow-brand/30 active:scale-[0.98]"
            >
              Выбрать корм для питомца
              <svg
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
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
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
