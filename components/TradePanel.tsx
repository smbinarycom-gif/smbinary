import React, { useState, useEffect } from 'react';
import { Asset } from '../types';

interface TradePanelProps {
  asset: Asset;
  onTrade: (type: 'CALL' | 'PUT', amount: number, durationInSeconds: number) => void;
  balance: number;
  shortcuts?: number[]; 
  minInvestment?: number;
  maxInvestment?: number;
  activeDurations: number[];
}

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m`;
};

const TradePanel: React.FC<TradePanelProps> = ({ 
  asset, 
  onTrade, 
  balance, 
  shortcuts = [10, 50, 100, 500],
  minInvestment = 1,
  maxInvestment = 1000,
  activeDurations
}) => {
  const [amount, setAmount] = useState(10);
  const [durationInSeconds, setDurationInSeconds] = useState(60);

  useEffect(() => {
    // If current selected duration is not in the active list, select the first available
    if (!activeDurations.includes(durationInSeconds) && activeDurations.length > 0) {
      setDurationInSeconds(activeDurations[0]);
    }
  }, [activeDurations]);

  const isOutOfRange = amount < minInvestment || amount > maxInvestment;
  const possibleProfit = (amount * (asset.payout / 100)).toFixed(2);

  return (
    <div className="flex flex-col space-y-4 lg:space-y-6">
      <div className="space-y-4 lg:space-y-5">
        <div className="space-y-2">
          <label className="text-[8px] font-black text-white/30 uppercase tracking-[2px]">EXPIRATION</label>
          <div className="grid grid-cols-4 gap-2">
            {activeDurations.map(duration => (
              <button 
                key={duration}
                onClick={() => setDurationInSeconds(duration)}
                className={`py-3 lg:py-2.5 rounded-full text-[10px] font-black transition-all border ${
                  durationInSeconds === duration 
                  ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
                  : 'bg-[#0c0c0e] border-white/5 text-white/30 hover:text-white'
                }`}
              >
                {formatDuration(duration)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[8px] font-black text-white/30 uppercase tracking-[2px]">INVESTMENT AMOUNT</label>
            <span className={`text-[8px] font-black uppercase tracking-[1px] ${isOutOfRange ? 'text-[#ff0033]' : 'text-white/20'}`}>
              Limit: ${minInvestment} - ${maxInvestment}
            </span>
          </div>
          <div className="relative group">
             <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(Number(e.target.value))}
              className={`w-full bg-[#0c0c0e] border rounded-2xl p-4 lg:p-5 text-white font-black text-2xl lg:text-3xl focus:outline-none transition-all font-mono ${
                isOutOfRange ? 'border-[#ff0033] shadow-[0_0_15px_rgba(255,0,51,0.1)]' : 'border-white/5 focus:border-white/20'
              }`}
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 font-black text-2xl">$</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {shortcuts.map(v => (
              <button 
                key={v} 
                onClick={() => setAmount(v)} 
                className={`flex-1 min-w-[50px] py-2 text-[9px] font-black rounded-xl border transition-all active:scale-95 ${
                  amount === v ? 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/40' : 'bg-[#0c0c0e] text-white/30 border-white/5 hover:text-white'
                }`}
              >
                ${v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-5 rounded-2xl bg-[#ccff00]/5 border border-[#ccff00]/10 flex flex-col items-center">
          <span className="text-[8px] text-[#ccff00]/50 font-black uppercase tracking-[2px] mb-1">EXPECTED PROFIT</span>
          <span className="text-3xl lg:text-4xl font-black text-[#ccff00] font-mono tracking-tighter">+$ {possibleProfit}</span>
      </div>

      {/* Trade Buttons */}
      <div className="flex flex-row gap-3">
        <button 
          disabled={isOutOfRange}
          onClick={() => onTrade('CALL', amount, durationInSeconds)}
          className={`flex-1 relative group h-24 lg:h-22 overflow-hidden rounded-2xl font-black transition-all active:scale-95 flex flex-col items-center justify-center ${
            isOutOfRange ? 'bg-[#ccff00]/10 text-white/10 border border-white/5 cursor-not-allowed' : 'bg-[#ccff00] text-black shadow-[0_10px_30px_rgba(204,255,0,0.3)]'
          }`}
        >
          <span className="text-3xl lg:text-3xl leading-none">↑</span>
          <span className="text-xl lg:text-2xl tracking-tighter uppercase font-black">BUY</span>
        </button>

        <button 
          disabled={isOutOfRange}
          onClick={() => onTrade('PUT', amount, durationInSeconds)}
          className={`flex-1 relative group h-24 lg:h-22 overflow-hidden rounded-2xl font-black transition-all active:scale-95 flex flex-col items-center justify-center ${
            isOutOfRange ? 'bg-[#ff0033]/10 text-white/10 border border-white/5 cursor-not-allowed' : 'bg-[#ff0033] text-white shadow-[0_10px_30px_rgba(255,0,51,0.3)]'
          }`}
        >
          <span className="text-3xl lg:text-3xl leading-none">↓</span>
          <span className="text-xl lg:text-2xl tracking-tighter uppercase font-black">SELL</span>
        </button>
      </div>
    </div>
  );
};

export default TradePanel;