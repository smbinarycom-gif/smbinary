import { useMemo } from 'react';
import type { User } from '../../shared/types.ts';
import type { AffiliateStats } from './types.ts';

export interface AffiliateAnalyticsResult {
  affiliateUsers: User[];
  referredUsers: User[];
  aggregateStats: AffiliateStats[];
  totalAffiliates: number;
  totalReferred: number;
  totalActiveAffiliates: number;
  totalReferralVolume: number;
}

export const useAffiliateAnalytics = (users: User[]): AffiliateAnalyticsResult => {
  const affiliateUsers = useMemo(() => users.filter(u => !!u.referralCode), [users]);
  const referredUsers = useMemo(() => users.filter(u => !!u.uplineId), [users]);

  const activeAffiliateIds = useMemo(() => {
    const byUpline: Record<string, number> = {};
    for (const u of referredUsers) {
      if (!u.uplineId) continue;
      byUpline[u.uplineId] = (byUpline[u.uplineId] || 0) + 1;
    }
    return byUpline;
  }, [referredUsers]);

  const aggregateStats = useMemo<AffiliateStats[]>(() => {
    const statsMap = new Map<string, AffiliateStats>();

    for (const aff of affiliateUsers) {
      statsMap.set(aff.id, {
        affiliateId: aff.id,
        name: aff.name,
        email: aff.email,
        referralCode: aff.referralCode,
        referrals: 0,
        referredVolume: 0,
        referredDeposits: 0,
      });
    }

    for (const u of users) {
      if (!u.uplineId) continue;
      const entry = statsMap.get(u.uplineId);
      if (!entry) continue;
      entry.referrals += 1;
      entry.referredVolume += u.totalTurnover;
      entry.referredDeposits += u.totalDeposited;
    }

    const list = Array.from(statsMap.values());
    list.sort((a, b) => b.referrals - a.referrals || b.referredVolume - a.referredVolume);
    return list;
  }, [users, affiliateUsers]);

  const totalAffiliates = affiliateUsers.length;
  const totalReferred = referredUsers.length;
  const totalActiveAffiliates = Object.keys(activeAffiliateIds).length;
  const totalReferralVolume = aggregateStats.reduce((sum, a) => sum + a.referredVolume, 0);

  return {
    affiliateUsers,
    referredUsers,
    aggregateStats,
    totalAffiliates,
    totalReferred,
    totalActiveAffiliates,
    totalReferralVolume,
  };
};
