import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/work/qbench/form-demo");
});

test("presets load a different form", async ({ page }) => {
  // Default preset is the lab intake.
  await expect(page.getByLabel("Sample ID")).toBeVisible();

  await page.getByRole("button", { name: "Vendor contract" }).click();
  await expect(page.getByLabel("Vendor name")).toBeVisible();
  await expect(page.getByLabel("Sample ID")).toHaveCount(0);

  await page.getByRole("button", { name: "Simple contact" }).click();
  await expect(page.getByLabel("Your name")).toBeVisible();
});

test("editing the JSON re-renders the form", async ({ page }) => {
  const config = JSON.stringify({
    title: "Edited form",
    fields: [{ name: "nickname", label: "Nickname", type: "text" }],
  });
  await page.getByTestId("config-editor").fill(config);

  await expect(page.getByText("Config is valid.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Edited form" })).toBeVisible();
  await expect(page.getByLabel("Nickname")).toBeVisible();
  await expect(page.getByLabel("Sample ID")).toHaveCount(0);
});

test("a conditional field appears and disappears (visibleWhen)", async ({ page }) => {
  // "Reason for rush" only shows when priority is Rush.
  await expect(page.getByLabel(/Reason for rush/)).toHaveCount(0);
  await page.getByLabel(/Priority/).selectOption({ label: "Rush" });
  await expect(page.getByLabel(/Reason for rush/)).toBeVisible();
  await page.getByLabel(/Priority/).selectOption({ label: "Standard" });
  await expect(page.getByLabel(/Reason for rush/)).toHaveCount(0);
});

test("nested dependent dropdowns chain: country to state to city", async ({ page }) => {
  await page.getByRole("button", { name: "Simple contact" }).click();

  // State and city are hidden until the field above them has a value.
  await expect(page.getByLabel(/State/)).toHaveCount(0);
  await expect(page.getByLabel(/City/)).toHaveCount(0);

  await page.getByLabel("Country").selectOption({ label: "India" });
  await expect(page.getByLabel(/State/)).toBeVisible();
  await expect(page.getByLabel(/City/)).toHaveCount(0);

  await page.getByLabel(/State/).selectOption({ label: "Maharashtra" });
  await expect(page.getByLabel(/City/)).toBeVisible();

  // Changing the country clears the now-invalid state, which hides the city.
  await page.getByLabel("Country").selectOption({ label: "United States" });
  await expect(page.getByLabel(/City/)).toHaveCount(0);
});

test("invalid JSON shows an error without crashing", async ({ page }) => {
  await page.getByTestId("config-editor").fill("{ not valid json");

  await expect(page.getByTestId("config-error")).toBeVisible();
  // The previously valid form is still rendered.
  await expect(page.getByTestId("rendered-form")).toBeVisible();
  await expect(page.getByLabel("Sample ID")).toBeVisible();
});

test("submitting shows the collected values as JSON", async ({ page }) => {
  await page.getByRole("button", { name: "Simple contact" }).click();
  await page.getByLabel("Your name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel(/Topic/).selectOption({ label: "Sales" });
  await page.getByLabel("Message").fill("Hello there.");
  await page.getByRole("button", { name: "Send" }).click();

  const result = page.getByTestId("submit-result");
  await expect(result).toBeVisible();
  await expect(result).toContainText('"name": "Ada Lovelace"');
  await expect(result).toContainText('"topic": "sales"');
});
