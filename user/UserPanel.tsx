
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Asset, CandleData, Trade, MarketSettings, PaymentRequest } from '../../shared/types.ts';
import TradingChart from './components/TradingChart.tsx';
import TradePanel from './components/TradePanel.tsx';
import AssetList from './components/AssetList.tsx';
import TradeHistory from './components/TradeHistory.tsx';
import AiAnalyst from './components/AiAnalyst.tsx';
import WalletPanel from './components/WalletPanel.tsx';
import { AssetIcon } from './components/AssetIcon.tsx';

interface UserPanelProps {
  selectedAsset: Asset;
  setSelectedAsset: (a: Asset) => void;
  candleHistory: CandleData[];
  currentPrice: number;
  balance: number;
  accountType: 'DEMO' | 'LIVE';
  setAccountType: (type: 'DEMO' | 'LIVE') => void;
  demoBalance: number;
  liveBalance: number;
  onResetDemo: (amount?: number) => void;
  activeTrades: Trade[];
  selectedTimeFrame: string;
  setSelectedTimeFrame: (tf: string) => void;
  marketSettings: MarketSettings;
  effectivePayout: number;
  handleTrade: (type: 'CALL' | 'PUT', amount: number, duration: number) => void;
  onExit: () => void;
  visibleAssets: Asset[];
  paymentRequests: PaymentRequest[];
  onDeposit: (amount: number, txId: string, proof: string) => void;
  onWithdraw: (amount: number, targetPayId: string) => void;
}

