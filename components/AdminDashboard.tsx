import React, { useState } from 'react';
import { MarketSettings, Trade } from '../types.ts';
import { TOP_100_SYMBOLS } from '../constants.tsx';

interface AdminDashboardProps {
  settings: MarketSettings;
  onUpdate: (settings: MarketSettings) => void;
  trades: Trade[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ settings, onUpdate, trades }) => {
  const [activeTab, setActiveTab] = useState<'CONTROLS' | 'ASSETS' | 'AUDIT'>('CONTROLS');
  const [newShortcut, setNewShortcut] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newInterval, setNewInterval] = useState('');

  // Calculations
  const totalVolume = trades.reduce((acc, t) => acc + t.amount, 0);
  const winCount = trades.filter(t => t.status === 'WIN').length;
  const lossCount = trades.filter(t => t.status === 'LOSS').length;
  const openCount = trades.filter(t => t.status === 'OPEN').length;
  const winRate = trades.length > 0 ? ((winCount / (trades.length - openCount || 1)) * 100).toFixed(1) : "0.0";

  // Company P&L Logic: 
  // User Loss = Company Gains (+Amount)
  // User Win = Company Loses (- (Amount * Payout%))
  const companyProfit = trades.reduce((acc, t) => {
    if (t.status === 'LOSS') return acc + t.amount;
    if (t.status === 'WIN') return acc - (t.amount * (t.payoutAtTrade / 100));
    return acc;
  }, 0);

  const toggleSymbol = (symbol: string) => {
    const newSymbols = settings.activeSymbols.includes(symbol)
      ? settings.activeSymbols.filter(s => s !== symbol)
      : [...settings.activeSymbols, symbol];
    onUpdate({ ...settings, activeSymbols: newSymbols });
  };

  const removeTimeFrame = (tf: string) => {
    onUpdate({ ...settings, activeTimeFrames: settings.activeTimeFrames.filter(t => t !== tf) });
  };

  const addTimeFrame = () => {
    if (newInterval && !settings.activeTimeFrames.includes(newInterval)) {
      onUpdate({ ...settings, activeTimeFrames: [...settings.activeTimeFrames, newInterval] });
      setNewInterval('');
    }
  };

  const addShortcut = () => {
    const val = parseInt(newShortcut);
    if (!isNaN(val) && !settings.investmentShortcuts.includes(val)) {
      onUpdate({ ...settings, investmentShortcuts: [...settings.investmentShortcuts, val].sort((a, b) => a - b) });
      setNewShortcut('');
    }
  };

  const removeShortcut = (val: number) => {
    onUpdate({ ...settings, investmentShortcuts: settings.investmentShortcuts.filter(s => s !== val) });
  };

  const addDuration = () => {
    const val = parseInt(newDuration);
    if (!isNaN(val) && !settings.activeTradeDurations.includes(val)) {
      onUpdate({ ...settings, activeTradeDurations: [...settings.activeTradeDurations, val].sort((a, b) => a - b) });
      setNewDuration('');
    }
  };

  const removeDuration = (val: number) => {
    onUpdate({ ...settings, activeTradeDurations: settings.activeTradeDurations.filter(d => d !== val) });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0a0c]">
        <h2 className="text-xl font-black tracking-tighter text-[#8b5cf6]">MASTER COMMAND</h2>
        <div className="flex space-x-1">
          {['CONTROLS', 'ASSETS', 'AUDIT'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab as any)} 
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === tab ? 'bg-[#8b5cf6] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'text-white/30 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
        {activeTab === 'CONTROLS' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Platform Volume', value: `$${totalVolume.toLocaleString()}` },
                { 
                  label: 'Company Revenue', 
                  value: `${companyProfit >= 0 ? '+' : ''}$${companyProfit.toFixed(2)}`, 
                  color: companyProfit >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]' 
                },
                { label: 'Avg Win Rate', value: `${winRate}%`, color: 'text-[#ccff00]' },
                { label: 'Active Pairs', value: settings.activeSymbols.length },
                { label: 'Min/Max Trade', value: `$${settings.minInvestment}/$${settings.maxInvestment}` },
              ].map((stat, i) => (
                <div key={i} className="bg-[#0c0c0e] p-5 rounded-2xl border border-white/5">
                  <p className="text-[9px] text-white/40 font-bold uppercase tracking-[2px]">{stat.label}</p>
                  <p className={`text-xl lg:text-2xl font-black mt-2 font-mono ${stat.color || 'text-white'}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Investment Limits */}
              <section className="bg-[#0c0c0e] p-6 rounded-3xl border border-white/5 space-y-4">
                <h3 className="text-xs font-black text-white uppercase tracking-[2px]">Investment Limits</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Minimum ($)</label>
                    <input 
                      type="number"
                      value={settings.minInvestment}
                      onChange={(e) => onUpdate({ ...settings, minInvestment: Number(e.target.value) })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8b5cf6] font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Maximum ($)</label>
                    <input 
                      type="number"
                      value={settings.maxInvestment}
                      onChange={(e) => onUpdate({ ...settings, maxInvestment: Number(e.target.value) })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8b5cf6] font-mono"
                    />
                  </div>
                </div>
              </section>

              {/* Chart Intervals Settings */}
              <section className="bg-[#0c0c0e] p-6 rounded-3xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-white uppercase tracking-[2px]">Chart Intervals</h3>
                  <span className="text-[8px] text-white/20 font-black tracking-widest">CUSTOM</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {settings.activeTimeFrames.map(tf => (
                    <div key={tf} className="flex items-center space-x-1 bg-[#ccff00]/10 border border-[#ccff00]/20 px-3 py-1.5 rounded-full">
                      <span className="text-[10px] font-black text-[#ccff00]">{tf}</span>
                      <button onClick={() => removeTimeFrame(tf)} className="text-[#ccff00]/40 hover:text-red-500">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="e.g. 10s"
                    value={newInterval}
                    onChange={(e) => setNewInterval(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8b5cf6]"
                  />
                  <button onClick={addTimeFrame} className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black hover:bg-gray-200 transition-all">ADD</button>
                </div>
              </section>

              {/* Trade Expiry */}
              <section className="bg-[#0c0c0e] p-6 rounded-3xl border border-white/5 space-y-4">
                <h3 className="text-xs font-black text-white uppercase tracking-[2px]">Trade Expiry</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {settings.activeTradeDurations.map(val => (
                    <div key={val} className="flex items-center space-x-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                      <span className="text-[10px] font-black text-white">{val}s</span>
                      <button onClick={() => removeDuration(val)} className="text-white/20 hover:text-red-500">×</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="number" placeholder="Seconds..." value={newDuration} onChange={(e) => setNewDuration(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" />
                  <button onClick={addDuration} className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black">ADD</button>
                </div>
              </section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Market Bias */}
              <section className="bg-[#0c0c0e] p-6 rounded-3xl border border-white/5 space-y-4">
                <h3 className="text-xs font-black text-white uppercase tracking-[2px]">Market Bias</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['RANDOM', 'PUMP', 'DUMP'] as const).map(trend => (
                    <button key={trend} onClick={() => onUpdate({ ...settings, marketTrend: trend })} className={`py-4 rounded-2xl font-black text-xs border transition-all ${settings.marketTrend === trend ? 'bg-[#8b5cf6] border-white text-white' : 'bg-white/5 border-white/5 text-white/30'}`}>{trend}</button>
                  ))}
                </div>
              </section>

              {/* Shortcuts */}
              <section className="bg-[#0c0c0e] p-6 rounded-3xl border border-white/5 space-y-4">
                <h3 className="text-xs font-black text-white uppercase tracking-[2px]">Panel Shortcuts</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {settings.investmentShortcuts.map(val => (
                    <div key={val} className="flex items-center space-x-1 bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 px-3 py-1.5 rounded-full">
                      <span className="text-[10px] font-black text-white">${val}</span>
                      <button onClick={() => removeShortcut(val)} className="text-[#8b5cf6] hover:text-white">×</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="number" placeholder="Value..." value={newShortcut} onChange={(e) => setNewShortcut(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" />
                  <button onClick={addShortcut} className="bg-[#8b5cf6] px-4 py-2 rounded-xl text-[10px] font-black">ADD</button>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'ASSETS' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {TOP_100_SYMBOLS.map(symbol => {
              const isActive = settings.activeSymbols.includes(symbol);
              return (
                <button key={symbol} onClick={() => toggleSymbol(symbol)} className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center space-y-2 ${isActive ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]' : 'bg-white/5 border-white/5'}`}>
                  <span className={`text-[10px] font-black ${isActive ? 'text-white' : 'text-white/40'}`}>{symbol.split('/')[0]}</span>
                  <div className={`text-[8px] px-2 py-0.5 rounded uppercase font-black ${isActive ? 'bg-[#8b5cf6] text-white' : 'bg-white/5 text-white/10'}`}>{isActive ? 'ACTIVE' : 'OFF'}</div>
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'AUDIT' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0c0c0e] p-5 rounded-2xl border border-white/5">
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-[2px]">Net Revenue</p>
                <p className={`text-2xl font-black mt-2 font-mono ${companyProfit >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                   {companyProfit >= 0 ? '+' : ''}${companyProfit.toFixed(2)}
                </p>
              </div>
              <div className="bg-[#0c0c0e] p-5 rounded-2xl border border-white/5">
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-[2px]">Total Wins</p>
                <p className="text-2xl font-black mt-2 text-[#0ecb81]">{winCount}</p>
              </div>
              <div className="bg-[#0c0c0e] p-5 rounded-2xl border border-white/5">
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-[2px]">Total Losses</p>
                <p className="text-2xl font-black mt-2 text-[#f6465d]">{lossCount}</p>
              </div>
              <div className="bg-[#0c0c0e] p-5 rounded-2xl border border-white/5">
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-[2px]">Open Orders</p>
                <p className="text-2xl font-black mt-2 text-[#ccff00]">{openCount}</p>
              </div>
            </div>

            <div className="bg-[#0c0c0e] rounded-3xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[2px]">Timestamp</th>
                      <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[2px]">Asset</th>
                      <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[2px]">Type</th>
                      <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[2px]">Amount</th>
                      <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[2px]">P/L (House)</th>
                      <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[2px]">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {trades.length > 0 ? trades.map((trade) => {
                      const housePL = trade.status === 'LOSS' ? trade.amount : trade.status === 'WIN' ? -(trade.amount * (trade.payoutAtTrade / 100)) : 0;
                      return (
                        <tr key={trade.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="px-6 py-4 text-[10px] font-mono text-white/40">
                            {new Date(trade.startTime).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-[10px] font-black text-white">{trade.assetSymbol}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded ${trade.type === 'CALL' ? 'bg-[#0ecb81]/10 text-[#0ecb81]' : 'bg-[#f6465d]/10 text-[#f6465d]'}`}>
                              {trade.type === 'CALL' ? 'BUY' : 'SELL'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[10px] font-mono font-black text-white">${trade.amount}</td>
                          <td className={`px-6 py-4 text-[10px] font-mono font-black ${housePL >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                            {trade.status !== 'OPEN' ? `${housePL >= 0 ? '+' : ''}${housePL.toFixed(2)}` : '--'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-black ${trade.status === 'WIN' ? 'text-[#0ecb81]' : trade.status === 'LOSS' ? 'text-[#f6465d]' : 'text-[#ccff00]'}`}>
                              {trade.status}
                            </span>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center text-white/20 text-[10px] font-black uppercase tracking-[4px]">
                          No Trade Logs Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;