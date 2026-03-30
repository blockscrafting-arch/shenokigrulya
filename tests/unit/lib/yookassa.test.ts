import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("yookassa createPayment", () => {
  beforeEach(() => {
    vi.stubEnv("YOOKASSA_SHOP_ID", "123");
    vi.stubEnv("YOOKASSA_SECRET_KEY", "secret");
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("sends idempotence key with attempt suffix", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => "",
      json: async () => ({
        id: "pay-1",
        confirmation: { confirmation_url: "https://yookassa.ru/pay" },
      }),
    } as Response);

    const { createPayment } = await import("@/lib/yookassa");
    const result = await createPayment({
      amount: 50000,
      orderId: "ord-1",
      description: "Заказ",
      returnUrl: "https://example.com/ok",
      customerEmail: "a@b.ru",
      deliveryCost: 500,
      items: [{ title: "Корм", quantity: 1, price: 49500 }],
      attempt: 2,
    });

    expect(result.confirmationUrl).toBe("https://yookassa.ru/pay");
    expect(result.paymentId).toBe("pay-1");

    expect(fetch).toHaveBeenCalledTimes(1);
    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(init?.headers).toMatchObject({
      "Idempotence-Key": "pay-ord-1-2",
    });
    const body = JSON.parse((init?.body as string) ?? "{}");
    expect(body.receipt.items.length).toBeGreaterThanOrEqual(2);
    expect(body.amount.value).toBe("500.00");
  });

  it("throws on API error", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      text: async () => "bad request",
      json: async () => ({}),
    } as Response);

    const { createPayment } = await import("@/lib/yookassa");
    await expect(
      createPayment({
        amount: 100,
        orderId: "o",
        description: "d",
        returnUrl: "https://x",
        customerEmail: "a@b.ru",
        deliveryCost: 0,
        items: [{ title: "t", quantity: 1, price: 100 }],
      })
    ).rejects.toThrow(/YooKassa error/);
  });
});
