import { chromium } from 'playwright';

(async () => {
  const url = process.env.DEV_URL || 'http://localhost:3001/';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const logs = [];
  page.on('console', msg => {
    logs.push({ type: 'console', text: msg.text(), location: msg.location() });
    console.log('[browser console]', msg.type(), msg.text());
  });
  page.on('pageerror', err => {
    logs.push({ type: 'error', text: err.message, stack: err.stack });
    console.error('[page error]', err.message);
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'diagnose_screenshot.png', fullPage: true });
    const html = await page.content();
    console.log('Page loaded, HTML length:', html.length);
    const rootInner = await page.evaluate(() => {
      const el = document.getElementById('root');
      return el ? el.innerHTML : null;
    });
    console.log('root innerHTML length:', rootInner ? rootInner.length : 'null');
    const blockers = await page.evaluate(() => {
      const out = [];
      const ww = window.innerWidth, hh = window.innerHeight;
      const els = Array.from(document.querySelectorAll('body *'));
      for (const el of els) {
        try {
          const r = el.getBoundingClientRect();
          const cs = window.getComputedStyle(el);
          const covers = r.width >= ww * 0.95 && r.height >= hh * 0.95;
          const bg = cs.backgroundColor || cs.background || '';
          const opacity = parseFloat(cs.opacity || '1');
          const vis = cs.visibility !== 'hidden' && cs.display !== 'none' && opacity > 0.05;
          if (covers && vis) {
            out.push({ tag: el.tagName, id: el.id || null, className: el.className || null, background: bg, opacity, zIndex: cs.zIndex || null });
          }
        } catch (e) { /* ignore */ }
      }
      return out.slice(0,10);
    });
    console.log('Potential blocking/fullscreen elements:', JSON.stringify(blockers, null, 2));
  } catch (e) {
    console.error('Navigation error:', e);
  } finally {
    await browser.close();
  }
})();
