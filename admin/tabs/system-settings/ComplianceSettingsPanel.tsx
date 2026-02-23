import React from 'react';
import type { SystemSettingsPanelProps } from '../systemSettingsPanels.types.ts';

const ComplianceSettingsPanel: React.FC<SystemSettingsPanelProps> = () => {
  return (
    <div className="h-full flex flex-col rounded-2xl bg-[#020617] border border-[#111827] shadow-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#111827] flex items-center justify-between bg-gradient-to-r from-[#020617] via-[#020617] to-[#020617]">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">GDPR & Cookies</h3>
          <p className="text-[11px] text-[#6b7280] mt-0.5">Prepare your cookie banner and consent preferences.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4">
        <div className="flex items-start gap-3">
          <input type="checkbox" defaultChecked className="mt-0.5 h-3.5 w-3.5 rounded border-[#4b5563] bg-[#020617] accent-[#22c55e]" />
          <div>
            <p className="text-xs font-semibold text-white">Enable cookie banner</p>
            <p className="text-[11px] text-[#6b7280] mt-0.5">Show a GDPR‑friendly banner on first visit.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <input type="checkbox" defaultChecked className="mt-0.5 h-3.5 w-3.5 rounded border-[#4b5563] bg-[#020617] accent-[#22c55e]" />
          <div>
            <p className="text-xs font-semibold text-white">Allow analytics cookies</p>
            <p className="text-[11px] text-[#6b7280] mt-0.5">Users can opt‑in to performance tracking.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <input type="checkbox" className="mt-0.5 h-3.5 w-3.5 rounded border-[#4b5563] bg-[#020617] accent-[#22c55e]" />
          <div>
            <p className="text-xs font-semibold text-white">Marketing cookies</p>
            <p className="text-[11px] text-[#6b7280] mt-0.5">Retargeting and promotional tracking (optional).</p>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#9ca3af] mb-1">Banner headline</label>
          <input
            defaultValue="We use cookies to improve your experience."
            className="w-full bg-[#020617] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#4b5563] focus:outline-none focus:border-[#6366f1]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#9ca3af] mb-1">Banner body</label>
          <textarea
            rows={3}
            defaultValue="By clicking Accept, you agree to our use of cookies for analytics and personalization. You can change your preferences at any time."
            className="w-full bg-[#020617] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#4b5563] focus:outline-none focus:border-[#6366f1] resize-none custom-scrollbar"
          />
        </div>
      </div>

      <div className="px-5 py-3 border-t border-[#111827] flex items-center justify-end bg-[#020617]">
        <button className="inline-flex items-center gap-2 rounded-lg bg-[#4b5563] hover:bg-[#374151] text-[11px] font-semibold text-white px-3 py-1.5 shadow-sm transition-colors">
          <i className="fa-solid fa-floppy-disk text-[10px]" />
          Save policy copy
        </button>
      </div>
    </div>
  );
};

export default ComplianceSettingsPanel;
