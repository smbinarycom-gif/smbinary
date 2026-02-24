import { chromium } from 'playwright';

(async function(){
  const url = process.env.URL || 'http://localhost:3002/st';
  console.log('E2E check', url);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ timeout: 30000 });

  const logs = [];
  page.on('console', msg => logs.push({ type: 'console', text: msg.text() }));
  page.on('pageerror', err => logs.push({ type: 'error', text: err.toString() }));

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Wait for login form
    await page.waitForSelector('text=Admin Login (dev)', { timeout: 5000 });

    // Click Fill dev creds if present
    const fillBtn = await page.$('text=Fill dev creds');
    if (fillBtn) await fillBtn.click();

    // Click Sign in
    const signBtn = await page.$('text=Sign in');
    if (signBtn) {
      await Promise.all([
        page.waitForTimeout(800),
        signBtn.click()
      ]);
    }

    // Wait a moment for UI update
    await page.waitForTimeout(800);

    // Check for admin UI indicator
    const hasAffiliate = await page.locator('text=Affiliate Settings').count();
    const hasDashboard = await page.locator('text=Overview').count();

    console.log('logs:', JSON.stringify(logs, null, 2));
    console.log('hasAffiliate:', hasAffiliate, 'hasDashboard:', hasDashboard);

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('E2E error:', err);
    console.log('logs so far:', JSON.stringify(logs, null, 2));
    await browser.close();
    process.exit(2);
  }
})();
