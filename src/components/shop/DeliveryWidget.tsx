"use client";

import Script from "next/script";
import { useEffect, useRef, useCallback } from "react";

// Актуальная версия @cdek-it/widget (wiki: https://github.com/cdek-it/widget/wiki)
const WIDGET_SCRIPT = "https://cdn.jsdelivr.net/npm/@cdek-it/widget@3.11.1/dist/cdek-widget.umd.js";
const WIDGET_ROOT_ID = "cdek-widget-root";

const DEFAULT_PARCEL = { weight: 4000, width: 13, height: 23, length: 37 };

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
}

/** iParcel для CDEK: width, height, length (см), weight (г) */
function buildParcelsFromGoods(goods: DeliveryWidgetProps["goods"]) {
  return goods.length
    ? goods.map((g) => ({
        weight: g.weight,
        width: g.width,
        height: g.height,
        length: g.length,
      }))
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

export function DeliveryWidget({ fromCity, goods, onChoose, yandexMapsApiKey }: DeliveryWidgetProps) {
  const onChooseRef = useRef(onChoose);
  onChooseRef.current = onChoose;

  const goodsRef = useRef(goods);
  goodsRef.current = goods;

  const widgetRef = useRef<CDEKWidgetInstance | null>(null);

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
          const rawCityCode = (address?.city_code ?? address?.cityCode) as number | string | null | undefined;
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
              mode === "door" && address?.formatted != null ? String(address.formatted) : null,
            periodMin: tariff?.period_min,
            periodMax: tariff?.period_max,
          };
          onChooseRef.current(choice);
        },
      });
    } catch (e) {
      console.error("CDEK widget init error:", e);
    }
  }, [fromCity, yandexMapsApiKey]);

  useEffect(() => {
    if (window.CDEKWidget) initWidget();
  }, [initWidget]);

  useEffect(() => {
    const w = widgetRef.current;
    if (!w || typeof w.resetParcels !== "function" || typeof w.addParcel !== "function") return;
    const parcels = buildParcelsFromGoods(goods);
    try {
      w.resetParcels();
      w.addParcel(parcels);
    } catch (e) {
      console.error("CDEK widget parcels update error:", e);
    }
  }, [goods]);

  return (
    <>
      <Script
        src={WIDGET_SCRIPT}
        strategy="afterInteractive"
        onLoad={() => initWidget()}
      />
      <div className="overflow-x-auto rounded-2xl border border-black/[0.08] bg-white">
        <p className="px-4 pt-4 pb-3 text-[13px] font-medium text-ink-muted">
          Выберите пункт выдачи или доставку курьером. Стоимость рассчитается автоматически.
        </p>
        <div
          id={WIDGET_ROOT_ID}
          style={{ width: "100%", minWidth: 800, height: 600 }}
        />
      </div>
    </>
  );
}
