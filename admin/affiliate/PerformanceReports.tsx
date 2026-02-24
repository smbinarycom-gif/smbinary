import React, { useMemo, useState, useEffect } from 'react';

type PerfRow = {
  id: string;
  date: number;
  affiliateId: string;
  affiliateName: string;
  campaign: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
};

const demoRows: PerfRow[] = (() => {
  const now = Date.now();
  const rows: PerfRow[] = [];
  const affs = [
    { id: 'u1', name: 'Alice' },
    { id: 'u2', name: 'Bob' },
    { id: 'u3', name: 'Charlie' },
  ];
  for (let d = 0; d < 30; d++) {
    const day = now - d * 24 * 60 * 60 * 1000;
    for (const a of affs) {
      const im = Math.round(200 + Math.random() * 800);
      const cl = Math.round(im * (0.02 + Math.random() * 0.05));
      const conv = Math.round(cl * (0.03 + Math.random() * 0.08));
      const rev = +(conv * (5 + Math.random() * 45)).toFixed(2);
      rows.push({ id: `${a.id}-${d}`, date: day, affiliateId: a.id, affiliateName: a.name, campaign: (d % 2 === 0) ? 'Spring' : 'Evergreen', impressions: im, clicks: cl, conversions: conv, revenue: rev });
    }
  }
  return rows;
})();

const fmtDate = (ts: number) => new Date(ts).toLocaleDateString();

