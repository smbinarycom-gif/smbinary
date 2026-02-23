import React from 'react';
import type { SystemSettingsPanelProps } from '../systemSettingsPanels.types.ts';

const MaintenanceSettingsPanel: React.FC<SystemSettingsPanelProps> = ({ settings, onUpdate }) => {
  const toggle = (key: 'maintenanceMode' | 'isKillSwitchActive') => {
    onUpdate({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <div className="h-full flex flex-col rounded-2xl bg-[#020617] border border-[#111827] shadow-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#111827] flex items-center justify-between bg-gradient-to-r from-[#020617] via-[#020617] to-[#020617]">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Maintenance & Safety</h3>
          <p className="text-[11px] text-[#6b7280] mt-0.5">Safely pause trading and broadcast system messages.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5">
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#020617] border border-[#1f2937]">
          <div>
            <p className="text-xs font-semibold text-white flex items-center">
              <i className="fa-solid fa-screwdriver-wrench text-[#f97316] mr-2" />
              Maintenance mode
            </p>
            <p className="text-[11px] text-[#6b7280] mt-1">
              When enabled, users see a maintenance banner and trading can be limited.
            </p>
          </div>
          <button
            onClick={() => toggle('maintenanceMode')}
            className={`w-12 h-6 rounded-full relative transition-colors ${
              settings.maintenanceMode ? 'bg-[#f97316]' : 'bg-[#374151]'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                settings.maintenanceMode ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-[#020617] border border-[#1f2937]">
          <div>
            <p className="text-xs font-semibold text-white flex items-center">
              <i className="fa-solid fa-ban text-[#f97316] mr-2" />
              Trading kill switch
            </p>
            <p className="text-[11px] text-[#6b7280] mt-1">
              Blocks new trades instantly while charts and data stay online.
            </p>
          </div>
          <button
            onClick={() => toggle('isKillSwitchActive')}
            className={`w-12 h-6 rounded-full relative transition-colors ${
              settings.isKillSwitchActive ? 'bg-[#ef4444]' : 'bg-[#374151]'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                settings.isKillSwitchActive ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#9ca3af] mb-2">Global announcement</label>
          <textarea
            rows={3}
            value={settings.globalAnnouncement}
            onChange={(e) => onUpdate({ ...settings, globalAnnouncement: e.target.value })}
            className="w-full bg-[#020617] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#4b5563] focus:outline-none focus:border-[#6366f1] resize-none custom-scrollbar"
            placeholder="System upgrade scheduled at 02:00 UTC. Trading will be paused for 15 minutes."
          />
          <p className="text-[10px] text-[#6b7280] mt-1">This text can be surfaced across user terminals as a top banner.</p>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-[#111827] flex items-center justify-between bg-[#020617]">
        <p className="text-[10px] text-[#6b7280]">
          Changes apply immediately to this session&apos;s engine config.
        </p>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#022c22] px-2 py-0.5 text-[10px] text-[#22c55e] border border-[#064e3b]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            Live safety
          </span>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceSettingsPanel;
