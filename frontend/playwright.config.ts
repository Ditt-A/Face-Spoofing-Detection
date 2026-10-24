import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
const localPython =
  process.platform === "win32"
    ? "../.venv/Scripts/python.exe"
    : "../.venv/bin/python";
const python =
  process.env.FSD_TEST_PYTHON ||
  (existsSync(localPython) ? localPython : "python");
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4174",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
      },
    },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command: `"${python}" -m uvicorn app.main:app --app-dir ../backend --host 127.0.0.1 --port 8311`,
      url: "http://127.0.0.1:8311/api/v1/health",
      env: { FSD_ENABLE_MODEL: "0", FSD_MODEL_FACTORY: "" },
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        "node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4174 --strictPort",
      url: "http://127.0.0.1:4174",
      env: { FSD_API_URL: "http://127.0.0.1:8311" },
      reuseExistingServer: !process.env.CI,
    },
  ],
});
