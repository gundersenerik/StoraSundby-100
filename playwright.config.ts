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
  // Standardens 5 s är för snävt för en server action på en belastad
  // CI-runner: bekräfta-åtgärden hann inte svara och testet föll fast
  // åtgärden lyckades. Tio sekunder mäter fortfarande "svarar rimligt",
  // utan att fälla körningen för maskinens dagsform.
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    // Loggar in en gang och sparar sessionerna. Utan detta gor varje test
    // ett eget auth-anrop, och Supabase stryper dem.
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "mobil",
      use: { ...devices["Pixel 7"] },
      dependencies: ["setup"],
    },
    {
      name: "skrivbord",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
