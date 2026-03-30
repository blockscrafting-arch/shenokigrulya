import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("sendOrderNotification", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}), text: async () => "" } as Response);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns early when token missing", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "");
    vi.stubEnv("TELEGRAM_CHAT_ID", "");
    const { sendOrderNotification } = await import("@/lib/telegram");
    await sendOrderNotification({
      orderNumber: 1,
      customerName: 'Jane "Doe"',
      customerPhone: "+7900",
      customerEmail: "a@b.ru",
      items: [{ title: "P <script>", quantity: 2, price: 10000 }],
      totalAmount: 20000,
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("calls Telegram API when configured", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "test-token");
    vi.stubEnv("TELEGRAM_CHAT_ID", "123456");
    const { sendOrderNotification } = await import("@/lib/telegram");
    await sendOrderNotification({
      orderNumber: 99,
      customerName: "Иван",
      customerPhone: "+79001234567",
      customerEmail: "a@b.ru",
      items: [{ title: "Корм", quantity: 1, price: 10000 }],
      totalAmount: 10000,
    });

    expect(fetch).toHaveBeenCalled();
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toContain("api.telegram.org");
    const body = JSON.parse((init?.body as string) ?? "{}");
    expect(body.chat_id).toBe("123456");
    expect(body.text).toContain("99");
    expect(body.text).not.toContain("<script>");
  });

  it("logs when response not ok", async () => {
    const warn = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "t");
    vi.stubEnv("TELEGRAM_CHAT_ID", "1");
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => "too long",
      json: async () => ({}),
    } as Response);

    const { sendOrderNotification } = await import("@/lib/telegram");
    await sendOrderNotification({
      orderNumber: 1,
      customerName: "A",
      customerPhone: "+7900",
      customerEmail: "a@b.ru",
      items: [{ title: "x", quantity: 1, price: 1 }],
      totalAmount: 1,
    });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
