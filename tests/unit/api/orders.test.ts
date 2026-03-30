import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findMany: vi.fn() },
    order: { create: vi.fn(), findMany: vi.fn(), count: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { POST } from "@/app/api/orders/route";

describe("POST /api/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("creates order with server prices from DB", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      {
        id: "seed-product-1",
        price: 233100,
        isActive: true,
        weight: 3000,
        length: 370,
        width: 130,
        height: 230,
      },
    ] as never);

    vi.mocked(prisma.order.create).mockResolvedValue({
      id: "new-order-id",
      orderNumber: 7,
    } as never);

    const body = {
      customerName: "Иван",
      customerPhone: "+79001234567",
      customerEmail: "a@b.ru",
      deliveryType: "CDEK_PVZ",
      deliveryCost: 0,
      items: [{ productId: "seed-product-1", quantity: 1, price: 999 }],
    };

    const res = await POST(
      new Request("http://localhost/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as { orderId: string; orderNumber: number };
    expect(json.orderId).toBe("new-order-id");
    expect(json.orderNumber).toBe(7);

    expect(prisma.order.create).toHaveBeenCalled();
    const arg = vi.mocked(prisma.order.create).mock.calls[0][0];
    expect(arg.data.items?.create).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          productId: "seed-product-1",
          quantity: 1,
          price: 233100,
        }),
      ])
    );
  });

  it("returns 400 for invalid JSON", async () => {
    const res = await POST(
      new Request("http://localhost/api/orders", {
        method: "POST",
        body: "not-json",
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(res.status).toBe(400);
  });
});
