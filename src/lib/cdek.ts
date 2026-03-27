/**
 * СДЭК: калькулятор тарифов (доставка от склада фулфилмента) и клиент Фулфилмент API.
 * Документация доставки: https://api.cdek.ru/v2
 * Документация фулфилмента: https://help.ffcdek.ru (Создание заказа FBS)
 */

const CDEK_API = process.env.CDEK_API_URL ?? "https://api.cdek.ru/v2";

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getCdekToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }
  const account = process.env.CDEK_ACCOUNT;
  const password = process.env.CDEK_SECURE_PASSWORD;
  if (!account || !password) throw new Error("CDEK_ACCOUNT and CDEK_SECURE_PASSWORD required");

  const res = await fetch(`${CDEK_API}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: account,
      client_secret: password,
    }),
  });
  if (!res.ok) throw new Error(`CDEK token error: ${res.status}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

export interface CalculateDeliveryParams {
  fromLocation: string;
  toLocation: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  tariffCode?: number;
}

export interface DeliveryQuote {
  sum: number;
  deliveryMin: number;
  deliveryMax: number;
}

export async function calculateDelivery(params: CalculateDeliveryParams): Promise<DeliveryQuote> {
  const token = await getCdekToken();
  const res = await fetch(`${CDEK_API}/calculator/tariff`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      from_location: { code: Number(params.fromLocation) },
      to_location: { code: Number(params.toLocation) },
      packages: [
        {
          weight: params.weight,
          length: params.length / 10,
          width: params.width / 10,
          height: params.height / 10,
        },
      ],
      tariff_code: params.tariffCode ?? 139,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CDEK calculate error: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { delivery_sum: number; period_min: number; period_max: number };
  return {
    sum: Math.round(data.delivery_sum * 100),
    deliveryMin: data.period_min,
    deliveryMax: data.period_max,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * CDEK API v2: подписка на вебхуки, получение информации о заказе
 * Документация: https://api-docs.cdek.ru
 * ──────────────────────────────────────────────────────────────────────────── */

export type CdekWebhookType = "ORDER_STATUS" | "PRINT_FORM" | "DOWNLOAD_PHOTO";

export async function subscribeCdekWebhook(webhookUrl: string, type: CdekWebhookType = "ORDER_STATUS") {
  const token = await getCdekToken();
  const res = await fetch(`${CDEK_API}/webhooks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ url: webhookUrl, type }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("CDEK webhook subscribe error:", res.status, text);
    return null;
  }
  return (await res.json()) as { entity: { uuid: string } };
}

export async function getCdekOrder(cdekOrderUuid: string) {
  const token = await getCdekToken();
  const res = await fetch(`${CDEK_API}/orders/${cdekOrderUuid}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as {
    entity: {
      uuid: string;
      cdek_number?: string;
      statuses?: { code: string; date_time: string; name: string }[];
    };
  };
}

/**
 * Маппинг кодов статусов СДЭК → внутренний OrderStatus.
 * Коды: https://api-docs.cdek.ru (раздел «Статусы заказов»)
 */
export function mapCdekStatusToOrderStatus(cdekCode: string): "PROCESSING" | "SHIPPED" | "DELIVERED" | null {
  switch (cdekCode) {
    case "CREATED":
    case "RECEIVED_AT_SHIPMENT_WAREHOUSE":
    case "READY_FOR_SHIPMENT_IN_TRANSIT_CITY":
      return "PROCESSING";
    case "ACCEPTED_AT_TRANSIT_WAREHOUSE":
    case "ACCEPTED_AT_PICK_UP_POINT":
    case "IN_TRANSIT":
    case "SHIPPED":
    case "ARRIVED_AT_TRANSIT_CITY":
    case "ACCEPTED_IN_TRANSIT_CITY":
    case "READY_TO_SHIP_AT_SENDING_OFFICE":
    case "TAKEN_BY_TRANSPORTER_FROM_DOOR_SELLER":
    case "ACCEPTED_AT_WAREHOUSE_ON_DEMAND":
      return "SHIPPED";
    case "DELIVERED":
    case "POSTOMAT_RECEIVED":
      return "DELIVERED";
    default:
      return null;
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * СДЭК Фулфилмент: создание и получение заказа FBS
 * Документация: help.ffcdek.ru
 * ──────────────────────────────────────────────────────────────────────────── */

function getFfAuth(): { base: string; auth: string } | null {
  const base = process.env.CDEK_FF_API_BASE?.replace(/\/$/, "");
  const account = process.env.CDEK_FF_ACCOUNT;
  const secret = process.env.CDEK_FF_SECURE_PASSWORD;
  if (!base || !account || !secret) return null;
  return { base, auth: "Basic " + Buffer.from(`${account}:${secret}`).toString("base64") };
}

export async function createFulfillmentOrder(params: {
  recipient: { name: string; phone: string };
  pvzCode?: string;
  pvzAddress?: string;
  address?: string;
  items: { fulfillmentProductId: string; quantity: number }[];
}): Promise<{ orderUuid: string } | null> {
  const ff = getFfAuth();
  if (!ff) return null;
  if (!params.items.length || !params.items.every((i) => i.fulfillmentProductId && i.quantity > 0))
    return null;

  const warehouseId = process.env.CDEK_FF_WAREHOUSE_ID;

  const body: Record<string, unknown> = {
    recipient: {
      name: params.recipient.name,
      phone: params.recipient.phone.replace(/\D/g, "").slice(-10),
    },
    delivery: params.pvzCode
      ? { type: "PVZ", pvz_code: params.pvzCode }
      : { type: "DOOR", address: params.address ?? params.pvzAddress ?? "" },
    items: params.items.map((i) => ({ product_id: i.fulfillmentProductId, quantity: i.quantity })),
    ...(warehouseId && { warehouse_id: Number(warehouseId) }),
  };

  try {
    const res = await fetch(`${ff.base}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: ff.auth },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error("CDEK FF create order error:", res.status, text);
      return null;
    }
    const data = (JSON.parse(text) as { uuid?: string; order_uuid?: string }) || {};
    const orderUuid = data.uuid ?? data.order_uuid ?? null;
    return orderUuid ? { orderUuid } : null;
  } catch (e) {
    console.error("CDEK FF createFulfillmentOrder:", e);
    return null;
  }
}

export async function getFulfillmentOrder(orderUuid: string): Promise<{
  uuid: string;
  cdek_number?: string;
  status?: string;
  track_number?: string;
} | null> {
  const ff = getFfAuth();
  if (!ff) return null;
  try {
    const res = await fetch(`${ff.base}/orders/${orderUuid}`, {
      headers: { Authorization: ff.auth },
    });
    if (!res.ok) return null;
    return (await res.json()) as { uuid: string; cdek_number?: string; status?: string; track_number?: string };
  } catch {
    return null;
  }
}
