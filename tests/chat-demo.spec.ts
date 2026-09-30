import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/work/ddmind/chat-demo");
});

test("an answer streams in progressively", async ({ page }) => {
  await page.getByRole("button", { name: "How did you make the grid faster?" }).click();

  const answer = page.getByTestId("assistant-message");
  await expect(answer).toBeVisible();

  // Catch a genuine mid-stream moment: still streaming, some answer text present,
  // but the closing words have not arrived yet — proof it renders token by token.
  await expect
    .poll(
      async () => {
        const status = await answer.getAttribute("data-status");
        const text = await answer.innerText();
        return status === "streaming" && text.includes("The table") && !text.includes("freezes stopped");
      },
      { timeout: 10_000 },
    )
    .toBe(true);

  // Then it finishes with the full answer.
  await expect(answer).toHaveAttribute("data-status", "done", { timeout: 15_000 });
  await expect(answer).toContainText("server-side pagination");
  await expect(answer).toContainText("freezes stopped");
});

test("Stop halts streaming and keeps the partial answer", async ({ page }) => {
  await page.getByRole("button", { name: "How does the streaming chat work?" }).click();

  const answer = page.getByTestId("assistant-message");
  await expect.poll(async () => (await answer.innerText()).length).toBeGreaterThan(5);

  await page.getByTestId("stop-button").click();
  await expect(answer).toHaveAttribute("data-status", "stopped");

  const stoppedLength = (await answer.innerText()).length;
  await page.waitForTimeout(700);
  // No further tokens after stopping (allow for the "(stopped)" label).
  expect((await answer.innerText()).length).toBeLessThanOrEqual(stoppedLength + 12);
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
});

test("the error state shows Retry and recovers", async ({ page }) => {
  await page.getByLabel("Make the next reply fail, to show the error and Retry").check();
  await page.getByRole("button", { name: "How do file uploads work?" }).click();

  const answer = page.getByTestId("assistant-message");
  await expect(answer).toHaveAttribute("data-status", "error", { timeout: 15_000 });
  const retry = page.getByTestId("retry-button");
  await expect(retry).toBeVisible();

  await retry.click();
  await expect(answer).toHaveAttribute("data-status", "done", { timeout: 15_000 });
  await expect(answer).toContainText("pre-signed URL");
});
