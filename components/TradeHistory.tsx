
import React, { useState, useEffect } from 'react';
import { Trade } from '../types';

interface TradeHistoryProps {
  trades: Trade[];
  payout: number;
}

const CountdownTimer: React.FC<{ startTime: number; expiryTime: number }> = ({ startTime, expiryTime }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);

  useEffect(() => {
    const totalDuration = expiryTime - startTime;

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, expiryTime - now);
      const remainingSeconds = Math.floor(diff / 1000);
      
      const currentProgress = totalDuration > 0 ? (diff / totalDuration) * 100 : 0;
      
      setTimeLeft(remainingSeconds);
      setProgress(currentProgress);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100); // Faster update for smooth progress bar
    return () => clearInterval(interval);
  }, [startTime, expiryTime]);

  const formatCountdown = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-end space-y-1 w-full max-w-[80px]">
      <div className="flex items-center space-x-1.5">
        <div className="w-1.5 h-1.5 bg-[#ccff00] rounded-full animate-pulse shadow-[0_0_8px_#ccff00]"></div>
        <span className="font-mono font-black text-[#ccff00] tabular-nums text-sm">
          {formatCountdown(timeLeft)}
        </span>
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#ccff00] transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const TradeHistory: React.FC<TradeHistoryProps> = ({ trades }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header for History */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#000000] z-10">
        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[3px]">Trade Journal</h3>
        <span className="text-[8px] bg-white/5 text-white/40 px-2 py-0.5 rounded font-black border border-white/5 uppercase">
          {trades.length} entries
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {trades.length > 0 ? (
          <div className="flex flex-col">
            {trades.map((trade) => {
              const isWin = trade.status === 'WIN';
              const isLoss = trade.status === 'LOSS';
              const isOpen = trade.status === 'OPEN';
              const profitValue = isWin ? (trade.amount * (trade.payoutAtTrade / 100)) : -trade.amount;

              return (
                <div 
                  key={trade.id} 
                  className={`flex flex-col p-4 border-b border-white/5 transition-all hover:bg-white/[0.02] relative overflow-hidden ${isOpen ? 'bg-white/[0.01]' : ''}`}
                >
                  {/* Status Indicator Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    isOpen ? 'bg-[#ccff00]' : isWin ? 'bg-[#0ecb81]' : 'bg-[#f6465d]'
                  }`} />

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-white tracking-tight">{trade.assetSymbol}</span>
                        <span className={`text-[8px] font-black px-1 py-0.5 rounded ${trade.type === 'CALL' ? 'bg-[#0ecb81]/20 text-[#0ecb81]' : 'bg-[#f6465d]/20 text-[#f6465d]'}`}>
                          {trade.type === 'CALL' ? 'BUY' : 'SELL'}
                        </span>
                      </div>
                      <span className="text-[9px] text-white/20 font-medium">Expires {formatTime(trade.expiryTime)}</span>
                    </div>
                    
                    <div className="flex flex-col items-end min-w-[80px]">
                      {isOpen ? (
                        <CountdownTimer startTime={trade.startTime} expiryTime={trade.expiryTime} />
                      ) : (
                        <span className={`text-sm font-black font-mono ${isWin ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                          {isWin ? '+' : ''}{profitValue.toFixed(2)}$
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex flex-col">
                      <span className="text-white/20 font-bold uppercase tracking-widest text-[8px]">Entry</span>
                      <span className="text-white/60 font-mono">{trade.entryPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-white/20 font-bold uppercase tracking-widest text-[8px]">Investment</span>
                      <span className="text-white/60 font-mono">${trade.amount}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-white/20 font-bold uppercase tracking-widest text-[8px]">Payout</span>
                      <span className="text-white/60 font-mono">{trade.payoutAtTrade}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-10 text-center space-y-4 opacity-20">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[4px] leading-relaxed">No Recent Trades Found</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeHistory;
