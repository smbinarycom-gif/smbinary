
import React from 'react';
import { MarketSettings } from '../../shared/types.ts';

interface TradingTabProps {
    settings: MarketSettings;
    onUpdate: (settings: MarketSettings) => void;
}

const TradingTab: React.FC<TradingTabProps> = ({ settings, onUpdate }) => {
    const isRealMarket = settings.marketMode === 'REAL';

    const toggleTarget = (target: 'DEMO' | 'LIVE') => {
        let newTargets = [...settings.manipulationTarget];
        if (newTargets.includes(target)) {
            newTargets = newTargets.filter(t => t !== target);
        } else {
            newTargets.push(target);
        }
        onUpdate({ ...settings, manipulationTarget: newTargets });
    };

    return (
        <div className="space-y-6">
            {/* 1. MASTER MARKET PROTOCOL SWITCH */}
            <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139] shadow-lg">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">Market Protocol</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => onUpdate({ ...settings, marketMode: 'REAL', forceLoss: false, marketTrend: 'RANDOM' })}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center space-y-2 ${isRealMarket ? 'bg-[#3b82f6]/10 border-[#3b82f6]' : 'bg-[#161a1e] border-[#2b3139] opacity-60'}`}
                    >
                        <i className={`fa-solid fa-chart-line text-2xl ${isRealMarket ? 'text-[#3b82f6]' : 'text-[#848e9c]'}`}></i>
                        <span className={`text-sm font-black uppercase ${isRealMarket ? 'text-white' : 'text-[#848e9c]'}`}>Real Market</span>
                        <span className="text-[10px] text-[#848e9c]">Live Data • No Manipulation</span>
                    </button>

                    <button 
                        onClick={() => onUpdate({ ...settings, marketMode: 'OTC' })}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center space-y-2 ${!isRealMarket ? 'bg-[#fcd535]/10 border-[#fcd535]' : 'bg-[#161a1e] border-[#2b3139] opacity-60'}`}
                    >
                        <i className={`fa-solid fa-gamepad text-2xl ${!isRealMarket ? 'text-[#fcd535]' : 'text-[#848e9c]'}`}></i>
                        <span className={`text-sm font-black uppercase ${!isRealMarket ? 'text-white' : 'text-[#848e9c]'}`}>OTC Market</span>
                        <span className="text-[10px] text-[#848e9c]">Controlled Data • Admin Power</span>
                    </button>
                </div>
            </div>

            {/* 2. OTC CONTROLS (CONDITIONAL) */}
            <div className={`transition-all duration-300 space-y-6 ${isRealMarket ? 'opacity-50 pointer-events-none grayscale blur-sm' : 'opacity-100'}`}>
                
                {/* LOSS PERCENTAGE CONTROL (NEW) */}
                <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139] shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <i className="fa-solid fa-scale-unbalanced-flip text-6xl text-[#f6465d]"></i>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wide flex items-center">
                        <i className="fa-solid fa-house-chimney text-[#f6465d] mr-2"></i> Loss Percentage Control
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-xs text-[#848e9c] font-bold">House Aggression Level</label>
                            <span className={`text-xl font-black ${settings.otcLossPercentage > 50 ? 'text-[#f6465d]' : 'text-[#fcd535]'}`}>
                                {settings.otcLossPercentage}%
                            </span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            step="5"
                            value={settings.otcLossPercentage} 
                            onChange={(e) => onUpdate({ ...settings, otcLossPercentage: Number(e.target.value) })}
                            className="w-full h-2 bg-[#2b3139] rounded-lg appearance-none cursor-pointer accent-[#f6465d] hover:accent-[#ff3d3d]"
                        />
                        <div className="flex justify-between text-[10px] text-[#848e9c] font-bold uppercase tracking-widest">
                            <span>0% (Fair)</span>
                            <span>50% (Hard)</span>
                            <span>100% (Rigged)</span>
                        </div>
                        
                        {/* Target Selection */}
                        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[#2b3139]">
                            <span className="text-[10px] font-bold text-[#848e9c] uppercase tracking-wider">Target Accounts:</span>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={settings.manipulationTarget.includes('DEMO')} 
                                    onChange={() => toggleTarget('DEMO')}
                                    className="w-4 h-4 rounded border-[#474d57] bg-[#131722] accent-[#fcd535]"
                                />
                                <span className={`text-xs font-bold ${settings.manipulationTarget.includes('DEMO') ? 'text-[#fcd535]' : 'text-[#848e9c]'}`}>DEMO</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={settings.manipulationTarget.includes('LIVE')} 
                                    onChange={() => toggleTarget('LIVE')}
                                    className="w-4 h-4 rounded border-[#474d57] bg-[#131722] accent-[#0ecb81]"
                                />
                                <span className={`text-xs font-bold ${settings.manipulationTarget.includes('LIVE') ? 'text-[#0ecb81]' : 'text-[#848e9c]'}`}>LIVE</span>
                            </label>
                        </div>

                        <p className="text-[10px] text-[#848e9c] mt-2 italic bg-[#161a1e] p-3 rounded border border-[#2b3139]">
                            <i className="fa-solid fa-circle-info mr-1"></i>
                            Live trades take priority. If Live is targeted, Demo trades are ignored for price logic. If Demo is disabled, Demo trades see random market.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139] shadow-lg">
                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
                            Manual Bias Engine
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {(['RANDOM', 'PUMP', 'DUMP'] as const).map(mode => (
                                <button 
                                    key={mode} 
                                    onClick={() => onUpdate({ ...settings, marketTrend: mode })} 
                                    className={`py-4 rounded-lg font-bold text-xs border transition-all ${settings.marketTrend === mode ? 'bg-[#fcd535] border-[#fcd535] text-black' : 'bg-[#2b3139] border-[#474d57] text-[#848e9c] hover:border-[#fcd535]'}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139] shadow-lg">
                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
                            OTC Risk Management
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-[#848e9c] font-bold mb-1 block">Global Payout Multiplier (x)</label>
                                <input type="number" step="0.1" value={settings.payoutMultiplier} onChange={(e) => onUpdate({ ...settings, payoutMultiplier: parseFloat(e.target.value) })} className="w-full bg-[#131722] border border-[#474d57] rounded p-2 text-white font-mono focus:border-[#fcd535] outline-none" />
                                <p className="text-[9px] text-[#848e9c] mt-1">Affects both Real & OTC payouts.</p>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-[#2b3139] border border-[#474d57] rounded-lg">
                                <span className="text-xs font-bold text-white">Force Global Loss (Kill Switch)</span>
                                <button onClick={() => onUpdate({ ...settings, forceLoss: !settings.forceLoss })} className={`w-12 h-6 rounded-full relative transition-colors ${settings.forceLoss ? 'bg-[#f6465d]' : 'bg-[#474d57]'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.forceLoss ? 'left-7' : 'left-1'}`}></div></button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139] shadow-lg lg:col-span-2">
                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
                            Investment Limits
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-[#848e9c] font-bold mb-1 block">Min Investment ($)</label>
                                <input 
                                    type="number" 
                                    value={settings.minInvestment} 
                                    onChange={(e) => onUpdate({ ...settings, minInvestment: Number(e.target.value) })} 
                                    className="w-full bg-[#131722] border border-[#474d57] rounded p-2 text-white font-mono focus:border-[#fcd535] outline-none" 
                                />
                            </div>
                            <div>
                                <label className="text-xs text-[#848e9c] font-bold mb-1 block">Max Investment ($)</label>
                                <input 
                                    type="number" 
                                    value={settings.maxInvestment} 
                                    onChange={(e) => onUpdate({ ...settings, maxInvestment: Number(e.target.value) })} 
                                    className="w-full bg-[#131722] border border-[#474d57] rounded p-2 text-white font-mono focus:border-[#fcd535] outline-none" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TradingTab;
