import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CartProvider, useCart } from "@/hooks/useCart";

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

describe("useCart", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("addItem and totals", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.addItem({
        productId: "p1",
        title: "Корм",
        price: 1000,
        image: null,
        quantity: 2,
      });
    });

    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalPrice).toBe(2000);
    expect(result.current.totalItems).toBe(2);
  });

  it("updateQuantity respects zero", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.addItem({
        productId: "p1",
        title: "Корм",
        price: 500,
        image: null,
      });
      result.current.updateQuantity("p1", 0);
    });

    expect(result.current.items[0].quantity).toBe(0);
    expect(result.current.totalItems).toBe(0);
  });

  it("removeItem clears line", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.addItem({ productId: "p1", title: "A", price: 1, image: null });
      result.current.removeItem("p1");
    });

    expect(result.current.items.length).toBe(0);
  });

  it("clearCart", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.addItem({ productId: "p1", title: "A", price: 1, image: null });
      result.current.clearCart();
    });

    expect(result.current.items.length).toBe(0);
  });
});
