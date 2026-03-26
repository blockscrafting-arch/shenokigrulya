import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold">Редактировать товар</h1>
      <ProductForm product={product} />
    </div>
  );
}
