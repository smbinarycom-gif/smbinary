import React, { useEffect, useState } from 'react';
import type { SystemSettingsPanelProps } from '../systemSettingsPanels.types.ts';
import type { AdminThemeSettings, AdminThemeMode } from '../../../shared/types.ts';

const DEFAULT_DARK_THEME: AdminThemeSettings = {
  mode: 'DARK',
  primaryColor: '#fcd535',
  accentColor: '#0ecb81',
  backgroundColor: '#161a1e',
  sidebarBackground: '#1e2329',
  headerBackground: '#1e2329',
  surfaceBackground: '#111827',
  textColor: '#EAECEF',
};

const DEFAULT_LIGHT_THEME: AdminThemeSettings = {
  mode: 'LIGHT',
  primaryColor: '#0f172a',
  accentColor: '#2563eb',
  // Fully light workspace including shell elements.
  backgroundColor: '#f3f4f6',
  sidebarBackground: '#f9fafb',
  headerBackground: '#f9fafb',
  surfaceBackground: '#ffffff',
  textColor: '#020617',
};

const ThemeSettingsPanel: React.FC<SystemSettingsPanelProps> = ({ settings, onUpdate }) => {
  const [localTheme, setLocalTheme] = useState<AdminThemeSettings>(
    settings.adminTheme || DEFAULT_DARK_THEME,
  );

  useEffect(() => {
    setLocalTheme(settings.adminTheme || DEFAULT_DARK_THEME);
  }, [settings.adminTheme]);

  const applyTheme = (next: AdminThemeSettings) => {
    setLocalTheme(next);
    onUpdate({ ...settings, adminTheme: next });
  };

  const handleModeChange = (mode: AdminThemeMode) => {
    if (mode === 'DARK') {
      applyTheme({ ...DEFAULT_DARK_THEME, mode: 'DARK' });
    } else if (mode === 'LIGHT') {
      applyTheme({ ...DEFAULT_LIGHT_THEME, mode: 'LIGHT' });
    } else {
      applyTheme({ ...localTheme, mode: 'CUSTOM' });
    }
  };

  const handleColorChange = (field: keyof AdminThemeSettings, value: string) => {
    const next = { ...localTheme, [field]: value };
    applyTheme(next);
  };

  const modeButtonClass = (mode: AdminThemeMode) =>
	`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold border ${
      localTheme.mode === mode
        ? 'border-[#4f46e5] bg-[#111827] text-white shadow-md shadow-[#4f46e5]/40'
        : 'border-[#1f2937] bg-[#020617] text-[#9ca3af] hover:border-[#4f46e5] hover:text-white'
    }`;

  return (
    <div
      className="h-full flex flex-col rounded-2xl shadow-xl overflow-hidden border"
      style={{
        backgroundColor: localTheme.surfaceBackground,
        borderColor: localTheme.mode === 'LIGHT' ? '#e5e7eb' : '#111827',
        color: localTheme.mode === 'LIGHT' ? '#020617' : '#e5e7eb',
      }}
    >
      <div
        className="px-5 py-4 border-b flex items-center justify-between"
        style={{
          backgroundColor: localTheme.mode === 'LIGHT' ? '#f9fafb' : '#020617',
          borderColor: localTheme.mode === 'LIGHT' ? '#e5e7eb' : '#111827',
        }}
      >
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Appearance &amp; Theme</h3>
          <p className="text-[11px] mt-0.5 opacity-80">
            Switch between dark, light and custom modes for the admin terminal.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] opacity-80">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border"
            style={{
              borderColor: localTheme.mode === 'LIGHT' ? '#e5e7eb' : '#27272a',
              backgroundColor: localTheme.mode === 'LIGHT' ? '#ffffff' : '#020617',
            }}
          >
            <i className="fa-solid fa-circle-half-stroke text-[9px]" />
            Live preview
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-[0.18em]">
            Theme Mode
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => handleModeChange('DARK')} className={modeButtonClass('DARK')}>
              <i className="fa-solid fa-moon" />
              <span>Dark</span>
            </button>
            <button type="button" onClick={() => handleModeChange('LIGHT')} className={modeButtonClass('LIGHT')}>
              <i className="fa-solid fa-sun" />
              <span>Light</span>
            </button>
            <button type="button" onClick={() => handleModeChange('CUSTOM')} className={modeButtonClass('CUSTOM')}>
              <i className="fa-solid fa-palette" />
              <span>Custom</span>
            </button>
          </div>
          <p className="text-[10px] text-[#6b7280]">
            Changes are applied instantly to your admin layout. Custom mode lets you override the base colors.
          </p>
        </div>

        <div
          className="border rounded-2xl p-4 space-y-4"
          style={{
            borderColor: localTheme.mode === 'LIGHT' ? '#e5e7eb' : '#111827',
            backgroundColor: localTheme.mode === 'LIGHT' ? '#ffffff' : '#020617',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold">Base Colors</p>
              <p className="text-[11px] opacity-80">
                Tune the core palette used for the admin shell backgrounds and text.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
            <div className="space-y-2">
              <label className="flex items-center justify-between gap-3">
                <span className="flex-1">Background</span>
                <input
                  type="color"
                  value={localTheme.backgroundColor}
                  onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                  className="w-10 h-6 rounded border border-[#27272a] bg-transparent p-0"
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="flex-1">Sidebar</span>
                <input
                  type="color"
                  value={localTheme.sidebarBackground}
                  onChange={(e) => handleColorChange('sidebarBackground', e.target.value)}
                  className="w-10 h-6 rounded border border-[#27272a] bg-transparent p-0"
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="flex-1">Header</span>
                <input
                  type="color"
                  value={localTheme.headerBackground}
                  onChange={(e) => handleColorChange('headerBackground', e.target.value)}
                  className="w-10 h-6 rounded border border-[#27272a] bg-transparent p-0"
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between gap-3">
                <span className="flex-1">Surface</span>
                <input
                  type="color"
                  value={localTheme.surfaceBackground}
                  onChange={(e) => handleColorChange('surfaceBackground', e.target.value)}
                  className="w-10 h-6 rounded border border-[#27272a] bg-transparent p-0"
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="flex-1">Primary</span>
                <input
                  type="color"
                  value={localTheme.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="w-10 h-6 rounded border border-[#27272a] bg-transparent p-0"
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="flex-1">Accent</span>
                <input
                  type="color"
                  value={localTheme.accentColor}
                  onChange={(e) => handleColorChange('accentColor', e.target.value)}
                  className="w-10 h-6 rounded border border-[#27272a] bg-transparent p-0"
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="flex-1">Text</span>
                <input
                  type="color"
                  value={localTheme.textColor}
                  onChange={(e) => handleColorChange('textColor', e.target.value)}
                  className="w-10 h-6 rounded border border-[#27272a] bg-transparent p-0"
                />
              </label>
            </div>
          </div>
          <p className="text-[10px] opacity-70">
            Custom colors mainly affect the admin shell (sidebar, header and background). Inner widgets can be
            progressively migrated to this palette later.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px]">
            <span className="opacity-80">Need to go back to the original look?</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => applyTheme({ ...DEFAULT_DARK_THEME })}
				className="px-2.5 py-1 rounded-full border border-[#1f2937] bg-[#020617] text-[#e5e7eb] hover:border-[#4f46e5] hover:text-white"
              >
                Reset Dark Default
              </button>
              <button
                type="button"
                onClick={() => applyTheme({ ...DEFAULT_LIGHT_THEME })}
				className="px-2.5 py-1 rounded-full border border-[#e5e7eb] bg-white text-[#111827] hover:border-[#4f46e5]"
              >
                Reset Light Default
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettingsPanel;
