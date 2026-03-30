import { expect, test } from "@playwright/test";

test.describe("Мобильная вёрстка", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("шапка и корзина на узком экране", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /на главную/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Корзина", exact: false })).toBeVisible();
    await page.getByRole("button", { name: /добавить в корзину/i }).click();
    await expect(page.getByRole("link", { name: "Корзина", exact: false })).toBeVisible();
  });
});
