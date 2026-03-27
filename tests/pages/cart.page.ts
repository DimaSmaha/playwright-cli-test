import { expect, Page } from "@playwright/test";

export class CartPage {
  constructor(private readonly page: Page) {}

  async assertLoaded() {
    await expect(
      this.page.getByRole("button", { name: "Checkout" }),
    ).toBeVisible();
  }

  async startCheckout() {
    await this.page.getByRole("button", { name: "Checkout" }).click();
    await expect(this.page).toHaveURL(/.*checkout-step-one.html/);
  }
}
