import React from 'react';
import type { User, AdminThemeSettings } from '../../shared/types.ts';
import { useAffiliateAnalytics } from './useAffiliateAnalytics.ts';
import AffiliateSummaryCards from './components/AffiliateSummaryCards.tsx';
import AffiliateTopAffiliatesTable from './components/AffiliateTopAffiliatesTable.tsx';

interface AffiliateTabProps {
  users: User[];
  theme?: AdminThemeSettings;
}

const AffiliateTab: React.FC<AffiliateTabProps> = ({ users, theme }) => {
  const isLight = theme?.mode === 'LIGHT';
  const shellBg = isLight ? '#f5f6f8' : 'transparent';

  const {
    aggregateStats,
    totalAffiliates,
    totalReferred,
    totalActiveAffiliates,
    totalReferralVolume,
  } = useAffiliateAnalytics(users);

  return (
    <div className="space-y-6 antialiased" style={{ backgroundColor: shellBg }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className={`text-xl font-bold tracking-tight ${isLight ? 'text-[#111827]' : 'text-white'}`}>
            Affiliate Program
          </h1>
          <p className="text-xs text-[#6b7280] mt-1">
            Track referrers, referred users and performance of your affiliate program.
          </p>
        </div>
      </div>

      <AffiliateSummaryCards
        totalAffiliates={totalAffiliates}
        totalReferred={totalReferred}
        totalActiveAffiliates={totalActiveAffiliates}
        totalReferralVolume={totalReferralVolume}
        theme={theme}
      />

      <AffiliateTopAffiliatesTable stats={aggregateStats} theme={theme} />
    </div>
  );
};

export default AffiliateTab;
