import React, { useState } from 'react';
import type { UserFilterType } from '../userFilters.ts';
import type { AdminThemeSettings } from '../../shared/types.ts';

interface UserManagementMenuProps {
  isActive: boolean;
  currentFilter: UserFilterType;
  onSelectFilter: (filter: UserFilterType) => void;
  onOpenNotificationComposer: () => void;
  isBroadcastActive: boolean;
  totalUsers: number;
  filterCounts?: Partial<Record<UserFilterType, number>>;
  theme?: AdminThemeSettings;
}

const FILTER_OPTIONS: {
  key: UserFilterType;
  label: string;
  iconClass: string;
  accentClass: string;
}[] = [
  { key: 'ALL', label: 'All Users', iconClass: 'fa-solid fa-users', accentClass: 'bg-[#0ecb81]' },
  { key: 'ACTIVE', label: 'Active Users', iconClass: 'fa-solid fa-user-check', accentClass: 'bg-[#0ecb81]' },
  { key: 'WITH_BALANCE', label: 'With Balance', iconClass: 'fa-solid fa-sack-dollar', accentClass: 'bg-[#fcd535]' },
  { key: 'BANNED', label: 'Banned Users', iconClass: 'fa-solid fa-user-slash', accentClass: 'bg-[#f6465d]' },
  { key: 'EMAIL_UNVERIFIED', label: 'Email Unverified', iconClass: 'fa-solid fa-envelope', accentClass: 'bg-[#f68435]' },
  { key: 'MOBILE_UNVERIFIED', label: 'Mobile Unverified', iconClass: 'fa-solid fa-mobile-screen-button', accentClass: 'bg-[#36a2f5]' },
  { key: 'KYC_UNVERIFIED', label: 'KYC Unverified', iconClass: 'fa-solid fa-id-card', accentClass: 'bg-[#848e9c]' },
  { key: 'KYC_PENDING', label: 'KYC Pending', iconClass: 'fa-solid fa-hourglass-half', accentClass: 'bg-[#fcd535]' },
  { key: 'KYC_REJECTED', label: 'KYC Rejected', iconClass: 'fa-solid fa-circle-xmark', accentClass: 'bg-[#f6465d]' },
  { key: 'KYC_VERIFIED', label: 'KYC Verified', iconClass: 'fa-solid fa-circle-check', accentClass: 'bg-[#0ecb81]' },
  { key: 'VPN_DETECTED', label: 'VPN Detected', iconClass: 'fa-solid fa-shield-halved', accentClass: 'bg-[#f6465d]' },
  { key: 'SEND_NOTIFICATION', label: 'Send Notification', iconClass: 'fa-solid fa-bullhorn', accentClass: 'bg-[#fcd535]' },
];

const UserManagementMenu: React.FC<UserManagementMenuProps> = ({
  isActive,
  currentFilter,
  onSelectFilter,
  onOpenNotificationComposer,
  isBroadcastActive,
  totalUsers,
  filterCounts,
  theme,
}) => {
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

  const getBadgeClasses = (key: UserFilterType): string => {
    switch (key) {
      case 'ALL':
        // Highlighted soft mint green (match deposits successful)
        return 'bg-[#c8f5e7] text-[#158f63]';
      case 'ACTIVE':
        // Highlighted soft blue
        return 'bg-[#dbeafe] text-[#1d4ed8]';
      case 'WITH_BALANCE':
        // Highlighted soft amber
        return 'bg-[#fde68a] text-[#b45309]';
      case 'BANNED':
        // Highlighted soft red
        return 'bg-[#fecaca] text-[#b91c1c]';
      case 'EMAIL_UNVERIFIED':
        // Highlighted soft orange
        return 'bg-[#fed7aa] text-[#c2410c]';
      case 'MOBILE_UNVERIFIED':
        // Highlighted soft sky blue
        return 'bg-[#bfdbfe] text-[#1d4ed8]';
      case 'KYC_UNVERIFIED':
        // Highlighted soft gray
        return 'bg-[#d4d4d8] text-[#374151]';
      case 'KYC_PENDING':
        // Highlighted soft yellow
        return 'bg-[#fef08a] text-[#854d0e]';
      case 'KYC_REJECTED':
        // Highlighted soft red (same family as banned)
        return 'bg-[#fecaca] text-[#b91c1c]';
      case 'KYC_VERIFIED':
        // Highlighted soft mint green
        return 'bg-[#c8f5e7] text-[#158f63]';
      case 'VPN_DETECTED':
        // Highlighted soft purple
        return 'bg-[#e9d5ff] text-[#7c3aed]';
      default:
        return 'bg-[#e5e7eb] text-[#4b5563]';
    }
  };

  return (
    <div className="mt-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
			className={`w-full flex items-center justify-between px-7 py-4 border-l-4 ${
          isActive ? rootActiveClasses : rootInactiveClasses
        }`}
      >
        <span className="flex items-center space-x-3.5">
            <span className={`w-9 h-9 rounded-2xl flex items-center justify-center border ${iconWrapperClasses}`}>
              <i className="fa-solid fa-users-gear text-[15px]"></i>
            </span>
          <span className="text-[13px] font-semibold font-binance tracking-wide">User Management</span>
        </span>
        <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} text-[10px] text-[#848e9c]`}></i>
      </button>

      {isOpen && (
        <div className={`pl-8 pr-4 pb-2 pt-1 space-y-0.5 ${submenuContainerClasses}`}>
          {FILTER_OPTIONS.map((option) => {
            const isSendNotification = option.key === 'SEND_NOTIFICATION';
            const isSelected = isBroadcastActive
              ? isSendNotification
              : currentFilter === option.key;

            const count = !isSendNotification
              ? (filterCounts && filterCounts[option.key]) ?? 0
              : undefined;

            return (
              <button
                key={option.key}
                onClick={() => {
                  if (option.key === 'SEND_NOTIFICATION') {
                    onOpenNotificationComposer();
                  } else {
                    onSelectFilter(option.key);
                  }
                }}
				className={`group w-full flex items-center justify-between text-[11px] font-semibold px-2.5 py-1.5 rounded-md ${
                  isSelected ? submenuItemSelected : submenuItemIdle
                }`}
              >
                <span className="flex items-center space-x-2">
                  <i className={`${option.iconClass} text-[11px] w-4 text-center opacity-80 group-hover:opacity-100`}></i>
                  <span className="truncate">{option.label}</span>
                </span>
                  {!isSendNotification && (
                    <span
	                      className={`ml-2 inline-flex items-center justify-center px-3 py-[3px] rounded-full text-[11px] font-extrabold shadow-sm border border-white/80 ${getBadgeClasses(option.key)}`}
                    >
                      {option.key === 'ALL' ? totalUsers : count}
                    </span>
                  )}
                  {isSendNotification && isSelected && (
                    <span className="text-[9px] text-[#2563eb]">Active</span>
                  )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserManagementMenu;
