import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://puppyigrulya.ru";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let lastModified = new Date();
  try {
    const product = await prisma.product.findFirst({
      where: { isActive: true },
      select: { updatedAt: true },
    });
    if (product?.updatedAt) lastModified = product.updatedAt;
  } catch {
    // БД недоступна при сборке — используем текущую дату
  }
  return [
    { url: baseUrl, lastModified, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${baseUrl}/cart`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ];
}
