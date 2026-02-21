
import React from 'react';

interface PortalSelectionProps {
  onSelect: (mode: 'USER' | 'ADMIN') => void;
}

const PortalSelection: React.FC<PortalSelectionProps> = ({ onSelect }) => {
  return (
    <div className="h-screen w-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 space-y-12">
      <div className="text-center space-y-2">
        <div className="inline-block px-4 py-1.5 bg-[#8b5cf6]/5 rounded-full border border-[#8b5cf6]/10 mb-4">
          <span className="text-[10px] font-black text-[#8b5cf6] tracking-[4px] uppercase">Enterprise Protocol</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 italic">GEMINI<span className="text-[#8b5cf6]">X</span></h1>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-[2px]">Select your destination portal to begin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <button 
          onClick={() => onSelect('USER')}
          className="group relative bg-white border border-slate-200 p-10 rounded-[40px] flex flex-col items-center text-center space-y-6 transition-all hover:border-[#8b5cf6]/40 hover:shadow-xl active:scale-95"
        >
          <div className="w-20 h-20 bg-[#0ecb81]/5 rounded-3xl flex items-center justify-center text-[#0ecb81] mb-4 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-chart-line text-3xl"></i>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">User Panel</h3>
            <p className="text-slate-500 text-[10px] font-medium leading-relaxed uppercase tracking-wider">Access live markets, analyze charts,<br/>and execute binary trades.</p>
          </div>
          <div className="pt-4">
            <div className="px-6 py-2 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-600 group-hover:bg-[#8b5cf6] group-hover:text-white transition-all uppercase tracking-widest">ENTER TERMINAL</div>
          </div>
        </button>

        <button 
          onClick={() => onSelect('ADMIN')}
          className="group relative bg-white border border-slate-200 p-10 rounded-[40px] flex flex-col items-center text-center space-y-6 transition-all hover:border-[#8b5cf6]/40 hover:shadow-xl active:scale-95"
        >
          <div className="w-20 h-20 bg-[#8b5cf6]/5 rounded-3xl flex items-center justify-center text-[#8b5cf6] mb-4 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-user-shield text-3xl"></i>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Admin Panel</h3>
            <p className="text-slate-500 text-[10px] font-medium leading-relaxed uppercase tracking-wider">Manage assets, control market bias,<br/>and monitor platform revenue.</p>
          </div>
          <div className="pt-4">
            <div className="px-6 py-2 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-600 group-hover:bg-[#8b5cf6] group-hover:text-white transition-all uppercase tracking-widest">COMMAND CENTER</div>
          </div>
        </button>
      </div>

      <div className="flex items-center space-x-2 opacity-40">
         <div className="w-1.5 h-1.5 rounded-full bg-[#0ecb81] animate-pulse"></div>
         <span className="text-[9px] font-black text-slate-500 uppercase tracking-[4px]">System Online: V2.5.0</span>
      </div>
    </div>
  );
};

export default PortalSelection;
