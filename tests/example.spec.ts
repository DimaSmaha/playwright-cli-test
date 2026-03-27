import { test } from "@playwright/test";
import { CartPage } from "./pages/cart.page";
import { CheckoutPage } from "./pages/checkout.page";
import { InventoryPage } from "./pages/inventory.page";
import { LoginPage } from "./pages/login.page";

test("user can complete checkout flow on SauceDemo", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  await loginPage.goto();
  await loginPage.login("standard_user", "secret_sauce");

  await inventoryPage.assertLoaded();
  await inventoryPage.addFirstItemToCart();
  await inventoryPage.assertCartCount("1");
  await inventoryPage.goToCart();

  await cartPage.assertLoaded();
  await cartPage.startCheckout();

  await checkoutPage.fillInformation("E2E", "Tester", "10001");
  await checkoutPage.finishOrder();
  await checkoutPage.assertOrderSuccess();
});
