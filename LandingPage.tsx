import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-[100dvh] w-screen bg-[#020617] text-white overflow-hidden">
      <div className="max-w-6xl mx-auto w-full px-4 md:px-8 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0ecb81] mr-2 animate-pulse" />
            Real-Time Binary Engine
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Trade digital contracts on a
            <span className="text-[#0ecb81]"> simulated </span>
            engine.
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto md:mx-0">
            Practice high‑frequency binary trading with live‑like price action,
            OTC controls and AI overlays — all in a safe demo environment.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center md:justify-start text-xs">
            <div className="flex items-center space-x-2 text-slate-400">
              <i className="fa-solid fa-shield-halved text-[#0ecb81]" />
              <span>Demo only · No real funds</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-500">
              <i className="fa-solid fa-gauge-high text-[#eab308]" />
              <span>Lightning-fast execution</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button onClick={() => navigate('/register')} className="px-5 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold">Sign up</button>
            <button onClick={() => navigate('/login')} className="px-5 py-2 rounded-lg border border-slate-700 text-slate-200">Log in</button>
          </div>
        </div>

        <div className="flex-1 flex justify-center md:justify-end w-full">
          <div className="w-full max-w-md bg-gradient-to-br from-slate-900/70 to-black/60 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-black text-white mb-3">Get started</h2>
            <p className="text-sm text-slate-400 mb-4">Create an account to access the trading terminal and all user features. Secure, fast and demo-ready.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate('/register')} className="w-full px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold">Create account</button>
              <button onClick={() => navigate('/login')} className="w-full px-4 py-2 rounded-lg border border-slate-700 text-slate-200">Already have an account? Log in</button>
            </div>
            <div className="mt-4 text-[12px] text-slate-500">By creating an account you agree to our Terms & Conditions.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
