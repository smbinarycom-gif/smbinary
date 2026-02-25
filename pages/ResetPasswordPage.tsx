import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { notify } from '../shared/notify';
import { useNavigate } from 'react-router-dom';

const parseHash = (hash: string) => {
  if (!hash) return {} as Record<string,string>;
  const clean = hash.startsWith('#') ? hash.slice(1) : hash;
  return Object.fromEntries(clean.split('&').map(p => p.split('=').map(decodeURIComponent)));
};

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // nothing special on mount
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 8) { notify.error('Password must be at least 8 chars'); return; }
    if (password !== confirm) { notify.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      // try to extract access_token and refresh_token from hash or query
      const hashParams = parseHash(window.location.hash || '');
      const searchParams = Object.fromEntries(new URLSearchParams(window.location.search));
      const access_token = (hashParams['access_token'] || searchParams['access_token'] || '') as string;
      const refresh_token = (hashParams['refresh_token'] || searchParams['refresh_token'] || '') as string;

      if (access_token) {
        try {
          await supabase.auth.setSession({ access_token, refresh_token });
        } catch (err) {
          // ignore
        }
      }

      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) {
        notify.error(error.message || 'Could not update password');
      } else {
        notify.success('Password updated. Please login.');
        navigate('/login');
      }
    } catch (err) {
      notify.error('Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gradient-to-br from-slate-900 to-black border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-3">Choose a new password</h2>
        <p className="text-sm text-slate-400 mb-4">Enter a new password for your account.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" type="password" className="w-full rounded px-3 py-2 bg-black/40 border border-slate-700 text-white" />
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" type="password" className="w-full rounded px-3 py-2 bg-black/40 border border-slate-700 text-white" />
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-emerald-500 text-slate-950 font-bold">Set password</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
