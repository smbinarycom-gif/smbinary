import { chromium } from 'playwright';

(async function(){
  const url = process.env.URL || 'http://localhost:3002/';
  console.log('Checking', url);
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ timeout: 30000 });
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Read localStorage admin_auth
    const adminAuth = await page.evaluate(() => {
      try { return localStorage.getItem('admin_auth'); } catch (e) { return null; }
    });

    // Check for login text
    const hasLoginText = await page.locator('text=Admin Login (dev)').count();

    // Also check if AdminPanel root element appears by presence of "Affiliate Settings" header (as an indicator)
    const hasAdminPanel = await page.locator('text=Affiliate Settings').count();

    console.log('admin_auth=', adminAuth);
    console.log('hasLoginText=', hasLoginText);
    console.log('hasAdminPanelIndicator=', hasAdminPanel);
    if (adminAuth) {
      console.log('Result: Browser shows authenticated state; login not shown.');
    } else if (hasLoginText) {
      console.log('Result: Login form is present (unauthenticated).');
    } else if (hasAdminPanel) {
      console.log('Result: Admin panel loaded directly (no login visible).');
    } else {
      console.log('Result: Could not detect login or admin panel — UI may differ.');
    }
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Error during check:', err);
    if (browser) await browser.close();
    process.exit(2);
  }
})();
