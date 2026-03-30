import { afterEach, describe, expect, it, vi } from "vitest";

describe("successSign", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("sign and verify roundtrip", async () => {
    vi.stubEnv("SUCCESS_ORDER_SECRET", "test-hmac-secret-32bytes-minimum!");
    vi.stubEnv("JWT_SECRET", "");
    const { signOrderId, verifyOrderId } = await import("@/lib/successSign");
    const id = "order-cuid-123";
    const sig = signOrderId(id);
    expect(sig.length).toBeGreaterThan(10);
    expect(verifyOrderId(id, sig)).toBe(true);
    expect(verifyOrderId(id, "deadbeef")).toBe(false);
    expect(verifyOrderId(id, null)).toBe(false);
    expect(verifyOrderId(id, "not-hex!!!")).toBe(false);
  });

  it("rejects tampered id", async () => {
    vi.stubEnv("SUCCESS_ORDER_SECRET", "same-secret-for-both-tests-xxxxx");
    vi.stubEnv("JWT_SECRET", "");
    const { signOrderId, verifyOrderId } = await import("@/lib/successSign");
    const sig = signOrderId("a");
    expect(verifyOrderId("b", sig)).toBe(false);
  });
});
