/**
 * Отправка уведомления о заказе в Telegram (chat_id заказчика).
 */

export interface OrderNotificationPayload {
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: { title: string; quantity: number; price: number }[];
  totalAmount: number;
  deliveryAddress?: string;
  comment?: string;
}

export async function sendOrderNotification(payload: OrderNotificationPayload): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID ?? (await getSettingsChatId());
  if (!token || !chatId) {
    if (process.env.NODE_ENV === "development" || !chatId) {
      console.warn("[Telegram] Уведомления отключены: задайте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID (или Chat ID в настройках админки)");
    }
    return;
  }

  const lines = [
    `✅ <b>НОВЫЙ ЗАКАЗ #${payload.orderNumber}</b>`,
    "",
    `👤 ${escapeHtml(payload.customerName)}`,
    `📞 ${escapeHtml(payload.customerPhone)}`,
    `✉️ ${escapeHtml(payload.customerEmail)}`,
    "",
    ...payload.items.map(
      (i) => `📦 ${escapeHtml(i.title)} × ${i.quantity} шт. — ${(i.price * i.quantity) / 100} ₽`
    ),
    `💳 <b>Итого оплачено: ${payload.totalAmount / 100} ₽</b>`,
  ];
  if (payload.deliveryAddress) lines.push("", `📍 ${escapeHtml(payload.deliveryAddress)}`);
  if (payload.comment) lines.push("", `📝 ${escapeHtml(payload.comment)}`);

  const text = lines.join("\n");
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

async function getSettingsChatId(): Promise<string | null> {
  try {
    const { prisma } = await import("./prisma");
    const s = await prisma.settings.findUnique({ where: { id: "main" } });
    return s?.telegramChatId ?? null;
  } catch {
    return null;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
