// Lightweight device detection helpers
// Non-blocking: quick synchronous tags applied immediately (width/touch),
// deeper tags applied later via idle callback.

export type DeviceTag = 'mobile'|'tablet'|'desktop'|'foldable'|'low-end'|'touch'|'dual-screen'|'landscape'|'portrait'|'high-dpr';

export function detectDeviceTagsQuick(): DeviceTag[] {
  const tags: DeviceTag[] = [];
  if (typeof window === 'undefined') return tags;
  const w = Math.max(window.innerWidth || 0, window.screen?.width || 0);
  const h = Math.max(window.innerHeight || 0, window.screen?.height || 0);
  const dpr = window.devicePixelRatio || 1;

  // coarse buckets — very cheap to compute
  if (w <= 420) tags.push('mobile');
  else if (w <= 900) tags.push('tablet');
  else tags.push('desktop');

  // orientation
  tags.push((w > h) ? 'landscape' : 'portrait');

  // touch
  if ('ontouchstart' in window || (navigator as any).maxTouchPoints > 0) tags.push('touch');

  if (dpr >= 2) tags.push('high-dpr');

  return Array.from(new Set(tags));
}

export function detectDeviceTagsFull(): DeviceTag[] {
  const tags: DeviceTag[] = detectDeviceTagsQuick();
  if (typeof window === 'undefined') return tags;
  const ua = navigator.userAgent || '';
  const cores = (navigator as any).hardwareConcurrency || 1;
  const mem = (navigator as any).deviceMemory || 0;

  // low-end heuristics
  if (cores <= 2 || (mem && mem <= 2)) tags.push('low-end');

  // UA hints for foldables
  if (/fold|foldable|surface duo|pixel fold|galaxy fold|zenbook fold/i.test(ua)) tags.push('foldable');

  // Dual-screen API
  if ('getWindowSegments' in (window as any)) tags.push('dual-screen');

  try {
    if (window.matchMedia && (window.matchMedia('(spanning: single-fold-vertical)').matches || window.matchMedia('(spanning: single-fold-horizontal)').matches)) {
      tags.push('foldable');
    }
  } catch (e) {
    // ignore
  }

  return Array.from(new Set(tags));
}

export function applyDeviceTagsToDOM(tags: DeviceTag[]) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  tags.forEach(t => root.classList.add(`device-${t}`));
  root.setAttribute('data-device', tags.join(' '));
  try { localStorage.setItem('lastDeviceTags', JSON.stringify(tags)); } catch (e) { /* ignore */ }
}

export function runDeviceDetection() {
  // quick synchronous tags (fast) to ensure immediate layout adjustments
  try {
    const quick = detectDeviceTagsQuick();
    applyDeviceTagsToDOM(quick);
  } catch (e) { /* ignore */ }

  // deeper detection deferred to idle callback
  const runFull = () => {
    try {
      const full = detectDeviceTagsFull();
      applyDeviceTagsToDOM(full);
    } catch (e) { /* ignore */ }
  };

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(runFull, { timeout: 300 });
  } else {
    setTimeout(runFull, 150);
  }
}

export default runDeviceDetection;
