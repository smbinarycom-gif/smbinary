import React, { useEffect, useMemo, useState } from 'react';

type CaseStatus = 'OPEN' | 'IN_REVIEW' | 'BLOCKED' | 'RESOLVED';
type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

type FraudCase = {
  id: string;
  userId: string;
  userName?: string;
  reason: string;
  createdAt: number;
  status: CaseStatus;
  severity: Severity;
  notes?: string[];
  evidence?: string[]; // URLs or text
};

type Rule = {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
};

const demoRules: Rule[] = [
  { id: 'r1', name: 'Velocity: > 5 payouts / hr', description: 'Flag many payout requests in short time', enabled: true },
  { id: 'r2', name: 'IP mismatch: country vs billing', description: 'Different geo than billing address', enabled: true },
  { id: 'r3', name: 'Multiple accounts same device', description: 'Device fingerprint used by several accounts', enabled: false },
];

const demoCases: FraudCase[] = [
  { id: 'c1', userId: 'u1', userName: 'Alice', reason: 'Multiple payout attempts', createdAt: Date.now() - 1000 * 60 * 60 * 6, status: 'OPEN', severity: 'HIGH', notes: ['Auto-flagged by rule r1'], evidence: [] },
  { id: 'c2', userId: 'u2', userName: 'Bob', reason: 'IP geo mismatch', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, status: 'IN_REVIEW', severity: 'MEDIUM', notes: ['Manual review started'], evidence: [] },
  { id: 'c3', userId: 'u3', userName: 'Charlie', reason: 'Multiple accounts', createdAt: Date.now() - 1000 * 60 * 60 * 48, status: 'RESOLVED', severity: 'LOW', notes: ['Resolved - false positive'], evidence: [] },
];

const fmt = (ts: number) => new Date(ts).toLocaleString();

