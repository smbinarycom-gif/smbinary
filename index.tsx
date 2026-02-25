
import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './Router.tsx';
import { AuthProvider } from './auth/AuthProvider';
import { SiteConfigProvider } from './shared/siteConfig';
// Device detection: perform quick tagging before initial render for immediate CSS tweaks
if (typeof window !== 'undefined') {
  try {
    // run quick detection synchronously then deeper detection deferred
    import('./shared/detectDevice').then(m => { if (m && m.default) m.default(); }).catch(() => {
      try { const m = require('./shared/detectDevice'); if (m && m.default) m.default(); } catch (err) { /* ignore */ }
    });
  } catch (e) {
    try { const m = require('./shared/detectDevice'); if (m && m.default) m.default(); } catch (err) { /* ignore */ }
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SiteConfigProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </SiteConfigProvider>
  </React.StrictMode>
);
