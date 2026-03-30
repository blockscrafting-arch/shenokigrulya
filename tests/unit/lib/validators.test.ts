import { describe, expect, it } from "vitest";
import {
  createOrderSchema,
  createProductSchema,
  loginSchema,
  orderItemSchema,
} from "@/lib/validators";

describe("loginSchema", () => {
  it("accepts valid login", () => {
    expect(loginSchema.safeParse({ login: "admin", password: "x" }).success).toBe(true);
  });

  it("rejects empty password", () => {
    expect(loginSchema.safeParse({ login: "a", password: "" }).success).toBe(false);
  });
});

describe("createProductSchema", () => {
  it("accepts minimal product", () => {
    const r = createProductSchema.safeParse({
      title: "Корм",
      price: 1000,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.badges).toEqual([]);
  });

  it("rejects negative price", () => {
    expect(createProductSchema.safeParse({ title: "x", price: -1 }).success).toBe(false);
  });
});

describe("orderItemSchema", () => {
  it("requires quantity >= 1", () => {
    expect(
      orderItemSchema.safeParse({ productId: "p1", quantity: 0, price: 100 }).success
    ).toBe(false);
    expect(
      orderItemSchema.safeParse({ productId: "p1", quantity: 1, price: 100 }).success
    ).toBe(true);
  });
});

describe("createOrderSchema", () => {
  const base = {
    customerName: "Иван Иванов",
    customerPhone: "+79001234567",
    customerEmail: "a@example.com",
    deliveryType: "CDEK_PVZ" as const,
    deliveryCost: 0,
    items: [{ productId: "p1", quantity: 1, price: 100 }],
  };

  it("accepts valid order", () => {
    expect(createOrderSchema.safeParse(base).success).toBe(true);
  });

  it("rejects bad phone", () => {
    expect(
      createOrderSchema.safeParse({ ...base, customerPhone: "123" }).success
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      createOrderSchema.safeParse({ ...base, customerEmail: "not-email" }).success
    ).toBe(false);
  });
});
