"use client";

import Script from "next/script";
import { useEffect, useRef, useCallback } from "react";

// Актуальная версия @cdek-it/widget (wiki: https://github.com/cdek-it/widget/wiki)
const WIDGET_SCRIPT = "https://cdn.jsdelivr.net/npm/@cdek-it/widget@3.11.1/dist/cdek-widget.umd.js";
const WIDGET_ROOT_ID = "cdek-widget-root";

export interface DeliveryChoice {
  deliveryType: "CDEK_PVZ" | "CDEK_DOOR";
  deliveryCost: number;
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

declare global {
  interface Window {
    CDEKWidget?: new (config: Record<string, unknown>) => { open?: () => void; close?: () => void };
  }
}

export function DeliveryWidget({ fromCity, goods, onChoose, yandexMapsApiKey }: DeliveryWidgetProps) {
  const onChooseRef = useRef(onChoose);
  onChooseRef.current = onChoose;

  const initWidget = useCallback(() => {
    if (typeof window === "undefined" || !window.CDEKWidget) return;
    const root = document.getElementById(WIDGET_ROOT_ID);
    if (!root || root.hasAttribute("data-cdek-inited")) return;

    // iParcell: { width, height, length (см), weight (г) } — по документации виджета
    const parcels = goods.length
      ? goods.map((g) => ({
          weight: g.weight,
          width: g.width,    // ширина
          height: g.height,  // высота
          length: g.length,  // длина (ранее width и length были перепутаны)
        }))
      : [{ weight: 4000, width: 13, height: 23, length: 37 }];

    try {
      new window.CDEKWidget!({
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
        // onChoose(mode, tariff, address) — по документации:
        // mode: "office" (ПВЗ) | "door" (до двери)
        // tariff.delivery_sum — стоимость в рублях (дробное число)
        // Цены в системе хранятся в копейках → умножаем на 100
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
          const choice: DeliveryChoice = {
            deliveryType: mode === "door" ? "CDEK_DOOR" : "CDEK_PVZ",
            deliveryCost: deliveryCostKopecks,
            // office: address.code (строка кода ПВЗ), address.address (адрес ПВЗ)
            cdekPvzCode:
              mode === "office" && address?.code != null ? String(address.code) : null,
            cdekPvzAddress:
              mode === "office" && address?.address != null ? String(address.address) : null,
            // door: address.formatted (читаемый адрес), address.city, address.postal_code
            deliveryAddress:
              mode === "door" && address?.formatted != null ? String(address.formatted) : null,
            periodMin: tariff?.period_min,
            periodMax: tariff?.period_max,
          };
          onChooseRef.current(choice);
        },
      });
      root.setAttribute("data-cdek-inited", "true");
    } catch (e) {
      console.error("CDEK widget init error:", e);
    }
  }, [fromCity, goods]);

  useEffect(() => {
    if (window.CDEKWidget) initWidget();
  }, [initWidget]);

  return (
    <>
      <Script
        src={WIDGET_SCRIPT}
        strategy="afterInteractive"
        onLoad={() => initWidget()}
      />
      {/* Контейнер виджета: по документации ширина >= 800px, высота >= 600px — явная, не minHeight */}
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
