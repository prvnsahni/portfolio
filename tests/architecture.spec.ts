import { expect, test } from "@playwright/test";

const slugs = ["ddmind", "ccm", "paper-tiger", "block-power", "qbench"];

for (const slug of slugs) {
  test(`/work/${slug} shows an accessible Architecture diagram`, async ({ page }) => {
    await page.goto(`/work/${slug}`);

    // Section heading + anchor target.
    const section = page.locator("section#architecture");
    await expect(section).toHaveCount(1);
    await expect(section.getByRole("heading", { name: "Architecture" })).toBeVisible();

    // The diagram is an accessible SVG (role="img" with a non-trivial label).
    const diagram = section.getByRole("img");
    await expect(diagram).toBeVisible();
    const label = await diagram.getAttribute("aria-label");
    expect(label?.length ?? 0).toBeGreaterThan(40);

    // It is inline SVG, not an <img>.
    expect(await diagram.evaluate((el) => el.tagName.toLowerCase())).toBe("svg");

    // On-page nav lists the Architecture section (the TOC is hidden on mobile
    // via CSS, so assert the anchor is present rather than visible).
    await expect(page.locator('a[href="#architecture"]')).toHaveCount(1);
  });
}

test("architecture diagram does not cause horizontal scroll on mobile", async ({ page }) => {
  await page.goto("/work/ddmind");
  await page.locator("section#architecture").scrollIntoViewIfNeeded();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});
