import React, { useState } from 'react';

type Props = { onSuccess: () => void };

// DEV-only credentials (temporary). REMOVE before production.
const DEV_ADMIN_EMAIL = 'smbinary.com@gmail.com';
const DEV_ADMIN_PASSWORD = 'admin123';

const AdminLogin: React.FC<Props> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!email || !password) {
      setErr('Enter email and password');
      return;
    }
    if (email.trim().toLowerCase() === DEV_ADMIN_EMAIL && password === DEV_ADMIN_PASSWORD) {
      if (remember) localStorage.setItem('admin_auth', '1');
      onSuccess();
      return;
    }
    setErr('Invalid credentials');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-50 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">SB</div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Admin Login</h1>
              <p className="text-sm text-slate-500">Sign in to access the dashboard</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-2 text-sm text-slate-500">{show ? 'Hide' : 'Show'}</button>
              </div>
            </div>

            {err && <div className="text-sm text-red-500">{err}</div>}

            <div className="flex items-center justify-between">
                <label className="inline-flex items-center text-sm text-slate-600">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="mr-2" /> Remember me
              </label>
              <button type="button" onClick={() => { setEmail(DEV_ADMIN_EMAIL); setPassword(DEV_ADMIN_PASSWORD); }} className="text-sm text-indigo-600">Fill dev creds</button>
            </div>

            <div>
              <button type="submit" className="w-full py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Sign in</button>
            </div>

            <div className="pt-2 text-xs text-slate-500 text-center">Developer fallback login — replace with server auth before production.</div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
