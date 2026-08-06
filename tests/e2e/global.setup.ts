
import { chromium } from "@playwright/test";

async function globalSetup() {
  const baseURL = "http://localhost:3000";

  console.log("🔧 Running global setup...");
  console.log(`📍 Base URL: ${baseURL}`);

  let browser;
  let page;

  try {
    browser = await chromium.launch();
    page = await browser.newPage();

    const response = await page.goto(`${baseURL}/_health`, {
      waitUntil: "domcontentloaded",
    });

    if (!response || !response.ok()) {
      console.error("⚠️  App health check failed. Make sure the app is running.");
      throw new Error("App health check failed");
    }

    console.log("✅ App is healthy");
  } catch (error) {
    console.error("⚠️  Could not reach app at", baseURL);
    console.error("   Make sure the dev server is running: pnpm dev");
    throw error;
  } finally {
    await browser?.close();
  }

  console.log("✅ Global setup complete\n");
}

export default globalSetup;
