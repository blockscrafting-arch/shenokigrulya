import { expect, test } from "@playwright/test";

test.describe("Витрина: карточка и оформление", () => {
  test("бейджи, состав и раскрытие", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/холистик/i).first()).toBeVisible();
    await expect(page.getByText(/гипоаллергенн/i).first()).toBeVisible();
    await expect(page.getByText("СОСТАВ:", { exact: false })).toBeVisible();
    const expand = page.getByRole("button", { name: /^Развернуть$/ });
    if ((await expand.count()) > 0) {
      await expand.click();
      await expect(page.getByRole("button", { name: /^Свернуть$/ })).toBeVisible();
    }
  });

  test("кнопка оплаты неактивна без доставки", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /добавить в корзину/i }).click();
    await page.goto("/cart");
    await expect(page.getByText(/выберите доставку для расчёта итога/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /оформить заказ/i })).toBeDisabled();
  });

  test("в блоке оплаты есть ссылки на политику и оферту", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /добавить в корзину/i }).click();
    await page.goto("/cart");
    await expect(
      page.getByRole("link", { name: /политикой обработки данных/i }),
    ).toHaveAttribute("href", "/privacy");
    await expect(page.getByRole("link", { name: /публичной офертой/i })).toHaveAttribute("href", "/offer");
  });

  test("/checkout редиректит на корзину", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/cart$/);
  });
});
