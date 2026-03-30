import { defineConfig, devices } from "@playwright/test";

/**
 * Локальный `npm run start` → NODE_ENV=production: нужен недефолтный JWT_SECRET и http-URL,
 * иначе вход в админку падает (auth.ts) или Secure-cookie не ставится на localhost.
 */
function webServerEnv(): Record<string, string> {
  const jwt = process.env.JWT_SECRET;
  const jwtOk = Boolean(jwt && jwt !== "dev-secret-change-in-production");
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined) out[k] = v;
  }
  out.JWT_SECRET = jwtOk ? jwt! : "playwright-e2e-jwt-secret-minimum-32-characters-long";
  out.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  /** Иначе общий лимит по IP «unknown» рвёт длинные E2E при одном воркере */
  out.E2E_RELAX_LOGIN_RATELIMIT = "1";
  return out;
}

/**
 * E2E требуют рабочую БД (как в .env / docker-compose) и сид:
 *   docker compose up -d && npx prisma db push && npx tsx prisma/seed.ts && npm run build
 * В CI PostgreSQL поднимается в workflow перед тестами.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"], ["list"]],
  timeout: 60_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: webServerEnv(),
  },
});
