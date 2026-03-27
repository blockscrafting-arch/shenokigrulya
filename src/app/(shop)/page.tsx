import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductInfo } from "@/components/shop/ProductInfo";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://puppyigrulya.ru";

export async function generateMetadata(): Promise<Metadata> {
  const product = await prisma.product.findFirst({
    where: { isActive: true },
    select: { title: true, description: true, images: true },
  });
  if (!product) {
    return { title: "Щенок Игруля" };
  }
  const image = product.images?.[0];
  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${baseUrl}${image}`
    : undefined;
  return {
    title: product.title,
    description: (product.description ?? product.title).slice(0, 160),
    openGraph: {
      title: product.title,
      description: (product.description ?? product.title).slice(0, 160),
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: product.title }]
        : undefined,
    },
  };
}

export default async function HomePage() {
  const product = await prisma.product.findFirst({
    where: { isActive: true },
  });

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <p className="text-ink-muted">
          Нет активных товаров. Добавьте товар в админ-панели.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1200px] px-5 py-8 md:px-8 md:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="min-w-0 max-w-full overflow-x-clip">
            <ProductGallery
              images={product.images}
              videoUrl={product.videoUrl}
            />
          </div>
          <div className="min-w-0 max-w-full">
            <ProductInfo product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
