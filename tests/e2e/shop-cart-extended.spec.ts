import { expect, test } from "@playwright/test";

async function openCartWithOneItem(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: /добавить в корзину/i }).click();
  await page.goto("/cart");
}

function cartLineCounter(page: import("@playwright/test").Page) {
  const cartSection = page.locator("section").filter({ has: page.getByRole("heading", { name: /^Корзина$/ }) });
  const line = cartSection.locator(".divide-y").locator("> div").first();
  const counter = line.locator("div.flex.items-center.rounded-xl").first();
  return { line, counter };
}

test.describe("Корзина: расширенные сценарии", () => {
  test("увеличение количества обновляет счётчик строки", async ({ page }) => {
    await openCartWithOneItem(page);
    const { counter } = cartLineCounter(page);
    await expect(counter.locator("span").first()).toHaveText("1");
    await counter.getByRole("button").last().click();
    await expect(counter.locator("span").first()).toHaveText("2");
  });

  test("количество 0: позиция остаётся, оформление заблокировано", async ({ page }) => {
    await openCartWithOneItem(page);
    const { counter } = cartLineCounter(page);
    await counter.getByRole("button").first().click();
    await expect(counter.locator("span").first()).toHaveText("0");
    await expect(page.getByRole("button", { name: /оформить заказ/i })).toBeDisabled();
  });

  test("удаление позиции через иконку — пустая корзина", async ({ page }) => {
    await openCartWithOneItem(page);
    await page.getByRole("button", { name: "Удалить товар" }).click();
    await expect(page.getByRole("heading", { name: /корзина пуста/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /к товарам/i })).toBeVisible();
  });

  test("очистить корзину с подтверждением", async ({ page }) => {
    await openCartWithOneItem(page);
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: /очистить корзину/i }).click();
    await expect(page.getByRole("heading", { name: /корзина пуста/i })).toBeVisible();
  });
});
