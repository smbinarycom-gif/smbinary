import React, { useMemo, useState } from 'react';
import type { User, AdminThemeSettings } from '../../../shared/types.ts';
import { useAffiliateAnalytics } from '../useAffiliateAnalytics.ts';

interface AffiliateDashboardTabProps {
  users: User[];
  theme?: AdminThemeSettings;
}

const AffiliateDashboardTab: React.FC<AffiliateDashboardTabProps> = ({ users, theme }) => {
  const isLight = theme?.mode === 'LIGHT';
  const shellBg = isLight ? '#f5f6f8' : 'transparent';

  const {
    affiliateUsers,
    aggregateStats,
    totalAffiliates,
    totalReferred,
  } = useAffiliateAnalytics(users);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'REFERRALS' | 'VOLUME' | 'DEPOSITS'>('REFERRALS');
  const [activeOnly, setActiveOnly] = useState(false);
  const [country, setCountry] = useState<string>('ALL');
  const [risk, setRisk] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<'ALL' | '7D' | '30D'>('ALL');

  const countryOptions = useMemo(
    () => Array.from(new Set(affiliateUsers.map((u) => u.country))).filter(Boolean).sort(),
    [affiliateUsers]
  );

  const riskOptions = useMemo(
    () => Array.from(new Set(affiliateUsers.map((u) => u.riskLabel))).filter(Boolean).sort(),
    [affiliateUsers]
  );

  const affiliateById = useMemo(() => {
    const map: Record<string, User> = {};
    affiliateUsers.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [affiliateUsers]);

  const filteredStats = useMemo(() => {
    let base = [...aggregateStats];

    if (activeOnly) {
      base = base.filter((a) => a.referrals > 0);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          (a.referralCode && a.referralCode.toLowerCase().includes(q))
      );
    }

    if (country !== 'ALL' || risk !== 'ALL' || dateRange !== 'ALL') {
      const now = Date.now();
      const cutoff =
        dateRange === '7D'
          ? now - 7 * 24 * 60 * 60 * 1000
          : dateRange === '30D'
          ? now - 30 * 24 * 60 * 60 * 1000
          : null;

      base = base.filter((a) => {
        const aff = affiliateById[a.affiliateId];
        if (!aff) return false;
        if (country !== 'ALL' && aff.country !== country) return false;
        if (risk !== 'ALL' && aff.riskLabel !== risk) return false;
        if (cutoff !== null && aff.joinedAt < cutoff) return false;
        return true;
      });
    }

    base.sort((a, b) => {
      if (sortBy === 'REFERRALS') return b.referrals - a.referrals;
      if (sortBy === 'VOLUME') return b.referredVolume - a.referredVolume;
      return b.referredDeposits - a.referredDeposits;
    });

    return base;
  }, [aggregateStats, activeOnly, search, sortBy, country, risk, affiliateById, dateRange]);

  const topForChart = filteredStats.slice(0, 6);
  const maxVolume = useMemo(
    () => (filteredStats.length ? Math.max(...filteredStats.map((a) => a.referredVolume)) : 0),
    [filteredStats]
  );

  const totalEarnings = filteredStats.reduce((sum, a) => sum + a.referredDeposits * 0.1, 0); // demo 10%
  const pendingPayouts = totalEarnings * 0.3; // demo split
  const avgEarningsPerAffiliate = filteredStats.length ? totalEarnings / filteredStats.length : 0;
  const activeAffiliateCount = filteredStats.filter((a) => a.referrals > 0).length;
  const activeRate = filteredStats.length ? (activeAffiliateCount / filteredStats.length) * 100 : 0;
  const totalReferralVolumeFiltered = filteredStats.reduce((sum, a) => sum + a.referredVolume, 0);

  return (
    <div className="space-y-6" style={{ backgroundColor: shellBg }}>
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[{
          label: 'Total Affiliates',
          value: totalAffiliates,
          accent: '#2563eb',
          icon: 'fa-users-line',
        }, {
          label: 'Referred Users',
          value: totalReferred,
          accent: '#22c55e',
          icon: 'fa-user-plus',
        }, {
          label: 'Total Earnings (est.)',
          value: `$${totalEarnings.toFixed(2)}`,
          accent: '#f97316',
          icon: 'fa-sack-dollar',
        }, {
          label: 'Pending Payouts',
          value: `$${pendingPayouts.toFixed(2)}`,
          accent: '#e11d48',
          icon: 'fa-wallet',
        }].map((stat, idx) => {
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
              <div className="absolute -right-8 -top-10 w-24 h-24 rounded-full opacity-60 blur-2xl" style={{ background: accentBgSoft }} />
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

      {/* Filters & quick controls */}
      <div
        className={`rounded-2xl border px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between ${
          isLight ? 'bg-white' : 'bg-[#1e2329]'
        }`}
        style={{ borderColor: isLight ? '#e5e7eb' : '#2b3139' }}
      >
        <div className="flex-1 flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <i
              className={`fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[11px] ${
                isLight ? 'text-[#9ca3af]' : 'text-[#6b7280]'
              }`}
            ></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="অ্যাফিলিয়েট নাম, ইমেইল বা রেফারেল কোড দিয়ে খুঁজুন..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border focus:outline-none ${
                isLight
                  ? 'bg-white border-[#e5e7eb] text-[#111827] focus:border-[#2563eb]'
                  : 'bg-[#111827] border-[#2b3139] text-white focus:border-[#fcd535]'
              }`}
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className={`px-2 py-1 rounded-lg text-[10px] font-semibold border ${
                isLight
                  ? 'border-[#e5e7eb] text-[#6b7280] hover:bg-[#f3f4f6]'
                  : 'border-[#374151] text-[#9ca3af] hover:bg-[#111827]'
              }`}
            >
              ক্লিয়ার
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex items-center gap-1 text-[11px]">
            <span className="uppercase tracking-wide text-[#9ca3af] font-semibold">Country</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={`text-[11px] px-2 py-1 rounded-md border focus:outline-none ${
                isLight
                  ? 'bg-white border-[#e5e7eb] text-[#111827] focus:border-[#2563eb]'
                  : 'bg-[#111827] border-[#2b3139] text-white focus:border-[#fcd535]'
              }`}
            >
              <option value="ALL">All</option>
              {countryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <span className="uppercase tracking-wide text-[#9ca3af] font-semibold">Risk</span>
            <select
              value={risk}
              onChange={(e) => setRisk(e.target.value)}
              className={`text-[11px] px-2 py-1 rounded-md border focus:outline-none ${
                isLight
                  ? 'bg-white border-[#e5e7eb] text-[#111827] focus:border-[#2563eb]'
                  : 'bg-[#111827] border-[#2b3139] text-white focus:border-[#fcd535]'
              }`}
            >
              <option value="ALL">All</option>
              {riskOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <span className="uppercase tracking-wide text-[#9ca3af] font-semibold">Range</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as 'ALL' | '7D' | '30D')}
              className={`text-[11px] px-2 py-1 rounded-md border focus:outline-none ${
                isLight
                  ? 'bg-white border-[#e5e7eb] text-[#111827] focus:border-[#2563eb]'
                  : 'bg-[#111827] border-[#2b3139] text-white focus:border-[#fcd535]'
              }`}
            >
              <option value="ALL">All time</option>
              <option value="7D">Last 7 days</option>
              <option value="30D">Last 30 days</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <span className="uppercase tracking-wide text-[#9ca3af] font-semibold">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`text-[11px] px-2 py-1 rounded-md border focus:outline-none ${
                isLight
                  ? 'bg-white border-[#e5e7eb] text-[#111827] focus:border-[#2563eb]'
                  : 'bg-[#111827] border-[#2b3139] text-white focus:border-[#fcd535]'
              }`}
            >
              <option value="REFERRALS">Referrals</option>
              <option value="VOLUME">Volume</option>
              <option value="DEPOSITS">Deposits</option>
            </select>
          </div>

          <button
            onClick={() => setActiveOnly((v) => !v)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
              activeOnly
                ? isLight
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                  : 'bg-emerald-900/30 border-emerald-500 text-emerald-300'
                : isLight
                ? 'bg-white border-[#e5e7eb] text-[#6b7280] hover:bg-[#f3f4f6]'
                : 'bg-[#111827] border-[#2b3139] text-[#9ca3af] hover:bg-[#1f2933]'
            }`}
          >
            <span
              className={`w-3 h-3 rounded-full border flex items-center justify-center text-[8px] ${
                activeOnly
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-[#9ca3af] text-transparent'
              }`}
            >
              ✓
            </span>
            <span>শুধু active affiliates</span>
          </button>
        </div>
      </div>

      {/* Charts & analytics grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Volume bar chart */}
        <div
          className={`rounded-2xl border p-4 xl:col-span-2 ${isLight ? 'bg-white' : 'bg-[#1e2329]'}`}
          style={{ borderColor: isLight ? '#e5e7eb' : '#2b3139' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className={`text-sm font-bold ${isLight ? 'text-[#111827]' : 'text-white'}`}>
                Top Affiliates by Referral Volume
              </h2>
              <p className="text-[11px] text-[#6b7280]">
                ফিল্টার অনুযায়ী শীর্ষ অ্যাফিলিয়েটদের ভলিউম বার-চার্ট আকারে দেখানো হচ্ছে।
              </p>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full bg-black/5 dark:bg-white/5 text-[#6b7280]">
              {topForChart.length} of {filteredStats.length} affiliates
            </span>
          </div>

          {topForChart.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#9ca3af]">
              কোন অ্যাফিলিয়েট পাওয়া যায়নি। ফিল্টার একটু হালকা করে দেখুন।
            </div>
          ) : (
            <div className="space-y-3">
              {topForChart.map((a) => {
                const pct = maxVolume ? (a.referredVolume / maxVolume) * 100 : 0;
                return (
                  <div key={a.affiliateId} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#6b7280]">
                      <span className="truncate max-w-[55%]">
                        <span className={isLight ? 'text-[#111827] font-semibold' : 'text-white font-semibold'}>
                          {a.name}
                        </span>{' '}
                        <span className="text-[10px] text-[#9ca3af]">({a.referrals} refs)</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#4b5563]">
                        ${a.referredVolume.toFixed(2)}
                      </span>
                    </div>
                    <div className={isLight ? 'bg-[#e5e7eb] rounded-full h-2 overflow-hidden' : 'bg-[#111827] rounded-full h-2 overflow-hidden'}>
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#2563eb] via-[#22c55e] to-[#fbbf24] transition-all"
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Extra insights */}
        <div
          className={`rounded-2xl border p-4 space-y-3 ${isLight ? 'bg-white' : 'bg-[#1e2329]'}`}
          style={{ borderColor: isLight ? '#e5e7eb' : '#2b3139' }}
        >
          <h2 className={`text-sm font-bold mb-1 ${isLight ? 'text-[#111827]' : 'text-white'}`}>
            Program Health Snapshot
          </h2>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6b7280]">Average earnings per affiliate</span>
              <span className="font-mono font-semibold text-[#16a34a]">
                ${avgEarningsPerAffiliate.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6b7280]">Active affiliate rate</span>
              <span className="font-mono font-semibold text-[#2563eb]">
                {activeRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6b7280]">Total referral volume (filtered)</span>
              <span className="font-mono font-semibold text-[#f97316]">
                ${totalReferralVolumeFiltered.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-[11px] text-[#6b7280] mb-2">
              Simple earnings distribution (demo): মোট earnings কে চারটা টিয়ারে ভাগ করে দেখানো হচ্ছে।
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/70 px-2.5 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-emerald-800">Top 25%</span>
                  <span className="font-mono text-emerald-700">HIGH</span>
                </div>
                <div className="h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                  <div className="h-full w-4/5 bg-emerald-500"></div>
                </div>
              </div>
              <div className="rounded-xl border border-sky-200/60 bg-sky-50/70 px-2.5 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sky-800">Middle 50%</span>
                  <span className="font-mono text-sky-700">MED</span>
                </div>
                <div className="h-1.5 rounded-full bg-sky-100 overflow-hidden">
                  <div className="h-full w-2/3 bg-sky-500"></div>
                </div>
              </div>
              <div className="rounded-xl border border-amber-200/60 bg-amber-50/70 px-2.5 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-amber-800">Bottom 25%</span>
                  <span className="font-mono text-amber-700">LOW</span>
                </div>
                <div className="h-1.5 rounded-full bg-amber-100 overflow-hidden">
                  <div className="h-full w-1/3 bg-amber-500"></div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 px-2.5 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800">Inactive / zero</span>
                  <span className="font-mono text-slate-700">ZERO</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full w-1/6 bg-slate-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDashboardTab;
