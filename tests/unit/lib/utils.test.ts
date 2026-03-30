import { describe, expect, it } from "vitest";
import { cn, formatDate, formatPrice } from "@/lib/utils";

describe("cn", () => {
  it("merges tailwind classes", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "block")).toBe("base block");
  });
});

describe("formatPrice", () => {
  it("formats kopecks as RUB without fraction", () => {
    expect(formatPrice(233100)).toContain("2");
    expect(formatPrice(233100)).toContain("331");
    expect(formatPrice(0)).toContain("0");
  });
});

describe("formatDate", () => {
  it("formats ISO date in ru locale", () => {
    const s = formatDate("2026-03-30T12:00:00.000Z");
    expect(s).toMatch(/30\.03\.2026/);
  });
});
