import { test, expect, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const shotsDir = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(shotsDir)) fs.mkdirSync(shotsDir, { recursive: true });

const viewports: Array<{ name: string; device?: string; viewport?: { width: number; height: number } }> = [
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

for (const v of viewports) {
  test(v.name + ' layout', async ({ browser }) => {
    const context = v.device ? await browser.newContext({ ...devices[v.device] as any }) : await browser.newContext({ viewport: v.viewport });
    const page = await context.newPage();
    const base = process.env.DEV_URL || 'http://localhost:3000';
    await page.goto(base);
    await page.waitForLoadState('networkidle');
    // short wait for dynamic UI
    await page.waitForTimeout(500);
    const file = path.join(shotsDir, `${v.name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    await context.close();
  });
}
