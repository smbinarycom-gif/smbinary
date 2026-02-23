
import React from 'react';
import { MarketSettings, AdminThemeSettings } from '../../shared/types.ts';

interface AiTabProps {
    settings: MarketSettings;
    onUpdate: (settings: MarketSettings) => void;
    theme?: AdminThemeSettings;
}

const AiTab: React.FC<AiTabProps> = ({ settings, onUpdate, theme }) => {
    const isLight = theme?.mode === 'LIGHT';
    const cardBg = isLight ? '#ffffff' : '#1e2329';
    const borderColor = isLight ? '#e5e7eb' : '#2b3139';
    const subtleBg = isLight ? '#f9fafb' : '#131722';
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 rounded-xl border shadow-lg" style={{ backgroundColor: cardBg, borderColor }}>
                <div className="flex items-center justify-between mb-6">
                    <div><h3 className={`text-lg font-bold ${isLight ? 'text-[#111827]' : 'text-white'}`}>AI Analyst Configuration</h3></div>
                    <div className={`w-3 h-3 rounded-full ${settings.aiAnalyst.isEnabled ? 'bg-[#0ecb81]' : 'bg-[#474d57]'}`}></div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border mb-6" style={{ backgroundColor: subtleBg, borderColor }}>
                    <span className="text-sm font-bold text-[#848e9c]">Master Enable Switch</span>
                    <button onClick={() => onUpdate({ ...settings, aiAnalyst: { ...settings.aiAnalyst, isEnabled: !settings.aiAnalyst.isEnabled } })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.aiAnalyst.isEnabled ? 'bg-[#0ecb81]' : 'bg-[#474d57]'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.aiAnalyst.isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border mb-6" style={{ backgroundColor: subtleBg, borderColor }}>
                    <span className="text-sm font-bold text-[#848e9c]">Service Status</span>
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => onUpdate({ ...settings, aiAnalyst: { ...settings.aiAnalyst, status: 'ACTIVE' } })}
                            className={`px-4 py-2 rounded text-xs font-bold transition-all ${settings.aiAnalyst.status === 'ACTIVE' ? 'bg-[#0ecb81] text-white' : 'bg-[#2b3139] text-[#848e9c]'}`}
                        >
                            ACTIVE
                        </button>
                        <button 
                            onClick={() => onUpdate({ ...settings, aiAnalyst: { ...settings.aiAnalyst, status: 'MAINTENANCE' } })}
                            className={`px-4 py-2 rounded text-xs font-bold transition-all ${settings.aiAnalyst.status === 'MAINTENANCE' ? 'bg-[#fcd535] text-black' : 'bg-[#2b3139] text-[#848e9c]'}`}
                        >
                            MAINTENANCE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiTab;
