import type { User } from '../shared/types.ts';

export type UserFilterType =
  | 'ALL'
  | 'ACTIVE'
  | 'WITH_BALANCE'
  | 'BANNED'
  | 'EMAIL_UNVERIFIED'
  | 'MOBILE_UNVERIFIED'
  | 'KYC_UNVERIFIED'
  | 'KYC_PENDING'
  | 'KYC_REJECTED'
  | 'KYC_VERIFIED'
  | 'VPN_DETECTED'
  | 'SEND_NOTIFICATION';

export const filterUsersByType = (users: User[], filter: UserFilterType): User[] => {
  switch (filter) {
    case 'ACTIVE':
      return users.filter((u) => u.status === 'ACTIVE');
    case 'WITH_BALANCE':
      return users.filter((u) => u.balance + u.bonusBalance > 0);
    case 'BANNED':
      return users.filter((u) => u.status === 'BLOCKED' || u.status === 'SUSPENDED');
    case 'EMAIL_UNVERIFIED':
      return users.filter((u) => u.tags?.includes('EMAIL_UNVERIFIED'));
    case 'MOBILE_UNVERIFIED':
      return users.filter((u) => u.tags?.includes('MOBILE_UNVERIFIED'));
    case 'KYC_UNVERIFIED':
      return users.filter((u) => u.kycStatus === 'NOT_SUBMITTED');
    case 'KYC_PENDING':
      return users.filter((u) => u.kycStatus === 'PENDING');
    case 'KYC_REJECTED':
      return users.filter((u) => u.kycStatus === 'REJECTED');
    case 'KYC_VERIFIED':
      return users.filter((u) => u.kycStatus === 'VERIFIED');
    case 'VPN_DETECTED':
      return users.filter((u) => u.tags?.includes('VPN_DETECTED'));
    case 'SEND_NOTIFICATION':
    case 'ALL':
    default:
      return users;
  }
};
