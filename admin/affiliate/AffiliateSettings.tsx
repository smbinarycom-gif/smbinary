import React, { useEffect, useState } from 'react';

type CommissionTier = { id: string; name: string; type: 'percent'|'flat'; value: number };

type AffiliateSettings = {
  general: { currency: string; timezone: string; reportingWindowDays: number; fraudThreshold: number };
  commission: { defaultType: 'percent'|'flat'; tiers: CommissionTier[] };
  payouts: { methods: string[]; minPayout: number; schedule: 'weekly'|'monthly'|'manual' };
  tracking: { enableUTM: boolean; cookieDays: number; pixelSnippet: string };
  assets: { defaultBannerSizes: string[]; autoApproveAssets: boolean };
  notifications: { email: boolean; inApp: boolean; webhookUrl?: string };
  apiKeys: { id: string; key: string; createdAt: number }[];
  roles: { admin: boolean; editor: boolean; viewer: boolean };
  testMode: { enabled: boolean };
  locale: { defaultLanguage: string };
};

const defaultSettings: AffiliateSettings = {
  general: { currency: 'USD', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', reportingWindowDays: 30, fraudThreshold: 75 },
  commission: { defaultType: 'percent', tiers: [{ id: 't-1', name: 'Standard', type: 'percent', value: 10 }] },
  payouts: { methods: ['bank'], minPayout: 50, schedule: 'monthly' },
  tracking: { enableUTM: true, cookieDays: 30, pixelSnippet: '<script></script>' },
  assets: { defaultBannerSizes: ['300x250','728x90'], autoApproveAssets: false },
  notifications: { email: true, inApp: true, webhookUrl: '' },
  apiKeys: [],
  roles: { admin: true, editor: false, viewer: false },
  testMode: { enabled: false },
  locale: { defaultLanguage: 'en' }
};

const keyFor = 'affiliate_settings_v1';
const auditKey = 'affiliate_settings_audit';

const uid = (p='k') => p + '-' + Math.random().toString(36).slice(2,9);

const pushAudit = (action: string) => {
  try {
    const raw = localStorage.getItem(auditKey);
    const prev = raw ? JSON.parse(raw) : [];
    const entry = { ts: Date.now(), action };
    localStorage.setItem(auditKey, JSON.stringify([entry, ...prev].slice(0,500)));
  } catch {}
};

const AffiliateSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AffiliateSettings>(() => {
    try { const raw = localStorage.getItem(keyFor); return raw ? JSON.parse(raw) : defaultSettings; } catch { return defaultSettings; }
  });
  const [tab, setTab] = useState<'general'|'commission'|'payouts'|'tracking'|'assets'|'notifications'|'apikeys'|'importexport'|'roles'|'test'|'locale'|'audit'>('general');
  const [audit, setAudit] = useState<{ts:number;action:string}[]>(() => { try { const r = localStorage.getItem(auditKey); return r?JSON.parse(r):[] } catch { return [] } });

  useEffect(() => {
    // keep audit view in sync with localStorage (useful if other tabs update)
    const load = () => { try { const r = localStorage.getItem(auditKey); setAudit(r?JSON.parse(r):[]); } catch { setAudit([]); } };
    load();
    const onStorage = (e: StorageEvent) => { if (e.key === auditKey) load(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => { localStorage.setItem(keyFor, JSON.stringify(settings)); }, [settings]);

  const save = (patch: Partial<AffiliateSettings>, note?: string) => {
    setSettings(prev => { const next = { ...prev, ...patch } as AffiliateSettings; pushAudit('Updated settings: ' + (note || 'general')); return next; });
  };

  const addTier = () => {
    const t: CommissionTier = { id: uid('t'), name: 'New tier', type: 'percent', value: 5 };
    setSettings(prev => ({ ...prev, commission: { ...prev.commission, tiers: [t, ...prev.commission.tiers] } }));
    pushAudit('Added commission tier');
  };

  const updateTier = (id: string, patch: Partial<CommissionTier>) => {
    setSettings(prev => ({ ...prev, commission: { ...prev.commission, tiers: prev.commission.tiers.map(t=> t.id===id?{...t,...patch}:t) } }));
    pushAudit('Updated commission tier '+id);
  };

  const removeTier = (id: string) => {
    setSettings(prev => ({ ...prev, commission: { ...prev.commission, tiers: prev.commission.tiers.filter(t=>t.id!==id) } }));
    pushAudit('Removed commission tier '+id);
  };

  const genApiKey = () => {
    const key = Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);
    const id = uid('k');
    const rec = { id, key, createdAt: Date.now() };
    setSettings(prev => ({ ...prev, apiKeys: [rec, ...prev.apiKeys] }));
    pushAudit('Generated API key '+id);
  };

  const revokeApiKey = (id: string) => {
    setSettings(prev => ({ ...prev, apiKeys: prev.apiKeys.filter(k=>k.id!==id) }));
    pushAudit('Revoked API key '+id);
  };

  const exportSettings = () => {
    const b = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(b); const a = document.createElement('a'); a.href = url; a.download = 'affiliate-settings.json'; a.click(); URL.revokeObjectURL(url);
    pushAudit('Exported settings');
  };

  const importSettings = (file: File | null) => {
    if (!file) return; const reader = new FileReader();
    reader.onload = () => {
      try { const parsed = JSON.parse(String(reader.result)); setSettings(parsed); pushAudit('Imported settings from file'); } catch (e) { alert('Invalid JSON'); }
    };
    reader.readAsText(file);
  };

  const resetToDefaults = () => {
    if (!confirm('Reset affiliate settings to defaults?')) return; setSettings(defaultSettings); pushAudit('Reset settings to defaults');
  };

  return (
    <div className="rounded-lg border bg-white p-6 text-gray-800 shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Affiliate Settings</h1>
        <div className="flex items-center space-x-2">
          <button className="text-xs px-3 py-1 border rounded" onClick={resetToDefaults}>Reset</button>
          <button className="text-xs px-3 py-1 bg-blue-600 text-white rounded" onClick={exportSettings}>Export</button>
        </div>
      </div>

      <div className="flex space-x-4">
          <div className="w-56">
          <div className="space-y-1 text-xs text-gray-500 mb-2">Sections</div>
          <div className="bg-gray-50 p-2 rounded space-y-1">
            {['general','commission','payouts','tracking','assets','notifications','apikeys','importexport','roles','test','locale','audit'].map(s=> (
              <button key={s} onClick={()=>setTab(s as any)} className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center space-x-2 ${tab===s? 'bg-white font-medium border-l-4 border-blue-500' : 'hover:bg-white'}`}>
                <span className="text-sm">{s.charAt(0).toUpperCase()+s.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {tab==='general' && (
            <div>
              <h3 className="font-semibold mb-2">General</h3>
              <p className="text-xs text-gray-500 mb-3">সাইট-স্তরের মূল সেটিংস: মুদ্রা, টাইমজোন এবং রিপোর্টিং সীমা কনফিগার করুন।</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs">Currency</label>
                  <input className="w-full border rounded px-2 py-1" value={settings.general.currency} onChange={e=> setSettings(s=> ({...s, general:{...s.general, currency: e.target.value}}))} />
                </div>
                <div>
                  <label className="text-xs">Timezone</label>
                  <input className="w-full border rounded px-2 py-1" value={settings.general.timezone} onChange={e=> setSettings(s=> ({...s, general:{...s.general, timezone: e.target.value}}))} />
                </div>
                <div>
                  <label className="text-xs">Reporting window (days)</label>
                  <input type="number" className="w-full border rounded px-2 py-1" value={settings.general.reportingWindowDays} onChange={e=> setSettings(s=> ({...s, general:{...s.general, reportingWindowDays: Number(e.target.value)||0}}))} />
                </div>
                <div>
                  <label className="text-xs">Fraud threshold (score)</label>
                  <input type="number" className="w-full border rounded px-2 py-1" value={settings.general.fraudThreshold} onChange={e=> setSettings(s=> ({...s, general:{...s.general, fraudThreshold: Number(e.target.value)||0}}))} />
                </div>
              </div>
              <div className="mt-3">
                <button className="px-4 py-2 bg-emerald-600 text-white rounded shadow" onClick={()=>{ pushAudit('Saved General settings'); localStorage.setItem(keyFor, JSON.stringify(settings)); alert('Saved'); }}>Save</button>
              </div>
            </div>
          )}

          {tab==='commission' && (
            <div>
              <p className="text-xs text-gray-500 mb-3">কমিশন টিয়ার এবং ডিফল্ট নীতিমালা এখানে নির্ধারণ করুন। ওভাররাইড নিয়ম প্রয়োগ করা যাবে।</p>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Commission Structure</h3>
                <div>
                  <button className="text-xs px-2 py-1 border rounded mr-2" onClick={addTier}>Add Tier</button>
                </div>
              </div>
              <div className="space-y-2">
                {settings.commission.tiers.map(t => (
                  <div key={t.id} className="border rounded p-2 flex items-center space-x-2">
                    <input className="border rounded px-2 py-1 w-40" value={t.name} onChange={e=> updateTier(t.id, { name: e.target.value })} />
                    <select className="border rounded px-2 py-1" value={t.type} onChange={e=> updateTier(t.id, { type: e.target.value as any })}>
                      <option value="percent">% percent</option>
                      <option value="flat">Flat</option>
                    </select>
                    <input type="number" className="border rounded px-2 py-1 w-24" value={t.value} onChange={e=> updateTier(t.id, { value: Number(e.target.value)||0 })} />
                    <button className="text-xs px-2 py-1 border rounded ml-auto" onClick={()=> removeTier(t.id)}>Remove</button>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <button className="px-4 py-2 bg-emerald-600 text-white rounded shadow" onClick={()=>{ pushAudit('Saved Commission settings'); localStorage.setItem(keyFor, JSON.stringify(settings)); alert('Saved'); }}>Save Commission</button>
              </div>
            </div>
          )}

          {tab==='payouts' && (
            <div>
              <p className="text-xs text-gray-500 mb-3">পে‑আউট পদ্ধতি, সর্বনিম্ন পে‑আউট ও শিডিউল কনফিগার করুন।</p>
              <h3 className="font-semibold mb-2">Payout Settings</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs">Methods (comma separated)</label>
                  <input className="w-full border rounded px-2 py-1" value={settings.payouts.methods.join(',')} onChange={e=> setSettings(s=> ({ ...s, payouts: { ...s.payouts, methods: e.target.value.split(',').map(x=>x.trim()).filter(Boolean) } }))} />
                </div>
                <div>
                  <label className="text-xs">Min payout</label>
                  <input type="number" className="w-full border rounded px-2 py-1" value={settings.payouts.minPayout} onChange={e=> setSettings(s=> ({...s, payouts: {...s.payouts, minPayout: Number(e.target.value)||0}}))} />
                </div>
                <div>
                  <label className="text-xs">Schedule</label>
                  <select className="w-full border rounded px-2 py-1" value={settings.payouts.schedule} onChange={e=> setSettings(s=> ({...s, payouts: {...s.payouts, schedule: e.target.value as any}}))}>
                    <option value="manual">Manual</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="mt-3"><button className="px-4 py-2 bg-emerald-600 text-white rounded shadow" onClick={()=>{ pushAudit('Saved Payout settings'); localStorage.setItem(keyFor, JSON.stringify(settings)); alert('Saved'); }}>Save Payouts</button></div>
            </div>
          )}

          {tab==='tracking' && (
            <div>
              <p className="text-xs text-gray-500 mb-3">UTM, কুকি লাইফটাইম এবং ট্র্যাকিং পিক্সেল এখানে কনফিগার করুন।</p>
              <h3 className="font-semibold mb-2">Tracking & Referral</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs">Enable UTM</label>
                  <select className="w-full border rounded px-2 py-1" value={String(settings.tracking.enableUTM)} onChange={e=> setSettings(s=> ({...s, tracking: {...s.tracking, enableUTM: e.target.value==='true'}}))}>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs">Cookie lifetime (days)</label>
                  <input type="number" className="w-full border rounded px-2 py-1" value={settings.tracking.cookieDays} onChange={e=> setSettings(s=> ({...s, tracking: {...s.tracking, cookieDays: Number(e.target.value)||0}}))} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs">Pixel / JS Snippet</label>
                  <textarea className="w-full border rounded px-2 py-1 h-28" value={settings.tracking.pixelSnippet} onChange={e=> setSettings(s=> ({...s, tracking: {...s.tracking, pixelSnippet: e.target.value}}))} />
                </div>
              </div>
              <div className="mt-3"><button className="px-4 py-2 bg-emerald-600 text-white rounded shadow" onClick={()=>{ pushAudit('Saved Tracking settings'); localStorage.setItem(keyFor, JSON.stringify(settings)); alert('Saved'); }}>Save Tracking</button></div>
            </div>
          )}

          {tab==='assets' && (
            <div>
              <p className="text-xs text-gray-500 mb-3">ক্রিয়েটিভ ডিফল্ট সাইজ এবং অটোমেটিক অনুমোদন নিয়ম কনফিগার করুন।</p>
              <h3 className="font-semibold mb-2">Assets & Creatives</h3>
              <div>
                <label className="text-xs">Default banner sizes (comma)</label>
                <input className="w-full border rounded px-2 py-1" value={settings.assets.defaultBannerSizes.join(',')} onChange={e=> setSettings(s=> ({...s, assets: {...s.assets, defaultBannerSizes: e.target.value.split(',').map(x=>x.trim()).filter(Boolean)}}))} />
              </div>
              <div className="mt-2">
                <label className="inline-flex items-center"><input type="checkbox" checked={settings.assets.autoApproveAssets} onChange={e=> setSettings(s=> ({...s, assets: {...s.assets, autoApproveAssets: e.target.checked}}))} className="mr-2"/>Auto-approve assets</label>
              </div>
              <div className="mt-3"><button className="px-4 py-2 bg-emerald-600 text-white rounded shadow" onClick={()=>{ pushAudit('Saved Assets settings'); localStorage.setItem(keyFor, JSON.stringify(settings)); alert('Saved'); }}>Save Assets</button></div>
            </div>
          )}

          {tab==='notifications' && (
            <div>
              <p className="text-xs text-gray-500 mb-3">নোটিফিকেশন চ্যানেল এবং ওয়েবহুক কনফিগারেশন।</p>
              <h3 className="font-semibold mb-2">Notifications</h3>
              <div className="space-y-2 text-sm">
                <label className="inline-flex items-center"><input type="checkbox" checked={settings.notifications.email} onChange={e=> setSettings(s=> ({...s, notifications: {...s.notifications, email: e.target.checked}}))} className="mr-2"/>Email</label>
                <label className="inline-flex items-center"><input type="checkbox" checked={settings.notifications.inApp} onChange={e=> setSettings(s=> ({...s, notifications: {...s.notifications, inApp: e.target.checked}}))} className="mr-2"/>In-app</label>
                <div>
                  <label className="text-xs">Webhook URL</label>
                  <input className="w-full border rounded px-2 py-1" value={settings.notifications.webhookUrl} onChange={e=> setSettings(s=> ({...s, notifications: {...s.notifications, webhookUrl: e.target.value}}))} />
                </div>
              </div>
              <div className="mt-3"><button className="px-4 py-2 bg-emerald-600 text-white rounded shadow" onClick={()=>{ pushAudit('Saved Notification settings'); localStorage.setItem(keyFor, JSON.stringify(settings)); alert('Saved'); }}>Save Notifications</button></div>
            </div>
          )}

          {tab==='apikeys' && (
            <div>
              <p className="text-xs text-gray-500 mb-3">API কী জেনারেট করুন এবং প্রয়োজনমতো রিভোক করুন।</p>
              <h3 className="font-semibold mb-2">API Keys</h3>
              <div className="mb-2"><button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={genApiKey}>Generate Key</button></div>
              <div className="space-y-2 text-sm">
                {settings.apiKeys.map(k=> (
                  <div key={k.id} className="flex items-center justify-between border rounded p-2">
                    <div className="truncate">{k.key}</div>
                    <div className="text-xs text-gray-500">{new Date(k.createdAt).toLocaleString()}</div>
                    <div><button className="text-xs px-2 py-1 border rounded" onClick={()=> revokeApiKey(k.id)}>Revoke</button></div>
                  </div>
                ))}
                {settings.apiKeys.length===0 && <div className="text-gray-400">No API keys yet.</div>}
              </div>
            </div>
          )}

          {tab==='importexport' && (
            <div>
              <p className="text-xs text-gray-500 mb-3">সেটিংস ইম্পোর্ট/এক্সপোর্ট করুন — ব্যাকআপ হিসেবে ব্যবহার করবেন।</p>
              <h3 className="font-semibold mb-2">Import / Export</h3>
              <div className="flex items-center space-x-2">
                <input type="file" accept="application/json" onChange={e=> importSettings(e.target.files ? e.target.files[0] : null)} />
                <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={exportSettings}>Export JSON</button>
              </div>
            </div>
          )}

          {tab==='roles' && (
            <div>
              <p className="text-xs text-gray-500 mb-3">রোল ভিত্তিক অ্যাক্সেস নিয়ন্ত্রণ কনফিগার করুন।</p>
              <h3 className="font-semibold mb-2">Role-based Access</h3>
              <div className="space-y-2">
                <label className="inline-flex items-center"><input type="checkbox" checked={settings.roles.admin} onChange={e=> setSettings(s=> ({...s, roles: {...s.roles, admin: e.target.checked}}))} className="mr-2"/>Admin</label>
                <label className="inline-flex items-center"><input type="checkbox" checked={settings.roles.editor} onChange={e=> setSettings(s=> ({...s, roles: {...s.roles, editor: e.target.checked}}))} className="mr-2"/>Editor</label>
                <label className="inline-flex items-center"><input type="checkbox" checked={settings.roles.viewer} onChange={e=> setSettings(s=> ({...s, roles: {...s.roles, viewer: e.target.checked}}))} className="mr-2"/>Viewer</label>
              </div>
              <div className="mt-3"><button className="px-3 py-1 bg-emerald-600 text-white rounded" onClick={()=>{ pushAudit('Saved Roles settings'); localStorage.setItem(keyFor, JSON.stringify(settings)); alert('Saved'); }}>Save Roles</button></div>
            </div>
          )}

          {tab==='test' && (
            <div>
              <p className="text-xs text-gray-500 mb-3">টেস্ট মোড চালু করলে অ্যাকশনগুলো dry-run হবে, প্রোডাকশনে পরিবর্তন হবে না।</p>
              <h3 className="font-semibold mb-2">Test Mode</h3>
              <label className="inline-flex items-center"><input type="checkbox" checked={settings.testMode.enabled} onChange={e=> setSettings(s=> ({...s, testMode: { enabled: e.target.checked }}))} className="mr-2"/>Enable test mode (dry-run)</label>
              <div className="mt-3"><button className="px-3 py-1 bg-amber-600 text-white rounded" onClick={()=> alert('Simulate: ' + (settings.testMode.enabled ? 'Running simulation...' : 'Enable test mode first'))}>Run Simulation</button></div>
            </div>
          )}

          {tab==='locale' && (
            <div>
              <p className="text-xs text-gray-500 mb-3">ডিফল্ট ভাষা নির্বাচন করুন — রেজিওনাল কনফিগারেশন।</p>
              <h3 className="font-semibold mb-2">Localization</h3>
              <label className="text-xs">Default language</label>
              <input className="w-40 border rounded px-2 py-1" value={settings.locale.defaultLanguage} onChange={e=> setSettings(s=> ({...s, locale: {...s.locale, defaultLanguage: e.target.value}}))} />
            </div>
          )}

          {tab==='audit' && (
            <div>
              <p className="text-xs text-gray-500 mb-3">সেটিংস পরিবর্তনের ইতিহাস এখানে দেখা যাবে।</p>
              <h3 className="font-semibold mb-2">Audit Logs</h3>
              <div className="text-xs max-h-64 overflow-y-auto bg-gray-50 p-2 rounded">
                {(audit.length===0) && <div className="text-gray-400">No audit entries.</div>}
                {audit.map((a,i)=> (
                  <div key={i} className="mb-2">
                    <div className="text-xs text-gray-500">{new Date(a.ts).toLocaleString()}</div>
                    <div>{a.action}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AffiliateSettingsPage;
