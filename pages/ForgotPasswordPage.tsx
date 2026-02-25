import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { notify } from '../shared/notify';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      notify.error('Enter your email');
      return;
    }
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        notify.error(error.message || 'Unable to send reset email');
      } else {
        notify.success('Password reset email sent. Check your inbox.');
        navigate('/login');
      }
    } catch (err) {
      notify.error('Failed to request password reset');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gradient-to-br from-slate-900 to-black border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-3">Reset your password</h2>
        <p className="text-sm text-slate-400 mb-4">Enter your account email and we'll send a password reset link.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded px-3 py-2 bg-black/40 border border-slate-700 text-white" />
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-emerald-500 text-slate-950 font-bold">Send reset email</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
