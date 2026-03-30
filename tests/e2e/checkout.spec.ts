import { expect, test } from "@playwright/test";

test.describe("Оформление", () => {
  test("форма получателя и блок доставки", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /добавить в корзину/i }).click();
    await page.goto("/cart");
    const receiver = page.locator("section").filter({ has: page.getByRole("heading", { name: /^Получатель$/i }) });
    await receiver.locator('input[type="text"]').fill("Тест Покупатель");
    await receiver.locator('input[type="tel"]').fill("+79001234567");
    await receiver.locator('input[type="email"]').fill("test@example.com");
    await expect(page.getByRole("heading", { name: /доставка/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /выбрать пункт выдачи|изменить доставку/i })
    ).toBeVisible();
  });
});
