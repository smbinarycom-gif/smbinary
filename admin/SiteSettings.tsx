import React, { useState } from 'react';
import { useSiteConfig } from '../shared/siteConfig';
import { notify } from '../shared/notify';

const SiteSettings: React.FC = () => {
  const { config, setConfig } = useSiteConfig();
  const [siteName, setSiteName] = useState(config.siteName);
  const [logoText, setLogoText] = useState(config.logoText || 'GX');
  const [logoUrl, setLogoUrl] = useState(config.logoUrl || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setConfig({ siteName: siteName.trim() || 'SMBinary.COM', logoText: logoText.trim() || 'GX', logoUrl: logoUrl.trim() });
      notify.success('Branding updated');
    } catch (err) {
      notify.error('Failed to save branding');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Site Branding</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300">Site name</label>
          <input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="mt-1 block w-full rounded-md bg-slate-900 border border-slate-700 p-2 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Logo text (fallback)</label>
          <input value={logoText} onChange={(e) => setLogoText(e.target.value)} className="mt-1 block w-full rounded-md bg-slate-900 border border-slate-700 p-2 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Logo image URL (optional)</label>
          <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://.../logo.png" className="mt-1 block w-full rounded-md bg-slate-900 border border-slate-700 p-2 text-white" />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-emerald-500 rounded text-slate-900 font-semibold">Save</button>
          <button onClick={() => { setSiteName(config.siteName); setLogoText(config.logoText); setLogoUrl(config.logoUrl || ''); }} className="px-3 py-2 border rounded border-slate-700">Reset</button>
        </div>

        <div className="mt-4">
          <p className="text-sm text-slate-300">Preview:</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              {logoUrl ? <img src={logoUrl} alt={siteName} className="h-8 w-8 object-contain" /> : <span className="font-black text-slate-950">{logoText}</span>}
            </div>
            <div className="text-sm font-semibold text-white">{siteName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings;
