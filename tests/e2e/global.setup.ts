
import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  const baseURL = "http://localhost:3000";

  console.log("🔧 Running global setup...");
  console.log(`📍 Base URL: ${baseURL}`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    const response = await page.goto(`${baseURL}/_health`, {
      waitUntil: "domcontentloaded",
    });

    if (!response || !response.ok()) {
      console.warn(
        "⚠️  App health check failed. Make sure the app is running."
      );
    } else {
      console.log("✅ App is healthy");
    }
  } catch (error) {
    console.error("⚠️  Could not reach app at", baseURL);
    console.error("   Make sure the dev server is running: pnpm dev");
  } finally {
    await browser.close();
  }

  console.log("✅ Global setup complete\n");
}

export default globalSetup;