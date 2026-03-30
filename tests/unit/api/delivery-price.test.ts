import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cdek", () => ({
  calculateDelivery: vi.fn().mockResolvedValue({
    sum: 55500,
    deliveryMin: 2,
    deliveryMax: 4,
  }),
}));

import { calculateDelivery } from "@/lib/cdek";
import { POST } from "@/app/api/delivery/price/route";

describe("POST /api/delivery/price", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("CDEK_FROM_CITY_CODE", "44");
  });

  it("returns delivery cost from CDEK helper", async () => {
    const res = await POST(
      new Request("http://localhost/api/delivery/price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryCityCode: 270,
          tariffCode: 136,
          goods: [{ weight: 3000, length: 37, width: 13, height: 23 }],
        }),
      }) as unknown as NextRequest
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.deliveryCost).toBe(55500);
    expect(json.periodMin).toBe(2);
    expect(calculateDelivery).toHaveBeenCalled();
  });

  it("returns 400 for invalid body", async () => {
    const res = await POST(
      new Request("http://localhost/api/delivery/price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryCityCode: -1 }),
      }) as unknown as NextRequest
    );
    expect(res.status).toBe(400);
  });
});
