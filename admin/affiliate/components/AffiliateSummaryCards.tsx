import React from 'react';
import type { AdminThemeSettings } from '../../../shared/types.ts';

interface SummaryCardsProps {
  totalAffiliates: number;
  totalReferred: number;
  totalActiveAffiliates: number;
  totalReferralVolume: number;
  theme?: AdminThemeSettings;
}

const AffiliateSummaryCards: React.FC<SummaryCardsProps> = ({
  totalAffiliates,
  totalReferred,
  totalActiveAffiliates,
  totalReferralVolume,
  theme,
}) => {
  const isLight = theme?.mode === 'LIGHT';

  const cards = [
    {
      label: 'Total Affiliates',
      value: totalAffiliates,
      accent: '#2563eb',
      icon: 'fa-users-line',
    },
    {
      label: 'Referred Users',
      value: totalReferred,
      accent: '#22c55e',
      icon: 'fa-user-plus',
    },
    {
      label: 'Active Affiliates',
      value: totalActiveAffiliates,
      accent: '#f97316',
      icon: 'fa-chart-line',
    },
    {
      label: 'Referral Volume',
      value: `$${totalReferralVolume.toFixed(2)}`,
      accent: '#8b5cf6',
      icon: 'fa-coins',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((stat, idx) => {
        const accentBgSoft = `${stat.accent}20`;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-3xl p-4 flex items-center justify-between transition-all duration-200 ${
              isLight
                ? 'bg-white border border-[#e5e7eb] shadow-[0_12px_32px_rgba(15,23,42,0.06)] hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)] hover:-translate-y-0.5'
                : 'bg-[#161a1e] border border-[#2b3139] shadow-lg hover:shadow-[0_22px_55px_rgba(0,0,0,0.6)] hover:-translate-y-0.5'
            }`}
          >
            <div
              className="absolute -right-8 -top-10 w-24 h-24 rounded-full opacity-60 blur-2xl"
              style={{ background: accentBgSoft }}
            />
            <div>
              <p className="text-[11px] text-[#6b7280] font-semibold uppercase tracking-[0.18em] mb-1">
                {stat.label}
              </p>
              <p className="text-lg font-extrabold font-mono" style={{ color: stat.accent }}>
                {stat.value}
              </p>
            </div>
            <div className="relative z-10 flex items-center justify-center">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center text-base shadow-sm"
                style={{ background: isLight ? '#eff6ff' : '#111827', color: stat.accent }}
              >
                <i className={`fa-solid ${stat.icon}`}></i>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AffiliateSummaryCards;
