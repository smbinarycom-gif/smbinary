
import React from 'react';
import { Trade, User, AdminThemeSettings } from '../../shared/types.ts';
import { HouseWinMeter, PnLChart } from '../components/AdminWidgets.tsx';

// Lazy‑load the heavy world map widget so the rest of the
// dashboard (cards, charts, shell) renders immediately.
const LazyWorldMapWidget = React.lazy(() =>
    import('../components/AdminWidgets.tsx').then(mod => ({ default: mod.WorldMapWidget }))
);

interface DashboardTabProps {
    companyProfit: number;
    totalVolume: number;
    users: User[];
    openCount: number;
    trades: Trade[];
    houseWinRate: number;
    totalDeposits: number;
    totalWithdrawals: number;
    depositPendingCount: number;
    withdrawalPendingCount: number;
    depositRejectedCount: number;
    withdrawalRejectedCount: number;
    pendingCount: number;
    pnlHistory: number[];
    topWinners: User[];
    setActiveMenu: (menu: any) => void;
    theme?: AdminThemeSettings;
}

const DashboardTab: React.FC<DashboardTabProps> = (props) => {
        const {
            companyProfit,
            totalVolume,
            users,
            openCount,
            trades,
            houseWinRate,
            totalDeposits,
            totalWithdrawals,
            depositPendingCount,
            withdrawalPendingCount,
            depositRejectedCount,
            withdrawalRejectedCount,
            pendingCount,
            pnlHistory,
            topWinners,
            setActiveMenu,
            theme,
        } = props;

        const isLight = theme?.mode === 'LIGHT';
        const shellBg = isLight ? '#f5f6f8' : 'transparent';
        const cardSurface = isLight ? '#ffffff' : '#1e2329';
        const borderColor = isLight ? '#e5e7eb' : '#2b3139';
        const sectionHeaderBg = isLight ? '#f9fafb' : '#1e2329';
        const subtleBg = isLight ? '#f3f4f6' : '#161a1e';

        const latestPnL = pnlHistory.length ? pnlHistory[pnlHistory.length - 1] : 0;
        const maxPnL = pnlHistory.length ? Math.max(...pnlHistory) : 0;
        const minPnL = pnlHistory.length ? Math.min(...pnlHistory) : 0;

        // Simulated fee assumptions for demo environment
        const depositCharge = totalDeposits * 0.012; // 1.2% of total deposits
        const withdrawalCharge = totalWithdrawals * 0.01; // 1% of total withdrawals

        return (
            <div className="space-y-6 antialiased" style={{ backgroundColor: shellBg }}>
                {/* 1. KEY METRICS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            label: 'Net Revenue',
                            value: `$${companyProfit.toFixed(2)}`,
                            trend: '+12.5%',
                            accent: companyProfit >= 0 ? '#0ecb81' : '#f6465d',
                            icon: 'fa-sack-dollar',
                        },
                        {
                            label: 'Total Volume',
                            value: `$${totalVolume.toLocaleString()}`,
                            trend: 'Daily',
                            accent: '#2563eb',
                            icon: 'fa-chart-simple',
                        },
                        {
                            label: 'Total Users',
                            value: users.length,
                            trend: 'Registered',
                            accent: '#facc15',
                            icon: 'fa-users',
                        },
                        {
                            label: 'Active Trades',
                            value: openCount,
                            trend: 'Running Now',
                            accent: '#4f46e5',
                            icon: 'fa-bolt',
                        },
                    ].map((stat, i) => {
                        const accentColor = stat.accent;
                        const accentBgSoft = `${accentColor}20`;

                        return (
                            <div
                                key={i}
                                className={`relative overflow-hidden rounded-3xl p-5 flex items-center justify-between transition-all duration-200 ${
                                    isLight
                                        ? 'bg-white border border-[#e5e7eb] shadow-[0_18px_45px_rgba(15,23,42,0.06)] hover:shadow-[0_22px_55px_rgba(15,23,42,0.09)] hover:-translate-y-0.5'
                                        : 'bg-[#161a1e] border border-[#2b3139] shadow-lg hover:shadow-[0_22px_55px_rgba(0,0,0,0.6)] hover:-translate-y-0.5'
                                }`}
                            >
                                <div className="absolute -right-10 -top-16 w-32 h-32 rounded-full opacity-60 blur-2xl" style={{ background: accentBgSoft }} />
                                <div>
                                    <p className="text-xs text-[#6b7280] font-semibold uppercase tracking-[0.18em] mb-1">
                                        {stat.label}
                                    </p>
                                    <h3
                                        className="text-[1.7rem] leading-snug font-extrabold font-mono text-[#111827]"
                                        style={{ color: accentColor }}
                                    >
                                        {stat.value}
                                    </h3>
                                    <span
                                        className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-[#4b5563] border border-[#e5e7eb] bg-[#f9fafb]"
                                    >
                                        {stat.trend}
                                    </span>
                                </div>
                                <div className="relative z-10 flex items-center justify-center">
                                    <div
                                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm"
                                        style={{
                                            background: isLight ? '#eff6ff' : '#111827',
                                            color: accentColor,
                                        }}
                                    >
                                        <i className={`fa-solid ${stat.icon}`}></i>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            {/* 1B. DEPOSITS & WITHDRAWALS SUMMARY */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Deposits summary */}
                <div
                    className="rounded-2xl border shadow-[0_18px_45px_rgba(15,23,42,0.06)] p-5 flex flex-col gap-4"
                    style={{ backgroundColor: cardSurface, borderColor }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className={`text-sm font-bold tracking-wide ${isLight ? 'text-[#111827]' : 'text-white'}`}>Deposits</h3>
                            <p className="text-[11px] text-[#6b7280] mt-0.5">Live overview of incoming funds</p>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <i className="fa-solid fa-arrow-trend-up"></i>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <button
                            type="button"
                            onClick={() => setActiveMenu('DEPOSITS_ALL')}
                            className="flex items-center justify-between rounded-xl px-3 py-2 border hover:border-emerald-400/70 hover:bg-emerald-50/60 transition-colors"
                            style={{ borderColor }}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                                    <i className="fa-solid fa-sack-dollar text-sm"></i>
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide">Total Deposited</div>
                                    <div className="text-sm font-bold text-[#111827] font-mono">
                                        ${totalDeposits.toFixed(2)} USD
                                    </div>
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-right text-[10px] text-slate-400" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveMenu('DEPOSITS_PENDING')}
                            className="flex items-center justify-between rounded-xl px-3 py-2 border hover:border-amber-400/70 hover:bg-amber-50/60 transition-colors"
                            style={{ borderColor }}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                                    <i className="fa-solid fa-clock-rotate-left text-sm"></i>
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide">Pending Deposits</div>
                                    <div className="text-sm font-bold text-[#111827]">
                                        {depositPendingCount}
                                    </div>
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-right text-[10px] text-slate-400" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveMenu('DEPOSITS_REJECTED')}
                            className="flex items-center justify-between rounded-xl px-3 py-2 border hover:border-rose-400/70 hover:bg-rose-50/60 transition-colors"
                            style={{ borderColor }}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                                    <i className="fa-solid fa-ban text-sm"></i>
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide">Rejected Deposits</div>
                                    <div className="text-sm font-bold text-[#111827]">
                                        {depositRejectedCount}
                                    </div>
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-right text-[10px] text-slate-400" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveMenu('DEPOSITS_ALL')}
                            className="flex items-center justify-between rounded-xl px-3 py-2 border hover:border-violet-400/70 hover:bg-violet-50/60 transition-colors"
                            style={{ borderColor }}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500">
                                    <i className="fa-solid fa-percent text-sm"></i>
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide">Deposited Charge</div>
                                    <div className="text-sm font-bold text-[#111827] font-mono">
                                        ${depositCharge.toFixed(2)} USD
                                    </div>
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-right text-[10px] text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Withdrawals summary */}
                <div
                    className="rounded-2xl border shadow-[0_18px_45px_rgba(15,23,42,0.06)] p-5 flex flex-col gap-4"
                    style={{ backgroundColor: cardSurface, borderColor }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className={`text-sm font-bold tracking-wide ${isLight ? 'text-[#111827]' : 'text-white'}`}>Withdrawals</h3>
                            <p className="text-[11px] text-[#6b7280] mt-0.5">Live overview of outgoing funds</p>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                            <i className="fa-solid fa-arrow-trend-down"></i>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <button
                            type="button"
                            onClick={() => setActiveMenu('WITHDRAWALS_ALL')}
                            className="flex items-center justify-between rounded-xl px-3 py-2 border hover:border-emerald-400/70 hover:bg-emerald-50/60 transition-colors"
                            style={{ borderColor }}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                                    <i className="fa-solid fa-credit-card text-sm"></i>
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide">Total Withdrawn</div>
                                    <div className="text-sm font-bold text-[#111827] font-mono">
                                        ${totalWithdrawals.toFixed(2)} USD
                                    </div>
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-right text-[10px] text-slate-400" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveMenu('WITHDRAWALS_PENDING')}
                            className="flex items-center justify-between rounded-xl px-3 py-2 border hover:border-amber-400/70 hover:bg-amber-50/60 transition-colors"
                            style={{ borderColor }}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                                    <i className="fa-solid fa-circle-notch text-sm"></i>
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide">Pending Withdrawals</div>
                                    <div className="text-sm font-bold text-[#111827]">
                                        {withdrawalPendingCount}
                                    </div>
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-right text-[10px] text-slate-400" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveMenu('WITHDRAWALS_REJECTED')}
                            className="flex items-center justify-between rounded-xl px-3 py-2 border hover:border-rose-400/70 hover:bg-rose-50/60 transition-colors"
                            style={{ borderColor }}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                                    <i className="fa-solid fa-circle-xmark text-sm"></i>
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide">Rejected Withdrawals</div>
                                    <div className="text-sm font-bold text-[#111827]">
                                        {withdrawalRejectedCount}
                                    </div>
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-right text-[10px] text-slate-400" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveMenu('WITHDRAWALS_ALL')}
                            className="flex items-center justify-between rounded-xl px-3 py-2 border hover:border-violet-400/70 hover:bg-violet-50/60 transition-colors"
                            style={{ borderColor }}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500">
                                    <i className="fa-solid fa-percent text-sm"></i>
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide">Withdrawal Charge</div>
                                    <div className="text-sm font-bold text-[#111827] font-mono">
                                        ${withdrawalCharge.toFixed(2)} USD
                                    </div>
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-right text-[10px] text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. ANALYTICS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
	                                <div
		                                    className="lg:col-span-2 rounded-2xl p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] flex flex-col h-[350px]"
		                                    style={{ backgroundColor: cardSurface }}
		                                >
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3
                                className={`text-sm font-bold uppercase tracking-wide flex items-center ${
                                    isLight ? 'text-[#111827]' : 'text-white'
                                }`}
                            >
                                <i className="fa-solid fa-chart-line mr-2 text-[#3b82f6]"></i>
                                Net P&L History
                            </h3>
                            <p className="mt-1 text-[11px] text-[#6b7280]">
                                Performance trend for recent sessions
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <span className="px-2 py-1 bg-[#e5e7eb] text-[#6b7280] text-[10px] font-bold rounded-full cursor-default">
                                7D
                            </span>
                            <span className="px-2 py-1 bg-[#3b82f6] text-white text-[10px] font-bold rounded-full cursor-default shadow-sm shadow-blue-500/20">
                                30D (default)
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
                        <div
                            className="rounded-xl px-3 py-2 flex flex-col"
                            style={{ backgroundColor: subtleBg }}
                        >
                            <span className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide">
                                Current Net P&L
                            </span>
                            <span
                                className={`mt-1 text-sm font-mono font-bold ${
                                    latestPnL >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'
                                }`}
                            >
                                {latestPnL >= 0 ? '+' : ''}${latestPnL.toFixed(2)}
                            </span>
                        </div>
                        <div
                            className="rounded-xl px-3 py-2 flex flex-col"
                            style={{ backgroundColor: subtleBg }}
                        >
                            <span className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide">
                                Best Session
                            </span>
                            <span className="mt-1 text-sm font-mono font-bold text-[#16a34a]">
                                {maxPnL >= 0 ? '+' : ''}${maxPnL.toFixed(2)}
                            </span>
                        </div>
                        <div
                            className="rounded-xl px-3 py-2 flex flex-col"
                            style={{ backgroundColor: subtleBg }}
                        >
                            <span className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide">
                                Worst Session
                            </span>
                            <span className="mt-1 text-sm font-mono font-bold text-[#dc2626]">
                                {minPnL >= 0 ? '+' : ''}${minPnL.toFixed(2)}
                            </span>
                        </div>
                    </div>

													<div
														className="flex-1 w-full relative border rounded-xl overflow-hidden"
														style={{ backgroundColor: subtleBg, borderColor }}
													>
															<PnLChart data={pnlHistory} />
													</div>
								</div>
                                <div
                                        className="rounded-2xl p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] flex flex-col items-center justify-between h-[350px] relative overflow-hidden"
                                        style={{ backgroundColor: cardSurface }}
                                    >
                    <div className="w-full flex justify-between items-center mb-4 z-10"><h3 className={`text-sm font-bold uppercase tracking-wide ${isLight ? 'text-[#111827]' : 'text-white'}`}>House Edge</h3><i className="fa-solid fa-crosshairs text-[#848e9c]"></i></div>
                    <HouseWinMeter winRate={houseWinRate} />
                        <div className="w-full mt-4 space-y-3 z-10">
                            <div className={`flex justify-between items-center text-xs border-b pb-2 ${isLight ? 'border-[#e5e7eb]' : 'border-[#2b3139]'}`}><span className="text-[#6b7280]">Target Win Rate</span><span className={isLight ? 'text-[#111827] font-bold' : 'text-white font-bold'}>55% - 60%</span></div>
                        <div className="flex justify-between items-center text-xs"><span className="text-[#848e9c]">Current Risk</span><span className={`font-bold px-2 py-0.5 rounded ${houseWinRate < 45 ? 'bg-[#f6465d]/20 text-[#f6465d]' : 'bg-[#0ecb81]/20 text-[#0ecb81]'}`}>{houseWinRate < 45 ? 'CRITICAL LOSS' : 'OPTIMAL'}</span></div>
                    </div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#3b82f6] blur-[70px] opacity-5 pointer-events-none"></div>
                </div>
            </div>

            {/* 3. GEO & CASH FLOW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div
                                        className="lg:col-span-2 rounded-2xl overflow-hidden shadow-[0_18px_45px_rgba(15,23,42,0.06)] h-80 relative flex flex-col"
                                        style={{ backgroundColor: cardSurface }}
                                    >
                    <div className="absolute top-4 left-4 z-20"><h3 className={`text-sm font-bold uppercase tracking-wide flex items-center ${isLight ? 'text-[#111827]' : 'text-white'}`}><i className="fa-solid fa-globe mr-2 text-[#3b82f6]"></i> Live Traffic</h3></div>
                    <React.Suspense
                        fallback={
                            <div className="flex-1 w-full h-full flex items-center justify-center">
                                <div className="w-[95%] h-[85%] rounded-[32px] skeleton" />
                            </div>
                        }
                    >
                        <LazyWorldMapWidget users={users} theme={theme} />
                    </React.Suspense>
                </div>
                                <div
                                        className="rounded-2xl p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] flex flex-col"
                                        style={{ backgroundColor: cardSurface }}
                                    >
                    <h3 className={`text-sm font-bold uppercase tracking-wide mb-6 ${isLight ? 'text-[#111827]' : 'text-white'}`}>Money Flow</h3>
                    <div className="flex-1 flex items-center justify-center relative">
                        <div
                            className={`w-48 h-48 rounded-full border-[12px] relative shadow-2xl ${
                                isLight ? 'border-[#e5e7eb]' : 'border-[#161a1e]'
                            }`}
                            style={{ background: `conic-gradient(#0ecb81 0% ${(totalDeposits / (totalDeposits + totalWithdrawals || 1)) * 100}%, #f6465d 0% 100%)` }}
                        >
                            <div
                                className={`absolute inset-2 rounded-full flex flex-col items-center justify-center ${
                                    isLight ? 'bg-white' : 'bg-[#1e2329]'
                                }`}
                            >
                                <span className="text-[10px] text-[#848e9c] uppercase font-bold tracking-widest">Net Flow</span>
                                <span className={`text-xl font-black font-mono mt-1 ${totalDeposits >= totalWithdrawals ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                                    {totalDeposits >= totalWithdrawals ? '+' : ''}${(totalDeposits - totalWithdrawals).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Detailed deposit/withdraw breakdown is shown in the Deposits & Withdrawals summary above to avoid duplication. */}
                </div>
            </div>

            {/* 4. TASKS & ALERTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div
                                        className="rounded-2xl p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
                                        style={{ backgroundColor: cardSurface }}
                                    >
                    <div className="flex items-center justify-between mb-5"><h3 className={`text-sm font-bold uppercase tracking-wide ${isLight ? 'text-[#111827]' : 'text-white'}`}>Action Center</h3><span className="bg-[#fcd535] text-black text-[10px] font-black px-1.5 py-0.5 rounded">{pendingCount} New</span></div>
                    <div className="space-y-3">
                        {[
                            { id: 'FINANCE', label: 'Finance Review', count: pendingCount, color: 'text-[#f6465d]', bg: 'bg-[#f6465d]', icon: 'fa-money-bill-transfer' },
                            { id: 'USERS', label: 'KYC Checks', count: 0, color: 'text-[#3b82f6]', bg: 'bg-[#3b82f6]', icon: 'fa-id-card' }, // Example count
                        ].map((task, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveMenu(task.id)}
                                className={`w-full flex justify-between items-center p-3 rounded-xl transition-all group border ${
                                    isLight ? 'bg-[#f9fafb] border-[#e5e7eb] hover:border-[#2563eb]' : 'bg-[#161a1e] border-[#2b3139] hover:border-[#fcd535]'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                            isLight ? 'bg-white border border-[#e5e7eb]' : `${task.bg} bg-opacity-10 ${task.color}`
                                        }`}
                                    >
                                        <i className={`fa-solid ${task.icon}`}></i>
                                    </div>
                                    <span
                                        className={`text-xs font-bold transition-colors ${
                                            isLight ? 'text-[#111827] group-hover:text-[#2563eb]' : 'text-[#ccddbb] group-hover:text-white'
                                        }`}
                                    >
                                        {task.label}
                                    </span>
                                </div>
                                <span
                                    className={`px-2 py-1 rounded text-xs font-bold ${
                                        task.count > 0
                                            ? isLight
                                                ? 'bg-[#2563eb] text-white'
                                                : `${task.bg} text-white`
                                            : isLight
                                            ? 'bg-[#e5e7eb] text-[#6b7280]'
                                            : 'bg-[#2b3139] text-[#848e9c]'
                                    }`}
                                >
                                    {task.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
                                <div
                                        className="rounded-2xl p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] relative overflow-hidden"
                                        style={{ backgroundColor: cardSurface }}
                                    >
                    <div className="flex items-center justify-between mb-4 relative z-10"><h3 className={`text-sm font-bold uppercase tracking-wide ${isLight ? 'text-[#111827]' : 'text-white'}`}>Threat Monitor</h3><span className="w-2 h-2 rounded-full bg-[#0ecb81] animate-pulse shadow-[0_0_10px_#0ecb81]"></span></div>
                    <div className="space-y-3 relative z-10">
                        <div
                            className={`p-3 border rounded-xl flex items-start space-x-3 ${
                                isLight ? 'bg-[#fef2f2] border-[#fecaca]' : 'bg-[#f6465d]/10 border-[#f6465d]/30'
                            }`}
                        >
                            <div className="mt-1"><i className="fa-solid fa-shield-cat text-[#f6465d]"></i></div>
                            <div className="flex-1">
                                <p className={`text-xs font-bold ${isLight ? 'text-[#b91c1c]' : 'text-white'}`}>Bot Pattern Detected</p>
                                <p className="text-[10px] text-[#f6465d] mt-1">IP 192.168.1.55 • High Frequency</p>
                            </div>
                            <button className="text-[9px] font-bold bg-[#f6465d] text-white px-3 py-1.5 rounded-lg hover:bg-[#e63737]">BLOCK</button>
                        </div>
                        <div
                            className={`p-3 border rounded-xl flex items-center justify-center text-xs ${
                                isLight ? 'bg-[#f3f4f6] border-[#e5e7eb] text-[#6b7280]' : 'bg-[#161a1e] border-[#2b3139] text-[#848e9c]'
                            }`}
                        >
                            <i className="fa-solid fa-check-circle mr-2 text-[#0ecb81]"></i> System Integrity Normal
                        </div>
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#f6465d] opacity-5 blur-[60px]"></div>
                </div>
                                <div
                                        className="rounded-2xl p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
                                        style={{ backgroundColor: cardSurface }}
                                    >
                    <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 ${isLight ? 'text-[#111827]' : 'text-white'}`}>Top Gainers (24h)</h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {topWinners.map((winner, idx) => (
                            <div
                                key={winner.id}
                                className="flex items-center justify-between p-2 rounded-lg border hover:border-[#3b414d] transition-colors"
                                style={{ backgroundColor: subtleBg, borderColor }}
                            >
                                <div className="flex items-center space-x-3">
                                    <div
                                        className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                                            idx === 0
                                                ? 'bg-[#fcd535] text-black shadow-lg shadow-yellow-500/20'
                                                : isLight
                                                ? 'bg-[#e5e7eb] text-[#6b7280]'
                                                : 'bg-[#2b3139] text-[#848e9c]'
                                        }`}
                                    >
                                        {idx === 0 ? <i className="fa-solid fa-crown"></i> : idx + 1}
                                    </div>
                                    <span className={`text-xs font-bold truncate max-w-[80px] ${isLight ? 'text-[#111827]' : 'text-white'}`}>{winner.name}</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-[#0ecb81]">+${winner.netPnL.toLocaleString()}</span>
                            </div>
                        ))}
                            {topWinners.length === 0 && <p className="text-xs text-[#6b7280] text-center italic py-4">No trading activity yet.</p>}
                    </div>
                </div>
            </div>

            {/* 5. LIVE TRADE FEED */}
                            <div
                                className="rounded-2xl overflow-hidden shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
                                style={{ backgroundColor: cardSurface }}
                            >
                                 <div
                                     className="p-5 border-b flex justify-between items-center"
                                     style={{ backgroundColor: sectionHeaderBg, borderColor }}
                                 >
							 <h3 className={`text-sm font-bold uppercase tracking-wide ${isLight ? 'text-[#111827]' : 'text-white'}`}>
							 	Live Trade Feed
							 </h3>
                                         <div
                                             className="flex items-center space-x-2 px-3 py-1 rounded-full border"
                                             style={{ backgroundColor: subtleBg, borderColor }}
                                         >
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#0ecb81] animate-pulse"></span>
                                                <span className="text-[10px] text-[#848e9c] font-bold uppercase tracking-wider">Socket Connected</span>
                                         </div>
                                 </div>
                                 <div className="overflow-x-auto">
                             	<table className="w-full text-left">
                             		<thead
                             			className="text-[#848e9c] text-xs uppercase font-bold tracking-wider"
                             			style={{ backgroundColor: subtleBg }}
                             		>
                             			<tr>
                             				<th className="px-6 py-4">Time</th>
                             				<th className="px-6 py-4">Asset</th>
                             				<th className="px-6 py-4">Action</th>
                             				<th className="px-6 py-4">Amount</th>
                             				<th className="px-6 py-4">Status</th>
                             			</tr>
                             		</thead>
                             		<tbody className="divide-y" style={{ borderColor }}>
                             			{trades.slice(0, 10).map((t) => (
                             				<tr
                             					key={t.id}
                             					className="transition-colors group"
                             					style={{ cursor: 'default' }}
                             				>
                             					<td
                             						className={`px-6 py-4 text-xs font-mono transition-colors ${
                             							isLight
                             								? 'text-[#6b7280] group-hover:text-[#111827]'
                             								: 'text-[#848e9c] group-hover:text-white'
                             						}`}
                             					>
                             						{new Date(t.startTime).toLocaleTimeString()}
                             					</td>
                             					<td className="px-6 py-4">
                             						<div className="flex items-center space-x-2">
                             							<span
                             								className={`w-2 h-2 rounded-full ${
                             									isLight ? 'bg-[#22c55e]' : 'bg-white/20'
                             								}`}
                             							/>
                             							<span
                             								className={`text-sm font-bold ${
                             									isLight ? 'text-[#111827]' : 'text-white'
                             								}`}
                             							>
                             								{t.assetSymbol}
                             							</span>
                             						</div>
                             					</td>
                             					<td className="px-6 py-4">
                             						<span
                             							className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wide ${
                             								t.type === 'CALL'
                             									? 'bg-[#0ecb81]/10 text-[#0ecb81]'
                             									: 'bg-[#f6465d]/10 text-[#f6465d]'
                             							}`}
                             						>
                             							{t.type === 'CALL' ? 'BUY' : 'SELL'}
                             						</span>
                             					</td>
                             					<td
                             						className={`px-6 py-4 text-sm font-bold font-mono ${
                             							isLight ? 'text-[#111827]' : 'text-white'
                             						}`}
                             					>
                             						${t.amount}
                             					</td>
                             					<td className="px-6 py-4">
                             						<span
                             							className={`text-xs font-bold ${
                             								t.status === 'WIN'
                             								? 'text-[#0ecb81]'
                             								: t.status === 'LOSS'
                             								? 'text-[#f6465d]'
                             								: 'text-[#fcd535]'
                             							}`}
                             						>
                             							{t.status}
                             						</span>
                             					</td>
                             				</tr>
                             			))}
                             			{trades.length === 0 && (
                             				<tr>
                             					<td
                             						colSpan={5}
                             						className="px-6 py-8 text-center text-[#848e9c] text-xs italic"
                             					>
                             						Waiting for incoming trades...
                             					</td>
                             				</tr>
                             			)}
                             		</tbody>
                             	</table>
                             </div>
            </div>
        </div>
    );
};

export default DashboardTab;
