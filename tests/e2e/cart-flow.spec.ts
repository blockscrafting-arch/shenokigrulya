import { expect, test } from "@playwright/test";

test.describe("Корзина", () => {
  test("добавление и переход в корзину", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /добавить в корзину/i }).click();
    await page.getByRole("link", { name: "Корзина", exact: false }).click();
    await expect(page.getByRole("heading", { name: /корзина/i })).toBeVisible();
    await expect(page.getByText(/получатель/i)).toBeVisible();
  });
});