const FraudDetection: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>(() => {
    try { const raw = localStorage.getItem('fraud_rules'); return raw ? JSON.parse(raw) : demoRules; } catch { return demoRules; }
  });
  const [cases, setCases] = useState<FraudCase[]>(() => {
    try { const raw = localStorage.getItem('fraud_cases'); return raw ? JSON.parse(raw) : demoCases; } catch { return demoCases; }
  });
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedCase, setSelectedCase] = useState<FraudCase | null>(null);
  const [auditLogs, setAuditLogs] = useState<{ ts: number; action: string; ids?: string[]; by?: string }[]>(() => {
    try { const raw = localStorage.getItem('fraud_audit'); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });
  const [schedules, setSchedules] = useState<{ id: string; name: string; freq: 'daily'|'weekly'|'monthly'; lastRun?: number }[]>(() => {
    try { const raw = localStorage.getItem('fraud_export_schedules'); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });
  const [newScheduleName, setNewScheduleName] = useState<string>('');
  const [newScheduleFreq, setNewScheduleFreq] = useState<'daily'|'weekly'|'monthly'>('daily');

  useEffect(() => { localStorage.setItem('fraud_rules', JSON.stringify(rules)); }, [rules]);
  useEffect(() => { localStorage.setItem('fraud_cases', JSON.stringify(cases)); }, [cases]);
  useEffect(() => { localStorage.setItem('fraud_audit', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('fraud_export_schedules', JSON.stringify(schedules)); }, [schedules]);

  const pushAudit = (action: string, ids?: string[]) => {
    const entry = { ts: Date.now(), action, ids, by: 'admin' };
    setAuditLogs(prev => [entry, ...prev].slice(0, 500));
  };

  const visible = useMemo(() => {
    return cases.filter(c => {
      if (filterStatus && c.status !== filterStatus) return false;
      if (filterSeverity && c.severity !== filterSeverity) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!c.userId.toLowerCase().includes(s) && !(c.userName || '').toLowerCase().includes(s) && !c.id.toLowerCase().includes(s) && !c.reason.toLowerCase().includes(s)) return false;
      }
      if (startDate) {
        const sd = new Date(startDate).setHours(0,0,0,0);
        if (c.createdAt < sd) return false;
      }
      if (endDate) {
        const ed = new Date(endDate).setHours(23,59,59,999);
        if (c.createdAt > ed) return false;
      }
      return true;
    }).sort((a,b) => b.createdAt - a.createdAt);
  }, [cases, filterStatus, filterSeverity, search, startDate, endDate]);

  const toggleRule = (id: string) => setRules(prev => { const next = prev.map(r => r.id===id?{...r, enabled: !r.enabled}:r); pushAudit('Toggle rule '+id, [id]); return next; });

  const updateCaseStatus = (id: string, status: CaseStatus) => {
    setCases(prev => prev.map(c => c.id===id?{...c, status}:c));
    pushAudit(`Case ${id} -> ${status}`, [id]);
  };

  const addNote = (id: string, note: string) => {
    setCases(prev => prev.map(c => c.id===id?{...c, notes: [...(c.notes||[]), note]}:c));
    pushAudit(`Note added to ${id}`, [id]);
  };


  const createCase = (c: Partial<FraudCase>) => {
    const id = 'c-' + Date.now();
    const nc: FraudCase = { id, userId: c.userId || 'unknown', userName: c.userName, reason: c.reason || 'Manual case', createdAt: Date.now(), status: 'OPEN', severity: c.severity || 'MEDIUM', notes: [], evidence: [] };
    setCases(prev => [nc, ...prev]);
    pushAudit('Created case '+id, [id]);
  };

  const exportCasesCSV = (list: FraudCase[], fileName = 'fraud-cases.csv') => {
    const hdr = ['id','userId','userName','reason','status','severity','createdAt','notes'];
    const lines = [hdr.join(',')];
    list.forEach(c => lines.push([
      c.id, c.userId, `"${(c.userName||'').replace(/"/g,'""') }"`, `"${c.reason.replace(/"/g,'""')}"`, c.status, c.severity, new Date(c.createdAt).toISOString(), `"${(c.notes||[]).join('|').replace(/"/g,'""')}"`
    ].join(',')));
    const blob = new Blob([lines.join('\n')], { type:'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = fileName; a.click(); URL.revokeObjectURL(url);
    pushAudit('Exported cases', list.map(l=>l.id));
  };

  const scheduleExport = (name: string, freq: 'daily'|'weekly'|'monthly') => {
    const id = 's-' + Date.now();
    const s = { id, name, freq };
    setSchedules(prev => [s, ...prev]);
    pushAudit(`Scheduled export ${name} (${freq})`, []);
  };

  const runScheduleNow = (id: string) => {
    const s = schedules.find(x=>x.id===id);
    if (!s) return; exportCasesCSV(visible, `fraud-cases-${s.id}.csv`);
    setSchedules(prev => prev.map(x=> x.id===id ? { ...x, lastRun: Date.now() } : x));
    pushAudit(`Ran schedule ${id} now`, []);
  };

  const CasesOverTime: React.FC<{cases: FraudCase[]}> = ({cases}) => {
    const msDay = 1000*60*60*24;
    const end = endDate ? new Date(endDate).setHours(23,59,59,999) : Date.now();
    const start = startDate ? new Date(startDate).setHours(0,0,0,0) : end - msDay*13; // default 14 days
    const days: {label:string; ts:number; count:number}[] = [];
    for (let t = start; t <= end; t += msDay) {
      days.push({ label: new Date(t).toLocaleDateString(), ts: t, count: 0 });
    }
    cases.forEach(c => {
      if (c.createdAt < start || c.createdAt > end) return;
      const dayStart = new Date(new Date(c.createdAt).setHours(0,0,0,0)).getTime();
      const d = days.find(x=>x.ts===dayStart);
      if (d) d.count++;
    });
    const max = Math.max(...days.map(d=>d.count), 1);
    const w = 220; const h = 60; const bw = Math.max(2, Math.floor(w / days.length) - 2);
    return (
      <div className="mb-3">
        <div className="text-xs text-gray-600">Cases Over Time</div>
        <svg width={w} height={h} className="block mt-2">
          {days.map((d,i) => {
            const x = i * (bw + 2);
            const barH = Math.round((d.count / max) * (h - 12));
            return <rect key={d.ts} x={x} y={h - barH} width={bw} height={barH} fill="#3B82F6" />;
          })}
        </svg>
        <div className="text-xs text-gray-500 mt-1">{days.reduce((s,a)=>s+a.count,0)} cases</div>
      </div>
    );
  };

  const SeverityBars: React.FC<{cases: FraudCase[]}> = ({cases}) => {
    const buckets: Record<Severity, number> = { LOW:0, MEDIUM:0, HIGH:0, CRITICAL:0 };
    cases.forEach(c=> buckets[c.severity]++);
    const max = Math.max(...Object.values(buckets), 1);
    return (
      <div className="mb-3">
        <div className="text-xs text-gray-600">Severity Distribution</div>
        {(['LOW','MEDIUM','HIGH','CRITICAL'] as Severity[]).map(s => (
          <div key={s} className="flex items-center text-xs mt-2">
            <div className="w-20 text-gray-700">{s}</div>
            <div className="flex-1 bg-gray-100 h-3 rounded overflow-hidden mr-2">
              <div style={{ width: `${(buckets[s]/max)*100}%` }} className={`h-3 ${s==='CRITICAL'?'bg-red-500': s==='HIGH'?'bg-orange-400': s==='MEDIUM'?'bg-yellow-400':'bg-green-400'}`} />
            </div>
            <div className="w-8 text-right text-gray-600">{buckets[s]}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-lg border bg-white p-6 text-gray-800 shadow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Fraud Detection</h1>
        <div className="flex items-center space-x-2">
          <button className="text-xs px-3 py-1 border rounded" onClick={() => exportCasesCSV(visible)}>Export Visible CSV</button>
          <button className="text-xs px-3 py-1 bg-blue-600 text-white rounded" onClick={() => createCase({ userId: 'test-'+Date.now(), userName: 'New User', reason: 'Manual flag' })}>New Case</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 border rounded bg-yellow-50">
          <div className="text-xs text-gray-600">Open Cases</div>
          <div className="text-lg font-semibold">{cases.filter(c=>c.status==='OPEN').length}</div>
        </div>
        <div className="p-4 border rounded bg-emerald-50">
          <div className="text-xs text-gray-600">In Review</div>
          <div className="text-lg font-semibold">{cases.filter(c=>c.status==='IN_REVIEW').length}</div>
        </div>
        <div className="p-4 border rounded bg-red-50">
          <div className="text-xs text-gray-600">Blocked</div>
          <div className="text-lg font-semibold">{cases.filter(c=>c.status==='BLOCKED').length}</div>
        </div>
        <div className="p-4 border rounded bg-gray-50">
          <div className="text-xs text-gray-600">Resolved</div>
          <div className="text-lg font-semibold">{cases.filter(c=>c.status==='RESOLVED').length}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-3 mb-4">
        <input placeholder="Search user, case id, reason" className="border rounded px-2 py-1 text-sm w-64" value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="border rounded px-2 py-1 text-sm" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="BLOCKED">Blocked</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <select className="border rounded px-2 py-1 text-sm" value={filterSeverity} onChange={e=>setFilterSeverity(e.target.value)}>
          <option value="">All Severity</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
        <div className="flex items-center space-x-2">
          <input type="date" className="border rounded px-2 py-1 text-sm" value={startDate} onChange={e=>setStartDate(e.target.value)} />
          <input type="date" className="border rounded px-2 py-1 text-sm" value={endDate} onChange={e=>setEndDate(e.target.value)} />
          <button className="text-xs px-2 py-1 border rounded" onClick={()=>{ setStartDate(''); setEndDate(''); }}>Clear</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
                  <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                    <table className="min-w-full text-sm bg-white">
                      <thead>
                        <tr className="bg-gray-50 text-gray-700">
                          <th className="px-3 py-2 border-b sticky top-0 bg-white z-10">Case</th>
                          <th className="px-3 py-2 border-b sticky top-0 bg-white z-10">User</th>
                          <th className="px-3 py-2 border-b sticky top-0 bg-white z-10">Severity</th>
                          <th className="px-3 py-2 border-b sticky top-0 bg-white z-10">Created</th>
                          <th className="px-3 py-2 border-b sticky top-0 bg-white z-10">Status</th>
                          <th className="px-3 py-2 border-b sticky top-0 bg-white z-10">Actions</th>
                        </tr>
                      </thead>
              <tbody>
                {visible.length===0 && <tr><td colSpan={6} className="text-center py-6 text-gray-400">No cases found.</td></tr>}
                {visible.map((c, idx)=> (
                  <tr key={c.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                    <td className="px-3 py-2 border-b">{c.id}<div className="text-xs text-gray-500">{c.reason}</div></td>
                    <td className="px-3 py-2 border-b">{c.userName || c.userId}</td>
                    <td className="px-3 py-2 border-b">{c.severity}</td>
                    <td className="px-3 py-2 border-b">{fmt(c.createdAt)}</td>
                    <td className="px-3 py-2 border-b">{c.status}</td>
                    <td className="px-3 py-2 border-b text-right">
                      <div className="flex justify-end space-x-2">
                        <button className="text-xs px-2 py-1 border rounded" onClick={()=>setSelectedCase(c)}>View</button>
                        <button className="text-xs px-2 py-1 bg-yellow-400 text-white rounded" onClick={()=>updateCaseStatus(c.id,'IN_REVIEW')}>Mark In Review</button>
                        <button className="text-xs px-2 py-1 bg-red-500 text-white rounded" onClick={()=>updateCaseStatus(c.id,'BLOCKED')}>Block</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-1">
          <div className="border rounded p-3 mb-3">
            <CasesOverTime cases={visible} />
            <SeverityBars cases={visible} />
          </div>

          <div className="border rounded p-3 mb-3">
            <h3 className="font-semibold mb-2">Scheduled Exports</h3>
            <div className="flex items-center space-x-2 mb-2">
              <input placeholder="Name" className="border rounded px-2 py-1 text-sm flex-1" value={newScheduleName} onChange={e=>setNewScheduleName(e.target.value)} />
              <select className="border rounded px-2 py-1 text-sm" value={newScheduleFreq} onChange={e=>setNewScheduleFreq(e.target.value as any)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <button className="text-xs px-3 py-1 bg-blue-600 text-white rounded" onClick={()=>{ scheduleExport(newScheduleName || `Export ${schedules.length+1}`, newScheduleFreq); setNewScheduleName(''); }}>Create</button>
            </div>
            <div className="text-xs">
              {schedules.length===0 && <div className="text-gray-400">No schedules.</div>}
              {schedules.map(s=> (
                <div key={s.id} className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-gray-500">{s.freq} {s.lastRun?`• last ${new Date(s.lastRun).toLocaleString()}`:''}</div>
                  </div>
                  <div>
                    <button className="text-xs px-2 py-1 border rounded mr-2" onClick={()=>runScheduleNow(s.id)}>Run now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded p-3 mb-3">
            <h3 className="font-semibold mb-2">Rules</h3>
            {rules.map(r=> (
              <div key={r.id} className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.description}</div>
                </div>
                <div>
                  <label className="inline-flex items-center"><input type="checkbox" checked={r.enabled} onChange={()=>toggleRule(r.id)} className="mr-2"/>Enable</label>
                </div>
              </div>
            ))}
          </div>

          <div className="border rounded p-3 mb-3">
            <h3 className="font-semibold mb-2">Audit Logs</h3>
            <div className="text-xs max-h-48 overflow-y-auto bg-gray-50 p-2 rounded">
              {auditLogs.length===0 && <div className="text-gray-400">No audit logs yet.</div>}
              {auditLogs.map((a,i)=> (
                <div key={i} className="mb-2">
                  <div className="text-xs text-gray-500">{new Date(a.ts).toLocaleString()}</div>
                  <div>{a.action}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedCase && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg w-2/5 p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Case {selectedCase.id}</h3>
              <div className="text-xs text-gray-500">{fmt(selectedCase.createdAt)}</div>
            </div>
            <div className="mb-3">
              <div className="text-xs text-gray-600">User</div>
              <div className="font-medium">{selectedCase.userName || selectedCase.userId}</div>
            </div>
            <div className="mb-3">
              <div className="text-xs text-gray-600">Reason</div>
              <div>{selectedCase.reason}</div>
            </div>
            <div className="mb-3">
              <div className="text-xs text-gray-600">Notes</div>
              <div className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
                {(selectedCase.notes || []).map((n, i) => <div key={i} className="text-sm mb-1">- {n}</div>)}
              </div>
              <div className="flex mt-2 space-x-2">
                <input placeholder="Add note" className="border rounded px-2 py-1 text-sm flex-1" id="note-input" />
                <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => {
                  const el = document.getElementById('note-input') as HTMLInputElement | null;
                  if (!el) return; const v = el.value.trim(); if (!v) return; addNote(selectedCase.id, v); el.value='';
                }}>Add</button>
              </div>
            </div>
            <div className="mt-4 text-right">
              <button className="px-3 py-1 border rounded mr-2" onClick={() => setSelectedCase(null)}>Close</button>
              <button className="px-3 py-1 bg-emerald-600 text-white rounded" onClick={() => { updateCaseStatus(selectedCase.id,'RESOLVED'); setSelectedCase(null); }}>Resolve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FraudDetection;
