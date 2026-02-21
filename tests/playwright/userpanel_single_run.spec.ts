import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outFile = path.join(__dirname, 'userpanel-responsive-aggregate.json');

const deviceMap: Array<{ name: string; device?: string; viewport?: { width: number; height: number } }> = [
  { name: 'iPhone_SE', device: 'iPhone SE' },
  { name: 'iPhone_XR', device: 'iPhone XR' },
  { name: 'iPhone_12_Pro', device: 'iPhone 12' },
  { name: 'iPhone_14_Pro_Max', device: 'iPhone 14 Pro Max' },
  { name: 'Pixel_7', device: 'Pixel 7' },
  { name: 'Galaxy_S8_plus', viewport: { width: 360, height: 740 } },
  { name: 'Galaxy_S20_Ultra', device: 'Galaxy S20' },
  { name: 'iPad_Mini', device: 'iPad Mini' },
  { name: 'iPad_Air', device: 'iPad Air' },
  { name: 'iPad_Pro', device: 'iPad Pro' },
  { name: 'Surface_Pro_7', viewport: { width: 1366, height: 768 } },
  { name: 'Surface_Duo', device: 'Surface Duo' },
  { name: 'Galaxy_Z_Fold_5', viewport: { width: 904, height: 2316 } },
  { name: 'Asus_Zenbook_Fold', viewport: { width: 1536, height: 1024 } },
  { name: 'Galaxy_A51_71', viewport: { width: 412, height: 915 } },
  { name: 'Nest_Hub', viewport: { width: 1024, height: 600 } },
  { name: 'Nest_Hub_Max', viewport: { width: 1280, height: 800 } },
];

test.setTimeout(0);
test('UserPanel full device sweep', async ({ browser, playwright }) => {
  const devices = (playwright as any).devices || {};
  const results: Record<string, any> = {};
  const base = process.env.DEV_URL || 'http://localhost:3000';

  for (const d of deviceMap) {
    try {
      const context = d.device ? await browser.newContext({ ...(devices[d.device] || {}) }) : await browser.newContext({ viewport: d.viewport });
      const page = await context.newPage();
      await page.goto(base);
      await page.waitForLoadState('networkidle');
      await page.locator('text=ENTER TERMINAL').first().click();
      await page.waitForSelector('text=Deposit', { timeout: 7000 }).catch(() => {});
      await page.waitForTimeout(300);

      const report = await page.evaluate(() => {
      const issues: string[] = [];
      try { if (document.documentElement.scrollWidth > window.innerWidth + 1) issues.push('HORIZONTAL_OVERFLOW'); } catch(e) {}
      const els = Array.from(document.querySelectorAll<HTMLElement>('body *'));
      const off = els.filter(el => { const r = el.getBoundingClientRect(); if (r.width === 0 && r.height === 0) return false; return (r.right < 0 || r.left > window.innerWidth || r.bottom < 0 || r.top > window.innerHeight); }).slice(0,5).map(e => e.tagName + (e.id?('#'+e.id):''));
      if (off.length) issues.push('OFFSCREEN:' + off.join(','));
      const small = els.filter(el => ['BUTTON','A','INPUT','SELECT','TEXTAREA'].includes(el.tagName)).filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.width < 40 || r.height < 40); }).slice(0,5).map(e => e.tagName + (e.id?('#'+e.id):''));
      if (small.length) issues.push('SMALL_TOUCH:' + small.join(','));
      const txt = els.filter(el => el.scrollWidth > el.clientWidth + 2).slice(0,6).map(e => e.tagName + (e.id?('#'+e.id):''));
      if (txt.length) issues.push('TEXT_OVERFLOW:' + txt.join(','));
      const fixed = els.filter(el => getComputedStyle(el).position === 'fixed').slice(0,6).map(el => el.tagName + (el.id?('#'+el.id):''));
      if (fixed.length) issues.push('FIXED:' + fixed.join(','));
      return { w: window.innerWidth, h: window.innerHeight, issues };
    });
      results[d.name] = report;
      await context.close();
    } catch (err: any) {
      results[d.name] = { error: String(err) };
    }
  }

  fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
});
