"use client";

import Script from "next/script";
import { useState, useEffect, useRef, useCallback } from "react";

// Актуальная версия @cdek-it/widget (wiki: https://github.com/cdek-it/widget/wiki)
const WIDGET_SCRIPT = "https://cdn.jsdelivr.net/npm/@cdek-it/widget@3.11.1/dist/cdek-widget.umd.js";
const WIDGET_ROOT_ID = "cdek-widget-root";

/** Дефолтный вес посылки (г) — единая константа для cart и DeliveryWidget */
export const DEFAULT_PACKAGE_WEIGHT = 3000;
const DEFAULT_PARCEL = { weight: DEFAULT_PACKAGE_WEIGHT, width: 13, height: 23, length: 37 };

/** Дебаунс (мс) на обновление посылок: исключает шторм resetParcels/addParcel при быстром клике +/- */
const PARCELS_UPDATE_DEBOUNCE_MS = 400;

export interface DeliveryChoice {
  deliveryType: "CDEK_PVZ" | "CDEK_DOOR";
  deliveryCost: number;
  deliveryCityCode: number | null;
  tariffCode: number | null;
  cdekPvzCode: string | null;
  cdekPvzAddress: string | null;
  deliveryAddress: string | null;
  periodMin?: number;
  periodMax?: number;
}

interface DeliveryWidgetProps {
  /** Город отправления (склад) */
  fromCity: string;
  /** Габариты и вес посылки: { weight (г), length, width, height (см) } */
  goods: { weight: number; length: number; width: number; height: number }[];
  /** Вызов при выборе ПВЗ или доставки на дом */
  onChoose: (choice: DeliveryChoice) => void;
  /** Ключ Яндекс.Карт (обязателен для виджета) */
  yandexMapsApiKey: string;
  /** Доставка уже выбрана — меняет текст кнопки-триггера */
  hasSelection?: boolean;
}

/** iParcel для CDEK: width, height, length (см), weight (г) */
function buildParcelsFromGoods(goods: DeliveryWidgetProps["goods"]) {
  return goods.length
    ? goods.map((g) => ({ weight: g.weight, width: g.width, height: g.height, length: g.length }))
    : [DEFAULT_PARCEL];
}

/** Инстанс виджета: wiki — resetParcels / addParcel без полного реиници (destroy() багованный, не использовать) */
interface CDEKWidgetInstance {
  open?: () => void;
  close?: () => void;
  addParcel: (parcel: unknown | unknown[]) => void;
  resetParcels: () => void;
  getParcels?: () => unknown[];
}

declare global {
  interface Window {
    CDEKWidget?: new (config: Record<string, unknown>) => CDEKWidgetInstance;
  }
}

