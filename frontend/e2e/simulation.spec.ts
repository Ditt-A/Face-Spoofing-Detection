import { expect, test } from "@playwright/test";

test("simulation is reachable and accepts only internal examples", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator(".header-actions")
    .getByRole("link", { name: "Coba simulasi", exact: true })
    .click();
  await expect(page).toHaveURL(/#simulasi$/);
  const section = page.locator("#simulasi");
  await expect(section.getByRole("heading", { level: 2 })).toBeInViewport();
  await expect(section.getByRole("note")).toContainText("Model belum dimuat.");
  await expect(section.locator('input[type="file"]')).toHaveCount(0);
  await expect(section.locator(".simulation-examples button")).toHaveCount(6);
  await expect(
    section.getByRole("button", { name: "Periksa gambar", exact: true }),
  ).toBeEnabled();
});

test("running a sample calls the real backend and renders its result", async ({
  page,
}) => {
  await page.goto("/#simulasi");
  const section = page.locator("#simulasi");
  await expect(section.getByRole("heading", { level: 2 })).toBeInViewport();
  await expect(
    section.getByRole("button", { name: "Periksa gambar", exact: true }),
  ).toBeEnabled();
  const response = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/v1/analyze") &&
      response.request().method() === "POST",
  );
  await section
    .getByRole("button", { name: "Periksa gambar", exact: true })
    .click();
  const result = await (await response).json();
  expect(result.metadata.provider).toBe("fallback");
  expect(result.metadata.model_loaded).toBe(false);
  expect(result.confidence).toBeNull();
  await expect(section.getByTestId("analysis-result")).toContainText(
    "Wajah asli",
  );
  await expect(section.getByTestId("analysis-result")).toContainText(
    result.request_id.slice(0, 8),
  );
  await expect(section.getByTestId("analysis-result")).toContainText(
    "PRATINJAU HASIL",
  );
  await section
    .getByRole("button", { name: "Pilih contoh Foto cetak", exact: true })
    .click();
  await expect(section.getByTestId("analysis-result")).toHaveCount(0);
  await section
    .getByRole("button", { name: "Periksa gambar", exact: true })
    .click();
  await expect(section.getByTestId("analysis-result")).toContainText(
    "Indikasi pemalsuan",
  );
  await expect(section.getByTestId("analysis-result")).toContainText(
    "Foto cetak",
  );
  await section
    .getByRole("button", { name: "Atur ulang", exact: true })
    .click();
  await expect(section.getByTestId("analysis-result")).toHaveCount(0);
  await expect(
    section.getByRole("button", {
      name: "Pilih contoh Wajah asli",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("changing examples aborts a pending request and ignores stale results", async ({
  page,
}) => {
  let release!: () => void;
  let received!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const requested = new Promise<void>((resolve) => {
    received = resolve;
  });
  await page.route("**/api/v1/analyze", async (route) => {
    received();
    await held;
    await route
      .fulfill({ json: { request_id: "stale-result" } })
      .catch(() => {});
  });
  await page.goto("/#simulasi");
  const section = page.locator("#simulasi");
  await expect(
    section.getByRole("button", { name: "Periksa gambar", exact: true }),
  ).toBeEnabled();
  await section
    .getByRole("button", { name: "Periksa gambar", exact: true })
    .click();
  await requested;
  const cancelled = page.waitForEvent("requestfailed", (request) =>
    request.url().endsWith("/api/v1/analyze"),
  );
  await section
    .getByRole("button", { name: "Pilih contoh Layar ponsel", exact: true })
    .click();
  await cancelled;
  release();
  await expect(section.getByTestId("analysis-result")).toHaveCount(0);
  await expect(
    section.getByRole("button", { name: "Periksa gambar", exact: true }),
  ).toBeEnabled();
  await expect(
    section.getByRole("button", {
      name: "Pilih contoh Layar ponsel",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("request failures show a readable message and can be retried", async ({
  page,
}) => {
  let failures = 0;
  await page.route("**/api/v1/analyze", async (route) => {
    if (failures++ === 0)
      await route.fulfill({ status: 503, json: { detail: "Unavailable" } });
    else await route.continue();
  });
  await page.goto("/#simulasi");
  const section = page.locator("#simulasi");
  await expect(
    section.getByRole("button", { name: "Periksa gambar", exact: true }),
  ).toBeEnabled();
  await section
    .getByRole("button", { name: "Periksa gambar", exact: true })
    .click();
  await expect(section.getByRole("alert")).toContainText(
    "Layanan pemeriksaan belum dapat dihubungi",
  );
  await section.getByRole("button", { name: "Coba lagi", exact: true }).click();
  await expect(section.getByTestId("analysis-result")).toContainText(
    "Wajah asli",
  );
});

test("offline connection can recover without exposing an upload control", async ({
  page,
}) => {
  await page.route("**/api/v1/health", (route) =>
    route.fulfill({ status: 503 }),
  );
  await page.goto("/#simulasi");
  const section = page.locator("#simulasi");
  await expect(
    section.getByRole("button", { name: "Periksa gambar", exact: true }),
  ).toBeDisabled();
  await expect(
    section.getByRole("button", { name: "Coba hubungkan", exact: true }),
  ).toBeVisible();
  await page.unroute("**/api/v1/health");
  await section
    .getByRole("button", { name: "Coba hubungkan", exact: true })
    .click();
  await expect(
    section.getByRole("button", { name: "Periksa gambar", exact: true }),
  ).toBeEnabled();
  await expect(section.getByRole("note")).toContainText("Model belum dimuat");
});
