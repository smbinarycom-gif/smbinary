
import React from 'react';
import { MarketSettings, AdminThemeSettings } from '../../shared/types.ts';

interface TradingTabProps {
    settings: MarketSettings;
    onUpdate: (settings: MarketSettings) => void;
    theme?: AdminThemeSettings;
}

const TradingTab: React.FC<TradingTabProps> = ({ settings, onUpdate, theme }) => {
    const isRealMarket = settings.marketMode === 'REAL';
    const isLight = theme?.mode === 'LIGHT';
    const cardBg = isLight ? '#ffffff' : '#1e2329';
    const borderColor = isLight ? '#e5e7eb' : '#2b3139';
    const subtleBg = isLight ? '#f9fafb' : '#161a1e';
    const mutedText = isLight ? '#6b7280' : '#848e9c';

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
            <div className="p-6 rounded-xl border shadow-lg" style={{ backgroundColor: cardBg, borderColor }}>
                <h3 className={`text-sm font-bold mb-4 uppercase tracking-wide ${isLight ? 'text-[#111827]' : 'text-white'}`}>Market Protocol</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => onUpdate({ ...settings, marketMode: 'REAL', forceLoss: false, marketTrend: 'RANDOM' })}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center space-y-2 ${isRealMarket 
                            ? 'bg-[#3b82f6]/10 border-[#3b82f6]' 
                            : isLight 
                                ? 'bg-white border-[#e5e7eb] opacity-60' 
                                : 'bg-[#161a1e] border-[#2b3139] opacity-60'}`}
                    >
                        <i className={`fa-solid fa-chart-line text-2xl ${isRealMarket ? 'text-[#3b82f6]' : ''}`} style={!isRealMarket ? { color: mutedText } : undefined}></i>
                        <span className={`text-sm font-black uppercase ${isRealMarket ? (isLight ? 'text-[#111827]' : 'text-white') : ''}`} style={!isRealMarket ? { color: mutedText } : undefined}>Real Market</span>
                        <span className="text-[10px]" style={{ color: mutedText }}>Live Data • No Manipulation</span>
                    </button>

                    <button 
                        onClick={() => onUpdate({ ...settings, marketMode: 'OTC' })}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center space-y-2 ${!isRealMarket 
                            ? 'bg-[#fcd535]/10 border-[#fcd535]' 
                            : isLight 
                                ? 'bg-white border-[#e5e7eb] opacity-60' 
                                : 'bg-[#161a1e] border-[#2b3139] opacity-60'}`}
                    >
                        <i className={`fa-solid fa-gamepad text-2xl ${!isRealMarket ? 'text-[#fcd535]' : ''}`} style={isRealMarket ? { color: mutedText } : undefined}></i>
                        <span className={`text-sm font-black uppercase ${!isRealMarket ? (isLight ? 'text-[#111827]' : 'text-white') : ''}`} style={isRealMarket ? { color: mutedText } : undefined}>OTC Market</span>
                        <span className="text-[10px]" style={{ color: mutedText }}>Controlled Data • Admin Power</span>
                    </button>
                </div>
            </div>

            {/* 2. OTC CONTROLS (CONDITIONAL) */}
            <div className={`transition-all duration-300 space-y-6 ${isRealMarket ? 'opacity-50 pointer-events-none grayscale blur-sm' : 'opacity-100'}`}>
                
                {/* LOSS PERCENTAGE CONTROL (NEW) */}
                <div className="p-6 rounded-xl border shadow-lg relative overflow-hidden" style={{ backgroundColor: cardBg, borderColor }}>
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <i className="fa-solid fa-scale-unbalanced-flip text-6xl text-[#f6465d]"></i>
                    </div>
                    <h3 className={`text-sm font-bold mb-6 uppercase tracking-wide flex items-center ${isLight ? 'text-[#111827]' : 'text-white'}`}>
                        <i className="fa-solid fa-house-chimney text-[#f6465d] mr-2"></i> Loss Percentage Control
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-bold" style={{ color: mutedText }}>House Aggression Level</label>
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
                            className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#f6465d] hover:accent-[#ff3d3d] ${isLight ? 'bg-[#e5e7eb]' : 'bg-[#2b3139]'}`}
                        />
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest" style={{ color: mutedText }}>
                            <span>0% (Fair)</span>
                            <span>50% (Hard)</span>
                            <span>100% (Rigged)</span>
                        </div>
                        
                        {/* Target Selection */}
                        <div className="flex items-center gap-6 mt-4 pt-4 border-t" style={{ borderColor }}>
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: mutedText }}>Target Accounts:</span>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={settings.manipulationTarget.includes('DEMO')} 
                                    onChange={() => toggleTarget('DEMO')}
                                    className={`w-4 h-4 rounded accent-[#fcd535] ${isLight ? 'border-[#d1d5db] bg-white' : 'border-[#474d57] bg-[#131722]'}`}
                                />
                                <span className={`text-xs font-bold ${settings.manipulationTarget.includes('DEMO') ? 'text-[#fcd535]' : ''}`} style={!settings.manipulationTarget.includes('DEMO') ? { color: mutedText } : undefined}>DEMO</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={settings.manipulationTarget.includes('LIVE')} 
                                    onChange={() => toggleTarget('LIVE')}
                                    className={`w-4 h-4 rounded accent-[#0ecb81] ${isLight ? 'border-[#d1d5db] bg-white' : 'border-[#474d57] bg-[#131722]'}`}
                                />
                                <span className={`text-xs font-bold ${settings.manipulationTarget.includes('LIVE') ? 'text-[#0ecb81]' : ''}`} style={!settings.manipulationTarget.includes('LIVE') ? { color: mutedText } : undefined}>LIVE</span>
                            </label>
                        </div>

                        <p className="text-[10px] mt-2 italic p-3 rounded border" style={{ backgroundColor: isLight ? subtleBg : '#161a1e', borderColor, color: mutedText }}>
                            <i className="fa-solid fa-circle-info mr-1"></i>
                            Live trades take priority. If Live is targeted, Demo trades are ignored for price logic. If Demo is disabled, Demo trades see random market.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl border shadow-lg" style={{ backgroundColor: cardBg, borderColor }}>
                        <h3 className={`text-sm font-bold mb-4 uppercase tracking-wide ${isLight ? 'text-[#111827]' : 'text-white'}`}>
                            Manual Bias Engine
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {(['RANDOM', 'PUMP', 'DUMP'] as const).map(mode => (
                                <button 
                                    key={mode} 
                                    onClick={() => onUpdate({ ...settings, marketTrend: mode })} 
                                    className={`py-4 rounded-lg font-bold text-xs border transition-all ${settings.marketTrend === mode 
                                        ? 'bg-[#fcd535] border-[#fcd535] text-black' 
                                        : isLight 
                                            ? 'bg-white border-[#e5e7eb] text-[#6b7280] hover:border-[#fcd535] hover:bg-[#f9fafb]'
                                            : 'bg-[#2b3139] border-[#474d57] text-[#848e9c] hover:border-[#fcd535]'}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-6 rounded-xl border shadow-lg" style={{ backgroundColor: cardBg, borderColor }}>
                        <h3 className={`text-sm font-bold mb-4 uppercase tracking-wide ${isLight ? 'text-[#111827]' : 'text-white'}`}>
                            OTC Risk Management
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold mb-1 block" style={{ color: mutedText }}>Global Payout Multiplier (x)</label>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    value={settings.payoutMultiplier} 
                                    onChange={(e) => onUpdate({ ...settings, payoutMultiplier: parseFloat(e.target.value) })} 
                                    className={`w-full rounded p-2 font-mono focus:border-[#fcd535] outline-none ${isLight ? 'bg-white border border-[#e5e7eb] text-[#111827]' : 'bg-[#131722] border border-[#474d57] text-white'}`} 
                                />
                                <p className="text-[9px] mt-1" style={{ color: mutedText }}>Affects both Real & OTC payouts.</p>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border" style={{ backgroundColor: isLight ? '#fef2f2' : '#2b3139', borderColor: isLight ? '#fecaca' : '#474d57' }}>
                                <span className={`text-xs font-bold ${isLight ? 'text-[#111827]' : 'text-white'}`}>Force Global Loss (Kill Switch)</span>
                                <button 
                                    onClick={() => onUpdate({ ...settings, forceLoss: !settings.forceLoss })} 
                                    className={`w-12 h-6 rounded-full relative transition-colors ${settings.forceLoss ? 'bg-[#f6465d]' : isLight ? 'bg-[#e5e7eb]' : 'bg-[#474d57]'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.forceLoss ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-xl border shadow-lg lg:col-span-2" style={{ backgroundColor: cardBg, borderColor }}>
                        <h3 className={`text-sm font-bold mb-4 uppercase tracking-wide ${isLight ? 'text-[#111827]' : 'text-white'}`}>
                            Investment Limits
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold mb-1 block" style={{ color: mutedText }}>Min Investment ($)</label>
                                <input 
                                    type="number" 
                                    value={settings.minInvestment} 
                                    onChange={(e) => onUpdate({ ...settings, minInvestment: Number(e.target.value) })} 
                                    className={`w-full rounded p-2 font-mono focus:border-[#fcd535] outline-none ${isLight ? 'bg-white border border-[#e5e7eb] text-[#111827]' : 'bg-[#131722] border border-[#474d57] text-white'}`} 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold mb-1 block" style={{ color: mutedText }}>Max Investment ($)</label>
                                <input 
                                    type="number" 
                                    value={settings.maxInvestment} 
                                    onChange={(e) => onUpdate({ ...settings, maxInvestment: Number(e.target.value) })} 
                                    className={`w-full rounded p-2 font-mono focus:border-[#fcd535] outline-none ${isLight ? 'bg-white border border-[#e5e7eb] text-[#111827]' : 'bg-[#131722] border border-[#474d57] text-white'}`} 
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