const PerformanceReports: React.FC = () => {
  const [rows, setRows] = useState<PerfRow[]>(() => {
    try { const raw = localStorage.getItem('perf_rows'); if (raw) return JSON.parse(raw) as PerfRow[]; } catch(e) {}
    return demoRows;
  });
  const [from, setFrom] = useState<string>(() => {
    const d = new Date(Date.now() - 1000 * 60 * 60 * 24 * 29);
    return d.toISOString().slice(0,10);
  });
  const [to, setTo] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [affiliateFilter, setAffiliateFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [savedViews, setSavedViews] = useState<{name:string, affiliate:string, from:string, to:string}[]>(() => { try { return JSON.parse(localStorage.getItem('perf_views')||'[]'); } catch(e){return [];} });
  const [auditLogs, setAuditLogs] = useState<{ts:number; action:string;}[]>([]);

  useEffect(() => { try { localStorage.setItem('perf_rows', JSON.stringify(rows)); } catch(e){} }, [rows]);
  useEffect(() => { try { localStorage.setItem('perf_views', JSON.stringify(savedViews)); } catch(e){} }, [savedViews]);

  const pushLog = (action: string) => setAuditLogs(prev => [{ ts: Date.now(), action }, ...prev].slice(0,200));

  const filtered = useMemo(() => {
    const fFrom = new Date(from + 'T00:00:00').getTime();
    const fTo = new Date(to + 'T23:59:59').getTime();
    return rows.filter(r => r.date >= fFrom && r.date <= fTo && (!affiliateFilter || r.affiliateId === affiliateFilter) && (search === '' || r.affiliateName.toLowerCase().includes(search.toLowerCase()) || r.campaign.toLowerCase().includes(search.toLowerCase())));
  }, [rows, from, to, affiliateFilter, search]);

  const totals = useMemo(() => {
    return filtered.reduce((acc, r) => {
      acc.impressions += r.impressions;
      acc.clicks += r.clicks;
      acc.conversions += r.conversions;
      acc.revenue += r.revenue;
      return acc;
    }, { impressions: 0, clicks: 0, conversions: 0, revenue: 0 } as any);
  }, [filtered]);

  const timeseries = useMemo(() => {
    const map = new Map<number, {impressions:number, clicks:number, conversions:number, revenue:number}>();
    filtered.forEach(r => {
      const day = new Date(new Date(r.date).toDateString()).getTime();
      const cur = map.get(day) || {impressions:0,clicks:0,conversions:0,revenue:0};
      cur.impressions += r.impressions; cur.clicks += r.clicks; cur.conversions += r.conversions; cur.revenue += r.revenue;
      map.set(day, cur);
    });
    return Array.from(map.entries()).sort((a,b)=>a[0]-b[0]).map(([d,v]) => ({d, ...v}));
  }, [filtered]);

  const exportCSV = (list: PerfRow[]) => {
    const header = ['date','affiliateId','affiliateName','campaign','impressions','clicks','conversions','revenue'];
    const lines = [header.join(',')];
    list.forEach(r => lines.push([new Date(r.date).toISOString(), r.affiliateId, `"${r.affiliateName}"`, r.campaign, String(r.impressions), String(r.clicks), String(r.conversions), String(r.revenue)].join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'performance.csv'; a.click(); URL.revokeObjectURL(url);
    pushLog('Exported CSV');
  };

  const saveView = (name: string) => { setSavedViews(prev => [{name, affiliate: affiliateFilter, from, to}, ...prev]); pushLog('Saved view '+name); };

  return (
    <div className="rounded-lg border bg-white p-6 text-gray-800 shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Performance Reports</h1>
        <div className="text-sm text-gray-600">Summary & drilldowns for affiliate campaigns</div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="p-3 border rounded bg-blue-50">
          <div className="text-xs text-gray-600">Impressions</div>
          <div className="text-lg font-semibold">{totals.impressions.toLocaleString()}</div>
        </div>
        <div className="p-3 border rounded bg-yellow-50">
          <div className="text-xs text-gray-600">Clicks</div>
          <div className="text-lg font-semibold">{totals.clicks.toLocaleString()}</div>
        </div>
        <div className="p-3 border rounded bg-emerald-50">
          <div className="text-xs text-gray-600">Conversions</div>
          <div className="text-lg font-semibold">{totals.conversions.toLocaleString()}</div>
        </div>
        <div className="p-3 border rounded bg-gray-50">
          <div className="text-xs text-gray-600">Revenue</div>
          <div className="text-lg font-semibold">${totals.revenue.toFixed(2)}</div>
        </div>
      </div>

      <div className="flex items-center space-x-3 mb-4">
        <label className="text-xs">From <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="ml-2 border rounded px-2 py-1 text-sm" /></label>
        <label className="text-xs">To <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="ml-2 border rounded px-2 py-1 text-sm" /></label>
        <select value={affiliateFilter} onChange={e=>setAffiliateFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="">All Affiliates</option>
          <option value="u1">Alice</option>
          <option value="u2">Bob</option>
          <option value="u3">Charlie</option>
        </select>
        <input placeholder="Search campaign or affiliate" className="border rounded px-2 py-1 text-sm flex-1" value={search} onChange={e=>setSearch(e.target.value)} />
        <button className="text-xs px-3 py-1 border rounded" onClick={()=>exportCSV(filtered)}>Export CSV</button>
        <button className="text-xs px-3 py-1 border rounded" onClick={()=>saveView('View '+(new Date()).toISOString())}>Save View</button>
      </div>

      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">Time-series (Impressions)</div>
        <div className="w-full h-40 bg-white border rounded p-2">
          {/* simple SVG sparkline */}
          <svg width="100%" height="100%" viewBox="0 0 600 120" preserveAspectRatio="none">
            <polyline fill="none" stroke="#2563eb" strokeWidth={2} points={
              timeseries.map((t,i)=>{
                const x = i*(600/(Math.max(1,timeseries.length)-1||1));
                const max = Math.max(...timeseries.map(x=>x.impressions),1);
                const y = 120 - (t.impressions/max)*100 - 10;
                return `${x},${y}`;
              }).join(' ')
            } />
          </svg>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Drilldown</h3>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm bg-white">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="px-3 py-2 border-b">Date</th>
                <th className="px-3 py-2 border-b">Affiliate</th>
                <th className="px-3 py-2 border-b">Campaign</th>
                <th className="px-3 py-2 border-b">Impr.</th>
                <th className="px-3 py-2 border-b">Clicks</th>
                <th className="px-3 py-2 border-b">Conv.</th>
                <th className="px-3 py-2 border-b">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0,200).map(r=> (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border-b">{fmtDate(r.date)}</td>
                  <td className="px-3 py-2 border-b">{r.affiliateName}</td>
                  <td className="px-3 py-2 border-b">{r.campaign}</td>
                  <td className="px-3 py-2 border-b">{r.impressions}</td>
                  <td className="px-3 py-2 border-b">{r.clicks}</td>
                  <td className="px-3 py-2 border-b">{r.conversions}</td>
                  <td className="px-3 py-2 border-b">${r.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Saved Views</h3>
        <div className="flex space-x-2 mb-4">
          {savedViews.map((v,i)=>(<button key={i} className="text-xs px-3 py-1 border rounded" onClick={()=>{ setAffiliateFilter(v.affiliate); setFrom(v.from); setTo(v.to); pushLog('Loaded view '+v.name);}}>{v.name}</button>))}
        </div>
        <h3 className="font-semibold mb-2">Audit Logs</h3>
        <div className="max-h-32 overflow-y-auto text-xs border rounded p-2 bg-gray-50">
          {auditLogs.length===0 && <div className="text-gray-400">No logs yet.</div>}
          {auditLogs.map((a,i)=>(<div key={i} className="mb-1"><div className="text-xs text-gray-500">{new Date(a.ts).toLocaleString()}</div><div>{a.action}</div></div>))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceReports;
