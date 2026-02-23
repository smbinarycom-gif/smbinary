// Commission group/rank structure
export interface CommissionGroup {
  id: string;
  name: string;
  description?: string;
  commissionRate: number; // percentage (e.g. 10 for 10%)
  minReferrals?: number;
  minVolume?: number;
  minDeposits?: number;
  isDefault?: boolean;
}

// Commission plan (can be group-based, promo, or override)
export interface CommissionPlan {
  id: string;
  name: string;
  groupId?: string; // linked to CommissionGroup
  userId?: string; // for manual override
  promoStart?: number; // timestamp
  promoEnd?: number; // timestamp
  promoRate?: number;
  isActive: boolean;
}

// Commission payout history
export interface CommissionHistoryEntry {
  id: string;
  userId: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'HOLD';
  createdAt: number;
  paidAt?: number;
  planId?: string;
  notes?: string;
}
export interface AffiliateStats {
  affiliateId: string;
  name: string;
  email: string;
  referralCode?: string;
  referrals: number;
  referredVolume: number;
  referredDeposits: number;
}
