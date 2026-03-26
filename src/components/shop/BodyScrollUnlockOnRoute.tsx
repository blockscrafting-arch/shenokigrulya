"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Сбрасывает scroll-lock body при смене маршрута (лайтбокс, модалки). */
export function BodyScrollUnlockOnRoute() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = "";
  }, [pathname]);

  return null;
}
