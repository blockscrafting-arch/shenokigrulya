/**
 * ЮKassa REST API — создание платежа и обработка webhook.
 * Документация: https://yookassa.ru/developers/api
 */

const YOOKASSA_API = "https://api.yookassa.ru/v3/payments";

function getAuthHeader(): string {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secretKey) throw new Error("YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY required");
  return "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64");
}

export interface CreatePaymentParams {
  amount: number;
  orderId: string;
  description: string;
  returnUrl: string;
  customerEmail: string;
  deliveryCost: number;
  items: { title: string; quantity: number; price: number }[];
  /** Счётчик попытки: при повторном создании платежа (после отмены предыдущего)
   *  меняем суффикс, иначе ЮKassa вернёт кешированный ответ из-за idempotence key (TTL 24ч) */
  attempt?: number;
}

export async function createPayment(params: CreatePaymentParams): Promise<{ confirmationUrl: string; paymentId: string }> {
  // attempt позволяет пересоздать платёж после отмены:
  // ЮKassa кэширует ответ по idempotence key 24ч — без суффикса вернётся старый отменённый платёж
  const attempt = params.attempt ?? 1;
  const idempotenceKey = `pay-${params.orderId}-${attempt}`;

  const receiptItems = [
    ...params.items.map((item) => ({
      description: item.title,
      quantity: item.quantity,
      amount: { value: (item.price / 100).toFixed(2), currency: "RUB" },
      vat_code: 1,
      payment_subject: "commodity",
      payment_mode: "full_prepayment",
    })),
    ...(params.deliveryCost > 0
      ? [{
          description: "Доставка",
          quantity: 1,
          amount: { value: (params.deliveryCost / 100).toFixed(2), currency: "RUB" },
          vat_code: 1,
          payment_subject: "service",
          payment_mode: "full_prepayment",
        }]
      : []),
  ];

  const response = await fetch(YOOKASSA_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
      "Idempotence-Key": idempotenceKey,
    },
    body: JSON.stringify({
      amount: { value: (params.amount / 100).toFixed(2), currency: "RUB" },
      confirmation: { type: "redirect", return_url: params.returnUrl },
      description: params.description,
      metadata: { orderId: params.orderId },
      receipt: {
        customer: { email: params.customerEmail },
        items: receiptItems,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`YooKassa error: ${response.status} ${err}`);
  }

  const data = (await response.json()) as {
    id: string;
    confirmation?: { confirmation_url?: string };
  };
  const confirmationUrl = data.confirmation?.confirmation_url;
  if (!confirmationUrl) throw new Error("No confirmation_url in YooKassa response");
  return { confirmationUrl, paymentId: data.id };
}

/** Получить информацию о платеже (для верификации webhook) */
export async function getPayment(paymentId: string): Promise<{ status: string; confirmation?: { confirmation_url?: string } } | null> {
  try {
    const response = await fetch(`${YOOKASSA_API}/${paymentId}`, {
      headers: { Authorization: getAuthHeader() },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { status: string; confirmation?: { confirmation_url?: string } };
    return data;
  } catch {
    return null;
  }
}