// --- RATING INFO MODAL ---
const RatingInfoModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
        <div className="w-full max-w-[420px] bg-[#1e222d] rounded-2xl shadow-2xl border border-[#2a3040] relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={onClose} className="absolute top-4 right-4 text-[#7d8699] hover:text-white transition-colors">
                <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-[#2a3040] rounded-xl flex items-center justify-center shadow-lg">
                        <i className="fa-solid fa-suitcase text-[#fcd535] text-2xl"></i>
                    </div>
                    <div>
                        <p className="text-[#7d8699] text-xs font-bold uppercase tracking-wide">Top</p>
                        <h2 className="text-xl font-bold text-white tracking-tight">How does it work?</h2>
                    </div>
                </div>
                <div className="border border-dashed border-[#2a3040] rounded-xl p-5 mb-6 bg-[#2a3040]/10">
                    <p className="text-[#7d8699] text-sm mb-4 leading-relaxed">
                        All traders on our platform participate in this rating. Main features:
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full mt-1.5 mr-3 shrink-0"></span>
                            <span className="text-sm text-white font-medium leading-tight">Ranking metric is determined by system administrators (Profit, ROI, or Volume).</span>
                        </li>
                        <li className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full mt-1.5 mr-3 shrink-0"></span>
                            <span className="text-sm text-white font-medium leading-tight">A minimum number of trades and volume is required to qualify.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full mt-1.5 mr-3 shrink-0"></span>
                            <span className="text-sm text-white font-medium leading-tight">Participants can only be those who trade in live mode.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
);

// --- NOTIFICATIONS MODAL ---
interface NotificationItem {
    id: number; type: string; icon: string; color: string; bg: string; title: string; desc: string; time: string; unread: boolean; expanded: boolean;
}

const NotificationsModal = ({ 
    isOpen, onClose, notifications, onNotificationClick, onClearAll 
}: { 
    isOpen: boolean; onClose: () => void; notifications: NotificationItem[]; onNotificationClick: (id: number) => void; onClearAll: () => void;
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-[#161a1e] flex flex-col animate-in slide-in-from-right duration-200 lg:max-w-md lg:left-auto lg:border-l lg:border-[#2a3040] shadow-2xl">
            <div className="h-14 bg-[#1e222d] border-b border-[#2a3040] flex items-center justify-between px-4 shrink-0 shadow-lg relative z-10">
                <h2 className="text-white font-bold text-base">Notifications</h2>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[#848e9c] hover:text-white bg-[#2a3040] rounded-lg border border-[#333a4d] transition-colors"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-[#161a1e]">
                {notifications.map((item) => (
                    <div key={item.id} onClick={() => onNotificationClick(item.id)} className={`bg-[#1e222d] border border-[#2a3040] rounded-xl p-3 flex items-start space-x-3 transition-all duration-200 active:scale-[0.99] cursor-pointer ${item.unread ? 'border-l-[3px] border-l-[#3b82f6] bg-[#2a3040]/30' : ''}`}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}><i className={`fa-solid ${item.icon} text-sm`}></i></div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5"><h4 className={`text-white font-bold text-xs truncate ${item.expanded ? 'whitespace-normal' : ''}`}>{item.title}</h4><span className="text-[9px] text-[#848e9c] whitespace-nowrap ml-2">{item.time}</span></div>
                            <p className={`text-[10px] text-[#848e9c] leading-relaxed transition-all duration-300 ${item.expanded ? '' : 'line-clamp-1'}`}>{item.desc}</p>
                            {item.expanded && <span className="text-[9px] text-[#3b82f6] font-bold mt-2 inline-block">See details <i className="fa-solid fa-arrow-right ml-1"></i></span>}
                        </div>
                        {item.unread && <div className="w-2 h-2 rounded-full bg-[#3b82f6] mt-1.5 shrink-0 animate-pulse"></div>}
                    </div>
                ))}
                <div className="pt-4 pb-2 text-center"><span className="text-[10px] text-[#7d8699] uppercase font-bold tracking-widest">End of notifications</span></div>
            </div>
            <div className="p-3 border-t border-[#2a3040] bg-[#1e222d] flex space-x-3 pb-safe">
                <button onClick={onClearAll} className="flex-1 bg-[#2a3040] text-[#848e9c] font-bold text-xs py-3 rounded-lg border border-[#333a4d] hover:text-white transition-colors active:scale-95">Clear All</button>
                <button onClick={onClose} className="flex-1 bg-[#3b82f6] text-white font-bold text-xs py-3 rounded-lg hover:bg-[#2563eb] transition-colors shadow-lg shadow-blue-500/20 active:scale-95">Done</button>
            </div>
        </div>
    );
};

// --- NEW EDIT DEMO BALANCE MODAL ---
const EditDemoBalanceModal = ({ isOpen, onClose, currentBalance, onUpdate }: { isOpen: boolean; onClose: () => void; currentBalance: number; onUpdate: (amount: number) => void; }) => {
    const [amount, setAmount] = useState(currentBalance.toString());
    useEffect(() => { if(isOpen) setAmount(currentBalance.toString()); }, [isOpen, currentBalance]);
    const handleConfirm = () => {
        let val = parseFloat(amount); if (isNaN(val)) val = 10000;
        if (val > 10000) val = 10000; if (val < 0) val = 0;
        onUpdate(val); onClose();
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-[320px] bg-[#1e222d] rounded-xl border border-[#2a3040] p-5 relative animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-3 right-3 text-[#7d8699] hover:text-white transition-colors"><i className="fa-solid fa-xmark text-lg"></i></button>
                <h2 className="text-white font-bold text-lg mb-4 text-center">Top up Demo</h2>
                <div className="mb-6"><div className="flex justify-between mb-1"><label className="text-[10px] text-[#7d8699] font-bold uppercase">Balance</label><span className="text-[10px] text-[#f6465d] font-bold uppercase">Max: $10k</span></div>
                <div className="relative"><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#161a1e] border border-[#333a4d] rounded-lg py-3 pl-3 pr-10 text-white font-bold font-mono focus:border-[#3b82f6] outline-none transition-colors"/><button onClick={() => setAmount('10000')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d8699] hover:text-[#fcd535] transition-colors"><i className="fa-solid fa-rotate-right"></i></button></div></div>
                <div className="flex space-x-2 mb-4"><button onClick={() => setAmount('0')} className="flex-1 py-2 bg-[#2a3040] rounded text-xs font-bold text-[#ccddbb] hover:bg-[#3b414d] transition-colors">$0</button><button onClick={() => setAmount('1000')} className="flex-1 py-2 bg-[#2a3040] rounded text-xs font-bold text-[#ccddbb] hover:bg-[#3b414d] transition-colors">$1k</button><button onClick={() => setAmount('10000')} className="flex-1 py-2 bg-[#2a3040] rounded text-xs font-bold text-[#ccddbb] hover:bg-[#3b414d] transition-colors">$10k</button></div>
                <button onClick={handleConfirm} className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-500/20">Confirm</button>
            </div>
        </div>
    );
};

// --- MOBILE ACCOUNT SWITCHER ---
const AccountSwitchModal = ({ isOpen, onClose, accountType, onSwitch, liveBalance, demoBalance, onResetDemo, hideBalance, onToggleBalance, onEditDemo }: any) => {
    if (!isOpen) return null;
    return (
        <div onClick={(e) => e.target === e.currentTarget && onClose()} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex flex-col justify-start pt-16 items-center px-4 animate-in fade-in duration-200">
             <div className="w-full max-w-sm bg-[#1e222d] rounded-lg shadow-2xl border border-[#2a3040] overflow-hidden animate-in zoom-in-95 duration-200 origin-top">
                 <div className="bg-[#2a3040] p-3 flex justify-between items-center relative overflow-hidden border-b border-[#333a4d]"><div className="flex flex-col relative z-10"><span className="text-[9px] text-[#7d8699] font-black uppercase tracking-widest mb-0.5">STANDARD:</span><span className="text-white font-bold text-sm">+0% profit</span></div><button onClick={(e) => { e.stopPropagation(); onToggleBalance(); }} className="w-8 h-8 rounded bg-[#1e222d] flex items-center justify-center text-[#848e9c] hover:text-white transition-colors"><i className={`fa-solid ${hideBalance ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i></button></div>
                 <div className="p-4 bg-[#1e222d] border-b border-[#2a3040]"><h3 className="text-white font-bold text-sm truncate">todayearning2022@gmail.com</h3><p className="text-[#7d8699] text-[10px] font-bold mb-3 tracking-wide">ID: 48131283</p><div className="flex items-center justify-between"><div className="flex items-center space-x-1"><span className="text-[#7d8699] text-[10px] font-medium">Currency:</span><span className="text-white font-bold text-xs">USD</span></div><button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white text-[9px] font-bold px-3 py-1 rounded transition-colors uppercase">CHANGE</button></div></div>
                 <div className="p-2 space-y-1 bg-[#161a1e]">
                    <div onClick={() => onSwitch('LIVE')} className={`p-3 rounded-lg cursor-pointer flex items-start space-x-3 transition-colors ${accountType === 'LIVE' ? 'bg-[#2a3040]' : 'hover:bg-[#2a3040]/50'}`}><div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${accountType === 'LIVE' ? 'border-[#00b85e]' : 'border-[#7d8699]'}`}>{accountType === 'LIVE' && <div className="w-2 h-2 rounded-full bg-[#00b85e]"></div>}</div><div className="flex-1"><div className="flex justify-between items-center"><span className="text-white font-bold text-sm">Live Account</span></div><p className="text-[#7d8699] text-xs font-mono mb-1">{hideBalance ? '****' : `$${liveBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}`}</p><div className="flex items-center justify-between"><span className="text-[#7d8699] text-[9px]">The daily limit is not set</span><button onClick={(e) => { e.stopPropagation(); }} className="text-[#3b82f6] text-[9px] font-bold uppercase hover:text-[#60a5fa]">SET LIMIT</button></div></div></div>
                    <div onClick={() => onSwitch('DEMO')} className={`p-3 rounded-lg cursor-pointer flex items-start space-x-3 transition-colors ${accountType === 'DEMO' ? 'bg-[#2a3040]' : 'hover:bg-[#2a3040]/50'}`}><div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${accountType === 'DEMO' ? 'border-[#f6990c]' : 'border-[#7d8699]'}`}>{accountType === 'DEMO' && <div className="w-2 h-2 rounded-full bg-[#f6990c]"></div>}</div><div className="flex-1"><div className="flex justify-between items-center mb-1"><span className="text-white font-bold text-sm">Demo Account</span><button onClick={(e) => { e.stopPropagation(); onEditDemo(); }} className="text-[#7d8699] hover:text-white"><i className="fa-solid fa-pen text-xs"></i></button></div><div className="flex items-center space-x-2"><p className="text-white text-xs font-bold font-mono">{hideBalance ? '****' : `$${demoBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}`}</p><button onClick={(e) => { e.stopPropagation(); onResetDemo(); }} className="text-[#7d8699] hover:text-white transition-colors"><i className="fa-solid fa-rotate-right text-xs"></i></button></div></div></div>
                 </div>
            </div>
        </div>
    );
}

// --- CONFIRMATION MODAL ---
const AccountChangedModal = ({ isOpen, onClose, type, balance }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
             <div className="w-full max-w-[320px] bg-[#1e222d] rounded-xl border border-[#2a3040] p-5 relative animate-in zoom-in-95 duration-200 shadow-2xl"><button onClick={onClose} className="absolute top-3 right-3 text-[#7d8699] hover:text-white transition-colors"><i className="fa-solid fa-xmark text-lg"></i></button><h2 className="text-lg font-bold text-white mb-2 text-center">Account type changed</h2><p className="text-[#848e9c] text-xs text-center mb-6">You are now trading on a <span className="text-white font-bold">{type === 'LIVE' ? 'Live' : 'Demo'} Account</span></p><div className="flex flex-col items-center space-y-4 mb-6"><div className="flex flex-col items-center opacity-40 scale-75 grayscale"><i className={`fa-solid ${type === 'LIVE' ? 'fa-graduation-cap' : 'fa-paper-plane'} text-4xl mb-1`}></i><span className="text-[9px] font-bold uppercase">{type === 'LIVE' ? 'DEMO' : 'LIVE'} ACCOUNT</span></div><i className="fa-solid fa-arrow-down text-[#3b82f6] text-xl animate-bounce"></i><div className="bg-[#2a3040] rounded-lg p-4 w-full flex flex-col items-center border border-[#3b414d] shadow-lg relative overflow-hidden"><div className={`absolute top-0 left-0 w-full h-1 ${type === 'LIVE' ? 'bg-[#00b85e]' : 'bg-[#f6990c]'}`}></div><i className={`fa-solid ${type === 'LIVE' ? 'fa-paper-plane text-[#00b85e]' : 'fa-graduation-cap text-[#f6990c]'} text-2xl mb-2`}></i><span className={`text-[9px] font-black uppercase tracking-[2px] mb-1 ${type === 'LIVE' ? 'text-[#00b85e]' : 'text-[#f6990c]'}`}>{type} ACCOUNT</span><span className="text-lg font-bold text-white font-mono">${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div></div><button onClick={onClose} className="w-full bg-[#2a3040] hover:bg-[#3b414d] text-white font-bold text-sm py-3 rounded-lg border border-[#3b414d] transition-all">Close</button></div>
        </div>
    )
}

// Reusable Leaderboard Component for User Panel
const LeaderboardContent = ({ data, isDesktop = false, onClose, onShowInfo, isEnabled, rankingBasis }: { data: any[], isDesktop?: boolean, onClose?: () => void, onShowInfo: () => void, isEnabled: boolean, rankingBasis: string }) => {
    if (!isEnabled) {
        return (
            <div className={`flex flex-col h-full bg-[#1e222d] ${isDesktop ? 'border-r border-[#2a3040]' : ''}`}>
                 <div className="flex items-center justify-between p-4 border-b border-[#2a3040]"><h2 className="text-lg font-bold text-white">Leader Board</h2>{onClose && <button onClick={onClose} className="text-[#848e9c] hover:text-white transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>}</div>
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center"><div className="w-20 h-20 bg-[#2a3040] rounded-3xl flex items-center justify-center mb-4 text-[#f6465d]/40 border border-[#f6465d]/20"><i className="fa-solid fa-lock text-4xl"></i></div><h3 className="text-white font-bold text-base mb-2">Leader Board বর্তমানে বন্ধ আছে</h3><p className="text-[#7d8699] text-xs leading-relaxed max-w-[200px]">সিস্টেম মেইনটেন্যান্সের কারণে লিডারবোর্ড সাময়িকভাবে বন্ধ রাখা হয়েছে।</p></div>
            </div>
        );
    }
    return (
        <div className={`flex flex-col h-full bg-[#1e222d] ${isDesktop ? 'border-r border-[#2a3040]' : ''}`}>
            <div className="flex items-center justify-between p-4 border-b border-[#2a3040] shrink-0 bg-[#1e222d] z-10"><div><h2 className="text-lg font-bold text-white">Leader Board</h2><p className="text-xs text-[#7d8699] font-medium">Ranked by {rankingBasis.replace('_', ' ').toLowerCase()}</p></div>{onClose && <button onClick={onClose} className="text-[#848e9c] hover:text-white transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>}</div>
            <div className="p-4 space-y-3 shrink-0 bg-[#1e222d] border-b border-[#2a3040] z-10 shadow-md">
                <div className="bg-[#2a3040]/40 border border-[#2a3040] rounded-lg p-4 relative overflow-hidden"><div className="flex items-center justify-between mb-3 relative z-10"><div className="flex items-center space-x-3"><img src="https://flagcdn.com/24x18/bd.png" alt="flag" className="w-5 h-3.5 rounded-[2px]" /><span className="text-sm font-bold text-white">Sumon Mollik</span></div><span className="text-sm font-bold text-[#00b85e]">$0.00</span></div><div className="h-[1px] bg-[#2a3040] w-full mb-3 relative z-10"></div><p className="text-xs text-[#7d8699] font-bold relative z-10">Your position: <span className="text-white ml-1">-</span></p><div className="absolute -right-4 -bottom-4 text-[#2a3040]/50 transform rotate-12 pointer-events-none"><i className="fa-solid fa-trophy text-6xl"></i></div></div>
                <div onClick={onShowInfo} className="bg-[#2a3040]/20 border border-[#2a3040] rounded-lg p-3 flex items-center justify-center space-x-2 cursor-pointer hover:bg-[#2a3040] transition-colors"><i className="fa-solid fa-gift text-[#fcd535]"></i><span className="text-xs font-bold text-[#3b82f6]">How does this rating work?</span></div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-[#1e222d]"><div className="space-y-1 pb-4">{data.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between py-3 border-b border-[#2a3040] last:border-0 hover:bg-[#2a3040]/40 px-3 rounded transition-colors group"><div className="flex items-center space-x-3"><div className="w-6 flex justify-center shrink-0">{index === 0 && <span className="w-6 h-6 rounded-full bg-[#fcd535] text-black flex items-center justify-center text-[10px] font-bold shadow-[0_0_10px_#fcd535]">1</span>}{index === 1 && <span className="w-6 h-6 rounded-full bg-[#C0C0C0] text-black flex items-center justify-center text-[10px] font-bold shadow-[0_0_10px_#C0C0C0]">2</span>}{index === 2 && <span className="w-6 h-6 rounded-full bg-[#CD7F32] text-black flex items-center justify-center text-[10px] font-bold shadow-[0_0_10px_#CD7F32]">3</span>}{index > 2 && <span className="text-xs font-bold text-[#7d8699] group-hover:text-white">{index + 1}</span>}</div><div className="flex items-center space-x-3 overflow-hidden"><div className="relative shrink-0"><img src={`https://flagcdn.com/24x18/${user.country}.png`} className="w-5 h-3.5 rounded-[2px]" alt="flag" /></div><span className="text-xs font-bold text-white truncate max-w-[110px]">{user.name}</span></div></div><span className="text-xs font-bold text-[#00b85e]">{rankingBasis === 'ROI' ? user.roi.toFixed(2) + '%' : '$' + user.displayValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
            ))}</div></div>
        </div>
    );
}

// Desktop Only Dropdown
const AccountSelectorDropdown = React.forwardRef<HTMLDivElement, any>(({ accountType, setAccountType, liveBalance, demoBalance, onResetDemo, onClose, onEditDemo, className, hideBalance, onToggleBalance }, ref) => (
  <div ref={ref} className={`bg-[#1e222d] border border-[#2a3040] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 w-80 md:w-96 ${className}`}>
      <div className="bg-[#2a3040] p-3 flex justify-between items-center border-b border-[#333a4d]"><div className="flex flex-col"><span className="text-[9px] text-[#7d8699] font-black uppercase tracking-widest mb-0.5">STANDARD:</span><span className="text-white font-bold text-xs">+0% profit</span></div><button onClick={(e) => { e.stopPropagation(); onToggleBalance(); }} className="w-8 h-8 rounded bg-[#1e222d] flex items-center justify-center text-[#848e9c] hover:text-white transition-colors"><i className={`fa-solid ${hideBalance ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i></button></div>
      <div className="p-4 bg-[#1e222d] border-b border-[#2a3040]"><h3 className="text-white font-bold text-sm truncate">todayearning2022@gmail.com</h3><p className="text-[#7d8699] text-[10px] font-bold mb-3 tracking-wide">ID: 48131283</p><div className="flex items-center justify-between"><div className="flex items-center space-x-1"><span className="text-[#7d8699] text-[10px] font-medium">Currency:</span><span className="text-white font-bold text-xs">USD</span></div><button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white text-[9px] font-bold px-3 py-1 rounded transition-colors uppercase">CHANGE</button></div></div>
      <div className="p-2 space-y-1 bg-[#161a1e]">
          <div onClick={(e) => { e.stopPropagation(); setAccountType('LIVE'); onClose(); }} className={`p-3 rounded-lg cursor-pointer flex items-start space-x-3 transition-colors ${accountType === 'LIVE' ? 'bg-[#2a3040]' : 'hover:bg-[#2a3040]/50'}`}><div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${accountType === 'LIVE' ? 'border-[#00b85e]' : 'border-[#7d8699]'}`}>{accountType === 'LIVE' && <div className="w-2 h-2 rounded-full bg-[#00b85e]"></div>}</div><div className="flex-1"><span className="text-white font-bold text-sm">Live Account</span><div className="flex justify-between items-center mt-1"><span className="text-white font-bold text-xs font-mono">{hideBalance ? '****' : `$${liveBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}`}</span></div><div className="flex items-center justify-between mt-1"><span className="text-[#7d8699] text-[9px]">The daily limit is not set</span><button onClick={(e) => { e.stopPropagation(); }} className="text-[#3b82f6] text-[9px] font-bold uppercase hover:text-[#60a5fa]">SET LIMIT</button></div></div></div>
          <div onClick={(e) => { e.stopPropagation(); setAccountType('DEMO'); onClose(); }} className={`p-3 rounded-lg cursor-pointer flex items-start space-x-3 transition-colors ${accountType === 'DEMO' ? 'bg-[#2a3040]' : 'hover:bg-[#2a3040]/50'}`}><div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${accountType === 'DEMO' ? 'border-[#f6990c]' : 'border-[#7d8699]'}`}>{accountType === 'DEMO' && <div className="w-2 h-2 rounded-full bg-[#f6990c]"></div>}</div><div className="flex-1"><div className="flex justify-between items-center"><span className="text-white font-bold text-sm">Demo Account</span><button onClick={(e) => { e.stopPropagation(); onEditDemo(); onClose(); }} className="text-[#7d8699] hover:text-white"><i className="fa-solid fa-pen text-xs"></i></button></div><div className="flex items-center space-x-2 mt-1"><span className="text-white font-bold text-xs font-mono">{hideBalance ? '****' : `$${demoBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}`}</span><button onClick={(e) => { e.stopPropagation(); onResetDemo(); }} className="text-[#7d8699] hover:text-white transition-colors"><i className="fa-solid fa-rotate-right text-xs"></i></button></div></div></div>
      </div>
  </div>
));

const UserPanel: React.FC<UserPanelProps> = ({
  selectedAsset, setSelectedAsset, candleHistory, currentPrice, balance, accountType, setAccountType, demoBalance, liveBalance, onResetDemo, activeTrades, selectedTimeFrame, setSelectedTimeFrame, marketSettings, effectivePayout, handleTrade, onExit, visibleAssets, paymentRequests, onDeposit, onWithdraw
}) => {
  const [isAssetListOpen, setIsAssetListOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false); 
  const [showRatingInfo, setShowRatingInfo] = useState(false); 
  const [isTradesListOpen, setIsTradesListOpen] = useState(false); 
  const [isAccountSelectorOpen, setIsAccountSelectorOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState('TRADE');
  const [isMobileAccountModalOpen, setIsMobileAccountModalOpen] = useState(false);
  const [isChangedModalOpen, setIsChangedModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hideBalance, setHideBalance] = useState(false); 
  const [isEditDemoModalOpen, setIsEditDemoModalOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const desktopAccountSelectorRef = useRef<HTMLDivElement>(null);
  const relevantTrades = useMemo(() => activeTrades.filter(t => t.accountType === accountType), [activeTrades, accountType]);
  const isCurrentAssetOTC = marketSettings.marketMode === 'OTC' || selectedAsset.forceOTC;

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'SYSTEM', icon: 'fa-shield-halved', color: 'text-[#3b82f6]', bg: 'bg-[#3b82f6]/10', title: 'System Security', desc: 'Two-factor authentication recommended.', time: 'Now', unread: true, expanded: false },
    { id: 2, type: 'SUCCESS', icon: 'fa-check', color: 'text-[#0ecb81]', bg: 'bg-[#0ecb81]/10', title: 'Deposit Confirmed', desc: 'Your deposit of $500.00 has been credited.', time: '2m ago', unread: true, expanded: false },
  ]);

  const handleAccountSwitch = (newType: 'LIVE' | 'DEMO') => {
      if (newType !== accountType) { setAccountType(newType); setIsMobileAccountModalOpen(false); setIsAccountSelectorOpen(false); setIsChangedModalOpen(true); }
      else { setIsMobileAccountModalOpen(false); setIsAccountSelectorOpen(false); }
  };

  useEffect(() => {
    const timer = setInterval(() => {
        const now = new Date(); setCurrentTime(`${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')} UTC`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // PUBLIC LEADERBOARD CALCULATION (Respects Admin Rules)
  const leaderboardData = useMemo(() => {
    const config = marketSettings.leaderboardConfig;
    const liveTrades = activeTrades.filter(t => t.accountType === 'LIVE' && t.status !== 'OPEN');
    
    // Group users from trade history
    const userSummary: Record<string, { id: string, name: string, net: number, volume: number, count: number, country: string }> = {};
    
    // Seed data (Optional, filtered later)
    const countries = ['us', 'gb', 'in', 'ae', 'sa', 'pk', 'bd', 'cn', 'jp', 'de', 'fr', 'br', 'ru'];
    for (let i = 0; i < 20; i++) {
        userSummary[`seed_${i}`] = { id: `seed_${i}`, name: `Trader_${i}`, net: 15000 - (i * 800), volume: 50000, count: 50, country: countries[i % countries.length] };
    }

    // Actual user data
    liveTrades.forEach(t => {
        const id = "currentUser";
        if (!userSummary[id]) userSummary[id] = { id, name: "Sumon Mollik", net: 0, volume: 0, count: 0, country: 'bd' };
        userSummary[id].volume += t.amount;
        userSummary[id].count += 1;
        if (t.status === 'WIN') userSummary[id].net += t.amount * (t.payoutAtTrade / 100);
        else if (t.status === 'LOSS') userSummary[id].net -= t.amount;
    });

    return Object.values(userSummary)
        .filter(u => {
            // Exclude logic
            if (config.excludedUserIds.includes(u.id)) return false;
            // Qualification rules
            if (u.count < config.minTradeCount) return false;
            if (u.volume < config.minTradeVolume) return false;
            return true;
        })
        .map(u => ({
            ...u,
            roi: u.volume > 0 ? (u.net / u.volume) * 100 : 0,
            displayValue: config.rankingBasis === 'TOTAL_VOLUME' ? u.volume : u.net
        }))
        .sort((a, b) => {
            if (config.rankingBasis === 'ROI') return b.roi - a.roi;
            if (config.rankingBasis === 'TOTAL_VOLUME') return b.volume - a.volume;
            return b.net - a.net;
        })
        .slice(0, 20);
  }, [activeTrades, marketSettings.leaderboardConfig]);

  if (marketSettings.maintenanceMode) return (
      <div className="h-screen w-screen bg-[#131722] flex flex-col items-center justify-center p-8 text-center text-white"><h1 className="text-4xl font-bold mb-4">System Maintenance</h1><button onClick={onExit} className="mt-8 text-sm font-bold text-[#00b85e] hover:underline">Exit Platform</button></div>
  );

  return (
    <div className="h-screen w-screen bg-[#131722] text-[#ccddbb] overflow-hidden font-inter">
      {showRatingInfo && <RatingInfoModal onClose={() => setShowRatingInfo(false)} />}
      <EditDemoBalanceModal isOpen={isEditDemoModalOpen} onClose={() => setIsEditDemoModalOpen(false)} currentBalance={demoBalance} onUpdate={onResetDemo} />
      <AccountSwitchModal isOpen={isMobileAccountModalOpen} onClose={() => setIsMobileAccountModalOpen(false)} accountType={accountType} onSwitch={handleAccountSwitch} liveBalance={liveBalance} demoBalance={demoBalance} onResetDemo={onResetDemo} hideBalance={hideBalance} onToggleBalance={() => setHideBalance(!hideBalance)} onEditDemo={() => { setIsMobileAccountModalOpen(false); setIsEditDemoModalOpen(true); }} />
      <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} notifications={notifications} onNotificationClick={(id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, unread: false, expanded: !n.expanded} : n))} onClearAll={() => setNotifications(prev => prev.map(n => ({...n, unread: false})))} />
      <AccountChangedModal isOpen={isChangedModalOpen} onClose={() => setIsChangedModalOpen(false)} type={accountType} balance={balance} />
      
      {/* Desktop Main */}
      <div className="hidden md:flex h-full w-full">
        <aside className="w-[60px] flex flex-col items-center py-4 bg-[#1e222d] border-r border-[#2a3040] z-20 shrink-0">
          <div className="mb-6 w-8 h-8 bg-[#00b85e] rounded flex items-center justify-center font-bold text-white text-lg">Q</div>
          <div className="flex flex-col space-y-6 w-full">
              <button onClick={() => { setMobileTab('TRADE'); setIsAssetListOpen(false); setIsLeaderboardOpen(false); }} className={`w-full h-10 flex items-center justify-center ${mobileTab === 'TRADE' && !isAssetListOpen && !isLeaderboardOpen ? 'text-[#00b85e]' : 'text-[#7d8699] hover:text-white'}`}><i className="fa-solid fa-arrow-trend-up text-lg"></i></button>
              <button onClick={() => { setIsLeaderboardOpen(!isLeaderboardOpen); setIsAssetListOpen(false); setMobileTab('TRADE'); }} className={`w-full h-10 flex items-center justify-center ${isLeaderboardOpen ? 'text-[#00b85e]' : 'text-[#7d8699] hover:text-white'}`}><i className="fa-solid fa-trophy text-lg"></i></button>
              <button onClick={() => { setIsAssetListOpen(!isAssetListOpen); setIsLeaderboardOpen(false); setMobileTab('TRADE'); }} className={`w-full h-10 flex items-center justify-center ${isAssetListOpen ? 'text-[#00b85e]' : 'text-[#7d8699] hover:text-white'}`}><i className="fa-solid fa-chart-simple text-lg"></i></button>
              <button onClick={() => { setMobileTab('WALLETS'); setIsAssetListOpen(false); setIsLeaderboardOpen(false); }} className={`w-full h-10 flex items-center justify-center ${mobileTab === 'WALLETS' ? 'text-[#00b85e]' : 'text-[#7d8699] hover:text-white'}`}><i className="fa-solid fa-wallet text-lg"></i></button>
          </div>
          <button onClick={onExit} className="mt-auto text-[#7d8699] hover:text-[#ff3d3d]"><i className="fa-solid fa-power-off"></i></button>
        </aside>
        <div className="flex-1 flex flex-col min-w-0 relative">
          <header className="h-16 bg-[#1e222d] flex items-center justify-between px-4 shrink-0 border-b border-[#2a3040]">
              <button onClick={() => setIsAssetListOpen(!isAssetListOpen)} className="flex items-center space-x-3 bg-[#2a3040] hover:bg-[#333a4d] px-3 py-2 rounded border border-[#333a4d]"><AssetIcon asset={selectedAsset} /><div className="flex flex-col items-start leading-tight"><span className="text-white text-sm font-bold">{selectedAsset.symbol} {isCurrentAssetOTC && '(OTC)'}</span><span className="text-[#00b85e] text-xs font-bold">{effectivePayout}%</span></div><i className="fa-solid fa-chevron-down text-[10px] text-[#7d8699] ml-2"></i></button>
                   <div className="flex items-center space-x-3">
                   <button onClick={() => setMobileTab('WALLETS')} className="ml-3 bg-[#00b85e] btn-deposit text-white text-xs font-bold px-3 py-1.5 rounded-lg h-9">Deposit</button>
                  <button onClick={() => setIsNotificationsOpen(true)} className="w-11 h-11 rounded bg-[#2a3040] flex items-center justify-center text-white relative border border-[#333a4d]"><i className="fa-regular fa-bell text-lg"></i>{notifications.filter(n => n.unread).length > 0 && <div className="absolute top-2 right-2 w-4 h-4 bg-[#ff3d3d] rounded-full flex items-center justify-center border border-[#2a3040]"><span className="text-[10px] font-bold text-white">{notifications.filter(n => n.unread).length}</span></div>}</button>
                  <div className="relative z-50"><button onClick={() => setIsAccountSelectorOpen(!isAccountSelectorOpen)} className="flex items-center space-x-3 bg-[#2a3040] hover:bg-[#333a4d] px-4 py-2 rounded border border-[#333a4d] h-11"><div className="text-xl">{accountType === 'DEMO' ? <i className="fa-solid fa-graduation-cap text-[#fcd535]"></i> : <i className="fa-solid fa-paper-plane text-[#00b85e]"></i>}</div><div className="flex flex-col items-start"><span className={`text-[9px] font-black uppercase tracking-wide ${accountType === 'LIVE' ? 'text-[#00b85e]' : 'text-[#fcd535]'}`}>{accountType} ACCOUNT</span><span className="text-white font-bold text-sm tracking-wide font-mono">{hideBalance ? '****' : `$${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}`}</span></div><i className="fa-solid fa-chevron-down text-[10px] text-[#7d8699] ml-1"></i></button>{isAccountSelectorOpen && <AccountSelectorDropdown accountType={accountType} setAccountType={handleAccountSwitch} liveBalance={liveBalance} demoBalance={demoBalance} onResetDemo={onResetDemo} onClose={() => setIsAccountSelectorOpen(false)} onEditDemo={() => { setIsEditDemoModalOpen(true); setIsAccountSelectorOpen(false); }} className="absolute top-full right-0 mt-2" hideBalance={hideBalance} onToggleBalance={() => setHideBalance(!hideBalance)} />}</div>
                  <button onClick={() => setMobileTab('WALLETS')} className="bg-[#00b85e] btn-deposit text-white text-sm font-bold px-6 py-2.5 rounded h-11 shadow-lg">Deposit</button>
                  </div>
          </header>
          <div className="flex-1 flex overflow-hidden relative">
              {isAssetListOpen && <div className="absolute top-0 left-0 bottom-0 z-30 w-80 shadow-2xl"><AssetList assets={visibleAssets} selectedId={selectedAsset.id} onSelect={(a) => { setSelectedAsset(a); setIsAssetListOpen(false); }} onClose={() => setIsAssetListOpen(false)} isGlobalOTC={marketSettings.marketMode === 'OTC'} /></div>}
              {isLeaderboardOpen && <div className="absolute top-0 left-0 bottom-0 z-30 w-80 shadow-2xl animate-in slide-in-from-left-4 duration-200"><LeaderboardContent data={leaderboardData} isDesktop={true} onClose={() => setIsLeaderboardOpen(false)} onShowInfo={() => setShowRatingInfo(true)} isEnabled={marketSettings.isLeaderboardEnabled} rankingBasis={marketSettings.leaderboardConfig.rankingBasis} /></div>}
              <main className="flex-1 bg-[#131722] relative flex flex-col">
                  {mobileTab === 'WALLETS' ? <WalletPanel balance={liveBalance} adminPayId={marketSettings.adminBinancePayId} paymentHistory={paymentRequests} onDeposit={onDeposit} onWithdraw={onWithdraw} onClose={() => setMobileTab('TRADE')} /> : <>
                      {marketSettings.aiAnalyst.isEnabled && <div className="absolute bottom-16 left-4 z-10 w-64"><AiAnalyst assetSymbol={selectedAsset.symbol} currentPrice={currentPrice} priceHistory={candleHistory} settings={marketSettings.aiAnalyst} /></div>}
                      <TradingChart data={candleHistory} currentPrice={currentPrice} symbol={selectedAsset.symbol} activeTrades={relevantTrades} currentTimeFrame={selectedTimeFrame} activeTimeFrames={marketSettings.activeTimeFrames} onTimeFrameChange={setSelectedTimeFrame} onToggleTrades={() => setIsTradesListOpen(true)} />
                  </>}
              </main>
              {mobileTab === 'TRADE' && <aside className="w-[280px] bg-[#1e222d] border-l border-[#2a3040] flex flex-col shrink-0 z-20 h-full"><div className="shrink-0 p-4 border-b border-[#2a3040] overflow-y-auto"><TradePanel asset={{...selectedAsset, payout: effectivePayout}} balance={balance} onTrade={handleTrade} activeDurations={marketSettings.activeTradeDurations} shortcuts={marketSettings.investmentShortcuts} minInvestment={marketSettings.minInvestment} maxInvestment={marketSettings.maxInvestment} selectedTimeFrame={selectedTimeFrame} isOTC={isCurrentAssetOTC} /></div><div className="flex-1 flex flex-col min-h-0 bg-[#181c25] overflow-hidden"><TradeHistory trades={relevantTrades} payout={effectivePayout} /></div></aside>}
          </div>
        </div>
      </div>

      {/* Mobile Main */}
            <div className="flex md:hidden flex-col h-full w-full bg-[#161a1e] relative">
                {mobileTab !== 'TOP' && mobileTab !== 'WALLETS' && <header className="mobile-topbar h-[52px] bg-[#1e222d] border-b border-[#2a3040] flex items-center justify-between px-3 shrink-0 z-20 shadow-md"><div className="flex items-center space-x-2 min-w-0">
                    <button onClick={() => setIsMobileAccountModalOpen(true)} className="flex items-center bg-[#2a3040] rounded-lg border border-[#333a4d] px-2 py-1 h-9 truncate">
                        <div className="mr-2">{accountType === 'DEMO' ? <i className="fa-solid fa-graduation-cap text-[#fcd535]"></i> : <i className="fa-solid fa-paper-plane text-[#00b85e]"></i>}</div>
                        <div className="flex items-baseline space-x-2 mr-1 min-w-0">
                            <span className={`text-[10px] font-black uppercase ${accountType === 'LIVE' ? 'text-[#00b85e]' : 'text-[#f6990c]'}`}>{accountType}</span>
                            <span className="text-white font-bold text-sm truncate">{hideBalance ? '****' : `$${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}`}</span>
                        </div>
                        <i className="fa-solid fa-chevron-down text-[9px] text-[#848e9c]"></i>
                    </button>
                    <button onClick={() => setIsNotificationsOpen(true)} className="w-10 h-10 bg-[#2a3040] rounded-lg border border-[#333a4d] flex items-center justify-center relative h-9 ml-2"><i className="fa-regular fa-bell text-white text-lg"></i>{notifications.filter(n => n.unread).length > 0 && <div className="absolute top-1 right-1 w-4 h-4 bg-[#ff3d3d] rounded-full flex items-center justify-center border border-[#2a3040]"><span className="text-[10px] font-bold text-white">{notifications.filter(n => n.unread).length}</span></div>}</button></div></header>}
        {isAssetListOpen && <div className="fixed inset-0 z-50 bg-[#161a1e]"><AssetList assets={visibleAssets} selectedId={selectedAsset.id} onSelect={(a) => { setSelectedAsset(a); setIsAssetListOpen(false); setMobileTab('TRADE'); }} onClose={() => { setIsAssetListOpen(false); setMobileTab('TRADE'); }} isGlobalOTC={marketSettings.marketMode === 'OTC'} /></div>}
                <div className="flex-1 relative flex flex-col min-h-0">
                    {mobileTab === 'WALLETS' ? <WalletPanel balance={liveBalance} adminPayId={marketSettings.adminBinancePayId} paymentHistory={paymentRequests} onDeposit={onDeposit} onWithdraw={onWithdraw} onClose={() => setMobileTab('TRADE')} /> : mobileTab === 'TOP' ? <LeaderboardContent data={leaderboardData} isDesktop={false} onClose={() => setMobileTab('TRADE')} onShowInfo={() => setShowRatingInfo(true)} isEnabled={marketSettings.isLeaderboardEnabled} rankingBasis={marketSettings.leaderboardConfig.rankingBasis} /> : <>
                        <div className="flex-1 w-full bg-[#161a1e] relative chart-bleed"><TradingChart data={candleHistory} currentPrice={currentPrice} symbol={selectedAsset.symbol} activeTrades={relevantTrades} currentTimeFrame={selectedTimeFrame} activeTimeFrames={marketSettings.activeTimeFrames} onTimeFrameChange={setSelectedTimeFrame} onToggleTrades={() => setIsTradesListOpen(true)} /></div>
                        <div className="px-3 py-2 bg-[#1e2329] border-t border-[#2a3040] flex items-center justify-between z-20 compact-asset-row"><button onClick={() => setIsAssetListOpen(true)} className="flex items-center space-x-2 min-w-0"><AssetIcon asset={selectedAsset} /><span className="text-white text-sm font-bold truncate">{selectedAsset.symbol.split('/')[0]} {isCurrentAssetOTC && '(OTC)'}</span><span className="text-[#0ecb81] text-sm font-bold">{effectivePayout}%</span><i className="fa-solid fa-chevron-down text-[#848e9c] text-[10px] ml-1"></i></button><div className="flex items-center space-x-2"><div className="w-1.5 h-1.5 rounded-full bg-[#0ecb81] animate-pulse"></div><span className="text-xs font-bold text-[#848e9c] font-mono">{currentTime}</span></div></div>
                        <div className="bg-[#1e2329] pb-safe p-2 mobile-trade-panel"><TradePanel asset={{...selectedAsset, payout: effectivePayout}} balance={balance} onTrade={handleTrade} activeDurations={marketSettings.activeTradeDurations} shortcuts={marketSettings.investmentShortcuts} minInvestment={marketSettings.minInvestment} maxInvestment={marketSettings.maxInvestment} isMobile={true} selectedTimeFrame={selectedTimeFrame} isOTC={isCurrentAssetOTC} /></div>
                    </>}
                </div>
                <nav className="mobile-bottom-nav bg-[#1e2329] border-t border-[#2b3139] h-14 flex items-center justify-around z-50">{[{ icon: "fa-right-left", label: "Trade" }, { icon: "fa-trophy", label: "Top" }, { icon: "fa-chart-simple", label: "Markets" }, { icon: "fa-wallet", label: "Wallets" }].map((nav, i) => (<button aria-label={nav.label} key={i} onClick={() => { const tab = nav.label.toUpperCase(); setMobileTab(tab); if (tab === 'MARKETS') setIsAssetListOpen(true); else setIsAssetListOpen(false); }} className="mobile-nav-btn flex flex-col items-center justify-center space-y-1 w-full"><i className={`fa-solid ${nav.icon} text-lg ${nav.label.toUpperCase() === mobileTab ? 'text-[#fcd535]' : 'text-[#848e9c]'}`}></i><span className={`text-[10px] ${nav.label.toUpperCase() === mobileTab ? 'text-white' : 'text-[#848e9c]'}`}>{nav.label}</span></button>))}</nav>

                {/* Mobile: Trade History modal (opened from chart toolbar) */}
                {isTradesListOpen && (
                    <div onClick={(e) => e.target === e.currentTarget && setIsTradesListOpen(false)} className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm">
                        {/* Mobile: edge-to-edge bottom-sheet on small screens, centered card on md+ */}
                        <div className="w-full h-full md:flex md:items-center md:justify-center">
                            <div className="mx-auto md:mx-0 w-full md:max-w-3xl h-full md:h-auto bg-[#1e222d] md:rounded-2xl md:max-h-[85vh] overflow-hidden border border-[#2a3040] shadow-2xl animate-in slide-in-from-bottom-2">
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center justify-between p-3 border-b border-[#2a3040] bg-[#1e222d]">
                                            <h3 className="text-white font-bold text-sm">Trade History</h3>
                                            <button onClick={() => setIsTradesListOpen(false)} className="w-8 h-8 flex items-center justify-center text-[#848e9c] hover:text-white bg-transparent rounded"><i className="fa-solid fa-xmark"></i></button>
                                    </div>
                                      <div className="flex-1 p-0 overflow-hidden">
                                          <TradeHistory trades={relevantTrades} payout={effectivePayout} isInModal={true} />
                                      </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
      </div>
    </div>
  );
};

export default UserPanel;
