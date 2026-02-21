
import React, { useState, useMemo, useEffect } from 'react';
import { Trade } from '../../shared/types';
import { AssetIcon } from './AssetIcon.tsx';

interface TradeHistoryProps {
   trades: Trade[];
   payout: number;
   isInModal?: boolean;
}

// Helper: Custom Hook for Countdown
const useCountdown = (targetDate: number) => {
  const [timeLeft, setTimeLeft] = useState(targetDate - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = targetDate - now;
      setTimeLeft(Math.max(0, diff));
      if (diff <= 0) clearInterval(interval);
    }, 100); 
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};

// ===================================
// SUB-COMPONENT: Active Trade Card
// ===================================
const ActiveTradeCard: React.FC<{ trade: Trade }> = ({ trade }) => {
  const timeLeft = useCountdown(trade.expiryTime);
  const totalDuration = trade.expiryTime - trade.startTime;
  const progressPercent = Math.min(100, Math.max(0, (timeLeft / totalDuration) * 100));
  
  const m = Math.floor(timeLeft / 1000 / 60);
  const s = Math.floor((timeLeft / 1000) % 60);
  const timeString = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  
  const potentialProfit = trade.amount + (trade.amount * (trade.payoutAtTrade / 100));

  return (
    <div className="bg-[#1e222d] border border-[#2a3040] rounded-lg p-3 mb-2 relative overflow-hidden shadow-lg animate-in slide-in-from-right-2 fade-in duration-300">
      <div className={`absolute top-0 right-0 w-16 h-16 opacity-10 blur-xl rounded-full ${trade.type === 'CALL' ? 'bg-[#00b85e]' : 'bg-[#ff3d3d]'}`}></div>
      
      <div className="flex justify-between items-center mb-3 relative z-10">
        <div className="flex items-center space-x-2">
           <AssetIcon asset={{ symbol: trade.assetSymbol }} className="w-4 h-4 mr-0" />
           <span className="text-xs font-bold text-white">{trade.assetSymbol}</span>
           <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${trade.type === 'CALL' ? 'bg-[#00b85e]/20 text-[#00b85e]' : 'bg-[#ff3d3d]/20 text-[#ff3d3d]'}`}>
             {trade.type === 'CALL' ? 'BUY' : 'SELL'}
           </span>
        </div>
        <div className="flex items-center space-x-2">
            <i className="fa-regular fa-clock text-[#7d8699] text-[10px]"></i>
            <span className="text-sm font-mono font-bold text-white">{timeString}</span>
        </div>
      </div>

      <div className="flex justify-between items-end mb-2 relative z-10">
         <div className="flex flex-col">
            <span className="text-[9px] text-[#7d8699] font-bold uppercase">Investment</span>
            <span className="text-xs font-mono font-bold text-white">${trade.amount}</span>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-[9px] text-[#7d8699] font-bold uppercase">Revenue</span>
            <span className="text-sm font-mono font-bold text-[#00b85e] drop-shadow-sm">+${potentialProfit.toFixed(2)}</span>
         </div>
      </div>

      <div className="w-full h-1 bg-[#2a3040] rounded-full overflow-hidden relative z-10">
         <div 
           className={`h-full transition-all duration-100 ease-linear ${trade.type === 'CALL' ? 'bg-[#00b85e]' : 'bg-[#ff3d3d]'}`} 
           style={{ width: `${progressPercent}%` }}
         ></div>
      </div>
    </div>
  );
};

// ===================================
// SUB-COMPONENT: Closed Trade Card
// ===================================
const ClosedTradeCard: React.FC<{ trade: Trade }> = ({ trade }) => {
  const isWin = trade.status === 'WIN';
  const isTie = trade.status === 'TIE';
  
  const profit = isWin 
    ? (trade.amount * (trade.payoutAtTrade / 100)) 
    : isTie 
        ? 0 
        : -trade.amount;
  
  // Format closing time as HH:MM (24h)
  const closeTimeStr = new Date(trade.expiryTime).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });

  // Border Color
  const borderColor = isWin ? 'border-l-[#00b85e]' : isTie ? 'border-l-[#9ca3af]' : 'border-l-[#ff3d3d]';
  // Badge Style
  const badgeClass = isWin 
    ? 'text-[#00b85e] bg-[#00b85e]/10' 
    : isTie 
        ? 'text-[#9ca3af] bg-[#9ca3af]/10' 
        : 'text-[#ff3d3d] bg-[#ff3d3d]/10';

  return (
    <div className={`bg-[#1e222d] border-l-4 ${borderColor} border-y border-r border-[#2a3040] rounded-r-lg p-3 mb-2 hover:bg-[#2a3040] transition-colors group`}>
       {/* Header: Asset, Badge, Time */}
       <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
              <AssetIcon asset={{ symbol: trade.assetSymbol }} className="w-4 h-4 mr-0" />
              <span className="text-xs font-bold text-white">{trade.assetSymbol}</span>
              <span className={`text-[8px] font-bold px-1 rounded ${badgeClass}`}>
                {isTie ? 'REFUND' : trade.status}
              </span>
          </div>
          <span className="text-[10px] text-[#7d8699] font-mono font-bold">{closeTimeStr}</span>
       </div>

       {/* Details: Entry -> Close */}
       <div className="flex items-center justify-between bg-[#161a1e]/50 rounded p-2 mb-2">
          <div className="flex flex-col">
             <span className="text-[8px] text-[#7d8699] font-bold uppercase tracking-wider">Entry</span>
             <span className="text-[10px] text-white font-mono font-bold">{trade.entryPrice.toFixed(5)}</span>
          </div>
          <i className="fa-solid fa-arrow-right-long text-[10px] text-[#7d8699] opacity-50"></i>
          <div className="flex flex-col items-end">
             <span className="text-[8px] text-[#7d8699] font-bold uppercase tracking-wider">Close</span>
             <span className={`text-[10px] font-mono font-bold ${isWin ? 'text-[#00b85e]' : isTie ? 'text-[#9ca3af]' : 'text-[#ff3d3d]'}`}>
                {trade.exitPrice?.toFixed(5) || '---'}
             </span>
          </div>
       </div>

       {/* Footer: Amount & Profit */}
       <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
             <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${trade.type === 'CALL' ? 'bg-[#00b85e]/10 text-[#00b85e]' : 'bg-[#ff3d3d]/10 text-[#ff3d3d]'}`}>
                {trade.type === 'CALL' ? '↑' : '↓'}
             </span>
             <span className="text-xs font-bold text-[#ccddbb] font-mono">${trade.amount}</span>
          </div>
          <span className={`text-sm font-black font-mono ${isWin ? 'text-[#00b85e]' : isTie ? 'text-[#9ca3af]' : 'text-[#ff3d3d]'}`}>
             {isWin ? '+' : ''}{profit.toFixed(2)}$
          </span>
       </div>
    </div>
  );
};

// ===================================
// MAIN COMPONENT: TradeHistory
// ===================================
const TradeHistory: React.FC<TradeHistoryProps> = ({ trades, payout, isInModal = false }) => {
  const [activeTab, setActiveTab] = useState<'OPEN' | 'CLOSED'>('OPEN');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterAsset, setFilterAsset] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'WIN' | 'LOSS' | 'TIE'>('ALL');
  const [limit, setLimit] = useState(10); 

  const openTrades = useMemo(() => trades.filter(t => t.status === 'OPEN').sort((a,b) => b.startTime - a.startTime), [trades]);
  const closedTrades = useMemo(() => {
    let list = trades.filter(t => t.status !== 'OPEN');
    
    // Asset Filter
    if (filterAsset !== 'ALL') list = list.filter(t => t.assetSymbol === filterAsset);
    
    // Status Filter
    if (filterStatus !== 'ALL') {
         list = list.filter(t => t.status === filterStatus);
    }
    
    return list.sort((a, b) => b.expiryTime - a.expiryTime);
  }, [trades, filterAsset, filterStatus]);

  const distinctAssets = useMemo(() => Array.from(new Set(trades.map(t => t.assetSymbol))), [trades]);
  const visibleHistory = closedTrades.slice(0, limit);

  return (
    <div className="flex flex-col h-full bg-[#181c25] relative">
      <div className="bg-[#1e222d] border-b border-[#2a3040] shrink-0 sticky top-0 z-20">
         <div className="flex items-center justify-between px-3 h-10">
            <h3 className="text-xs font-bold text-white uppercase tracking-wide">My Trades</h3>
            <button 
              onClick={() => setFilterOpen(!filterOpen)} 
              className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${filterOpen ? 'bg-[#3b82f6] text-white' : 'text-[#7d8699] hover:text-white'}`}
            >
              <i className="fa-solid fa-filter text-xs"></i>
            </button>
         </div>
         
         {filterOpen && (
             <div className="px-3 pb-3 pt-1 border-t border-[#2a3040] bg-[#1e222d] animate-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-2 mb-2">
                   <div>
                      <label className="text-[9px] text-[#7d8699] font-bold uppercase block mb-1">Asset</label>
                      <select 
                        value={filterAsset} 
                        onChange={(e) => setFilterAsset(e.target.value)}
                        className="w-full bg-[#161a1e] text-white text-[10px] border border-[#2a3040] rounded px-2 py-1.5 focus:border-[#00b85e] outline-none"
                      >
                         <option value="ALL">All Assets</option>
                         {distinctAssets.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="text-[9px] text-[#7d8699] font-bold uppercase block mb-1">Result</label>
                      <select 
                         value={filterStatus}
                         onChange={(e) => setFilterStatus(e.target.value as any)}
                         className="w-full bg-[#161a1e] text-white text-[10px] border border-[#2a3040] rounded px-2 py-1.5 focus:border-[#00b85e] outline-none"
                      >
                         <option value="ALL">All Results</option>
                         <option value="WIN">Win</option>
                         <option value="LOSS">Loss</option>
                         <option value="TIE">Refund</option>
                      </select>
                   </div>
                </div>
                <div className="flex justify-end">
                   <button onClick={() => { setFilterAsset('ALL'); setFilterStatus('ALL'); }} className="text-[9px] text-[#3b82f6] font-bold hover:underline">Reset Filters</button>
                </div>
             </div>
         )}

         <div className="flex items-center px-2 pt-1 space-x-4">
             <button 
                onClick={() => setActiveTab('OPEN')}
                className={`flex-1 pb-2 text-[11px] font-bold uppercase border-b-2 transition-all flex items-center justify-center gap-2 ${activeTab === 'OPEN' ? 'text-white border-[#00b85e]' : 'text-[#7d8699] border-transparent'}`}
             >
                <span>Active</span>
                {openTrades.length > 0 && (
                    <span className="bg-[#00b85e] text-[#1e222d] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[16px] h-4 flex items-center justify-center leading-none shadow-[0_0_5px_rgba(0,184,94,0.5)]">
                        {openTrades.length}
                    </span>
                )}
             </button>
             <button 
                onClick={() => setActiveTab('CLOSED')}
                className={`flex-1 pb-2 text-[11px] font-bold uppercase border-b-2 transition-all flex items-center justify-center gap-2 ${activeTab === 'CLOSED' ? 'text-white border-[#fcd535]' : 'text-[#7d8699] border-transparent'}`}
             >
                <span>Closed</span>
                {closedTrades.length > 0 && (
                    <span className="bg-[#fcd535] text-[#1e222d] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[16px] h-4 flex items-center justify-center leading-none shadow-[0_0_5px_rgba(252,213,53,0.5)]">
                        {closedTrades.length}
                    </span>
                )}
             </button>
         </div>
      </div>

      <div className={`flex-1 overflow-y-auto custom-scrollbar p-2 ${isInModal ? 'pb-2' : 'pb-16 md:pb-2'}`}>
         {activeTab === 'OPEN' ? (
            <div className="space-y-2">
               {openTrades.length > 0 ? (
                  openTrades.map(trade => <ActiveTradeCard key={trade.id} trade={trade} />)
               ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-[#7d8699] opacity-40">
                     <i className="fa-solid fa-stopwatch text-3xl mb-2"></i>
                     <span className="text-[10px] uppercase font-bold tracking-widest">No Active Trades</span>
                  </div>
               )}
            </div>
         ) : (
            <div className="space-y-1">
               {visibleHistory.length > 0 ? (
                  <>
                     {visibleHistory.map(trade => <ClosedTradeCard key={trade.id} trade={trade} />)}
                     
                     {closedTrades.length > limit && (
                         <button 
                            onClick={() => setLimit(l => l + 10)}
                            className="w-full py-3 text-xs text-[#7d8699] font-bold hover:text-white transition-colors border-t border-[#2a3040] mt-2"
                         >
                            Load more history...
                         </button>
                     )}
                  </>
               ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-[#7d8699] opacity-40">
                     <i className="fa-solid fa-box-open text-3xl mb-2"></i>
                     <span className="text-[10px] uppercase font-bold tracking-widest">History is Empty</span>
                  </div>
               )}
            </div>
         )}
      </div>

    </div>
  );
};

export default TradeHistory;
