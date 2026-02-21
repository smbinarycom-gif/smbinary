
import React, { useState } from 'react';
import { AnalysisResult, CandleData, AiAnalystSettings } from '../../shared/types';
import { getMarketAnalysis } from '../../shared/services/geminiService';

interface AiAnalystProps {
  assetSymbol: string;
  currentPrice: number;
  priceHistory: CandleData[];
  settings: AiAnalystSettings;
}

const AiAnalyst: React.FC<AiAnalystProps> = ({ assetSymbol, currentPrice, priceHistory, settings }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  if (!settings.isEnabled) return null;

  const runAnalysis = async () => {
    if (settings.status !== 'ACTIVE') return;
    setLoading(true);
    const result = await getMarketAnalysis(assetSymbol, currentPrice, priceHistory.slice(-10));
    if (result.confidence < settings.minConfidence) {
        setAnalysis({
            ...result,
            sentiment: 'NEUTRAL',
            reasoning: 'Market volatility too high for a confident prediction. Admin threshold not met.'
        });
    } else {
        setAnalysis(result);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] transition-all duration-1000 ${settings.status === 'MAINTENANCE' ? 'bg-[#f59e0b]/5' : 'bg-[#8b5cf6]/10'}`}></div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-3">
           <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${settings.status === 'MAINTENANCE' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20' : 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20'}`}>
              <i className="fa-solid fa-brain text-xs"></i>
           </div>
           <div>
              <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[2px]">Gemini Analyst</h3>
              <p className={`text-[8px] font-bold uppercase tracking-wider ${settings.status === 'MAINTENANCE' ? 'text-[#f59e0b]' : 'text-slate-400'}`}>
                {settings.status === 'MAINTENANCE' ? 'SYSTEM UPGRADE' : 'Intelligence Layer'}
              </p>
           </div>
        </div>
        
        {settings.status === 'ACTIVE' ? (
            <button 
                onClick={runAnalysis}
                disabled={loading}
                className="px-3 py-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:bg-slate-100 text-white text-[9px] font-black rounded-lg transition-all uppercase tracking-wider shadow-sm active:scale-95"
            >
                {loading ? 'Analyzing...' : 'Get Signal'}
            </button>
        ) : settings.status === 'MAINTENANCE' ? (
            <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
        ) : (
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">OFFLINE</span>
        )}
      </div>

      {settings.status === 'ACTIVE' ? (
        analysis ? (
            <div className="animate-fade-in space-y-3 relative z-10">
            <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                analysis.sentiment === 'BULLISH' ? 'bg-[#0ecb81]/10 text-[#0ecb81]' : 
                analysis.sentiment === 'BEARISH' ? 'bg-[#f6465d]/10 text-[#f6465d]' : 
                'bg-slate-100 text-slate-400'
                }`}>
                {analysis.sentiment}
                </span>
                <span className="text-[10px] text-slate-600 font-black font-mono">{analysis.confidence}% CONFIDENCE</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div 
                className={`h-full transition-all duration-500 ${analysis.sentiment === 'BULLISH' ? 'bg-[#0ecb81]' : analysis.sentiment === 'BEARISH' ? 'bg-[#f6465d]' : 'bg-slate-400'}`}
                style={{ width: `${analysis.confidence}%` }}
                ></div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed italic font-medium">
                "{analysis.reasoning}"
            </p>
            </div>
        ) : (
            <div className="py-4 text-center border border-dashed border-slate-200 rounded-xl">
            <p className="text-[9px] text-slate-300 font-black uppercase tracking-[2px]">Scan Marketplace</p>
            </div>
        )
      ) : settings.status === 'MAINTENANCE' ? (
        <div className="py-4 space-y-3">
             <div className="w-full bg-[#f59e0b]/5 border border-[#f59e0b]/10 rounded-xl p-3">
                <p className="text-[10px] text-[#f59e0b] font-medium italic text-center leading-relaxed">
                    "{settings.maintenanceMessage}"
                </p>
             </div>
             <p className="text-[8px] text-slate-300 font-black uppercase tracking-[3px] text-center">Protocol V2.5.0 Deployment</p>
        </div>
      ) : (
        <div className="py-8 flex flex-col items-center justify-center opacity-30">
            <i className="fa-solid fa-triangle-exclamation text-slate-300 text-xl mb-2"></i>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Service Disconnected</p>
        </div>
      )}
    </div>
  );
};

export default AiAnalyst;
