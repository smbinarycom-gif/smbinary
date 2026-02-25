import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient.js';
import { notify } from '../shared/notify';

type SiteConfig = {
  siteName: string;
  logoText: string;
  logoUrl?: string;
};

const STORAGE_KEY = 'smb_site_config_v1';

const defaultConfig: SiteConfig = {
  siteName: 'SMBinary.COM',
  logoText: 'GX',
  logoUrl: '',
};

// Context exposes an async setConfig so callers can await server persistence
const SiteConfigContext = createContext<{
  config: SiteConfig;
  setConfig: (up: Partial<SiteConfig>) => Promise<void>;
}>({ config: defaultConfig, setConfig: async () => {} });

const CONFIG_ROW_ID = 'default';

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<SiteConfig>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...defaultConfig, ...JSON.parse(raw) };
    } catch (e) {
      // ignore
    }
    return defaultConfig;
  });

  // Load from Supabase on mount (best-effort)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase.from('site_config').select('*').eq('id', CONFIG_ROW_ID).limit(1).single();
        if (error && error.code !== 'PGRST116') {
          // ignore if table missing or other issues; we'll keep local config
          return;
        }
        if (data && mounted) {
          const loaded: SiteConfig = {
            siteName: data.site_name || defaultConfig.siteName,
            logoText: data.logo_text || defaultConfig.logoText,
            logoUrl: data.logo_url || '',
          };
          setConfigState(prev => ({ ...prev, ...loaded }));
        }
      } catch (e) {
        // ignore network errors
      }
    })();
    return () => { mounted = false; };
  }, []);

  // persist to localStorage whenever config changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      // ignore
    }
  }, [config]);

  // keep document title in sync with site name
  useEffect(() => {
    if (typeof document !== 'undefined') {
      try { document.title = config.siteName; } catch (e) { /* ignore */ }
    }
  }, [config.siteName]);

  const setConfig = async (up: Partial<SiteConfig>) => {
    const next = { ...config, ...up };
    setConfigState(next);
    // localStorage already handled by effect; now call secure serverless endpoint to persist
    try {
      // try to get an access token for current user session
      let token: string | null = null;
      try {
        const sessionRes = await supabase.auth.getSession();
        token = (sessionRes && (sessionRes as any).data && (sessionRes as any).data.session && (sessionRes as any).data.session.access_token) || null;
      } catch (e) {
        // ignore: no session
      }

      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const resp = await fetch('/api/site-config', {
        method: 'POST',
        headers,
        body: JSON.stringify({ siteName: next.siteName, logoText: next.logoText, logoUrl: next.logoUrl || '' }),
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        console.warn('siteConfig: serverless save failed', body);
        notify.error((body && body.error) ? `Save failed: ${body.error}` : 'Could not persist site config to server — saved locally.');
      } else {
        notify.success('Site branding saved');
      }
    } catch (e) {
      console.warn('siteConfig: serverless exception', e);
      notify.error('Could not persist site config to server — saved locally.');
    }
  };

  return <SiteConfigContext.Provider value={{ config, setConfig }}>{children}</SiteConfigContext.Provider>;
};

export const useSiteConfig = () => useContext(SiteConfigContext);

export const getSiteConfig = (): SiteConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultConfig, ...JSON.parse(raw) };
  } catch (e) {}
  return defaultConfig;
};

export default SiteConfigProvider;
