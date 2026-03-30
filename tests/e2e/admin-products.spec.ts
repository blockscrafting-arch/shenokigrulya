import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/admin";

test.describe("Админка: товары", () => {
  test("список товаров и создание", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/products");
    await expect(page.getByRole("heading", { name: /товар/i })).toBeVisible();
    await page.getByRole("link", { name: "Добавить товар" }).click();
    await expect(page).toHaveURL(/\/admin\/products\/new/);
  });

  test("редактирование карточки сида (стабильный id)", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/products/seed-product-1");
    await expect(page.getByRole("heading", { name: "Редактировать товар" })).toBeVisible();
    await expect(page.getByRole("textbox").first()).toBeVisible();
  });
});
