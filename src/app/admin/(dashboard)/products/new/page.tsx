import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold">Новый товар</h1>
      <ProductForm />
    </div>
  );
}
