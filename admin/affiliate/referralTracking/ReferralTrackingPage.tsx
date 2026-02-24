import React, { useMemo, useState } from 'react';

type Affiliate = {
  id: string;
  name: string;
  email?: string;
  blocked?: boolean;
};

type Metrics = {
  clicks: number;
  signups: number;
  conversions: number; // deposits or purchases
};

const demoAffiliates: Affiliate[] = [
  { id: 'u1', name: 'Alice Smith', email: 'alice@example.com' },
  { id: 'u2', name: 'Bob Lee', email: 'bob@example.com' },
  { id: 'u3', name: 'Charlie Kim', email: 'charlie@example.com' },
];

const demoMetrics: Record<string, Metrics> = {
  u1: { clicks: 1240, signups: 210, conversions: 95 },
  u2: { clicks: 680, signups: 78, conversions: 22 },
  u3: { clicks: 320, signups: 40, conversions: 8 },
};

const formatPercent = (num: number) => `${(num * 100).toFixed(1)}%`;

const ReferralTrackingPage: React.FC = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>(demoAffiliates);
  const [metrics] = useState<Record<string, Metrics>>(demoMetrics);
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const rows = useMemo(() => {
    return affiliates.map(a => {
      const m = metrics[a.id] || { clicks: 0, signups: 0, conversions: 0 };
      const signupRate = m.clicks ? m.signups / m.clicks : 0;
      const conversionRate = m.signups ? m.conversions / m.signups : 0;
      return { affiliate: a, metrics: m, signupRate, conversionRate };
    });
  }, [affiliates, metrics]);

  const copyLink = async (id: string) => {
    try {
      const link = `${window.location.origin.replace(/:\\d+$/, '') || window.location.origin}/ref/${id}`;
      await navigator.clipboard.writeText(link);
      setCopied(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, [id]: false })), 1500);
    } catch (e) {
      console.error('copy failed', e);
    }
  };

  const toggleBlock = (id: string) => {
    setAffiliates(prev => prev.map(a => a.id === id ? { ...a, blocked: !a.blocked } : a));
  };

  const downloadCSV = () => {
    const header = ['id', 'name', 'email', 'clicks', 'signups', 'conversions', 'signupRate', 'conversionRate'];
    const lines = [header.join(',')];
    rows.forEach(r => {
      const line = [
        r.affiliate.id,
        `"${r.affiliate.name}"`,
        r.affiliate.email || '',
        String(r.metrics.clicks),
        String(r.metrics.signups),
        String(r.metrics.conversions),
        formatPercent(r.signupRate),
        formatPercent(r.conversionRate),
      ].join(',');
      lines.push(line);
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'referral-metrics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg border bg-white p-6 text-gray-800 shadow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Referral Tracking</h1>
        <div className="space-x-2">
          <button onClick={downloadCSV} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Export CSV</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
        <table className="min-w-full text-sm bg-white">
          <thead>
            <tr className="bg-gradient-to-r from-purple-50 to-purple-100 text-gray-800">
              <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Affiliate</th>
              <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Referral Link</th>
              <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Clicks</th>
              <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Signups</th>
              <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Conversions</th>
              <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Signup %</th>
              <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Conv %</th>
              <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.affiliate.id} className="bg-white hover:bg-gray-50">
                <td className="border px-2 py-2">
                  <div className="font-medium">{r.affiliate.name}</div>
                  <div className="text-xs text-gray-500">{r.affiliate.email}</div>
                </td>
                <td className="border px-2 py-2">
                  <div className="flex items-center space-x-2">
                    <input readOnly value={`${window.location.origin.replace(/:\\d+$/, '') || window.location.origin}/ref/${r.affiliate.id}`} className="text-xs border rounded px-2 py-1 w-full bg-gray-50" />
                    <button onClick={() => copyLink(r.affiliate.id)} className="bg-slate-700 text-white px-2 py-1 rounded text-xs">
                      {copied[r.affiliate.id] ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </td>
                <td className="border px-2 py-2 text-center">{r.metrics.clicks}</td>
                <td className="border px-2 py-2 text-center">{r.metrics.signups}</td>
                <td className="border px-2 py-2 text-center">{r.metrics.conversions}</td>
                <td className="border px-2 py-2 text-center">{formatPercent(r.signupRate)}</td>
                <td className="border px-2 py-2 text-center">{formatPercent(r.conversionRate)}</td>
                <td className="border px-2 py-2 text-center">
                  <button onClick={() => toggleBlock(r.affiliate.id)} className={`px-2 py-1 rounded text-xs ${r.affiliate.blocked ? 'bg-red-500 text-white' : 'bg-yellow-400 text-white'}`}>
                    {r.affiliate.blocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-500">এই পেইজটি ডেমো ডেটা ব্যবহার করছে — বাস্তব ডেটা পেতে রিয়েল টাইম ট্র্যাকিং সার্ভিস সংযুক্ত করুন।</div>
    </div>
  );
};

export default ReferralTrackingPage;
