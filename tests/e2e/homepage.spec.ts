import { expect, test } from "@playwright/test";

test.describe("Главная", () => {
  test("заголовок, товар и CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Щенок Игруля/i);
    await expect(
      page.getByRole("button", { name: /добавить в корзину/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /ozon/i })).toBeVisible();
  });
});
