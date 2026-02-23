import React, { useState } from 'react';
import type { AdminThemeSettings } from '../../shared/types.ts';

interface DepositsMenuProps {
  activeMenu: string;
  onSelect: (menu: string) => void;
  depositCounts?: Record<string, number>;
  theme?: AdminThemeSettings;
}

const DepositsMenu: React.FC<DepositsMenuProps> = ({ activeMenu, onSelect, depositCounts, theme }) => {
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

  const activeTagColor = isLight ? 'text-[#2563eb]' : 'text-[#fcd535]';

  const ITEMS = [
    { id: 'DEPOSITS_ALL', label: 'All Deposits', iconClass: 'fa-solid fa-list-ul' },
    { id: 'DEPOSITS_PENDING', label: 'Pending Deposits', iconClass: 'fa-solid fa-hourglass-half' },
    { id: 'DEPOSITS_APPROVED', label: 'Approved Deposits', iconClass: 'fa-solid fa-circle-check' },
    { id: 'DEPOSITS_SUCCESSFUL', label: 'Successful Deposits', iconClass: 'fa-solid fa-check-double' },
    { id: 'DEPOSITS_REJECTED', label: 'Rejected Deposits', iconClass: 'fa-solid fa-circle-xmark' },
    { id: 'DEPOSITS_INITIATED', label: 'Initiated Deposits', iconClass: 'fa-solid fa-play' },
  ];

  const getBadgeClasses = (id: string) => {
    switch (id) {
      case 'DEPOSITS_ALL':
        // Highlighted soft blue pill like screenshot
        return 'bg-[#dbeafe] text-[#1d4ed8]';
      case 'DEPOSITS_PENDING':
        // Highlighted warm soft yellow
        return 'bg-[#fde68a] text-[#b45309]';
      case 'DEPOSITS_APPROVED':
      case 'DEPOSITS_SUCCESSFUL':
        // Highlighted soft mint green
        return 'bg-[#c8f5e7] text-[#158f63]';
      case 'DEPOSITS_REJECTED':
        // Highlighted soft red
        return 'bg-[#fecaca] text-[#b91c1c]';
      case 'DEPOSITS_INITIATED':
        // Highlighted soft indigo / blue
        return 'bg-[#e0e7ff] text-[#4f46e5]';
      default:
        return isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#2b3139] text-[#e5e7eb]';
    }
  };

  return (
    <div className="mt-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-7 py-4 border-l-4 ${
          ITEMS.some((i) => i.id === activeMenu) ? rootActiveClasses : rootInactiveClasses
        }`}
      >
        <span className="flex items-center space-x-3.5">
          <span className={`w-9 h-9 rounded-2xl flex items-center justify-center border ${iconWrapperClasses}`}>
            <i className="fa-solid fa-sack-dollar text-[15px]"></i>
          </span>
          <span className="text-[13px] font-semibold font-binance tracking-wide">Deposits</span>
        </span>
        <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} text-[10px] text-[#848e9c]`}></i>
      </button>

      {isOpen && (
        <div className={`pl-8 pr-4 pb-2 pt-1 space-y-0.5 ${submenuContainerClasses}`}>
          {ITEMS.map((item) => {
            const isSelected = activeMenu === item.id;
            const count = depositCounts?.[item.id] ?? 0;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`group w-full flex items-center justify-between text-[11px] font-semibold px-2.5 py-1.5 rounded-md ${
                  isSelected ? submenuItemSelected : submenuItemIdle
                }`}
              >
                <span className="flex items-center space-x-2">
                  <i className={`${item.iconClass} text-[11px] w-4 text-center opacity-80 group-hover:opacity-100`}></i>
                  <span className="truncate">{item.label}</span>
                </span>
                <span
                  className={`ml-2 inline-flex items-center justify-center px-3 py-[3px] rounded-full text-[11px] font-extrabold shadow-sm border border-white/80 ${getBadgeClasses(
                    item.id
                  )}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DepositsMenu;
