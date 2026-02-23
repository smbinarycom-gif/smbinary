import React from 'react';
import type { SystemSettingsPanelProps } from '../systemSettingsPanels.types.ts';

const PaymentSettingsPanel: React.FC<SystemSettingsPanelProps> = ({ settings, onUpdate }) => {
  return (
    <div className="h-full flex flex-col rounded-2xl bg-[#020617] border border-[#111827] shadow-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#111827] flex items-center justify-between bg-gradient-to-r from-[#020617] via-[#020617] to-[#020617]">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Payment Gateways</h3>
          <p className="text-[11px] text-[#6b7280] mt-0.5">Configure Binance Pay and prepare for future providers.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-[#9ca3af] mb-1">Admin Binance Pay ID</label>
          <input
            value={settings.adminBinancePayId}
            onChange={(e) => onUpdate({ ...settings, adminBinancePayId: e.target.value })}
            className="w-full bg-[#020617] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white font-mono placeholder:text-[#4b5563] focus:outline-none focus:border-[#22c55e]"
            placeholder="e.g. 548293012"
          />
          <p className="text-[10px] text-[#6b7280] mt-1">
            Used for deposit and withdrawal requests inside the user wallet panel.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div className="rounded-lg border border-[#1f2937] bg-[#020617] px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-white flex items-center gap-1">
                <i className="fa-brands fa-bitcoin text-[#f97316]" />
                Binance Pay
              </p>
              <p className="text-[10px] text-[#6b7280]">Primary crypto payment channel.</p>
            </div>
            <span className="text-[10px] font-semibold text-[#22c55e]">Enabled</span>
          </div>

          <div className="rounded-lg border border-dashed border-[#1f2937] bg-[#020617] px-3 py-2 flex items-center justify-between opacity-60">
            <div>
              <p className="text-[11px] font-semibold text-[#9ca3af] flex items-center gap-1">
                <i className="fa-solid fa-plug text-[#6b7280]" />
                Additional gateway
              </p>
              <p className="text-[10px] text-[#4b5563]">Stripe, Flutterwave, etc. (coming soon)</p>
            </div>
            <span className="text-[10px] font-semibold text-[#4b5563]">Queued</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-[#111827] flex items-center justify-end bg-[#020617]">
        <button className="inline-flex items-center gap-2 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-[11px] font-semibold text-black px-3 py-1.5 shadow-sm transition-colors">
          <i className="fa-solid fa-floppy-disk text-[10px]" />
          Save payment config
        </button>
      </div>
    </div>
  );
};

export default PaymentSettingsPanel;
