import { expect, test } from "@playwright/test";

test.describe("API и SEO: дымовые проверки", () => {
  test("GET /api/health — ok при живой БД", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { status: string };
    expect(json.status).toBe("ok");
  });

  test("GET /api/products — публичный список", async ({ request }) => {
    const res = await request.get("/api/products");
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as unknown[];
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test("GET /api/orders без cookie — 401", async ({ request }) => {
    const res = await request.get("/api/orders");
    expect(res.status()).toBe(401);
  });

  test("POST /api/auth/logout — 200", async ({ request }) => {
    const res = await request.post("/api/auth/logout");
    expect(res.ok()).toBeTruthy();
  });

  test("POST /api/orders — невалидное тело 400", async ({ request }) => {
    const res = await request.post("/api/orders", {
      data: {
        customerName: "Т",
        customerPhone: "1",
        customerEmail: "не-email",
        deliveryType: "CDEK_PVZ",
        deliveryCost: 0,
        items: [],
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(400);
  });

  test("GET / — заголовок CSP", async ({ request }) => {
    const res = await request.get("/");
    expect(res.ok()).toBeTruthy();
    const csp = res.headers()["content-security-policy"];
    expect(csp).toBeTruthy();
    expect(csp!.toLowerCase()).toContain("default-src");
  });

  test("robots.txt запрещает /admin", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(text.toLowerCase()).toContain("disallow:");
    expect(text).toMatch(/admin/i);
  });

  test("sitemap.xml отдаётся", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(text).toContain("<urlset");
  });
});
