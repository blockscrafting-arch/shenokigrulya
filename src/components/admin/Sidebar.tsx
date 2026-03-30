"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin/dashboard", label: "Дашборд" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/settings", label: "Настройки" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      /* сеть недоступна — всё равно уводим на логин */
    }
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-56 border-r border-black/10 bg-white p-4">
      <nav className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
              pathname === link.href ? "bg-primary text-white" : "text-primary hover:bg-black/5"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        onClick={handleLogout}
        className="mt-6 w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
      >
        Выйти
      </button>
    </aside>
  );
}
