import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/admin";

test.describe("Админка: заказы", () => {
  test("список заказов", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/orders");
    await expect(page.getByRole("heading", { name: /заказ/i })).toBeVisible();
  });
});
