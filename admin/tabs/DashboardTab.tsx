
import React from 'react';
import { Trade, User, PaymentRequest } from '../../shared/types.ts';
import { HouseWinMeter, PnLChart, WorldMapWidget } from '../components/AdminWidgets.tsx';

interface DashboardTabProps {
    companyProfit: number;
    totalVolume: number;
    users: User[];
    openCount: number;
    trades: Trade[];
    houseWinRate: number;
    totalDeposits: number;
    totalWithdrawals: number;
    pendingCount: number;
    pnlHistory: number[];
    topWinners: User[];
    setActiveMenu: (menu: any) => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ 
    companyProfit, totalVolume, users, openCount, trades, houseWinRate, 
    totalDeposits, totalWithdrawals, pendingCount, pnlHistory, topWinners, setActiveMenu 
}) => {
    return (
        <div className="space-y-6">
            {/* 1. KEY METRICS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Net Revenue', value: `$${companyProfit.toFixed(2)}`, trend: '+12.5%', color: companyProfit >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]', bg: 'bg-[#0ecb81]/5 border-[#0ecb81]/20', icon: 'fa-sack-dollar' },
                    { label: 'Total Volume', value: `$${totalVolume.toLocaleString()}`, trend: 'Daily', color: 'text-white', bg: 'bg-[#2b3139] border-[#3b414d]', icon: 'fa-chart-simple' },
                    { label: 'Total Users', value: users.length, trend: 'Registered', color: 'text-[#fcd535]', bg: 'bg-[#fcd535]/5 border-[#fcd535]/20', icon: 'fa-users' },
                    { label: 'Active Trades', value: openCount, trend: 'Running Now', color: 'text-[#3b82f6]', bg: 'bg-[#3b82f6]/5 border-[#3b82f6]/20', icon: 'fa-bolt' },
                ].map((stat, i) => (
                    <div key={i} className={`p-5 rounded-2xl border ${stat.bg} shadow-lg flex items-center justify-between transition-transform hover:scale-[1.02]`}>
                        <div>
                            <p className="text-[10px] text-[#848e9c] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className={`text-2xl font-black font-mono ${stat.color}`}>{stat.value}</h3>
                            <span className="text-[9px] font-bold text-[#848e9c] bg-[#161a1e] px-1.5 py-0.5 rounded mt-1 inline-block">{stat.trend}</span>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-[#161a1e] bg-opacity-50 backdrop-blur-sm ${stat.color}`}>
                            <i className={`fa-solid ${stat.icon}`}></i>
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. ANALYTICS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#1e2329] rounded-2xl border border-[#2b3139] p-6 shadow-xl flex flex-col h-[350px]">
                    <div className="flex justify-between items-center mb-6">
                        <div><h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center"><i className="fa-solid fa-chart-line mr-2 text-[#848e9c]"></i> Net P&L History</h3></div>
                        <div className="flex space-x-2"><span className="px-2 py-1 bg-[#2b3139] text-[#848e9c] text-[10px] font-bold rounded cursor-pointer hover:text-white">7D</span><span className="px-2 py-1 bg-[#3b82f6] text-white text-[10px] font-bold rounded cursor-pointer shadow-lg shadow-blue-500/30">30D</span></div>
                    </div>
                    <div className="flex-1 w-full relative border border-[#2b3139] bg-[#161a1e] rounded-xl overflow-hidden"><PnLChart data={pnlHistory} /></div>
                </div>
                <div className="bg-[#1e2329] rounded-2xl border border-[#2b3139] p-6 shadow-xl flex flex-col items-center justify-between h-[350px] relative overflow-hidden">
                    <div className="w-full flex justify-between items-center mb-4 z-10"><h3 className="text-sm font-bold text-white uppercase tracking-wide">House Edge</h3><i className="fa-solid fa-crosshairs text-[#848e9c]"></i></div>
                    <HouseWinMeter winRate={houseWinRate} />
                    <div className="w-full mt-4 space-y-3 z-10">
                        <div className="flex justify-between items-center text-xs border-b border-[#2b3139] pb-2"><span className="text-[#848e9c]">Target Win Rate</span><span className="text-white font-bold">55% - 60%</span></div>
                        <div className="flex justify-between items-center text-xs"><span className="text-[#848e9c]">Current Risk</span><span className={`font-bold px-2 py-0.5 rounded ${houseWinRate < 45 ? 'bg-[#f6465d]/20 text-[#f6465d]' : 'bg-[#0ecb81]/20 text-[#0ecb81]'}`}>{houseWinRate < 45 ? 'CRITICAL LOSS' : 'OPTIMAL'}</span></div>
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#3b82f6] blur-[80px] opacity-10 pointer-events-none"></div>
                </div>
            </div>

            {/* 3. GEO & CASH FLOW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#1e2329] rounded-2xl border border-[#2b3139] overflow-hidden shadow-xl h-80 relative flex flex-col">
                    <div className="absolute top-4 left-4 z-20"><h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center"><i className="fa-solid fa-globe mr-2 text-[#3b82f6]"></i> Live Traffic</h3></div>
                    <WorldMapWidget />
                </div>
                <div className="bg-[#1e2329] rounded-2xl border border-[#2b3139] p-6 shadow-xl flex flex-col">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-6">Money Flow</h3>
                    <div className="flex-1 flex items-center justify-center relative">
                        <div className="w-48 h-48 rounded-full border-[12px] border-[#161a1e] relative shadow-2xl" style={{ background: `conic-gradient(#0ecb81 0% ${(totalDeposits / (totalDeposits + totalWithdrawals || 1)) * 100}%, #f6465d 0% 100%)` }}>
                            <div className="absolute inset-2 bg-[#1e2329] rounded-full flex flex-col items-center justify-center"><span className="text-[10px] text-[#848e9c] uppercase font-bold tracking-widest">Net Flow</span><span className={`text-xl font-black font-mono mt-1 ${totalDeposits >= totalWithdrawals ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{totalDeposits >= totalWithdrawals ? '+' : ''}${(totalDeposits - totalWithdrawals).toLocaleString()}</span></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-[#161a1e] p-3 rounded-lg border border-[#2b3139]"><p className="text-[9px] text-[#848e9c] uppercase font-bold mb-1">In (Deposit)</p><p className="text-sm font-bold text-[#0ecb81]">${totalDeposits.toLocaleString()}</p></div>
                        <div className="bg-[#161a1e] p-3 rounded-lg border border-[#2b3139] text-right"><p className="text-[9px] text-[#848e9c] uppercase font-bold mb-1">Out (Withdraw)</p><p className="text-sm font-bold text-[#f6465d]">${totalWithdrawals.toLocaleString()}</p></div>
                    </div>
                </div>
            </div>

            {/* 4. TASKS & ALERTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-[#1e2329] rounded-2xl border border-[#2b3139] p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-5"><h3 className="text-sm font-bold text-white uppercase tracking-wide">Action Center</h3><span className="bg-[#fcd535] text-black text-[10px] font-black px-1.5 py-0.5 rounded">{pendingCount} New</span></div>
                    <div className="space-y-3">
                        {[
                            { id: 'FINANCE', label: 'Finance Review', count: pendingCount, color: 'text-[#f6465d]', bg: 'bg-[#f6465d]', icon: 'fa-money-bill-transfer' },
                            { id: 'USERS', label: 'KYC Checks', count: 0, color: 'text-[#3b82f6]', bg: 'bg-[#3b82f6]', icon: 'fa-id-card' }, // Example count
                        ].map((task, i) => (
                            <button key={i} onClick={() => setActiveMenu(task.id)} className="w-full flex justify-between items-center p-3 bg-[#161a1e] border border-[#2b3139] rounded-xl hover:border-[#fcd535] transition-all group">
                                <div className="flex items-center space-x-3"><div className={`w-8 h-8 rounded-lg ${task.bg} bg-opacity-10 flex items-center justify-center ${task.color}`}><i className={`fa-solid ${task.icon}`}></i></div><span className="text-xs font-bold text-[#ccddbb] group-hover:text-white transition-colors">{task.label}</span></div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${task.count > 0 ? `${task.bg} text-white` : 'bg-[#2b3139] text-[#848e9c]'}`}>{task.count}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-[#1e2329] rounded-2xl border border-[#2b3139] p-6 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4 relative z-10"><h3 className="text-sm font-bold text-white uppercase tracking-wide">Threat Monitor</h3><span className="w-2 h-2 rounded-full bg-[#0ecb81] animate-pulse shadow-[0_0_10px_#0ecb81]"></span></div>
                    <div className="space-y-3 relative z-10">
                        <div className="p-3 bg-[#f6465d]/10 border border-[#f6465d]/30 rounded-xl flex items-start space-x-3"><div className="mt-1"><i className="fa-solid fa-shield-cat text-[#f6465d]"></i></div><div className="flex-1"><p className="text-xs font-bold text-white">Bot Pattern Detected</p><p className="text-[10px] text-[#f6465d] mt-1">IP 192.168.1.55 • High Frequency</p></div><button className="text-[9px] font-bold bg-[#f6465d] text-white px-3 py-1.5 rounded-lg hover:bg-[#e63737]">BLOCK</button></div>
                        <div className="p-3 bg-[#161a1e] border border-[#2b3139] rounded-xl flex items-center justify-center text-[#848e9c] text-xs"><i className="fa-solid fa-check-circle mr-2 text-[#0ecb81]"></i> System Integrity Normal</div>
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#f6465d] opacity-5 blur-[60px]"></div>
                </div>
                <div className="bg-[#1e2329] rounded-2xl border border-[#2b3139] p-6 shadow-xl">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Top Gainers (24h)</h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {topWinners.map((winner, idx) => (
                            <div key={winner.id} className="flex items-center justify-between p-2 rounded-lg bg-[#161a1e] border border-[#2b3139] hover:border-[#3b414d] transition-colors">
                                <div className="flex items-center space-x-3"><div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${idx === 0 ? 'bg-[#fcd535] text-black shadow-lg shadow-yellow-500/20' : 'bg-[#2b3139] text-[#848e9c]'}`}>{idx === 0 ? <i className="fa-solid fa-crown"></i> : idx + 1}</div><span className="text-xs font-bold text-white truncate max-w-[80px]">{winner.name}</span></div>
                                <span className="text-xs font-mono font-bold text-[#0ecb81]">+${winner.netPnL.toLocaleString()}</span>
                            </div>
                        ))}
                        {topWinners.length === 0 && <p className="text-xs text-[#848e9c] text-center italic py-4">No trading activity yet.</p>}
                    </div>
                </div>
            </div>

            {/* 5. LIVE TRADE FEED */}
            <div className="bg-[#1e2329] rounded-2xl border border-[#2b3139] overflow-hidden shadow-xl">
                 <div className="p-5 border-b border-[#2b3139] flex justify-between items-center bg-[#1e2329]"><h3 className="text-sm font-bold text-white uppercase tracking-wide">Live Trade Feed</h3><div className="flex items-center space-x-2 px-3 py-1 bg-[#161a1e] rounded-full border border-[#2b3139]"><span className="w-1.5 h-1.5 rounded-full bg-[#0ecb81] animate-pulse"></span><span className="text-[10px] text-[#848e9c] font-bold uppercase tracking-wider">Socket Connected</span></div></div>
                 <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-[#161a1e] text-[#848e9c] text-xs uppercase font-bold tracking-wider"><tr><th className="px-6 py-4">Time</th><th className="px-6 py-4">Asset</th><th className="px-6 py-4">Action</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Status</th></tr></thead><tbody className="divide-y divide-[#2b3139]">{trades.slice(0, 10).map(t => (<tr key={t.id} className="hover:bg-[#2b3139] transition-colors group"><td className="px-6 py-4 text-xs text-[#848e9c] font-mono group-hover:text-white transition-colors">{new Date(t.startTime).toLocaleTimeString()}</td><td className="px-6 py-4"><div className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-white/20"></span><span className="text-sm font-bold text-white">{t.assetSymbol}</span></div></td><td className="px-6 py-4"><span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wide ${t.type === 'CALL' ? 'bg-[#0ecb81]/10 text-[#0ecb81]' : 'bg-[#f6465d]/10 text-[#f6465d]'}`}>{t.type === 'CALL' ? 'BUY' : 'SELL'}</span></td><td className="px-6 py-4 text-sm font-bold text-white font-mono">${t.amount}</td><td className="px-6 py-4"><span className={`text-xs font-bold ${t.status === 'WIN' ? 'text-[#0ecb81]' : t.status === 'LOSS' ? 'text-[#f6465d]' : 'text-[#fcd535]'}`}>{t.status}</span></td></tr>))}{trades.length === 0 && (<tr><td colSpan={5} className="px-6 py-8 text-center text-[#848e9c] text-xs italic">Waiting for incoming trades...</td></tr>)}</tbody></table></div>
            </div>
        </div>
    );
};

export default DashboardTab;
