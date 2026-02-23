import React from 'react';
import type { AdminThemeSettings } from '../../../shared/types.ts';
import type { AffiliateStats } from '../types.ts';

interface AffiliateTopAffiliatesTableProps {
  stats: AffiliateStats[];
  theme?: AdminThemeSettings;
}

const AffiliateTopAffiliatesTable: React.FC<AffiliateTopAffiliatesTableProps> = ({ stats, theme }) => {
  const isLight = theme?.mode === 'LIGHT';
  const cardSurface = isLight ? '#ffffff' : '#1e2329';
  const borderColor = isLight ? '#e5e7eb' : '#2b3139';

  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-sm"
      style={{ backgroundColor: cardSurface, borderColor }}
    >
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor }}>
        <div>
          <h2 className={`text-sm font-bold ${isLight ? 'text-[#111827]' : 'text-white'}`}>Top Affiliates</h2>
          <p className="text-[11px] text-[#6b7280] mt-0.5">
            Sorted by number of referrals and generated volume.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] uppercase font-semibold bg-[#f9fafb] text-[#6b7280]">
            <tr>
              <th className="px-4 py-2.5">Affiliate</th>
              <th className="px-4 py-2.5">Referral Code</th>
              <th className="px-4 py-2.5">Referrals</th>
              <th className="px-4 py-2.5">Referral Volume</th>
              <th className="px-4 py-2.5">Referral Deposits</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor }}>
            {stats.map((a) => (
              <tr key={a.affiliateId} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-[#111827]'}>
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-col">
                    <span className={`text-sm font-semibold ${isLight ? 'text-[#111827]' : 'text-white'}`}>
                      {a.name}
                    </span>
                    <span className="text-xs text-[#6b7280]">{a.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-xs text-[#4b5563] font-mono">
                  {a.referralCode || '-'}
                </td>
                <td className="px-4 py-3 align-top text-sm font-semibold text-[#111827]">
                  {a.referrals}
                </td>
                <td className="px-4 py-3 align-top text-sm font-mono text-emerald-700">
                  ${a.referredVolume.toFixed(2)}
                </td>
                <td className="px-4 py-3 align-top text-sm font-mono text-sky-700">
                  ${a.referredDeposits.toFixed(2)}
                </td>
              </tr>
            ))}

            {stats.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-xs text-[#9ca3af]">
                  No affiliate data yet. Once users have referral codes and upline relationships, their performance will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AffiliateTopAffiliatesTable;
