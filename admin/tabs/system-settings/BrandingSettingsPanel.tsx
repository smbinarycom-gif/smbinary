import React, { useMemo, useRef, useState } from 'react';
import type { SystemSettingsPanelProps } from '../systemSettingsPanels.types.ts';
import type {
  BrandingFavicons,
  BrandingLogos,
  BrandingSettings,
  BrandingSnapshot,
} from '../../../shared/types.ts';

type LogoKey = keyof BrandingLogos;
type FaviconKey = keyof BrandingFavicons;

interface UploadTargetMeta {
  label: string;
  recommended?: string;
}

const LOGO_META: Record<LogoKey, UploadTargetMeta> = {
  MAIN_WEBSITE: { label: 'Main Website Logo', recommended: '256×72 px' },
  ADMIN_PANEL: { label: 'Admin Panel Logo', recommended: '200×40 px' },
  MOBILE: { label: 'Mobile / Compact Logo', recommended: '160×40 px' },
  DARK_MODE: { label: 'Dark Mode Logo', recommended: 'For dark backgrounds' },
  LIGHT_MODE: { label: 'Light Mode Logo', recommended: 'For light backgrounds' },
  EMAIL: { label: 'Email Template Logo', recommended: '320×80 px' },
  FOOTER: { label: 'Footer Logo', recommended: '220×60 px' },
};

const FAVICON_META: Record<FaviconKey, UploadTargetMeta> = {
  favicon16: { label: 'Favicon 16×16', recommended: 'ICO / PNG 16×16' },
  favicon32: { label: 'Favicon 32×32', recommended: 'ICO / PNG 32×32' },
  favicon48: { label: 'Favicon 48×48', recommended: 'ICO / PNG 48×48' },
  appleTouchIcon: { label: 'Apple Touch Icon', recommended: 'PNG 180×180' },
  androidChrome192: { label: 'Android / PWA 192×192', recommended: 'PNG 192×192' },
  pwa512: { label: 'PWA / Splash 512×512', recommended: 'PNG 512×512' },
  windowsTile: { label: 'Windows Tile Icon', recommended: 'PNG 270×270' },
};

const ACCEPTED_TYPES = ['image/png', 'image/svg+xml', 'image/webp', 'image/x-icon'];
const MAX_FILE_SIZE_MB = 2;

const getInitialBranding = (branding?: BrandingSettings): BrandingSettings => {
  if (branding) return branding;
  return {
    logos: {},
    favicons: {},
    sizing: {
      desktopLogoHeight: 32,
      mobileLogoHeight: 24,
      sidebarLogoScale: 1,
      retinaScale: 2,
    },
    primaryBrandColor: '#fcd535',
    brandingHistory: [],
  };
};

