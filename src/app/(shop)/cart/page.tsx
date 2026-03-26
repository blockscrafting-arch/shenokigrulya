"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import {
  DeliveryWidget,
  type DeliveryChoice,
} from "@/components/shop/DeliveryWidget";

const SINGLE_PACKAGE = { weight: 3000, length: 37, width: 13, height: 23 };

export default function CartPage() {
  const { items, totalPrice, totalItems, updateQuantity, removeItem, clearCart } =
    useCart();
  const [deliveryChoice, setDeliveryChoice] =
    useState<DeliveryChoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    comment: "",
  });

  const fromCity = process.env.NEXT_PUBLIC_CDEK_FROM_CITY ?? "Москва";
  const yandexKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ?? "dummy_key_for_render";

  const deliveryCost = deliveryChoice?.deliveryCost ?? 0;
  const totalWithDelivery = totalPrice + deliveryCost;

  const goods = useMemo(
    () => Array.from({ length: Math.max(1, totalItems) }, () => SINGLE_PACKAGE),
    [totalItems]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!deliveryChoice) {
      setError("Выберите пункт выдачи или доставку на дом.");
      return;
    }

    if (totalItems < 1) {
      setError("Укажите количество товара больше нуля.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deliveryType:
            deliveryChoice?.deliveryType ?? "CDEK_PVZ",
          deliveryAddress:
            deliveryChoice?.deliveryAddress ??
            deliveryChoice?.cdekPvzAddress ??
            null,
          cdekPvzCode: deliveryChoice?.cdekPvzCode ?? null,
          cdekPvzAddress: deliveryChoice?.cdekPvzAddress ?? null,
          deliveryCityCode: deliveryChoice?.deliveryCityCode ?? undefined,
          deliveryCost,
          items: items
            .filter((i) => i.quantity > 0)
            .map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.price,
            })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const fe = data.error?.fieldErrors as
          | Record<string, string[] | undefined>
          | undefined;
        if (fe) {
          const next: Record<string, string> = {};
          if (fe.customerName?.[0]) next.customerName = fe.customerName[0];
          if (fe.customerPhone?.[0]) next.customerPhone = fe.customerPhone[0];
          if (fe.customerEmail?.[0]) next.customerEmail = fe.customerEmail[0];
          setFieldErrors(next);
        }
        const msg =
          typeof data.error === "string"
            ? data.error
            : (data.error?.formErrors?.[0] ?? "Ошибка создания заказа");
        setError(msg);
        return;
      }
      const { orderId } = data;
      const payRes = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const payData = await payRes.json().catch(() => ({}));
      if (!payRes.ok) {
        setError(
          typeof payData.error === "string"
            ? payData.error
            : (payData.error ?? "Ошибка создания платежа")
        );
        return;
      }
      clearCart();
      window.location.href = payData.confirmationUrl;
    } catch (err) {
      console.error(err);
      setError("Произошла ошибка. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1200px] min-h-[60vh] flex-col items-center justify-center px-5 py-20 text-center">
        <svg
          className="mb-8 h-20 w-20 text-[#CCCCCC]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
        <h2 className="mb-4 font-heading text-4xl font-bold uppercase tracking-wide text-ink-dark">Корзина пуста</h2>
        <p className="mb-10 text-base font-medium text-ink-muted max-w-md">
          Добавьте товар, чтобы оформить заказ и порадовать своего питомца.
        </p>
        <Link
          href="/"
          className="rounded-full bg-brand px-12 py-[18px] font-heading text-xl font-bold uppercase tracking-wide text-white transition-all hover:bg-brand-dark hover:scale-[1.02] shadow-lg shadow-brand/30"
        >
          К товарам
        </Link>
      </div>
    );
  }

  const inputBase =
    "w-full rounded-full border border-black/20 bg-transparent px-5 py-4 text-[15px] text-ink-dark outline-none transition-all placeholder:text-[#AAAAAA] focus:border-brand focus:ring-1 focus:ring-brand/40";

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-[1200px] px-5 py-8 md:px-8 md:py-12"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN: White cards on grey background */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Cart items */}
          <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-3xl font-bold text-ink-dark uppercase tracking-wide">
                  Корзина
                </h1>
                <span className="font-heading text-2xl font-bold text-[#999999] relative top-[2px]">
                  {items.length}
                </span>
              </div>
              <button
                type="button"
                onClick={clearCart}
                className="flex items-center gap-2 text-[14px] font-bold text-ink-secondary hover:text-red-500 transition-colors"
              >
                Очистить корзину
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="divide-y divide-line">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 py-5 first:pt-0 last:pb-0"
                >
                  {/* Фото — портретный контейнер, как у упаковки */}
                  <div className="relative shrink-0 w-[88px] h-[110px] overflow-hidden rounded-2xl bg-[#F5F5F5]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#CCC]">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21zm10.5-11.25h.008v.008h-.008V9.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Основная информация */}
                  <div className="flex flex-1 min-w-0 flex-col gap-2.5">
                    {/* Заголовок + кнопка удалить */}
                    <div className="flex items-start gap-2">
                      <h3 className="flex-1 min-w-0 text-[14px] font-bold leading-snug text-ink-dark line-clamp-3">
                        {item.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="shrink-0 rounded-lg p-1.5 text-[#CCCCCC] hover:text-[#FF4A4A] hover:bg-red-50 transition-all"
                        aria-label="Удалить товар"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Вес */}
                    <span className="self-start rounded-lg bg-[#F2F2F2] px-2.5 py-1 text-[12px] font-bold text-ink-secondary uppercase tracking-wide">
                      3 кг
                    </span>

                    {/* Количество + итоговая цена */}
                    <div className="mt-auto flex items-center justify-between gap-3">
                      {/* Счётчик */}
                      <div className="flex items-center rounded-xl bg-[#F2F2F2] p-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[18px] font-bold text-ink-dark hover:bg-white hover:shadow-sm transition-all"
                        >
                          &minus;
                        </button>
                        <span className="w-8 text-center text-[15px] font-black text-ink-dark">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[18px] font-bold text-ink-dark hover:bg-white hover:shadow-sm transition-all"
                        >
                          +
                        </button>
                      </div>

                      {/* Сумма по позиции — только здесь, без дубля */}
                      <div className="font-heading text-[20px] font-bold text-brand whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>


          {/* Receiver — horizontal fields per TZ */}
          <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <h2 className="mb-4 font-heading text-3xl font-bold text-ink-dark uppercase tracking-wide">
              Получатель
            </h2>

            {error && (
              <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 uppercase tracking-wide">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-ink-secondary">Имя и фамилия</label>
                <input
                  type="text"
                  required
                  value={form.customerName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customerName: e.target.value }))
                  }
                  className={`${inputBase} ${fieldErrors.customerName ? "border-red-400 focus:border-red-400 focus:ring-red-400" : ""}`}
                />
                {fieldErrors.customerName && (
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wide px-2">
                    {fieldErrors.customerName}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-ink-secondary">Телефон</label>
                <input
                  type="tel"
                  required
                  value={form.customerPhone}
                  placeholder="+7"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customerPhone: e.target.value }))
                  }
                  className={`${inputBase} ${fieldErrors.customerPhone ? "border-red-400 focus:border-red-400 focus:ring-red-400" : ""}`}
                />
                {fieldErrors.customerPhone && (
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wide px-2">
                    {fieldErrors.customerPhone}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-ink-secondary">Электронная почта</label>
                <input
                  type="email"
                  required
                  value={form.customerEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customerEmail: e.target.value }))
                  }
                  className={`${inputBase} ${fieldErrors.customerEmail ? "border-red-400 focus:border-red-400 focus:ring-red-400" : ""}`}
                />
                {fieldErrors.customerEmail && (
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wide px-2">
                    {fieldErrors.customerEmail}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Delivery секция перенесена за пределы грида */}
        </div>

        {/* RIGHT COLUMN: Black payment summary — sticky */}
        <div>
          <div className="lg:sticky lg:top-8 rounded-[2rem] bg-brand text-white p-8 shadow-xl shadow-brand/35">
            {/* Подсказка по состоянию */}
            <p className="text-[13px] font-medium text-white/60 mb-5">
              {!deliveryChoice
                ? "Выберите доставку для расчёта итога"
                : "Осталось указать контактные данные"}
            </p>

            <div className="mb-6 flex flex-col gap-1.5">
              <h2 className="font-heading text-3xl font-bold uppercase leading-tight tracking-tight text-white sm:text-4xl">
                К&nbsp;оплате
              </h2>
              {/* Итог показываем только когда выбрана доставка */}
              {deliveryChoice ? (
                <p className="font-heading text-3xl font-bold leading-none tracking-tight text-white sm:text-4xl whitespace-nowrap">
                  {formatPrice(totalWithDelivery)}
                </p>
              ) : (
                <p className="text-[15px] font-medium text-white/50 leading-snug">
                  {formatPrice(totalPrice)} + доставка
                </p>
              )}
            </div>

            <div className="space-y-3 text-[14px] font-medium border-b border-white/10 pb-5 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-white/60">Товары</span>
                <div className="flex-1 border-b border-dotted border-white/20" />
                <span className="font-bold whitespace-nowrap">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60">Доставка СДЭК</span>
                <div className="flex-1 border-b border-dotted border-white/20" />
                <span className={`font-bold whitespace-nowrap ${!deliveryChoice ? "text-white/40 italic text-[13px]" : ""}`}>
                  {deliveryChoice
                    ? deliveryCost > 0
                      ? formatPrice(deliveryCost)
                      : "0 ₽"
                    : "не выбрана"}
                </span>
              </div>
              {deliveryChoice?.periodMin != null && (
                <p className="text-[12px] text-white/45 leading-snug">
                  Срок доставки: {deliveryChoice.periodMin}
                  {deliveryChoice.periodMax && deliveryChoice.periodMax !== deliveryChoice.periodMin
                    ? `–${deliveryChoice.periodMax}`
                    : ""}{" "}
                  дн.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || totalItems < 1}
              className="w-full rounded-full bg-white py-5 font-heading text-xl md:text-2xl font-bold uppercase tracking-wider text-brand transition-all hover:bg-brand-light hover:scale-[1.02] disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? "СОЗДАНИЕ..." : "ОФОРМИТЬ ЗАКАЗ"}
            </button>

            <p className="mt-6 text-[12px] font-medium text-white/40 leading-relaxed max-w-[280px]">
              Согласен с условиями обработки данных, пользовательского соглашения и оферты
            </p>
          </div>
        </div>
      </div>

      {/* Delivery — full width, outside the 3-col grid so the map has room */}
      <section className="mt-6 bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <h2 className="mb-4 font-heading text-3xl font-bold text-ink-dark uppercase tracking-wide">
          Доставка
        </h2>
        <DeliveryWidget
          fromCity={fromCity}
          goods={goods}
          yandexMapsApiKey={yandexKey}
          onChoose={setDeliveryChoice}
        />
        {deliveryChoice && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-green-50 p-4">
            <svg className="h-5 w-5 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[14px] font-bold text-green-800 uppercase tracking-wide leading-snug">
              {deliveryChoice.deliveryType === "CDEK_PVZ" ? "ПВЗ" : "На дом"} &mdash; {deliveryChoice.cdekPvzAddress || deliveryChoice.deliveryAddress}
            </p>
          </div>
        )}
      </section>
    </form>
  );
}
