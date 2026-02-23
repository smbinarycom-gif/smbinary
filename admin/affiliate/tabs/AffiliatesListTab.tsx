import React, { useMemo, useState } from 'react';
import type { User, AdminThemeSettings } from '../../../shared/types.ts';
import { useAffiliateAnalytics } from '../useAffiliateAnalytics.ts';

interface AffiliatesListTabProps {
  users: User[];
  setUsers: (users: User[]) => void;
  theme?: AdminThemeSettings;
}

const AffiliatesListTab: React.FC<AffiliatesListTabProps> = ({ users, setUsers, theme }) => {
  const isLight = theme?.mode === 'LIGHT';

  const { affiliateUsers, aggregateStats } = useAffiliateAnalytics(users);

  const [search, setSearch] = useState('');
  const [risk, setRisk] = useState<string>('ALL');
  const [country, setCountry] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'REFERRALS' | 'VOLUME' | 'DEPOSITS'>('REFERRALS');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState<string>('');
  const [editError, setEditError] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  const riskOptions = useMemo(
    () => Array.from(new Set(affiliateUsers.map((u) => u.riskLabel))).filter(Boolean).sort(),
    [affiliateUsers]
  );

  const countryOptions = useMemo(
    () => Array.from(new Set(affiliateUsers.map((u) => u.country))).filter(Boolean).sort(),
    [affiliateUsers]
  );

  const statsById = useMemo(() => {
    const map: Record<string, (typeof aggregateStats)[number]> = {};
    aggregateStats.forEach((s) => {
      map[s.affiliateId] = s;
    });
    return map;
  }, [aggregateStats]);

  const filteredAffiliates = useMemo(() => {
    let base = [...affiliateUsers];

    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.referralCode && u.referralCode.toLowerCase().includes(q))
      );
    }

    if (risk !== 'ALL') {
      base = base.filter((u) => u.riskLabel === risk);
    }

    if (country !== 'ALL') {
      base = base.filter((u) => u.country === country);
    }

    base.sort((a, b) => {
      const sa = statsById[a.id];
      const sb = statsById[b.id];
      if (!sa || !sb) return 0;
      if (sortBy === 'REFERRALS') return sb.referrals - sa.referrals;
      if (sortBy === 'VOLUME') return sb.referredVolume - sa.referredVolume;
      return sb.referredDeposits - sa.referredDeposits;
    });

    return base;
  }, [affiliateUsers, search, risk, country, sortBy, statsById]);

  const selectedUser = selectedId ? affiliateUsers.find((u) => u.id === selectedId) || null : null;
  const selectedStats = selectedUser ? statsById[selectedUser.id] : undefined;

  // Edit referral code logic
  const handleEditStart = () => {
    setEditCode(selectedUser?.referralCode || '');
    setEditError('');
    setIsEditing(true);
  };

  const handleEditSave = () => {
    const code = editCode.trim();
    if (!code) {
      setEditError('রেফার কোড ফাঁকা রাখা যাবে না');
      return;
    }
    // ইউনিক চেক
    const exists = affiliateUsers.some(
      (u) => u.referralCode && u.referralCode.toLowerCase() === code.toLowerCase() && u.id !== selectedUser?.id
    );
    if (exists) {
      setEditError('এই কোডটি ইতিমধ্যে অন্য একজন ব্যবহার করছে');
      return;
    }
    // Save
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser?.id ? { ...u, referralCode: code } : u
      )
    );
    setIsEditing(false);
    setEditError('');
  };

  const downlinesByUpline = useMemo(() => {
    const map: Record<string, User[]> = {};
    users.forEach((u) => {
      if (!u.uplineId) return;
      if (!map[u.uplineId]) map[u.uplineId] = [];
      map[u.uplineId].push(u);
    });
    return map;
  }, [users]);

  const drawerBg = isLight ? '#ffffff' : '#020617';
  const drawerBorder = isLight ? '#e5e7eb' : '#1f2933';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className={`text-sm font-bold ${isLight ? 'text-[#111827]' : 'text-white'}`}>
            Affiliates List
          </h1>
          <p className="text-xs text-[#6b7280]">
            সম্পূর্ণ ডাইনামিক ভিউ: পারফরম্যান্স অনুযায়ী sort, country/risk ফিল্টার এবং ডান পাশে ডিটেইলস ড্রয়ার।
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#6b7280]">
          <span>Total: {affiliateUsers.length}</span>
          <span className="w-1 h-1 rounded-full bg-[#d1d5db]"></span>
          <span>Showing: {filteredAffiliates.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div
        className={`rounded-2xl border px-3 py-2.5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between ${
          isLight ? 'bg-white' : 'bg-[#111827]'
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
              placeholder="অ্যাফিলিয়েট নাম, ইমেইল বা রেফারেল কোড..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border focus:outline-none ${
                isLight
                  ? 'bg-white border-[#e5e7eb] text-[#111827] focus:border-[#2563eb]'
                  : 'bg-[#020617] border-[#2b3139] text-white focus:border-[#fcd535]'
              }`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end text-[11px]">
          <div className="flex items-center gap-1">
            <span className="uppercase tracking-wide text-[#9ca3af] font-semibold">Risk</span>
            <select
              value={risk}
              onChange={(e) => setRisk(e.target.value)}
              className={`px-2 py-1 rounded-md border focus:outline-none ${
                isLight
                  ? 'bg-white border-[#e5e7eb] text-[#111827] focus:border-[#2563eb]'
                  : 'bg-[#020617] border-[#2b3139] text-white focus:border-[#fcd535]'
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

          <div className="flex items-center gap-1">
            <span className="uppercase tracking-wide text-[#9ca3af] font-semibold">Country</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={`px-2 py-1 rounded-md border focus:outline-none ${
                isLight
                  ? 'bg-white border-[#e5e7eb] text-[#111827] focus:border-[#2563eb]'
                  : 'bg-[#020617] border-[#2b3139] text-white focus:border-[#fcd535]'
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

          <div className="flex items-center gap-1">
            <span className="uppercase tracking-wide text-[#9ca3af] font-semibold">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`px-2 py-1 rounded-md border focus:outline-none ${
                isLight
                  ? 'bg-white border-[#e5e7eb] text-[#111827] focus:border-[#2563eb]'
                  : 'bg-[#020617] border-[#2b3139] text-white focus:border-[#fcd535]'
              }`}
            >
              <option value="REFERRALS">Referrals</option>
              <option value="VOLUME">Volume</option>
              <option value="DEPOSITS">Deposits</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main table */}
        <div
          className="xl:col-span-2 overflow-x-auto rounded-2xl border"
          style={{ borderColor: isLight ? '#e5e7eb' : '#2b3139' }}
        >
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase font-semibold bg-[#f9fafb] text-[#6b7280]">
              <tr>
                <th className="px-4 py-2.5">Affiliate</th>
                <th className="px-4 py-2.5">Risk</th>
                <th className="px-4 py-2.5">Country</th>
                <th className="px-4 py-2.5 text-right">Referrals</th>
                <th className="px-4 py-2.5 text-right">Volume</th>
                <th className="px-4 py-2.5 text-right">Deposits</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: isLight ? '#e5e7eb' : '#2b3139' }}>
              {filteredAffiliates.map((u) => {
                const s = statsById[u.id];
                const isSelected = selectedId === u.id;
                return (
                  <tr
                    key={u.id}
                    className={`${
                      isLight ? 'hover:bg-slate-50' : 'hover:bg-[#020617]'
                    } cursor-pointer transition`}
                    onClick={() => setSelectedId(u.id)}
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-semibold ${
                            isLight ? 'text-[#111827]' : 'text-white'
                          }`}
                        >
                          {u.name}
                        </span>
                        <span className="text-xs text-[#6b7280]">{u.email}</span>
                        <span className="text-[10px] font-mono text-[#9ca3af]">
                          Code: {u.referralCode || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-[10px]">
                      <span
                        className={`inline-flex items-center px-2 py-[2px] rounded-full font-semibold border ${
                          u.riskLabel === 'VIP'
                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                            : u.riskLabel === 'HIGH_RISK'
                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                            : u.riskLabel === 'WHALE'
                            ? 'bg-amber-50 text-amber-800 border-amber-100'
                            : 'bg-slate-50 text-slate-700 border-slate-100'
                        }`}
                      >
                        {u.riskLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-[#4b5563]">{u.country}</td>
                    <td className="px-4 py-3 align-top text-right text-sm font-semibold text-[#111827]">
                      {s ? s.referrals : 0}
                    </td>
                    <td className="px-4 py-3 align-top text-right text-sm font-mono text-emerald-700">
                      ${s ? s.referredVolume.toFixed(2) : '0.00'}
                    </td>
                    <td className="px-4 py-3 align-top text-right text-sm font-mono text-sky-700">
                      ${s ? s.referredDeposits.toFixed(2) : '0.00'}
                    </td>
                  </tr>
                );
              })}
              {filteredAffiliates.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-xs text-[#9ca3af]">
                    No affiliates match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail drawer */}
        <div
          className="rounded-2xl border px-4 py-3 space-y-3 min-h-[220px]"
          style={{ backgroundColor: drawerBg, borderColor: drawerBorder }}
        >
          {!selectedUser ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-xs text-[#9ca3af]">
              <i className="fa-solid fa-circle-info mb-2 text-[18px]"></i>
              <p>ডান পাশে ডিটেইলস দেখতে টেবিল থেকে একজন অ্যাফিলিয়েট সিলেক্ট করুন।</p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className={`text-sm font-bold ${isLight ? 'text-[#111827]' : 'text-white'}`}>
                    {selectedUser.name}
                  </h2>
                  <p className="text-[11px] text-[#6b7280]">{selectedUser.email}</p>
                  <p className="text-[10px] text-[#9ca3af] font-mono mt-0.5">
                    ID: {selectedUser.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-[#9ca3af] hover:text-[#f87171] text-xs"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {/* Edit referral code */}
              <div className="mt-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold">Referral Code:</span>
                  {!isEditing ? (
                    <>
                      <span className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded">
                        {selectedUser.referralCode || <span className="text-[#9ca3af]">(none)</span>}
                      </span>
                      <button
                        onClick={handleEditStart}
                        className="ml-2 px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100"
                      >
                        Edit
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value)}
                        className="text-[11px] font-mono px-2 py-0.5 rounded border border-blue-200 focus:outline-none focus:border-blue-500"
                        style={{ minWidth: 90 }}
                        maxLength={24}
                      />
                      <button
                        onClick={handleEditSave}
                        className="ml-2 px-2 py-0.5 text-xs rounded bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setIsEditing(false); setEditError(''); }}
                        className="ml-1 px-2 py-0.5 text-xs rounded bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      {editError && (
                        <span className="ml-2 text-xs text-red-500">{editError}</span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-2.5 py-2">
                  <p className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wide mb-0.5">
                    Referrals
                  </p>
                  <p className="text-sm font-mono font-bold text-emerald-700">
                    {selectedStats ? selectedStats.referrals : 0}
                  </p>
                </div>
                <div className="rounded-xl border border-sky-100 bg-sky-50/70 px-2.5 py-2">
                  <p className="text-[10px] text-sky-800 font-semibold uppercase tracking-wide mb-0.5">
                    Volume
                  </p>
                  <p className="text-sm font-mono font-bold text-sky-700">
                    ${selectedStats ? selectedStats.referredVolume.toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-2.5 py-2">
                  <p className="text-[10px] text-amber-800 font-semibold uppercase tracking-wide mb-0.5">
                    Deposits
                  </p>
                  <p className="text-sm font-mono font-bold text-amber-700">
                    ${selectedStats ? selectedStats.referredDeposits.toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                  <p className="text-[10px] text-slate-700 font-semibold uppercase tracking-wide mb-0.5">
                    Status
                  </p>
                  <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedUser.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    ></span>
                    {selectedUser.status}
                  </p>
                </div>
              </div>

              <div className="mt-2">
                <p className="text-[11px] font-semibold mb-1 flex items-center gap-1">
                  <i className="fa-solid fa-network-wired text-[10px]"></i>
                  Referral tree (Level 1)
                </p>
                <div className="rounded-xl border border-dashed border-[#e5e7eb] px-2.5 py-2 max-h-32 overflow-y-auto custom-scrollbar">
                  {downlinesByUpline[selectedUser.id]?.length ? (
                    <ul className="space-y-1 text-[11px]">
                      {downlinesByUpline[selectedUser.id].map((dl) => (
                        <li key={dl.id} className="flex items-center justify-between gap-2">
                          <span className="truncate">
                            {dl.name}{' '}
                            <span className="text-[10px] text-[#9ca3af]">({dl.email})</span>
                          </span>
                          <span className="text-[10px] font-mono text-[#4b5563]">
                            Vol: ${dl.totalTurnover.toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-[#9ca3af]">এখনো কোনো ডাউনলাইন নেই।</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AffiliatesListTab;
