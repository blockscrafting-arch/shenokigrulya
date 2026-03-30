import { expect, test } from "@playwright/test";

test.describe("Маршруты и 404", () => {
  test("несуществующая страница — not-found", async ({ page }) => {
    const res = await page.goto("/this-page-definitely-does-not-exist-igrulya");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /страница не найдена/i })).toBeVisible();
    await page.getByRole("link", { name: /на главную/i }).click();
    await expect(page).toHaveURL("/");
  });
});
