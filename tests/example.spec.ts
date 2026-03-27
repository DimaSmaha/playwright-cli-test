import { test, expect } from "@playwright/test";

test("user can complete checkout flow on SauceDemo", async ({ page }) => {
  await page.goto("https://www.saucedemo.com/");

  await page.getByPlaceholder("Username").fill("standard_user");
  await page.getByPlaceholder("Password").fill("secret_sauce");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/.*inventory.html/);
  await expect(page.locator('[data-test="inventory-container"]')).toBeVisible();

  await page.getByRole("button", { name: "Add to cart" }).first().click();
  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText(
    "1",
  );

  await page.locator('[data-test="shopping-cart-link"]').click();
  await expect(page).toHaveURL(/.*cart.html/);
  await expect(page.getByRole("button", { name: "Checkout" })).toBeVisible();

  await page.getByRole("button", { name: "Checkout" }).click();
  await expect(page).toHaveURL(/.*checkout-step-one.html/);

  await page.getByPlaceholder("First Name").fill("E2E");
  await page.getByPlaceholder("Last Name").fill("Tester");
  await page.getByPlaceholder("Zip/Postal Code").fill("10001");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page).toHaveURL(/.*checkout-step-two.html/);
  await page.getByRole("button", { name: "Finish" }).click();

  await expect(page).toHaveURL(/.*checkout-complete.html/);
  await expect(
    page.getByRole("heading", { name: "Thank you for your order!" }),
  ).toBeVisible();
});
