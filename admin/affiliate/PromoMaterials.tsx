import React, { useMemo, useState, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

type AssetStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

type AssetVariant = {
  id: string;
  language?: string;
  name: string;
  fileName?: string;
  dataUrl?: string;
};

type PromoAsset = {
  id: string;
  name: string;
  tags: string[];
  type: string; // image/video/html
  size?: number;
  uploadedAt: number;
  uploadedBy?: string;
  status: AssetStatus;
  versions: AssetVariant[];
  utmSample?: string;
  abGroup?: string | null;
  analytics?: { views: number; clicks: number; conversions: number };
};

const sampleTemplates = [
  { id: 'tpl1', name: 'Landing - Hero', description: 'Hero banner + CTA section' },
  { id: 'tpl2', name: 'Sidebar Banner', description: '300x600 ad block' },
  { id: 'tpl3', name: 'Email Header', description: 'Simple email header image' },
];

const demoAssets: PromoAsset[] = [
  {
    id: 'a1',
    name: 'Spring Sale Banner',
    tags: ['sale', 'spring'],
    type: 'image',
    size: 123456,
    uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    uploadedBy: 'alice',
    status: 'APPROVED',
    versions: [{ id: 'v1', name: 'Spring Sale Banner - en', language: 'en', fileName: 'spring-en.png' }],
    analytics: { views: 1245, clicks: 78, conversions: 9 },
  },
  {
    id: 'a2',
    name: 'Signup Popup',
    tags: ['popup', 'signup'],
    type: 'html',
    size: 54321,
    uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    uploadedBy: 'bob',
    status: 'PENDING',
    versions: [{ id: 'v1', name: 'Signup Popup - default', fileName: 'popup.html' }],
    analytics: { views: 4321, clicks: 210, conversions: 36 },
  },
];

const fmtDate = (ts: number) => new Date(ts).toLocaleString();

const PromoMaterials: React.FC = () => {
  const [assets, setAssets] = useState<PromoAsset[]>(demoAssets);
  // load from localStorage to make the page dynamic/persistent
  useEffect(() => {
    try {
      const raw = localStorage.getItem('promo_assets');
      if (raw) {
        const parsed = JSON.parse(raw) as PromoAsset[];
        setAssets(parsed);
      }
    } catch (e) {
      console.warn('Failed to load promo assets from storage', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('promo_assets', JSON.stringify(assets));
    } catch (e) {
      console.warn('Failed to persist promo assets', e);
    }
  }, [assets]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [showUpload, setShowUpload] = useState(false);
  const [auditLogs, setAuditLogs] = useState<{ ts: number; action: string; by?: string; ids?: string[] }[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [activeAsset, setActiveAsset] = useState<PromoAsset | null>(null);
  const [utm, setUtm] = useState({ source: 'affiliate', medium: 'banner', campaign: '', content: '' });
  const [notification, setNotification] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    // sample push of analytics update (simulated)
    const t = setInterval(() => {
      setAssets(prev => prev.map(a => ({ ...a, analytics: { views: (a.analytics?.views || 0) + Math.round(Math.random() * 5), clicks: a.analytics?.clicks || 0, conversions: a.analytics?.conversions || 0 } })));
    }, 10_000);
    return () => clearInterval(t);
  }, []);

  const pushLog = (action: string, ids?: string[]) => {
    setAuditLogs(prev => [{ ts: Date.now(), action, ids, by: 'admin' }, ...prev].slice(0, 500));
  };

  const visible = assets.filter(a => {
    if (!search) return true;
    const s = search.toLowerCase();
    return a.name.toLowerCase().includes(s) || a.tags.join(' ').toLowerCase().includes(s) || a.id.toLowerCase().includes(s);
  });

  const toggleSelect = (id: string) => setSelected(prev => ({ ...prev, [id]: !prev[id] }));

  const handleFiles = (files?: FileList | null) => {
    if (!files) return;
    const readNext = (i: number) => {
      if (i >= files.length) return;
      const file = files[i];
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || '');
        const id = 'imp-' + Date.now() + '-' + i;
        const asset: PromoAsset = {
          id,
          name: file.name,
          tags: [],
          type: file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'html',
          size: file.size,
          uploadedAt: Date.now(),
          uploadedBy: 'admin',
          status: 'PENDING',
          versions: [{ id: id + '-v1', name: file.name, fileName: file.name, dataUrl }],
          analytics: { views: 0, clicks: 0, conversions: 0 },
        };
        setAssets(prev => [asset, ...prev]);
        pushLog('Uploaded asset', [id]);
        setNotification(`Uploaded ${file.name}`);
        setTimeout(() => setNotification(null), 2500);
        readNext(i + 1);
      };
      reader.readAsDataURL(file);
    };
    readNext(0);
  };

  const approveAsset = (id: string) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, status: 'APPROVED' } : a));
    pushLog('Approved asset', [id]);
    setNotification('Asset approved'); setTimeout(() => setNotification(null), 2000);
  };

  const rejectAsset = (id: string) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, status: 'REJECTED' } : a));
    pushLog('Rejected asset', [id]);
    setNotification('Asset rejected'); setTimeout(() => setNotification(null), 2000);
  };

  const exportMetadataCSV = (list: PromoAsset[]) => {
    const header = ['id','name','tags','type','status','uploadedAt','uploadedBy','size','abGroup'];
    const lines = [header.join(',')];
    list.forEach(a => lines.push([
      a.id,
      `"${a.name.replace(/"/g,'""')}"`,
      `"${a.tags.join('|')}"`,
      a.type,
      a.status,
      new Date(a.uploadedAt).toISOString(),
      a.uploadedBy || '',
      String(a.size || 0),
      a.abGroup || '',
    ].join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'promo-assets.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const importMetadataCSV = (file?: File) => {
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const header = (lines.shift() || '').split(',').map(h => h.trim().toLowerCase());
        const created: PromoAsset[] = lines.map((ln, idx) => {
          const cols = ln.split(',').map(c => c.trim());
          const obj: any = {};
          header.forEach((h, i) => obj[h] = cols[i]);
          const id = 'imp-' + Date.now() + '-' + idx;
          return {
            id,
            name: (obj.name || obj.id || 'Imported ' + idx).replace(/^"|"$/g, ''),
            tags: (obj.tags || '').replace(/^"|"$/g, '').split('|').filter(Boolean),
            type: obj.type || 'image',
            size: Number(obj.size || 0),
            uploadedAt: Date.now(),
            uploadedBy: obj.uploadedby || 'import',
            status: (obj.status || 'PENDING') as AssetStatus,
            versions: [],
            analytics: { views: 0, clicks: 0, conversions: 0 },
          } as PromoAsset;
        });
        setAssets(prev => [...created, ...prev]);
        pushLog('Imported assets metadata', created.map(c => c.id));
        setNotification(`Imported ${created.length} assets`);
      } catch (e) {
        console.error(e);
        setNotification('Import failed');
      } finally {
        setTimeout(() => setNotification(null), 2000);
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const generateShareLink = (asset: PromoAsset, params: { utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string }) => {
    const base = `https://example.com/promo/${asset.id}`;
    const q = new URLSearchParams();
    if (params.utm_source) q.set('utm_source', params.utm_source);
    if (params.utm_medium) q.set('utm_medium', params.utm_medium);
    if (params.utm_campaign) q.set('utm_campaign', params.utm_campaign);
    if (params.utm_content) q.set('utm_content', params.utm_content);
    return base + (String(q) ? `?${q.toString()}` : '');
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setNotification('Copied to clipboard'); setTimeout(() => setNotification(null), 1800);
  };

  const qrFor = (link: string) => `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(link)}`;

  const exportSelectedJSON = () => {
    const sel = Object.keys(selected).filter(k => selected[k]);
    const list = assets.filter(a => sel.includes(a.id));
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'promo-assets.json'; a.click(); URL.revokeObjectURL(url);
    pushLog('Exported JSON', sel);
  };

  const bulkDownloadZip = async () => {
    const sel = Object.keys(selected).filter(k => selected[k]);
    const list = sel.length ? assets.filter(a => sel.includes(a.id)) : assets;
    const zip = new JSZip();
    for (const a of list) {
      if (a.versions && a.versions.length) {
        for (const v of a.versions) {
          if (v.dataUrl && v.fileName) {
            try {
              const res = await fetch(v.dataUrl);
              const blob = await res.blob();
              zip.file(`${a.id}/${v.fileName}`, blob);
            } catch (e) {
              zip.file(`${a.id}/${v.fileName || v.id}.txt`, `Failed to include binary for ${v.fileName || v.id}`);
            }
          } else if (v.fileName) {
            zip.file(`${a.id}/${v.fileName}.txt`, JSON.stringify(v));
          }
        }
      } else {
        zip.file(`${a.id}/meta.json`, JSON.stringify(a));
      }
    }
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'promo-assets.zip');
    pushLog('Downloaded ZIP', list.map(l => l.id));
  };

  const applyTemplate = (templateId: string, target?: PromoAsset | null) => {
    const tpl = sampleTemplates.find(t => t.id === templateId);
    if (!tpl) return;
    const id = 'tmpl-' + Date.now();
    const newAsset: PromoAsset = {
      id,
      name: tpl.name + ' (copy)',
      tags: ['template'],
      type: 'html',
      uploadedAt: Date.now(),
      uploadedBy: 'template',
      status: 'DRAFT',
      versions: [{ id: id + '-v1', name: tpl.name + ' default', fileName: tpl.name + '.html' }],
      analytics: { views: 0, clicks: 0, conversions: 0 }
    };
    setAssets(prev => [newAsset, ...prev]);
    pushLog('Created from template ' + templateId, [id]);
    setNotification('Template applied'); setTimeout(() => setNotification(null), 2000);
  };

  const setAssetABGroup = (id: string, group: string | null) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, abGroup: group } : a));
    pushLog('Set A/B group', [id]);
  };

  return (
    <div className="rounded-lg border bg-white p-6 text-gray-800 shadow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Promo Materials</h1>
        <div className="flex items-center space-x-2">
          <button className="text-xs px-3 py-1 border rounded" onClick={() => exportMetadataCSV(assets)}>Export Metadata CSV</button>
          <button className="text-xs px-3 py-1 bg-blue-600 text-white rounded" onClick={() => setShowUpload(true)}>Upload</button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-3 mb-4">
        <input placeholder="Search assets, tags, id" className="border rounded px-2 py-1 text-sm w-64" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="ml-auto flex items-center space-x-2">
          <label className="text-xs px-3 py-1 border rounded cursor-pointer">
            {importing ? 'Importing...' : 'Import CSV'}
            <input type="file" accept=".csv" className="hidden" onChange={e => importMetadataCSV(e.target.files ? e.target.files[0] : undefined)} />
          </label>
          <button disabled={Object.keys(selected).filter(k => selected[k]).length===0} onClick={exportSelectedJSON} className="text-xs px-3 py-1 border rounded disabled:opacity-50">Export Selected</button>
          <button onClick={bulkDownloadZip} className="text-xs px-3 py-1 border rounded">Download ZIP</button>
          <button onClick={() => setShowTemplateModal(true)} className="text-xs px-3 py-1 border rounded">Templates</button>
        </div>
      </div>

      {/* Assets table */}
      <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
        <table className="min-w-full text-sm bg-white">
          <thead>
            <tr className="bg-gray-50 text-gray-700">
              <th className="px-3 py-2 border-b"><input type="checkbox" onChange={e => {
                const checked = e.target.checked;
                const visIds = visible.map(v => v.id);
                setSelected(prev => {
                  const next = { ...prev };
                  visIds.forEach(id => next[id] = checked);
                  return next;
                });
              }} /></th>
              <th className="px-3 py-2 border-b">Asset</th>
              <th className="px-3 py-2 border-b">Tags</th>
              <th className="px-3 py-2 border-b">Type</th>
              <th className="px-3 py-2 border-b">Status</th>
              <th className="px-3 py-2 border-b">Uploaded</th>
              <th className="px-3 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && <tr><td colSpan={7} className="text-center py-6 text-gray-400">No assets found.</td></tr>}
            {visible.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 border-b text-center"><input type="checkbox" checked={!!selected[a.id]} onChange={() => toggleSelect(a.id)} /></td>
                <td className="px-3 py-2 border-b">
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-gray-500">{a.id} • {a.uploadedBy}</div>
                </td>
                <td className="px-3 py-2 border-b">{a.tags.join(', ')}</td>
                <td className="px-3 py-2 border-b">{a.type}</td>
                <td className="px-3 py-2 border-b"><span className={`px-2 py-0.5 rounded text-xs ${a.status==='APPROVED'?'bg-emerald-100 text-emerald-800':a.status==='PENDING'?'bg-yellow-100 text-yellow-800':a.status==='REJECTED'?'bg-red-100 text-red-800':'bg-gray-100 text-gray-800'}`}>{a.status}</span></td>
                <td className="px-3 py-2 border-b">{fmtDate(a.uploadedAt)}</td>
                <td className="px-3 py-2 border-b text-right">
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => { setActiveAsset(a); }} className="text-xs px-2 py-1 border rounded">View</button>
                    <button onClick={() => copyToClipboard(generateShareLink(a, utm))} className="text-xs px-2 py-1 border rounded">Copy Link</button>
                    <button onClick={() => approveAsset(a.id)} className="text-xs px-2 py-1 bg-emerald-600 text-white rounded">Approve</button>
                    <button onClick={() => rejectAsset(a.id)} className="text-xs px-2 py-1 bg-red-500 text-white rounded">Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Side / Modals */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg w-2/5 p-4">
            <h3 className="font-semibold mb-3">Upload Promo Assets</h3>
            <div className="mb-3">
              <input type="file" multiple onChange={e => { handleFiles(e.target.files); setShowUpload(false); }} />
            </div>
            <div className="text-right">
              <button className="px-3 py-1 border rounded" onClick={() => setShowUpload(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg w-2/5 p-4">
            <h3 className="font-semibold mb-3">Templates</h3>
            <div className="mb-3">
              {sampleTemplates.map(t => (
                <div key={t.id} className="flex items-center justify-between border-b py-2">
                  <div>
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.description}</div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-xs px-2 py-1 border rounded" onClick={() => applyTemplate(t.id)}>Use</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-right">
              <button className="px-3 py-1 border rounded" onClick={() => setShowTemplateModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {activeAsset && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg w-3/5 p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold">{activeAsset.name}</h3>
              <div className="text-xs text-gray-500">{activeAsset.id}</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <div className="border rounded p-3 mb-3">
                  <div className="text-xs text-gray-600 mb-1">Metadata</div>
                  <div className="text-sm">Tags: {activeAsset.tags.join(', ') || '-'}</div>
                  <div className="text-sm">Type: {activeAsset.type}</div>
                  <div className="text-sm">Uploaded: {fmtDate(activeAsset.uploadedAt)}</div>
                  <div className="text-sm">Status: {activeAsset.status}</div>
                </div>
                <div className="border rounded p-3 mb-3">
                  <div className="text-xs text-gray-600 mb-1">Share / Tracking</div>
                  <div className="flex flex-col space-y-2">
                    <input value={utm.campaign} onChange={e => setUtm(prev => ({ ...prev, campaign: e.target.value }))} placeholder="utm_campaign" className="border rounded px-2 py-1 text-sm" />
                    <div className="flex space-x-2">
                      <button className="text-xs px-3 py-1 border rounded" onClick={() => copyToClipboard(generateShareLink(activeAsset, utm))}>Copy Link</button>
                      <button className="text-xs px-3 py-1 border rounded" onClick={() => window.open(qrFor(generateShareLink(activeAsset, utm)), '_blank')}>Open QR</button>
                    </div>
                    <div className="text-xs text-gray-500">QR and embed code available.</div>
                  </div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-xs text-gray-600 mb-1">A/B Test</div>
                  <div className="flex space-x-2">
                    <button className="text-xs px-2 py-1 border rounded" onClick={() => setAssetABGroup(activeAsset.id, 'A')}>Set A</button>
                    <button className="text-xs px-2 py-1 border rounded" onClick={() => setAssetABGroup(activeAsset.id, 'B')}>Set B</button>
                    <button className="text-xs px-2 py-1 border rounded" onClick={() => setAssetABGroup(activeAsset.id, null)}>Clear</button>
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <div className="border rounded p-3 mb-3">
                  <div className="text-xs text-gray-600 mb-1">Preview</div>
                  <div className="p-4 bg-gray-50 rounded">
                    {/* show first version preview if image/video */}
                    {activeAsset.versions[0]?.dataUrl ? (
                      activeAsset.type === 'image' ? <img src={activeAsset.versions[0].dataUrl} alt={activeAsset.name} className="max-h-48 object-contain" /> : activeAsset.type === 'video' ? <video src={activeAsset.versions[0].dataUrl} controls className="max-h-48" /> : <div className="text-sm text-gray-600">HTML / Template preview</div>
                    ) : (
                      <div className="text-sm text-gray-600">No binary preview available.</div>
                    )}
                  </div>
                </div>

                <div className="border rounded p-3 mb-3">
                  <div className="text-xs text-gray-600 mb-1">Embed & Code</div>
                  <div className="mb-2">
                    <div className="text-xs text-gray-500 mb-1">Iframe Embed</div>
                    <textarea readOnly value={`<iframe src="https://example.com/promo/${activeAsset.id}" width="600" height="400"></iframe>`} className="w-full text-xs border rounded p-2 h-20" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">QR Image</div>
                    <img src={qrFor(generateShareLink(activeAsset, utm))} alt="qr" />
                  </div>
                </div>

                <div className="border rounded p-3">
                  <div className="text-xs text-gray-600 mb-1">Analytics</div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="p-2 border rounded text-center">
                      <div className="text-xs text-gray-500">Views</div>
                      <div className="text-lg font-semibold">{activeAsset.analytics?.views || 0}</div>
                    </div>
                    <div className="p-2 border rounded text-center">
                      <div className="text-xs text-gray-500">Clicks</div>
                      <div className="text-lg font-semibold">{activeAsset.analytics?.clicks || 0}</div>
                    </div>
                    <div className="p-2 border rounded text-center">
                      <div className="text-xs text-gray-500">Conversions</div>
                      <div className="text-lg font-semibold">{activeAsset.analytics?.conversions || 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-right">
              <button className="px-3 py-1 border rounded mr-2" onClick={() => setActiveAsset(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded">{notification}</div>
      )}

      {/* Audit Logs */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Audit Logs</h3>
        <div className="max-h-40 overflow-y-auto text-xs border rounded p-2 bg-gray-50">
          {auditLogs.length === 0 && <div className="text-gray-400">No audit logs yet.</div>}
          {auditLogs.map((a, i) => (
            <div key={i} className="mb-2">
              <div className="text-xs text-gray-500">{new Date(a.ts).toLocaleString()}</div>
              <div>{a.action} {a.ids ? `(${a.ids.length} items)` : ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoMaterials;
