"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@prisma/client";
import { ImageUploader } from "./ImageUploader";

interface ProductFormProps {
  product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: product?.title ?? "",
    description: product?.description ?? "",
    composition: product?.composition ?? "",
    price: product ? product.price / 100 : 0,
    ozonUrl: product?.ozonUrl ?? "",
    badges: product?.badges ?? [],
    images: product?.images ?? [],
    videoUrl: product?.videoUrl ?? "",
    weight: product?.weight ?? null,
    length: product?.length ?? null,
    width: product?.width ?? null,
    height: product?.height ?? null,
    cdekFulfillmentProductId: product?.cdekFulfillmentProductId ?? "",
    isActive: product?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Math.round(form.price * 100),
        ozonUrl: form.ozonUrl || undefined,
        weight: form.weight ? Number(form.weight) : null,
        length: form.length ? Number(form.length) : null,
        width: form.width ? Number(form.width) : null,
        height: form.height ? Number(form.height) : null,
        cdekFulfillmentProductId: form.cdekFulfillmentProductId || null,
      };
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Ошибка сохранения");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Название *</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full rounded-lg border border-black/10 px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Описание</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
          className="w-full rounded-lg border border-black/10 px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Состав и питательные вещества</label>
        <textarea
          value={form.composition}
          onChange={(e) => setForm((f) => ({ ...f, composition: e.target.value }))}
          rows={5}
          className="w-full rounded-lg border border-black/10 px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Цена (₽) *</label>
        <input
          type="number"
          required
          min={0}
          step={0.01}
          value={form.price || ""}
          onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))}
          className="w-full rounded-lg border border-black/10 px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Ссылка на Ozon</label>
        <input
          type="url"
          value={form.ozonUrl}
          onChange={(e) => setForm((f) => ({ ...f, ozonUrl: e.target.value }))}
          className="w-full rounded-lg border border-black/10 px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">ID товара СДЭК Фулфилмент</label>
        <input
          type="text"
          value={form.cdekFulfillmentProductId}
          onChange={(e) => setForm((f) => ({ ...f, cdekFulfillmentProductId: e.target.value }))}
          placeholder="Привязка к складу фулфилмента"
          className="w-full rounded-lg border border-black/10 px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Фото</label>
        <ImageUploader
          urls={form.images}
          onChange={(urls) => setForm((f) => ({ ...f, images: urls }))}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={form.isActive}
          onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
          className="h-4 w-4 rounded border-black/20"
        />
        <label htmlFor="isActive" className="text-sm">Активен (показывать на сайте)</label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-primary px-6 py-2 font-medium text-white hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Сохранение…" : product ? "Сохранить" : "Создать"}
      </button>
    </form>
  );
}
