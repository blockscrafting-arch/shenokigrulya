import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findMany: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({
  getAdminFromRequest: vi.fn(),
}));

import { getAdminFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GET, POST } from "@/app/api/products/route";

describe("/api/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns active products", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: "1", title: "Корм", price: 100, isActive: true },
    ] as never);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].title).toBe("Корм");
  });

  it("POST requires admin", async () => {
    vi.mocked(getAdminFromRequest).mockResolvedValue(null);

    const res = await POST(
      new Request("http://localhost/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New",
          price: 1000,
        }),
      })
    );
    expect(res.status).toBe(401);
  });

  it("POST creates product when admin", async () => {
    vi.mocked(getAdminFromRequest).mockResolvedValue({
      adminId: "a1",
      login: "admin",
    });
    vi.mocked(prisma.product.create).mockResolvedValue({
      id: "p-new",
      title: "New",
      price: 1000,
    } as never);

    const res = await POST(
      new Request("http://localhost/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New",
          price: 1000,
        }),
      })
    );

    expect(res.status).toBe(200);
    expect(prisma.product.create).toHaveBeenCalled();
  });
});
