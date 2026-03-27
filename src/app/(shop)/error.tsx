"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Shop error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-5 py-20 text-center">
      <h1 className="mb-4 font-heading text-2xl font-bold text-ink">
        Что-то пошло не так
      </h1>
      <p className="mb-6 text-ink-secondary">
        Произошла ошибка. Попробуйте обновить страницу.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
      >
        Попробовать снова
      </button>
    </div>
  );
}