export function DeliveryWidget({ fromCity, goods, onChoose, yandexMapsApiKey, hasSelection }: DeliveryWidgetProps) {
  const onChooseRef = useRef(onChoose);
  onChooseRef.current = onChoose;

  const goodsRef = useRef(goods);
  goodsRef.current = goods;

  const widgetRef = useRef<CDEKWidgetInstance | null>(null);
  const lastCityCodeRef = useRef<number | null>(null);
  const parcelsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  // После первого открытия popup остаётся в DOM — виджет не пересоздаётся
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  // Масштаб: 1 на десктопе (popup 860px > виджет 800px), <1 на узких экранах
  const [scaleFactor, setScaleFactor] = useState(1);
  const popupBodyRef = useRef<HTMLDivElement>(null);

  // Расчёт масштаба через ResizeObserver на теле popup
  // Desktop (popup 860px): scaleFactor = min(1, 860/800) = 1 → без масштабирования
  // Mobile (popup = viewport ~375px): scaleFactor = 375/800 ≈ 0.47
  useEffect(() => {
    if (!isPopupOpen || !popupBodyRef.current) return;
    const el = popupBodyRef.current;
    const update = () => {
      setScaleFactor(Math.min(1, el.clientWidth / 800));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isPopupOpen]);

  // Блокировка прокрутки body + ESC для закрытия popup
  useEffect(() => {
    if (!isPopupOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsPopupOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [isPopupOpen]);

  const initWidget = useCallback(() => {
    if (typeof window === "undefined" || !window.CDEKWidget) return;
    if (widgetRef.current) return;

    const root = document.getElementById(WIDGET_ROOT_ID);
    if (!root) return;

    const parcels = buildParcelsFromGoods(goodsRef.current);

    try {
      widgetRef.current = new window.CDEKWidget!({
        from: fromCity,
        root: WIDGET_ROOT_ID,
        apiKey: yandexMapsApiKey,
        servicePath: `${window.location.origin}/api/cdek-widget`,
        canChoose: true,
        goods: parcels,
        defaultLocation: fromCity,
        lang: "rus",
        currency: "RUB",
        tariffs: { office: [136, 138, 234], door: [137, 139, 233] },
        onCalculate: (
          _prices: unknown,
          address: { code?: number; address?: string },
        ) => {
          if (address?.code) lastCityCodeRef.current = address.code;
        },
        onChoose: (
          mode: string,
          tariff: {
            tariff_code?: number;
            tariff_name?: string;
            delivery_sum?: number;
            period_min?: number;
            period_max?: number;
          },
          address: Record<string, unknown>,
        ) => {
          const deliveryCostKopecks = Math.round((tariff?.delivery_sum ?? 0) * 100);
          const rawCityCode = (address?.city_code ?? address?.cityCode ?? lastCityCodeRef.current) as number | string | null | undefined;
          const deliveryCityCode = rawCityCode != null ? Number(rawCityCode) : null;
          const choice: DeliveryChoice = {
            deliveryType: mode === "door" ? "CDEK_DOOR" : "CDEK_PVZ",
            deliveryCost: deliveryCostKopecks,
            deliveryCityCode: deliveryCityCode && !isNaN(deliveryCityCode) ? deliveryCityCode : null,
            tariffCode: tariff?.tariff_code ?? null,
            cdekPvzCode:
              mode === "office" && address?.code != null ? String(address.code) : null,
            cdekPvzAddress:
              mode === "office" && address?.address != null ? String(address.address) : null,
            deliveryAddress:
              mode === "door" && address?.name != null
                ? String(address.name)
                : mode === "door" && address?.formatted != null
                  ? String(address.formatted)
                  : null,
            periodMin: tariff?.period_min,
            periodMax: tariff?.period_max,
          };
          onChooseRef.current(choice);
          // Закрываем popup после выбора
          setIsPopupOpen(false);
        },
      });
    } catch (e) {
      console.error("CDEK widget init error:", e);
    }
  }, [fromCity, yandexMapsApiKey]);

  // Инициализировать виджет при открытии popup (элемент #cdek-widget-root уже в DOM)
  useEffect(() => {
    if (isPopupOpen && typeof window !== "undefined" && window.CDEKWidget) initWidget();
  }, [isPopupOpen, initWidget]);

  // Дебаунс 400мс: при быстрых кликах +/- накапливает изменения
  useEffect(() => {
    if (parcelsTimerRef.current) clearTimeout(parcelsTimerRef.current);
    parcelsTimerRef.current = setTimeout(() => {
      const w = widgetRef.current;
      if (!w || typeof w.resetParcels !== "function" || typeof w.addParcel !== "function") return;
      const parcels = buildParcelsFromGoods(goods);
      try {
        w.resetParcels();
        w.addParcel(parcels);
      } catch (e) {
        console.error("CDEK widget parcels update error:", e);
      }
    }, PARCELS_UPDATE_DEBOUNCE_MS);
    return () => {
      if (parcelsTimerRef.current) clearTimeout(parcelsTimerRef.current);
    };
  }, [goods]);

  const handleOpenPopup = () => {
    // Сразу вычисляем масштаб — избегаем flash на первом рендере popup
    // На десктопе popup шириной ~860px → scale = 1; на мобильном → <1
    setScaleFactor(Math.min(1, Math.min(window.innerWidth * 0.95, 860) / 800));
    setHasOpenedOnce(true);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => setIsPopupOpen(false);

  return (
    <>
      <Script
        src={WIDGET_SCRIPT}
        strategy="afterInteractive"
        onLoad={() => {
          // Если popup уже открыт в момент загрузки скрипта — инициализируем сразу
          if (isPopupOpen) initWidget();
        }}
      />

      {/* Кнопка-триггер — всегда показывается */}
      <button
        type="button"
        onClick={handleOpenPopup}
        className="w-full flex items-center justify-between gap-3 rounded-2xl border border-black/[0.08] bg-white px-5 py-4 text-left transition-all hover:border-brand/25 hover:bg-[#f8fcff] active:scale-[0.99]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8f4fb] text-brand">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </span>
          <span className="text-[15px] font-semibold text-ink-dark leading-snug">
            {hasSelection ? "Изменить доставку" : "Выбрать пункт выдачи или курьера"}
          </span>
        </div>
        <svg className="h-5 w-5 shrink-0 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Popup — монтируется один раз и остаётся в DOM (виджет не пересоздаётся) */}
      {hasOpenedOnce && (
        <div
          className="cdek-popup-backdrop"
          style={{ display: isPopupOpen ? "flex" : "none" }}
          onClick={(e) => {
            // Закрыть по клику на backdrop (только если клик прямо на него)
            if (e.target === e.currentTarget) handleClosePopup();
          }}
        >
          <div className="cdek-popup">
            {/* Drag-handle (видна только на мобильных через CSS) */}
            <div className="cdek-popup-handle" />

            {/* Шапка */}
            <div className="flex shrink-0 items-center justify-between border-b border-[#EAEAEA] bg-white px-5 py-3.5">
              <h3 className="font-heading text-xl font-bold uppercase tracking-wide text-ink-dark">
                Доставка
              </h3>
              <button
                type="button"
                onClick={handleClosePopup}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F2F2] text-ink-secondary transition-colors hover:bg-[#EAEAEA]"
                aria-label="Закрыть"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Тело popup с масштабированием виджета */}
            <div ref={popupBodyRef} className="cdek-popup-body">
              <div
                id={WIDGET_ROOT_ID}
                style={{
                  width: 800,
                  height: 600,
                  transform: `scale(${scaleFactor})`,
                  transformOrigin: "top left",
                  // Высота контейнера ужимается по факту масштаба — тело popup не скроллится лишнее
                  marginBottom: `${-(600 * (1 - scaleFactor))}px`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
