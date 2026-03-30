import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/payment/webhook/route";

describe("POST /api/payment/webhook", () => {
  it("returns 403 for disallowed IP", async () => {
    const res = await POST(
      new Request("http://localhost/api/payment/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "203.0.113.50",
        },
        body: JSON.stringify({
          type: "notification",
          object: { id: "pay-1", status: "succeeded" },
        }),
      })
    );
    expect(res.status).toBe(403);
  });

  it("returns 400 for invalid JSON", async () => {
    const res = await POST(
      new Request("http://localhost/api/payment/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "77.75.153.99",
        },
        body: "not-json",
      })
    );
    expect(res.status).toBe(400);
  });
});