const BrandingSettingsPanel: React.FC<SystemSettingsPanelProps> = ({ settings, onUpdate }) => {
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingLogoKey, setPendingLogoKey] = useState<LogoKey | null>(null);
  const [pendingFaviconKey, setPendingFaviconKey] = useState<FaviconKey | null>(null);

  const branding = useMemo(() => getInitialBranding(settings.branding), [settings.branding]);

  const updateBranding = (next: Partial<BrandingSettings>) => {
    const merged: BrandingSettings = {
      ...branding,
      ...next,
      logos: { ...branding.logos, ...(next.logos || {}) },
      favicons: { ...branding.favicons, ...(next.favicons || {}) },
      sizing: { ...branding.sizing, ...(next.sizing || {}) },
      brandingHistory:
        next.brandingHistory !== undefined
          ? next.brandingHistory
          : branding.brandingHistory || [],
    };
    onUpdate({ ...settings, branding: merged });
  };

  const triggerUpload = (logoKey?: LogoKey, faviconKey?: FaviconKey) => {
    setPendingLogoKey(logoKey ?? null);
    setPendingFaviconKey(faviconKey ?? null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || (!pendingLogoKey && !pendingFaviconKey)) {
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      // Invalid type; in a full app show a toast
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const src = typeof reader.result === 'string' ? reader.result : '';
      if (!src) return;

      if (pendingLogoKey) {
        updateBranding({ logos: { [pendingLogoKey]: src } as BrandingLogos });
      } else if (pendingFaviconKey) {
        updateBranding({ favicons: { [pendingFaviconKey]: src } as BrandingFavicons });
      }

      setPendingLogoKey(null);
      setPendingFaviconKey(null);
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = (key: LogoKey) => {
    const next: BrandingLogos = { ...branding.logos };
    delete next[key];
    updateBranding({ logos: next });
  };

  const handleResetFavicon = (key: FaviconKey) => {
    const next: BrandingFavicons = { ...branding.favicons };
    delete next[key];
    updateBranding({ favicons: next });
  };

  const handleSaveSnapshot = () => {
    const snapshot: BrandingSnapshot = {
      id: `snapshot-${Date.now()}`,
      label: `Snapshot • ${new Date().toLocaleString()}`,
      createdAt: Date.now(),
      logos: { ...branding.logos },
      favicons: { ...branding.favicons },
      sizing: { ...branding.sizing },
      primaryBrandColor: branding.primaryBrandColor,
    };

    const history = branding.brandingHistory || [];
    updateBranding({ brandingHistory: [...history, snapshot] });
  };

  const handleRestoreSnapshot = (id: string) => {
    const snapshot = (branding.brandingHistory || []).find((s) => s.id === id);
    if (!snapshot) return;

    updateBranding({
      logos: snapshot.logos,
      favicons: snapshot.favicons,
      sizing: snapshot.sizing,
      primaryBrandColor: snapshot.primaryBrandColor,
    });
  };

  const handleSaveBranding = () => {
    setIsSaving(true);
    // Visual feedback only; settings are already persisted via onUpdate
    setTimeout(() => setIsSaving(false), 600);
  };

  return (
    <div className="flex h-full flex-col bg-[#020617]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#111827] px-5 py-3">
        <div className="space-y-0.5">
          <h3 className="text-[13px] font-semibold text-white">Logo & Favicon branding</h3>
          <p className="text-[11px] text-[#6b7280]">
            Manage all brand assets, previews and sizing from a single control centre.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveSnapshot}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#1f2937] bg-[#020617] px-3 py-1.5 text-[11px] font-medium text-[#e5e7eb] hover:border-[#4f46e5] hover:text-white"
        >
          <i className="fa-solid fa-clock-rotate-left text-[10px]" />
          Save version
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-6 items-start">
          {/* LEFT COLUMN: assets (logos + icons) */}
          <div className="space-y-6">
            {/* Multi-logo management */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[12px] font-semibold text-white">Multi‑logo setup</h4>
                  <p className="text-[10px] text-[#6b7280]">
                    Configure separate logos for website, admin panel, mobile and theme variants.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {(Object.keys(LOGO_META) as LogoKey[]).map((key) => {
                  const meta = LOGO_META[key];
                  const src = branding.logos[key];
                  return (
                    <div
                      key={key}
                      className="rounded-2xl border border-[#1f2937] bg-[#020617] px-4 py-3 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-semibold text-[#e5e7eb]">{meta.label}</p>
                          {meta.recommended && (
                            <p className="text-[10px] text-[#6b7280]">Recommended: {meta.recommended}</p>
                          )}
                        </div>
                        {src && (
                          <button
                            type="button"
                            onClick={() => handleResetLogo(key)}
                            className="text-[10px] text-[#f97316] hover:text-[#fb923c]"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => triggerUpload(key, undefined)}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-dashed border-[#374151] bg-[#020617] px-3 py-2 text-left hover:border-[#6366f1] hover:bg-[#030712] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-lg bg-[#020617] border border-[#1f2937] flex items-center justify-center text-[#4b5563]">
                            {src ? (
                              <img src={src} alt={meta.label} className="max-h-8 max-w-[2.25rem] object-contain" />
                            ) : (
                              <i className="fa-solid fa-image text-xs" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-semibold text-[#e5e7eb]">
                              {src ? 'Replace logo' : 'Upload logo'}
                            </span>
                            <span className="text-[10px] text-[#6b7280]">
                              PNG, SVG or WebP • up to {MAX_FILE_SIZE_MB}MB
                            </span>
                          </div>
                        </div>
                        <i className="fa-solid fa-upload text-[10px] text-[#6b7280] group-hover:text-[#fcd535]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Favicon & app icons */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[12px] font-semibold text-white">Favicon & App Icon Pack</h4>
                  <p className="text-[10px] text-[#6b7280]">
                    Upload icons for browser tabs, Apple devices, Android Chrome and PWA splash screens.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {(Object.keys(FAVICON_META) as FaviconKey[]).map((key) => {
                  const meta = FAVICON_META[key];
                  const src = branding.favicons[key];
                  return (
                    <div
                      key={key}
                      className="rounded-2xl border border-[#1f2937] bg-[#020617] px-4 py-3 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-semibold text-[#e5e7eb]">{meta.label}</p>
                          {meta.recommended && (
                            <p className="text-[10px] text-[#6b7280]">{meta.recommended}</p>
                          )}
                        </div>
                        {src && (
                          <button
                            type="button"
                            onClick={() => handleResetFavicon(key)}
                            className="text-[10px] text-[#f97316] hover:text-[#fb923c]"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => triggerUpload(undefined, key)}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-dashed border-[#374151] bg-[#020617] px-3 py-2 text-left hover:border-[#6366f1] hover:bg-[#030712] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-2xl bg-[#020617] border border-[#1f2937] flex items-center justify-center text-[#4b5563]">
                            {src ? (
                              <img src={src} alt={meta.label} className="h-7 w-7 object-contain rounded" />
                            ) : (
                              <i className="fa-solid fa-star text-xs" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-semibold text-[#e5e7eb]">
                              {src ? 'Replace icon' : 'Upload icon'}
                            </span>
                            <span className="text-[10px] text-[#6b7280]">
                              Optimised delivery, lazy‑loaded in previews
                            </span>
                          </div>
                        </div>
                        <i className="fa-solid fa-upload text-[10px] text-[#6b7280] group-hover:text-[#fcd535]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: previews + sizing/colour/history */}
          <div className="space-y-6">
            {/* Live preview */}
            <section className="space-y-3">
              <h4 className="text-[12px] font-semibold text-white">Live preview</h4>
              <p className="text-[10px] text-[#6b7280]">
                See how your branding looks in different contexts before saving.
              </p>

              <div className="space-y-3">
                {/* Browser tab preview */}
                <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-3 space-y-2">
                  <p className="text-[10px] font-semibold text-[#9ca3af] mb-1">Browser tab</p>
                  <div className="flex items-center gap-2 rounded-xl bg-[#030712] border border-[#111827] px-3 py-2">
                    <div className="h-4 w-4 rounded-lg bg-[#020617] border border-[#1f2937] flex items-center justify-center overflow-hidden">
                      {branding.favicons.favicon16 ? (
                        <img
                          src={branding.favicons.favicon16}
                          alt="Favicon 16×16"
                          className="h-4 w-4 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <i className="fa-solid fa-star text-[9px] text-[#4b5563]" />
                      )}
                    </div>
                    <span className="text-[11px] text-[#e5e7eb] truncate">SMBinary.COM — Admin Terminal</span>
                  </div>
                </div>

                {/* Admin sidebar preview */}
                <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-3 space-y-2">
                  <p className="text-[10px] font-semibold text-[#9ca3af] mb-1">Admin sidebar</p>
                  <div className="flex items-center gap-3 rounded-xl bg-[#020617] border border-[#111827] px-3 py-2">
                    <div className="h-9 w-9 rounded-xl bg-[#111827] flex items-center justify-center overflow-hidden">
                      {branding.logos.ADMIN_PANEL ? (
                        <img
                          src={branding.logos.ADMIN_PANEL}
                          alt="Admin logo"
                          className="max-h-7 max-w-[2.5rem] object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs font-black text-[#fcd535]">GX</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-white">SMBinary.COM</span>
                      <span className="text-[10px] text-[#6b7280]">Admin Terminal</span>
                    </div>
                  </div>
                </div>

                {/* Website header preview */}
                <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-3 space-y-2">
                  <p className="text-[10px] font-semibold text-[#9ca3af] mb-1">Website header (desktop)</p>
                  <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[#020617] via-[#020617] to-[#030712] border border-[#111827] px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-32 flex items-center overflow-hidden">
                        {branding.logos.MAIN_WEBSITE ? (
                          <img
                            src={branding.logos.MAIN_WEBSITE}
                            alt="Main website logo"
                            className="max-h-8 max-w-[8rem] object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-sm font-black text-white tracking-tight">SMBinary.COM</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-[#9ca3af]">
                      <span>Trading</span>
                      <span>Markets</span>
                      <span>Pricing</span>
                    </div>
                  </div>
                </div>

                {/* Mobile header preview */}
                <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-3 space-y-2">
                  <p className="text-[10px] font-semibold text-[#9ca3af] mb-1">Mobile header</p>
                  <div className="flex items-center justify-between rounded-xl bg-[#020617] border border-[#111827] px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-[#111827] flex items-center justify-center overflow-hidden">
                        {branding.logos.MOBILE ? (
                          <img
                            src={branding.logos.MOBILE}
                            alt="Mobile logo"
                            className="max-h-6 max-w-[1.75rem] object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-[11px] font-black text-[#fcd535]">GX</span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-white">SMBinary.COM</span>
                    </div>
                    <i className="fa-solid fa-bars text-xs text-[#6b7280]" />
                  </div>
                </div>
              </div>
            </section>

            {/* Responsive sizing, brand colour & history */}
            <section className="space-y-4">
              <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 space-y-3">
                <h4 className="text-[12px] font-semibold text-white">Responsive logo sizing</h4>
                <p className="text-[10px] text-[#6b7280]">
                  Control how the logo scales across desktop, mobile and sidebar layouts.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold text-[#e5e7eb]">Desktop header height</span>
                      <span className="text-[10px] text-[#6b7280]">Applied in website header preview.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={20}
                        max={80}
                        value={branding.sizing.desktopLogoHeight}
                        onChange={(e) =>
                          updateBranding({ sizing: { desktopLogoHeight: Number(e.target.value) || 0 } as any })
                        }
                        className="w-16 rounded-lg bg-[#020617] border border-[#1f2937] px-2 py-1 text-[11px] text-[#e5e7eb] focus:outline-none focus:border-[#4f46e5]"
                      />
                      <span className="text-[10px] text-[#6b7280]">px</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold text-[#e5e7eb]">Mobile header size</span>
                      <span className="text-[10px] text-[#6b7280]">Compact logo for phones.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={16}
                        max={56}
                        value={branding.sizing.mobileLogoHeight}
                        onChange={(e) =>
                          updateBranding({ sizing: { mobileLogoHeight: Number(e.target.value) || 0 } as any })
                        }
                        className="w-16 rounded-lg bg-[#020617] border border-[#1f2937] px-2 py-1 text-[11px] text-[#e5e7eb] focus:outline-none focus:border-[#4f46e5]"
                      />
                      <span className="text-[10px] text-[#6b7280]">px</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold text-[#e5e7eb]">Sidebar logo scale</span>
                      <span className="text-[10px] text-[#6b7280]">Fine‑tune admin sidebar logo size.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min={0.5}
                        max={2}
                        value={branding.sizing.sidebarLogoScale}
                        onChange={(e) =>
                          updateBranding({ sizing: { sidebarLogoScale: Number(e.target.value) || 1 } as any })
                        }
                        className="w-16 rounded-lg bg-[#020617] border border-[#1f2937] px-2 py-1 text-[11px] text-[#e5e7eb] focus:outline-none focus:border-[#4f46e5]"
                      />
                      <span className="text-[10px] text-[#6b7280]">×</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold text-[#e5e7eb]">Retina scaling</span>
                      <span className="text-[10px] text-[#6b7280]">Controls how crisp logos look on 2× displays.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={branding.sizing.retinaScale}
                        onChange={(e) =>
                          updateBranding({ sizing: { retinaScale: Number(e.target.value) || 1 } as any })
                        }
                        className="rounded-lg bg-[#020617] border border-[#1f2937] px-2 py-1 text-[11px] text-[#e5e7eb] focus:outline-none focus:border-[#4f46e5]"
                      >
                        <option value={1}>1×</option>
                        <option value={1.5}>1.5×</option>
                        <option value={2}>2×</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 space-y-3">
                  <h4 className="text-[12px] font-semibold text-white">Primary brand colour</h4>
                  <p className="text-[10px] text-[#6b7280]">
                    Used as the base accent for suggestions, CTAs and previews.
                  </p>

                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg border border-[#4b5563]"
                      style={{ background: branding.primaryBrandColor }}
                    />
                    <input
                      type="color"
                      value={branding.primaryBrandColor}
                      onChange={(e) => updateBranding({ primaryBrandColor: e.target.value })}
                      className="h-8 w-10 rounded bg-transparent border border-[#1f2937] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.primaryBrandColor}
                      onChange={(e) => updateBranding({ primaryBrandColor: e.target.value })}
                      className="w-20 bg-[#020617] border border-[#1f2937] rounded-lg px-2 py-1.5 text-[11px] text-white font-mono focus:outline-none focus:border-[#6366f1]"
                    />
                  </div>
                </div>

                {branding.brandingHistory && branding.brandingHistory.length > 0 && (
                  <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[12px] font-semibold text-white">Version history</h4>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                      {branding.brandingHistory
                        .slice()
                        .reverse()
                        .map((snapshot) => (
                          <button
                            key={snapshot.id}
                            type="button"
                            onClick={() => handleRestoreSnapshot(snapshot.id)}
                            className="w-full flex items-center justify-between rounded-lg border border-[#111827] bg-[#020617] px-3 py-1.5 text-left text-[10px] text-[#9ca3af] hover:border-[#4f46e5] hover:text-white"
                          >
                            <span className="truncate">{snapshot.label}</span>
                            <span className="ml-2 text-[#6b7280]">Restore</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#111827] flex items-center justify-end bg-[#020617]">
        <button
          type="button"
          onClick={handleSaveBranding}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-60 text-[11px] font-semibold text-white px-3 py-1.5 shadow-sm transition-colors"
        >
          <i className="fa-solid fa-floppy-disk text-[10px]" />
          {isSaving ? 'Saving…' : 'Save branding'}
        </button>
      </div>

      {/* Hidden file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default BrandingSettingsPanel;
