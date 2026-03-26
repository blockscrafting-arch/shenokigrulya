import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Товары</h1>
        <Link
          href="/admin/products/new"
          className="rounded-xl bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90"
        >
          Добавить товар
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 bg-black/5">
              <th className="px-4 py-2 text-left font-medium">Фото</th>
              <th className="px-4 py-2 text-left font-medium">Название</th>
              <th className="px-4 py-2 text-left font-medium">Цена</th>
              <th className="px-4 py-2 text-left font-medium">Статус</th>
              <th className="px-4 py-2 text-left font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-black/5 hover:bg-black/5">
                <td className="px-4 py-2">
                  <div className="relative h-12 w-12 overflow-hidden rounded bg-black/5">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized={product.images[0].startsWith("http") || product.images[0].startsWith("/uploads")}
                      />
                    ) : (
                      <span className="text-xs text-text-muted">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2">{product.title}</td>
                <td className="px-4 py-2">{formatPrice(product.price)}</td>
                <td className="px-4 py-2">{product.isActive ? "Активен" : "Скрыт"}</td>
                <td className="px-4 py-2">
                  <Link href={`/admin/products/${product.id}`} className="text-primary hover:underline">
                    Редактировать
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-8 text-center text-text-muted">Товаров пока нет</p>
        )}
      </div>
    </div>
  );
}
