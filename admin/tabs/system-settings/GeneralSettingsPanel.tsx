import React, { useState } from 'react';
import type { SystemSettingsPanelProps } from '../systemSettingsPanels.types.ts';

const GeneralSettingsPanel: React.FC<SystemSettingsPanelProps> = () => {
  const [siteTitle, setSiteTitle] = useState('SMBinary.COM Options');
  const [timezone, setTimezone] = useState('UTC');
  const [currency, setCurrency] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [baseColor, setBaseColor] = useState('#0099ff');
  const [secondaryColor, setSecondaryColor] = useState('#001d4a');
  const [recordsPerPage, setRecordsPerPage] = useState('20 items per page');
  const [currencyFormat, setCurrencyFormat] = useState('TEXT_AND_SYMBOL');
  const [registrationBonus, setRegistrationBonus] = useState('0.5');
  const [defaultPlan, setDefaultPlan] = useState('BASIC');
  const [transferFixedCharge, setTransferFixedCharge] = useState('0.5');
  const [transferPercentCharge, setTransferPercentCharge] = useState('2.5');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo only: here we could push values to a backend or global config store.
    // Keeping it local to maintain a clean, non-opinionated demo behavior.
  };

  return (
    <div className="h-full flex flex-col rounded-2xl bg-[#020617] border border-[#111827] shadow-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#111827] flex items-center justify-between bg-gradient-to-r from-[#020617] via-[#020617] to-[#020617]">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">General Setting</h3>
          <p className="text-[11px] text-[#6b7280] mt-0.5">Configure fundamental information and monetary behaviour of the site.</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-[#022c22] text-[#22c55e] border border-[#064e3b] px-2 py-0.5 text-[10px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] mr-1" />
          Live
        </span>
      </div>
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 custom-scrollbar flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {/* Site title */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#9ca3af]">
              Site Title <span className="text-[#f97316]">*</span>
            </label>
            <input
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              className="w-full bg-[#020617] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#4b5563] focus:outline-none focus:border-[#6366f1]"
            />
          </div>

          {/* Timezone */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#9ca3af]">
              Timezone <span className="text-[#f97316]">*</span>
            </label>
            <div className="relative">
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full appearance-none bg-[#020617] border border-[#1f2937] rounded-lg px-3 py-2 pr-8 text-xs text-white focus:outline-none focus:border-[#6366f1]"
              >
                <option value="UTC">UTC</option>
                <option value="UTC+3">UTC +3</option>
                <option value="UTC+5:30">UTC +5:30</option>
                <option value="UTC+6">UTC +6</option>
              </select>
              <i className="fa-solid fa-chevron-down text-[10px] text-[#6b7280] absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#9ca3af]">
              Currency <span className="text-[#f97316]">*</span>
            </label>
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#020617] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#4b5563] focus:outline-none focus:border-[#6366f1]"
            />
          </div>

          {/* Currency symbol */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#9ca3af]">
              Currency Symbol <span className="text-[#f97316]">*</span>
            </label>
            <input
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full bg-[#020617] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#4b5563] focus:outline-none focus:border-[#6366f1]"
            />
          </div>

          {/* Base color */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#9ca3af]">
              Site Base Color <span className="text-[#f97316]">*</span>
            </label>
            <div className="flex rounded-lg overflow-hidden border border-[#1f2937] bg-[#020617]">
              <div className="w-16 flex items-center justify-center" style={{ backgroundColor: baseColor }}>
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="opacity-0 w-full h-10 cursor-pointer"
                />
              </div>
              <input
                value={baseColor.replace('#', '')}
                onChange={(e) => setBaseColor(`#${e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)}`)}
                className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder:text-[#4b5563] focus:outline-none"
              />
            </div>
          </div>

          {/* Secondary color */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#9ca3af]">
              Site Secondary Color <span className="text-[#f97316]">*</span>
            </label>
            <div className="flex rounded-lg overflow-hidden border border-[#1f2937] bg-[#020617]">
              <div className="w-16 flex items-center justify-center" style={{ backgroundColor: secondaryColor }}>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="opacity-0 w-full h-10 cursor-pointer"
                />
              </div>
              <input
                value={secondaryColor.replace('#', '')}
                onChange={(e) => setSecondaryColor(`#${e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)}`)}
                className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder:text-[#4b5563] focus:outline-none"
              />
            </div>
          </div>

          {/* Records per page */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#9ca3af]">
              Record to Display Per page
            </label>
            <div className="relative">
              <select
                value={recordsPerPage}
                onChange={(e) => setRecordsPerPage(e.target.value)}
                className="w-full appearance-none bg-[#020617] border border-[#1f2937] rounded-lg px-3 py-2 pr-8 text-xs text-white focus:outline-none focus:border-[#6366f1]"
              >
                <option>10 items per page</option>
                <option>20 items per page</option>
                <option>50 items per page</option>
                <option>100 items per page</option>
              </select>
              <i className="fa-solid fa-chevron-down text-[10px] text-[#6b7280] absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Currency format */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#9ca3af]">
              Currency Showing Format <span className="text-[#f97316]">*</span>
            </label>
            <div className="relative">
              <select
                value={currencyFormat}
                onChange={(e) => setCurrencyFormat(e.target.value)}
                className="w-full appearance-none bg-[#020617] border border-[#1f2937] rounded-lg px-3 py-2 pr-8 text-xs text-white focus:outline-none focus:border-[#6366f1]"
              >
                <option value="TEXT_AND_SYMBOL">Show Currency Text and Symbol Both</option>
                <option value="TEXT_ONLY">Show Currency Text Only</option>
                <option value="SYMBOL_ONLY">Show Currency Symbol Only</option>
              </select>
              <i className="fa-solid fa-chevron-down text-[10px] text-[#6b7280] absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Registration bonus */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#9ca3af]">
              Registration Bonus <span className="text-[#f97316]">*</span>
            </label>
            <div className="flex rounded-lg overflow-hidden border border-[#1f2937] bg-[#020617]">
              <input
                type="number"
                value={registrationBonus}
                onChange={(e) => setRegistrationBonus(e.target.value)}
                className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder:text-[#4b5563] focus:outline-none"
              />
              <div className="px-3 py-2 text-[11px] font-semibold text-white bg-[#020617] border-l border-[#1f2937] flex items-center">
                {currency}
              </div>
            </div>
          </div>

          {/* Default plan */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#9ca3af]">Default Plan</label>
            <div className="relative">
              <select
                value={defaultPlan}
                onChange={(e) => setDefaultPlan(e.target.value)}
                className="w-full appearance-none bg-[#020617] border border-[#1f2937] rounded-lg px-3 py-2 pr-8 text-xs text-white focus:outline-none focus:border-[#6366f1]"
              >
                <option value="BASIC">BASIC</option>
                <option value="STANDARD">STANDARD</option>
                <option value="PREMIUM">PREMIUM</option>
              </select>
              <i className="fa-solid fa-chevron-down text-[10px] text-[#6b7280] absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Balance transfer fixed charge */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#9ca3af]">
              Balance Transfer Fixed Charge <span className="text-[#f97316]">*</span>
            </label>
            <div className="flex rounded-lg overflow-hidden border border-[#1f2937] bg-[#020617]">
              <input
                type="number"
                value={transferFixedCharge}
                onChange={(e) => setTransferFixedCharge(e.target.value)}
                className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder:text-[#4b5563] focus:outline-none"
              />
              <div className="px-3 py-2 text-[11px] font-semibold text-white bg-[#020617] border-l border-[#1f2937] flex items-center">
                {currency}
              </div>
            </div>
          </div>

          {/* Balance transfer percent charge */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#9ca3af]">
              Balance Transfer Percent Charge <span className="text-[#f97316]">*</span>
            </label>
            <div className="flex rounded-lg overflow-hidden border border-[#1f2937] bg-[#020617]">
              <input
                type="number"
                value={transferPercentCharge}
                onChange={(e) => setTransferPercentCharge(e.target.value)}
                className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder:text-[#4b5563] focus:outline-none"
              />
              <div className="px-3 py-2 text-[11px] font-semibold text-white bg-[#020617] border-l border-[#1f2937] flex items-center">
                %
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-[12px] font-semibold text-white py-2.5 shadow-md shadow-[#4f46e5]/40 transition-colors"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeneralSettingsPanel;
