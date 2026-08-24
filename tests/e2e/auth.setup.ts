import { test as setup } from "@playwright/test";
import { ADMIN_EPOST, ADMIN_STATE, ICKE_ADMIN_EPOST, ICKE_ADMIN_STATE, loggaInSom } from "./hjalp";

/**
 * Loggar in en gång och sparar sessionerna.
 *
 * Tidigare loggade varje test in för sig. Med två Playwright-projekt blev
 * det ett trettiotal auth-anrop per körning, och Supabase började strypa
 * dem. Inloggningen misslyckades tyst, testet omdirigerades till
 * inloggningssidan, och väntade sedan 30 sekunder på en knapp som aldrig
 * kunde dyka upp.
 *
 * Symptomet var timeouts som flyttade sig mellan körningar — alltså precis
 * det som brukar avfärdas som "kör om den". Orsaken var verklig.
 */
setup("logga in som administratör", async ({ page }) => {
  await loggaInSom(page, ADMIN_EPOST);
  await page.waitForURL(/\/admin$/);
  await page.context().storageState({ path: ADMIN_STATE });
});

setup("logga in utan behörighet", async ({ page }) => {
  await loggaInSom(page, ICKE_ADMIN_EPOST);
  await page.context().storageState({ path: ICKE_ADMIN_STATE });
});
