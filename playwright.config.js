import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
if (
  !process.env.DATABASE_URL ||
  !process.env.JWT_SECRET ||
  !process.env.E2E_ADMIN_EMAIL ||
  !process.env.E2E_ADMIN_PASSWORD
) {
  throw new Error(
    "Kiểm thử cần DATABASE_URL của database test đã migrate/seed, JWT_SECRET, E2E_ADMIN_EMAIL và E2E_ADMIN_PASSWORD. Không dùng database production.",
  );
}
if (!new URL(process.env.DATABASE_URL).pathname.endsWith("_test"))
  throw new Error(
    "Chỉ chạy Playwright trên database riêng có tên kết thúc bằng _test.",
  );
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (existsSync("/usr/lib/chromium/chromium")
    ? "/usr/lib/chromium/chromium"
    : undefined);
export default defineConfig({
  testDir: "./tests",
  globalTeardown: "./tests/redact-artifacts.js",
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30000,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5175",
    headless: true,
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
    timezoneId: "Asia/Bangkok",
    trace: "off",
    launchOptions: {
      executablePath,
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-proxy-server"],
    },
  },
  webServer: [
    {
      command: "npm start",
      cwd: "./server",
      url: "http://localhost:3100/api/health",
      reuseExistingServer: false,
      env: { PORT: "3100", FRONTEND_URL: "http://localhost:5175" },
    },
    {
      command:
        process.env.E2E_USE_PREVIEW === "1"
          ? "npm run preview -- --host 127.0.0.1 --port 5175 --strictPort"
          : "npm run dev -- --host 127.0.0.1 --port 5175 --strictPort",
      url: "http://localhost:5175",
      reuseExistingServer: false,
      env: { VITE_API_URL: "http://localhost:3100", VITE_BASE_PATH: "/" },
    },
  ],
});
