import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import notify from '../shared/notify';

export default function TwoFactorSetup() {
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [otpauth, setOtpauth] = useState<string | null>(null);
  const [token, setToken] = useState('');

  async function generate() {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const res = await fetch('/api/2fa-totp/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to generate');
      setSecret(json.secret);
      setOtpauth(json.otpauth_url);
    } catch (e: any) {
      notify('error', e.message || 'Failed to generate 2FA secret');
    } finally {
      setLoading(false);
    }
  }

  async function verifyAndPersist() {
    if (!secret) return notify('error', 'No secret generated');
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const res = await fetch('/api/2fa-totp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
        body: JSON.stringify({ secret, token, persist: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Verification failed');
      notify('success', '2FA enabled');
      setSecret(null);
      setOtpauth(null);
      setToken('');
    } catch (e: any) {
      notify('error', e.message || 'Failed to verify 2FA');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold">Two-Factor Authentication (TOTP)</h3>
      <p className="text-sm text-muted-foreground">Use an authenticator app (Google Authenticator, Authy).</p>
      <div className="mt-4">
        {!secret && <button className="btn" onClick={generate} disabled={loading}>Generate secret</button>}
        {secret && (
          <div className="mt-3">
            <div>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(otpauth || '')}&size=200x200`} alt="QR code" />
            </div>
            <p className="mt-2 text-xs">Secret: {secret}</p>
            <label className="block mt-2">Enter code from your authenticator</label>
            <input value={token} onChange={e => setToken(e.target.value)} className="input" />
            <div className="mt-2">
              <button className="btn" onClick={verifyAndPersist} disabled={loading}>Verify & Enable 2FA</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
