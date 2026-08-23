import { defineConfig, devices } from "@playwright/test";

/**
 * Testar mot en riktig produktionsbyggd sajt, inte mot dev-servern.
 * Skillnaderna mellan dem — cachning, prerendering, minifiering — är
 * precis där buggar gömmer sig.
 *
 * Mobil viewport är standard. Merparten av besökarna är föräldrar med
 * telefon, och kravet på inline-redigering gäller uttryckligen mobilen.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "mobil", use: { ...devices["Pixel 7"] } },
    { name: "skrivbord", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
