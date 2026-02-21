import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outFile = path.join(__dirname, 'responsive-check-results.json');

const viewports = [
  { name: 'iPhone_SE', device: 'iPhone SE' },
  { name: 'iPhone_12', device: 'iPhone 12' },
  { name: 'Pixel_5', device: 'Pixel 5' },
  { name: 'Galaxy_S20', device: 'Galaxy S20' },
  { name: 'iPad_gen7', device: 'iPad (gen 7)' },
  { name: 'Desktop_1366x768', viewport: { width: 1366, height: 768 } },
  { name: 'SmallPhone_320x568', viewport: { width: 320, height: 568 } },
  { name: 'LargePhone_412x915', viewport: { width: 412, height: 915 } },
  { name: 'Tablet_768x1024', viewport: { width: 768, height: 1024 } },
  { name: 'Desktop_1440x900', viewport: { width: 1440, height: 900 } },
  { name: 'Desktop_1920x1080', viewport: { width: 1920, height: 1080 } },
];

const results: Record<string, any> = {};

for (const v of viewports) {
  test(v.name + ' checks', async ({ browser, playwright }) => {
    const devices = (playwright as any).devices || {};
    const context = v.device ? await browser.newContext({ ...(devices[v.device] || {} ) }) : await browser.newContext({ viewport: v.viewport });
    const page = await context.newPage();
    const base = process.env.DEV_URL || 'http://localhost:3000';
    await page.goto(base);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);

    // Run a set of layout checks
    const report = await page.evaluate(() => {
      const issues: string[] = [];
      const w = window.innerWidth;
      const h = window.innerHeight;

      // 1. Horizontal overflow check
      try {
        if (document.documentElement.scrollWidth > window.innerWidth + 1) {
          issues.push('HORIZONTAL_OVERFLOW: document width > viewport width');
        }
      } catch (e) {}

      // 2. Offscreen elements (negative or > viewport)
      const els = Array.from(document.querySelectorAll<HTMLElement>('body *'));
      const offscreen = els.filter(el => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return false;
        return (r.right < 0 || r.left > window.innerWidth || r.bottom < 0 || r.top > window.innerHeight);
      }).slice(0,5).map(e => e.tagName + (e.id ? '#'+e.id : '') + (e.className ? '.'+e.className.split(' ').slice(0,2).join('.') : ''));
      if (offscreen.length) issues.push('OFFSCREEN_ELEMENTS: ' + offscreen.join(', '));

      // 3. Touch target size (buttons/inputs) smaller than 40px
      const smallTargets = els.filter(el => ['BUTTON','A','INPUT','SELECT','TEXTAREA'].includes(el.tagName)).filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.width < 40 || r.height < 40);
      }).slice(0,5).map(e => e.tagName + (e.id ? '#'+e.id : '') + (e.className ? '.'+e.className.split(' ').slice(0,2).join('.') : ''));
      if (smallTargets.length) issues.push('SMALL_TOUCH_TARGETS: ' + smallTargets.join(', '));

      // 4. Text overflow (elements whose scrollWidth > clientWidth)
      const textOverflow = els.filter(el => el.scrollWidth > el.clientWidth + 2).slice(0,6).map(e => e.tagName + (e.id ? '#'+e.id : '') + (e.className ? '.'+e.className.split(' ').slice(0,2).join('.') : ''));
      if (textOverflow.length) issues.push('TEXT_OVERFLOW: ' + textOverflow.join(', '));

      // 5. Large fixed header/footer that may overlap content
      const fixedEls = els.filter(el => getComputedStyle(el).position === 'fixed');
      const fixedInfo = fixedEls.map(el => {
        const r = el.getBoundingClientRect();
        return `${el.tagName}${el.id?('#'+el.id):''}(${Math.round(r.left)}x${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)})`;
      }).slice(0,5);
      if (fixedInfo.length) issues.push('FIXED_ELEMENTS: ' + fixedInfo.join(', '));

      return { width: window.innerWidth, height: window.innerHeight, issues };
    });

    results[v.name] = report;
    await context.close();
    fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
  });
}
