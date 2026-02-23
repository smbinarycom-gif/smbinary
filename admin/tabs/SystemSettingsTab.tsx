import React, { useMemo, useState } from 'react';
import { MarketSettings, AdminThemeSettings } from '../../shared/types.ts';
import { SYSTEM_SETTINGS_ITEMS, SystemSettingsSectionId } from './systemSettingsItems.ts';
import { SystemSettingsPanelProps } from './systemSettingsPanels.types.ts';
import GeneralSettingsPanel from './system-settings/GeneralSettingsPanel.tsx';
import BrandingSettingsPanel from './system-settings/BrandingSettingsPanel.tsx';
import MaintenanceSettingsPanel from './system-settings/MaintenanceSettingsPanel.tsx';
import PaymentSettingsPanel from './system-settings/PaymentSettingsPanel.tsx';
import ComplianceSettingsPanel from './system-settings/ComplianceSettingsPanel.tsx';
import SystemConfigurationPanel from './system-settings/SystemConfigurationPanel.tsx';
import ThemeSettingsPanel from './system-settings/ThemeSettingsPanel.tsx';
import NotificationSettingsPanel from './system-settings/NotificationSettingsPanel.tsx';

interface SystemSettingsTabProps {
  settings: MarketSettings;
  onUpdate: (settings: MarketSettings) => void;
  theme?: AdminThemeSettings;
}

const SystemSettingsTab: React.FC<SystemSettingsTabProps> = ({ settings, onUpdate, theme }) => {
  const [query, setQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<SystemSettingsSectionId>('GENERAL_SETTING');
  const [viewMode, setViewMode] = useState<'GRID' | 'DETAIL'>('GRID');

  const isLight = theme?.mode === 'LIGHT';

  const filteredItems = useMemo(() => {
    if (!query.trim()) return SYSTEM_SETTINGS_ITEMS;
    const q = query.toLowerCase();
    return SYSTEM_SETTINGS_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    );
  }, [query]);

  const PanelComponent = useMemo(() => {
    const map: Partial<Record<SystemSettingsSectionId, React.ComponentType<SystemSettingsPanelProps>>> = {
      GENERAL_SETTING: GeneralSettingsPanel,
      LOGO_FAVICON: BrandingSettingsPanel,
      MAINTENANCE_MODE: MaintenanceSettingsPanel,
      SYSTEM_CONFIGURATION: SystemConfigurationPanel,
      PAYMENT_GATEWAYS: PaymentSettingsPanel,
      GDPR_COOKIE: ComplianceSettingsPanel,
      APPEARANCE_THEME: ThemeSettingsPanel,
      NOTIFICATION_SETTING: NotificationSettingsPanel,
    };
    return map[selectedSection] ?? GeneralSettingsPanel;
  }, [selectedSection]);

  return (
    <div className="space-y-6">
      {viewMode === 'GRID' ? (
        <div className="min-h-[420px]">
          {/* Cards Grid: mobile=1, tablet=2, desktop=3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
            {filteredItems.map((item) => {
              const isMaintenance = item.id === 'MAINTENANCE_MODE';
              const isPayment = item.id === 'PAYMENT_GATEWAYS';

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedSection(item.id);
                    setViewMode('DETAIL');
                  }}
                  className={`group relative setting-card-rgb overflow-hidden rounded-2xl px-4 py-4 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]/70 ${
                    isLight
                      ? selectedSection === item.id
                        ? 'bg-white border border-[#4f46e5] shadow-[0_0_0_1px_rgba(79,70,229,0.35)]'
                        : 'bg-white border border-[#e5e7eb] hover:border-[#4f46e5] hover:shadow-[0_15px_30px_rgba(15,23,42,0.08)]'
                      : selectedSection === item.id
                        ? 'bg-[#111827] border border-[#4f46e5] shadow-[0_0_24px_rgba(79,70,229,0.45)]'
                        : 'bg-[#111827] border border-[#1f2937] hover:border-[#4f46e5] hover:shadow-[0_0_24px_rgba(79,70,229,0.35)]'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3 relative z-10">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${item.accentClass} text-white shadow-lg shadow-black/40`}>
                      <i className={`${item.iconClass} text-base`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-sm font-semibold truncate ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                          {item.title}
                        </h3>
                        {isMaintenance && (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold border ${
                              settings.maintenanceMode
                                ? 'border-[#f97316]/40 text-[#f97316] bg-[#111827]'
                                : 'border-[#10b981]/40 text-[#10b981] bg-[#022c22]'
                            }`}
                          >
                            <span
                              className={`mr-1 h-1.5 w-1.5 rounded-full ${
                                settings.maintenanceMode ? 'bg-[#f97316]' : 'bg-[#10b981]'
                              }`}
                            />
                            {settings.maintenanceMode ? 'Active' : 'Live'}
                          </span>
                        )}
                        {item.id === 'CUSTOM_CSS' && (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold border border-[#4b5563] text-[#9ca3af]">
                            Advanced
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[11px] leading-snug line-clamp-2 transition-colors ${
                          isLight
                            ? 'text-[#6b7280] group-hover:text-[#111827]'
                            : 'text-[#9ca3af] group-hover:text-[#e5e7eb]'
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Context strip */}
                  <div className="mt-3 flex items-center text-[10px] text-[#6b7280] relative z-10">
                    {!isLight && (
                      <div className="flex items-center gap-2">
                        {isPayment && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#022c22] px-2 py-0.5 text-[#22c55e] border border-[#064e3b]">
                            <i className="fa-brands fa-bitcoin text-[9px]" />
                            <span className="font-mono">
                              ID:
                              {settings.adminBinancePayId ? ` ${settings.adminBinancePayId}` : ' Not set'}
                            </span>
                          </span>
                        )}
                        {item.id === 'GDPR_COOKIE' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#020617] px-2 py-0.5 text-[#eab308] border border-[#4b5563]">
                            <i className="fa-solid fa-shield-halved text-[9px]" />
                            Compliance
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="min-h-[420px] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMode('GRID')}
			  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] border ${
                isLight
                  ? 'bg-white border-[#e5e7eb] text-[#111827] hover:border-[#4f46e5] hover:bg-[#eef2ff]'
                  : 'bg-[#020617] border-[#1f2937] text-[#e5e7eb] hover:border-[#4f46e5] hover:text-white hover:bg-[#111827]'
              }`}
            >
              <i className="fa-solid fa-arrow-left text-[10px]" />
              <span>Back to System Settings</span>
            </button>
          </div>

          <div className="h-full">
            <PanelComponent sectionId={selectedSection} settings={settings} onUpdate={onUpdate} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettingsTab;
