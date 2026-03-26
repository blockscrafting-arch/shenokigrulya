import Link from "next/link";

interface OzonButtonProps {
  url: string;
}

/**
 * Кнопка «Купить на OZON» — фирменный визуальный код 2024–2026:
 * SVG-паттерн из изогнутых синих (#005BFF) лент на розовом (#F91155) фоне,
 * точно как в лого-иконке приложения Ozon.
 * Полосы нарисованы кубическими Безье — control-points смещены влево-вниз,
 * создавая живой «закрученный» эффект.
 */
export function OzonButton({ url }: OzonButtonProps) {
  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex w-full overflow-hidden rounded-[1rem] text-white transition-[opacity,transform] hover:opacity-[0.93] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BFF]"
    >
      {/*
        SVG-паттерн: viewBox 100×100 + xMidYMid slice → равномерно кадрируется в кнопку любого размера.
        Каждая синяя лента — замкнутый path из двух кубических Безье.
        Control-points сдвинуты так, что середина каждой кривой отклоняется ~17 единиц влево от прямой,
        создавая плавный изгиб как у оригинальных «завитушек».
      */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Розовый фон */}
        <rect width="100" height="100" fill="#F91155" />

        {/* Синие изогнутые ленты — 4 штуки, шаг 35 единиц по X */}
        {/* Лента 1 */}
        <path
          d="M-20,110 C-40,75 10,25 35,-10 L52,-10 C30,25 -18,75 -3,110 Z"
          fill="#005BFF"
        />
        {/* Лента 2 */}
        <path
          d="M15,110 C-5,75 45,25 70,-10 L87,-10 C65,25 17,75 32,110 Z"
          fill="#005BFF"
        />
        {/* Лента 3 */}
        <path
          d="M50,110 C30,75 80,25 105,-10 L122,-10 C100,25 52,75 67,110 Z"
          fill="#005BFF"
        />
        {/* Лента 4 — частично выходит за правый край */}
        <path
          d="M85,110 C65,75 115,25 140,-10 L157,-10 C135,25 87,75 102,110 Z"
          fill="#005BFF"
        />
      </svg>

      {/* Контент */}
      <span className="relative z-10 flex w-full flex-col items-center justify-center gap-0.5 px-8 py-[18px]">
        <span
          className="text-[11px] font-bold uppercase leading-none tracking-[0.24em]"
          style={{
            fontFamily: "var(--font-body), system-ui, sans-serif",
            textShadow: "0 1px 6px rgba(0,0,0,0.35)",
          }}
        >
          Купить на
        </span>

        <span
          className="font-ozon text-[26px] font-black uppercase leading-none tracking-[0.04em] sm:text-[30px]"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.3)" }}
        >
          OZON
        </span>
      </span>
    </Link>
  );
}
