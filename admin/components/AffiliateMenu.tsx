import React, { useState } from 'react';
import type { AdminThemeSettings } from '../../shared/types.ts';

interface AffiliateMenuProps {
  activeMenu: string;
  onSelect: (menu: string) => void;
  theme?: AdminThemeSettings;
}

const AffiliateMenu: React.FC<AffiliateMenuProps> = ({ activeMenu, onSelect, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isLight = theme?.mode === 'LIGHT';

  const rootActiveClasses = isLight
    ? 'text-[#0f172a] bg-[#e5f0ff] border-[#2563eb]'
    : 'text-[#fcd535] bg-[#2b3139] border-[#fcd535]';

  const rootInactiveClasses = isLight
    ? 'text-[#6b7280] border-transparent hover:text-[#111827] hover:bg-[#e5e7eb]'
    : 'text-[#848e9c] border-transparent hover:text-white hover:bg-[#2b3139]';

  const iconWrapperClasses = isLight
    ? 'bg-white border-[#e5e7eb]'
    : 'bg-[#161a1e] border-[#2b3139]';

  const submenuContainerClasses = isLight
    ? 'border-l border-[#e5e7eb] bg-[#f9fafb]'
    : 'border-l border-[#2b3139] bg-[#14181c]';

  const submenuItemSelected = isLight
    ? 'bg-[#e5f0ff] text-[#0f172a]'
    : 'bg-[#2b3139] text-[#fcd535]';

  const submenuItemIdle = isLight
    ? 'text-[#6b7280] hover:text-[#111827] hover:bg-[#e5e7eb]'
    : 'text-[#848e9c] hover:text-white hover:bg-[#1f242b]';

  const ITEMS = [
    { id: 'AFFILIATE_DASHBOARD', label: 'Dashboard', iconClass: 'fa-solid fa-gauge' },
    { id: 'AFFILIATE_AFFILIATES', label: 'Affiliates List', iconClass: 'fa-solid fa-users' },
    { id: 'AFFILIATE_COMMISSIONS', label: 'Commission Plans', iconClass: 'fa-solid fa-percent' },
    { id: 'AFFILIATE_REFERRALS', label: 'Referral Tracking', iconClass: 'fa-solid fa-link' },
    { id: 'AFFILIATE_PAYOUTS', label: 'Payout Management', iconClass: 'fa-solid fa-wallet' },
    { id: 'AFFILIATE_PROMO', label: 'Promo Materials', iconClass: 'fa-solid fa-bullhorn' },
    { id: 'AFFILIATE_REPORTS', label: 'Performance Reports', iconClass: 'fa-solid fa-chart-line' },
    { id: 'AFFILIATE_FRAUD', label: 'Fraud Detection', iconClass: 'fa-solid fa-shield-halved' },
    { id: 'AFFILIATE_SETTINGS', label: 'Settings', iconClass: 'fa-solid fa-gear' },
  ];

  const isAnyAffiliateActive = ITEMS.some((i) => i.id === activeMenu);

  return (
    <div className="mt-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-7 py-4 border-l-4 ${
          isAnyAffiliateActive ? rootActiveClasses : rootInactiveClasses
        }`}
      >
        <span className="flex items-center space-x-3.5">
          <span className={`w-9 h-9 rounded-2xl flex items-center justify-center border ${iconWrapperClasses}`}>
            <i className="fa-solid fa-users-line text-[15px]"></i>
          </span>
          <span className="text-[13px] font-semibold font-binance tracking-wide">Affiliate Program</span>
        </span>
        <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} text-[10px] text-[#848e9c]`}></i>
      </button>

      {isOpen && (
        <div className={`pl-8 pr-4 pb-2 pt-1 space-y-0.5 ${submenuContainerClasses}`}>
          {ITEMS.map((item) => {
            const isSelected = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`group w-full flex items-center justify-between text-[11px] font-semibold px-2.5 py-1.5 rounded-md ${
                  isSelected ? submenuItemSelected : submenuItemIdle
                }`}
              >
                <span className="flex items-center space-x-2">
                  <i
                    className={`${item.iconClass} text-[11px] w-4 text-center opacity-80 group-hover:opacity-100`}
                  ></i>
                  <span className="truncate">{item.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AffiliateMenu;
