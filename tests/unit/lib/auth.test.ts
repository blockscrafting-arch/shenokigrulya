import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateToken, hashPassword, verifyPassword, verifyToken } from "@/lib/auth";

describe("auth helpers", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", "vitest-jwt-secret-min-32-characters-long!");
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("hashes and verifies password", async () => {
    const hash = await hashPassword("mySecurePass123");
    expect(hash).not.toBe("mySecurePass123");
    expect(await verifyPassword("mySecurePass123", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("JWT encode and decode", () => {
    const token = generateToken({ adminId: "admin-1", login: "admin" });
    expect(verifyToken(token)).toMatchObject({ adminId: "admin-1", login: "admin" });
    expect(verifyToken("invalid.token.here")).toBeNull();
  });
});
