
import React, { useState, useMemo, useEffect } from 'react';
import { MarketSettings, Trade, User } from '../../shared/types.ts';

interface LeaderboardTabProps {
    settings: MarketSettings;
    onUpdate: (settings: MarketSettings) => void;
    trades: Trade[];
    users: User[];
}

interface LeaderRecord {
    id: string;
    name: string;
    country: string;
    profit: number;
    loss: number;
    volume: number;
    net: number;
    tradesCount: number;
    roi: number;
    ip: string;
    isExcluded: boolean;
}

const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ settings, onUpdate, trades, users }) => {
    const [accountType, setAccountType] = useState<'LIVE' | 'DEMO'>('LIVE');
    const [dateRangeMode, setDateRangeMode] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('TODAY');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [manualRefreshKey, setManualRefreshKey] = useState(0);

    const config = settings.leaderboardConfig;

    // IP Audit Detection
    const ipCollisions = useMemo(() => {
        const ipMap: Record<string, string[]> = {};
        const collisions: Set<string> = new Set();
        
        users.forEach(u => {
            if (!ipMap[u.ipAddress]) ipMap[u.ipAddress] = [];
            ipMap[u.ipAddress].push(u.name);
            if (ipMap[u.ipAddress].length > 1) collisions.add(u.ipAddress);
        });
        return { map: ipMap, list: Array.from(collisions) };
    }, [users]);

    // Core Calculation Logic
    const leaderboardData = useMemo(() => {
        const now = new Date();
        let startTime = 0;
        let endTime = now.getTime() + 86400000;

        if (dateRangeMode === 'TODAY') {
            startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        } else if (dateRangeMode === 'WEEK') {
            startTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;
        } else if (dateRangeMode === 'MONTH') {
            startTime = now.getTime() - 30 * 24 * 60 * 60 * 1000;
        } else if (dateRangeMode === 'CUSTOM') {
            if (customFrom) startTime = new Date(customFrom).getTime();
            if (customTo) endTime = new Date(customTo).getTime() + 86400000;
        }

        const filteredTrades = trades.filter(t => {
            if (t.accountType !== accountType) return false;
            if (t.status === 'OPEN') return false;
            return t.expiryTime >= startTime && t.expiryTime < endTime;
        });

        const userGroups: Record<string, LeaderRecord> = {};

        filteredTrades.forEach(t => {
            const userId = t.userId || 'unknown';
            if (!userGroups[userId]) {
                const userObj = users.find(u => u.id === userId);
                userGroups[userId] = {
                    id: userId,
                    name: userObj?.name || 'Anonymous User',
                    country: userObj?.country || 'us',
                    profit: 0,
                    loss: 0,
                    volume: 0,
                    net: 0,
                    tradesCount: 0,
                    roi: 0,
                    ip: userObj?.ipAddress || '0.0.0.0',
                    isExcluded: config.excludedUserIds.includes(userId)
                };
            }

            const g = userGroups[userId];
            g.volume += t.amount;
            g.tradesCount += 1;

            if (t.status === 'WIN') {
                const p = t.amount * (t.payoutAtTrade / 100);
                g.profit += p;
                g.net += p;
            } else if (t.status === 'LOSS') {
                g.loss += t.amount;
                g.net -= t.amount;
            }
        });

        // Apply Qualification Rules & ROI Calculation
        return Object.values(userGroups)
            .filter(u => {
                // Must not be excluded
                if (u.isExcluded) return false;
                // Qualification
                if (u.tradesCount < config.minTradeCount) return false;
                if (u.volume < config.minTradeVolume) return false;
                return true;
            })
            .map(u => ({
                ...u,
                roi: u.volume > 0 ? (u.net / u.volume) * 100 : 0
            }))
            .sort((a, b) => {
                if (config.rankingBasis === 'NET_PROFIT') return b.net - a.net;
                if (config.rankingBasis === 'ROI') return b.roi - a.roi;
                if (config.rankingBasis === 'TOTAL_VOLUME') return b.volume - a.volume;
                return b.net - a.net;
            });
    }, [trades, users, accountType, dateRangeMode, customFrom, customTo, config, manualRefreshKey]);

    // Auto Refresh Logic
    useEffect(() => {
        if (!config.autoRefreshEnabled) return;
        const interval = setInterval(() => {
            setManualRefreshKey(k => k + 1);
        }, config.refreshInterval * 1000);
        return () => clearInterval(interval);
    }, [config.autoRefreshEnabled, config.refreshInterval]);

    const handleExportCSV = () => {
        const headers = ["Rank", "User Name", "User ID", "Total Trades", "Volume", "Net Profit", "ROI (%)"];
        const rows = leaderboardData.map((u, i) => [
            i + 1, u.name, u.id, u.tradesCount, u.volume.toFixed(2), u.net.toFixed(2), u.roi.toFixed(2) + "%"
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `leaderboard_${dateRangeMode.toLowerCase()}_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleExclusion = (userId: string) => {
        let newList = [...config.excludedUserIds];
        if (newList.includes(userId)) newList = newList.filter(id => id !== userId);
        else newList.push(userId);
        onUpdate({ ...settings, leaderboardConfig: { ...config, excludedUserIds: newList } });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-20">
            {/* Header: Master Controls */}
            <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <i className="fa-solid fa-trophy text-[#fcd535]"></i>
                        Leaderboard Command Center
                    </h3>
                    <p className="text-xs text-[#848e9c] mt-1">Configure qualification rules, ranking metrics, and audit top traders.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-3 bg-[#161a1e] px-4 py-2 rounded-lg border border-[#2b3139]">
                        <span className="text-xs text-[#848e9c] font-bold">Auto Refresh:</span>
                        <button 
                            onClick={() => onUpdate({ ...settings, leaderboardConfig: { ...config, autoRefreshEnabled: !config.autoRefreshEnabled } })}
                            className={`w-10 h-5 rounded-full relative transition-colors ${config.autoRefreshEnabled ? 'bg-[#0ecb81]' : 'bg-[#2b3139]'}`}
                        >
                            <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${config.autoRefreshEnabled ? 'left-6' : 'left-0.5'}`}></div>
                        </button>
                    </div>
                    <button 
                        onClick={() => setManualRefreshKey(k => k + 1)}
                        className="w-10 h-10 rounded-lg bg-[#2b3139] text-[#848e9c] hover:text-white flex items-center justify-center transition-colors border border-[#3b414d]"
                        title="Manual Refresh"
                    >
                        <i className={`fa-solid fa-rotate ${config.autoRefreshEnabled ? 'animate-spin-slow' : ''}`}></i>
                    </button>
                    <button 
                        onClick={() => onUpdate({ ...settings, isLeaderboardEnabled: !settings.isLeaderboardEnabled })}
                        className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${settings.isLeaderboardEnabled ? 'bg-[#f6465d] text-white hover:bg-[#ff3d3d]' : 'bg-[#0ecb81] text-white hover:bg-[#0aa869]'}`}
                    >
                        {settings.isLeaderboardEnabled ? 'Close Board' : 'Open Board'}
                    </button>
                </div>
            </div>

            {/* Quick Config Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Qualification Rules */}
                <div className="bg-[#1e2329] p-5 rounded-xl border border-[#2b3139] shadow-md">
                    <h4 className="text-xs font-black text-[#848e9c] uppercase tracking-[2px] mb-4">Qualification Rules</h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-white">Min Trade Count</label>
                            <input 
                                type="number" 
                                value={config.minTradeCount} 
                                onChange={(e) => onUpdate({ ...settings, leaderboardConfig: { ...config, minTradeCount: parseInt(e.target.value) || 1 } })}
                                className="w-20 bg-[#161a1e] border border-[#2b3139] rounded px-2 py-1 text-sm font-mono text-[#fcd535] outline-none focus:border-[#fcd535]"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-white">Min Trade Volume ($)</label>
                            <input 
                                type="number" 
                                value={config.minTradeVolume} 
                                onChange={(e) => onUpdate({ ...settings, leaderboardConfig: { ...config, minTradeVolume: parseInt(e.target.value) || 0 } })}
                                className="w-20 bg-[#161a1e] border border-[#2b3139] rounded px-2 py-1 text-sm font-mono text-[#fcd535] outline-none focus:border-[#fcd535]"
                            />
                        </div>
                    </div>
                </div>

                {/* Ranking Logic */}
                <div className="bg-[#1e2329] p-5 rounded-xl border border-[#2b3139] shadow-md">
                    <h4 className="text-xs font-black text-[#848e9c] uppercase tracking-[2px] mb-4">Ranking Basis</h4>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { id: 'NET_PROFIT', label: 'Net Profit ($)' },
                            { id: 'ROI', label: 'ROI (%)' },
                            { id: 'TOTAL_VOLUME', label: 'Total Volume ($)' }
                        ].map(basis => (
                            <button 
                                key={basis.id}
                                onClick={() => onUpdate({ ...settings, leaderboardConfig: { ...config, rankingBasis: basis.id as any } })}
                                className={`px-4 py-2 text-left rounded-lg text-xs font-bold transition-all border ${config.rankingBasis === basis.id ? 'bg-[#3b82f6]/10 border-[#3b82f6] text-[#3b82f6]' : 'bg-[#161a1e] border-transparent text-[#848e9c] hover:bg-[#2b3139]'}`}
                            >
                                <i className={`fa-solid ${config.rankingBasis === basis.id ? 'fa-circle-check' : 'fa-circle'} mr-2 opacity-50`}></i>
                                {basis.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date & Export */}
                <div className="bg-[#1e2329] p-5 rounded-xl border border-[#2b3139] shadow-md flex flex-col justify-between">
                    <div>
                        <h4 className="text-xs font-black text-[#848e9c] uppercase tracking-[2px] mb-4">Export Tools</h4>
                        <button 
                            onClick={handleExportCSV}
                            className="w-full bg-[#161a1e] border border-[#2b3139] hover:border-[#fcd535] text-white py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <i className="fa-solid fa-file-csv text-lg text-[#0ecb81]"></i>
                            Download Detailed CSV
                        </button>
                    </div>
                    <p className="text-[10px] text-[#848e9c] mt-2 italic text-center">Export follows currently active filters.</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-[#1e2329] p-4 rounded-xl border border-[#2b3139] flex flex-wrap items-center gap-4">
                <div className="flex bg-[#161a1e] p-1 rounded-lg border border-[#2b3139]">
                    <button onClick={() => setAccountType('LIVE')} className={`px-4 py-2 text-xs font-bold rounded transition-all ${accountType === 'LIVE' ? 'bg-[#3b82f6] text-white shadow-lg' : 'text-[#848e9c] hover:text-white'}`}>Live Account</button>
                    <button onClick={() => setAccountType('DEMO')} className={`px-4 py-2 text-xs font-bold rounded transition-all ${accountType === 'DEMO' ? 'bg-[#fcd535] text-black shadow-lg' : 'text-[#848e9c] hover:text-white'}`}>Demo Account</button>
                </div>

                <div className="h-8 w-[1px] bg-[#2b3139] hidden md:block"></div>

                <div className="flex bg-[#161a1e] p-1 rounded-lg border border-[#2b3139] overflow-x-auto">
                    {['TODAY', 'WEEK', 'MONTH', 'CUSTOM'].map(mode => (
                        <button 
                            key={mode}
                            onClick={() => setDateRangeMode(mode as any)} 
                            className={`px-3 py-2 text-[10px] font-bold uppercase rounded transition-all whitespace-nowrap ${dateRangeMode === mode ? 'bg-[#2b3139] text-white' : 'text-[#848e9c] hover:text-white'}`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>

                {dateRangeMode === 'CUSTOM' && (
                    <div className="flex items-center space-x-2 animate-in slide-in-from-left-2">
                        <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="bg-[#161a1e] border border-[#2b3139] rounded px-2 py-1 text-[10px] text-white outline-none focus:border-[#3b82f6]" />
                        <span className="text-[#848e9c] text-xs">to</span>
                        <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="bg-[#161a1e] border border-[#2b3139] rounded px-2 py-1 text-[10px] text-white outline-none focus:border-[#3b82f6]" />
                    </div>
                )}
                
                <div className="ml-auto flex items-center space-x-3 bg-[#161a1e] px-4 py-2 rounded-lg border border-[#2b3139]">
                    <span className="text-[10px] text-[#848e9c] font-bold">Displaying:</span>
                    <span className="text-sm font-bold text-white">{leaderboardData.length} Qualifiers</span>
                </div>
            </div>

            {/* IP Security Alerts */}
            {ipCollisions.list.length > 0 && (
                <div className="bg-[#f6465d]/10 border border-[#f6465d]/30 p-4 rounded-xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#f6465d] flex items-center justify-center text-white shrink-0 animate-pulse">
                        <i className="fa-solid fa-user-secret text-xl"></i>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase">Multi-Account IP Detection</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {ipCollisions.list.slice(0, 5).map(ip => (
                                <div key={ip} className="px-3 py-1 bg-[#161a1e] border border-[#f6465d]/30 rounded text-[10px] text-[#f6465d] font-bold">
                                    <span className="mr-2">IP: {ip}</span>
                                    <span className="text-white">({ipCollisions.map[ip].length} Users)</span>
                                </div>
                            ))}
                            {ipCollisions.list.length > 5 && <span className="text-[10px] text-[#848e9c] flex items-center">+{ipCollisions.list.length - 5} more...</span>}
                        </div>
                    </div>
                </div>
            )}

            {/* Table Area */}
            <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#161a1e] text-[#848e9c] text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Rank</th>
                                <th className="px-6 py-4">Trader Identity</th>
                                <th className="px-6 py-4">Trades</th>
                                <th className="px-6 py-4">Total Volume</th>
                                <th className="px-6 py-4">ROI (%)</th>
                                <th className="px-6 py-4">Net Result</th>
                                <th className="px-6 py-4 text-right">Moderation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2b3139]">
                            {leaderboardData.length > 0 ? leaderboardData.map((user, idx) => (
                                <tr key={user.id} className="hover:bg-[#2b3139] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-[#fcd535] text-black shadow-lg shadow-yellow-500/20' : idx === 1 ? 'bg-slate-300 text-black' : idx === 2 ? 'bg-[#cd7f32] text-white' : 'bg-[#161a1e] text-[#848e9c]'}`}>
                                            {idx + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="relative">
                                                <img src={`https://flagcdn.com/24x18/${user.country === 'Bangladesh' ? 'bd' : 'us'}.png`} className="w-5 h-3.5 rounded-sm" alt="flag" />
                                                {ipCollisions.list.includes(user.ip) && (
                                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#f6465d] rounded-full border border-[#1e2329]" title="Shared IP Detected"></div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white group-hover:text-[#fcd535] transition-colors">{user.name}</span>
                                                <span className="text-[10px] text-[#848e9c] font-mono">IP: {user.ip}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-white">{user.tradesCount}</td>
                                    <td className="px-6 py-4 font-mono font-bold text-[#848e9c] text-sm">${user.volume.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${user.roi >= 0 ? 'bg-[#0ecb81]/10 text-[#0ecb81]' : 'bg-[#f6465d]/10 text-[#f6465d]'}`}>
                                            {user.roi.toFixed(2)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded font-mono font-black text-xs ${user.net >= 0 ? 'bg-[#0ecb81]/10 text-[#0ecb81]' : 'bg-[#f6465d]/10 text-[#f6465d]'}`}>
                                            {user.net >= 0 ? '+' : ''}{user.net.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => toggleExclusion(user.id)}
                                            className={`px-3 py-1.5 rounded text-[10px] font-black uppercase transition-all ${user.isExcluded ? 'bg-[#0ecb81] text-white' : 'bg-[#161a1e] border border-[#f6465d]/30 text-[#f6465d] hover:bg-[#f6465d] hover:text-white'}`}
                                        >
                                            {user.isExcluded ? 'Restore' : 'Exclude'}
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-[#848e9c] text-xs italic">
                                        <i className="fa-solid fa-filter-circle-xmark text-4xl mb-4 block opacity-20"></i>
                                        No qualified traders found matching your current rules.
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

export default LeaderboardTab;
