import { chromium } from 'playwright';

(async function(){
  const url = process.env.URL || 'http://localhost:3001/st';
  console.log('Debugging', url);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ timeout: 60000 });

  const logs = [];
  page.on('console', msg => logs.push({ type: 'console', text: msg.text() }));
  page.on('pageerror', err => logs.push({ type: 'error', text: err.toString() }));
  page.on('requestfailed', req => logs.push({ type: 'requestfailed', url: req.url(), failure: req.failure() && req.failure().errorText }));

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    const hasLogin = await page.locator('text=Admin Login (dev)').count();
    const hasHeader = await page.locator('h1').allTextContents();
    const bodyHtml = await page.content();

    console.log('console logs:', JSON.stringify(logs, null, 2));
    console.log('hasLoginCount=', hasLogin);
    console.log('h1 texts=', hasHeader.slice(0,5));
    // print a short snippet of body
    console.log('body snippet:', bodyHtml.slice(0,2000));

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Debug error:', err);
    console.log('logs so far:', JSON.stringify(logs, null, 2));
    await browser.close();
    process.exit(2);
  }
})();
