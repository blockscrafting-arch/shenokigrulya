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
  const [badgesInput, setBadgesInput] = useState(
    (product?.badges ?? []).join(", ")
  );
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
      const badges = badgesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        ...form,
        badges,
        price: Math.round(form.price * 100),
        ozonUrl: form.ozonUrl || undefined,
        weight: form.weight ? Number(form.weight) : null,
        length: form.length ? Number(form.length) : null,
        width: form.width ? Number(form.width) : null,
        height: form.height ? Number(form.height) : null,
        videoUrl: form.videoUrl || null,
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

  const inputCls = "w-full rounded-lg border border-black/10 px-3 py-2 text-sm";
  const labelCls = "mb-1 block text-sm font-medium";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div>
        <label className={labelCls}>Название *</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Описание</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Состав и питательные вещества</label>
        <textarea
          value={form.composition}
          onChange={(e) => setForm((f) => ({ ...f, composition: e.target.value }))}
          rows={5}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Цена (₽) *</label>
        <input
          type="number"
          required
          min={0}
          step={0.01}
          value={form.price || ""}
          onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))}
          className={inputCls}
        />
      </div>

      {/* Бейджи */}
      <div>
        <label className={labelCls}>Бейджи (через запятую)</label>
        <input
          type="text"
          value={badgesInput}
          onChange={(e) => setBadgesInput(e.target.value)}
          placeholder="Гипоаллергенный, Холистик, Без глютена"
          className={inputCls}
        />
        <p className="mt-1 text-xs text-gray-400">
          Текущие: {badgesInput || "—"}
        </p>
      </div>

      {/* Видео */}
      <div>
        <label className={labelCls}>URL видео (необязательно)</label>
        <input
          type="url"
          value={form.videoUrl}
          onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
          placeholder="https://..."
          className={inputCls}
        />
      </div>

      {/* Габариты для расчёта доставки СДЭК */}
      <fieldset className="rounded-lg border border-black/10 p-4">
        <legend className="px-1 text-sm font-semibold">
          Габариты для СДЭК (мм — длина × ширина × высота) и вес (г)
        </legend>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium">Вес, г</label>
            <input
              type="number"
              min={0}
              value={form.weight ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, weight: e.target.value ? Number(e.target.value) : null }))
              }
              placeholder="3000"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Длина, мм</label>
            <input
              type="number"
              min={0}
              value={form.length ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, length: e.target.value ? Number(e.target.value) : null }))
              }
              placeholder="370"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Ширина, мм</label>
            <input
              type="number"
              min={0}
              value={form.width ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, width: e.target.value ? Number(e.target.value) : null }))
              }
              placeholder="130"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Высота, мм</label>
            <input
              type="number"
              min={0}
              value={form.height ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, height: e.target.value ? Number(e.target.value) : null }))
              }
              placeholder="230"
              className={inputCls}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Используются при расчёте стоимости доставки и создании фулфилмент-заказа в СДЭК.
        </p>
      </fieldset>

      <div>
        <label className={labelCls}>Ссылка на Ozon</label>
        <input
          type="url"
          value={form.ozonUrl}
          onChange={(e) => setForm((f) => ({ ...f, ozonUrl: e.target.value }))}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>ID товара СДЭК Фулфилмент</label>
        <input
          type="text"
          value={form.cdekFulfillmentProductId}
          onChange={(e) => setForm((f) => ({ ...f, cdekFulfillmentProductId: e.target.value }))}
          placeholder="ID товара в ЛК СДЭК FF (например 34691025)"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Фото</label>
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
