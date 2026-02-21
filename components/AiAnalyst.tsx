
import React, { useState } from 'react';
import { AnalysisResult, CandleData } from '../types';
import { getMarketAnalysis } from '../services/geminiService';

interface AiAnalystProps {
  assetSymbol: string;
  currentPrice: number;
  priceHistory: CandleData[];
}

const AiAnalyst: React.FC<AiAnalystProps> = ({ assetSymbol, currentPrice, priceHistory }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    // Provide a snapshot of the most recent price history for Gemini to analyze
    const result = await getMarketAnalysis(assetSymbol, currentPrice, priceHistory.slice(-10));
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="bg-[#0c0c0e] p-4 lg:p-5 rounded-2xl border border-white/5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
           <div className="w-8 h-8 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6] border border-[#8b5cf6]/20">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM6.464 14.95a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414z"></path></svg>
           </div>
           <div>
              <h3 className="text-[10px] font-black text-white uppercase tracking-[2px]">Gemini Analyst</h3>
              <p className="text-[8px] text-white/30 font-bold uppercase">Binance Market Intelligence</p>
           </div>
        </div>
        <button 
          onClick={runAnalysis}
          disabled={loading}
          className="px-3 py-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:bg-white/5 text-white text-[9px] font-black rounded-lg transition-all uppercase tracking-wider shadow-[0_0_15px_rgba(139,92,246,0.3)]"
        >
          {loading ? 'Analyzing...' : 'Get Signal'}
        </button>
      </div>

      {analysis ? (
        <div className="animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
              analysis.sentiment === 'BULLISH' ? 'bg-[#0ecb81]/20 text-[#0ecb81]' : 
              analysis.sentiment === 'BEARISH' ? 'bg-[#f6465d]/20 text-[#f6465d]' : 
              'bg-white/10 text-white/40'
            }`}>
              {analysis.sentiment}
            </span>
            <span className="text-[10px] text-white/60 font-black font-mono">{analysis.confidence}% CONFIDENCE</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${analysis.sentiment === 'BULLISH' ? 'bg-[#0ecb81]' : analysis.sentiment === 'BEARISH' ? 'bg-[#f6465d]' : 'bg-white/40'}`}
              style={{ width: `${analysis.confidence}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed italic font-medium">
            "{analysis.reasoning}"
          </p>
        </div>
      ) : (
        <div className="py-4 text-center border border-dashed border-white/5 rounded-xl">
           <p className="text-[9px] text-white/20 font-black uppercase tracking-[2px]">
            Signal Offline
           </p>
        </div>
      )}
    </div>
  );
};

export default AiAnalyst;
