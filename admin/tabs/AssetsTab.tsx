
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { notify } from '../../shared/notify';
import { Asset, MarketSettings, PayoutSchedule, AssetType, Trade } from '../../shared/types.ts';
import { AssetIcon } from '../../user/components/AssetIcon.tsx';

interface AssetsTabProps {
    assets: Asset[];
    setAssets: (assets: Asset[]) => void;
    settings: MarketSettings;
    onUpdate: (settings: MarketSettings) => void;
    trades: Trade[]; // Added trades prop for stats calculation
}

const AssetsTab: React.FC<AssetsTabProps> = ({ assets, setAssets, settings, onUpdate, trades = [] }) => {
    const [filter, setFilter] = useState<'ALL' | 'CRYPTO' | 'STOCKS' | 'FOREX'>('ALL');
    const [search, setSearch] = useState('');
    const [scheduleModalAsset, setScheduleModalAsset] = useState<Asset | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Live Prices State
    const [livePrices, setLivePrices] = useState<Record<string, number>>({});
    const wsRef = useRef<WebSocket | null>(null);

    // Schedule State
    const [newSchedule, setNewSchedule] = useState({ start: 0, end: 0, percent: 80 });

    // Create Asset State
    const [newAssetData, setNewAssetData] = useState<Partial<Asset>>({
        name: '',
        symbol: '',
        type: AssetType.CRYPTO,
        price: 100,
        payout: 85,
        isActive: true,
        forceOTC: false
    });

    // --- LIVE PRICE LOGIC ---
    useEffect(() => {
        // 1. Crypto WebSocket (Binance All Mini Tickers)
        const connectWs = () => {
            const ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');
            
            ws.onopen = () => {
                // console.log('Admin Assets WS Connected');
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                const updates: Record<string, number> = {};
                
                // Map Binance symbols to our Asset IDs or Symbols
                data.forEach((ticker: any) => {
                    // Find asset that matches this ticker (e.g., BTCUSDT matches BTC/USDT)
                    // We check against the symbol without '/'
                    const symbol = ticker.s; 
                    const price = parseFloat(ticker.c);
                    updates[symbol] = price;
                });

                setLivePrices(prev => {
                    // Only update if we have relevant data to prevent excessive re-renders
                    // We merge with previous prices
                    return { ...prev, ...updates };
                });
            };

            wsRef.current = ws;
        };

        connectWs();

        // 2. Forex & Stocks Simulation (Since we don't have free real-time WS for these)
        const simulationInterval = setInterval(() => {
            setLivePrices(prev => {
                const updates: Record<string, number> = { ...prev };
                assets.forEach(asset => {
                    if (asset.type !== AssetType.CRYPTO) {
                        // Get current simulated price or base price
                        const current = updates[asset.symbol.replace('/', '')] || asset.price;
                        // Simulate random small movement (0.01% - 0.05%)
                        const move = (Math.random() - 0.5) * (current * 0.0005);
                        updates[asset.symbol.replace('/', '')] = current + move;
                    }
                });
                return updates;
            });
        }, 1000);

        return () => {
            if (wsRef.current) wsRef.current.close();
            clearInterval(simulationInterval);
        };
    }, [assets.length]); // Re-run if asset count changes significantly

    const filteredAssets = useMemo(() => {
        let data = assets;
        if (filter !== 'ALL') {
            const typeMap = {
                'CRYPTO': AssetType.CRYPTO,
                'STOCKS': AssetType.STOCKS,
                'FOREX': AssetType.FOREX
            };
            data = data.filter(a => a.type === typeMap[filter]);
        }
        if (search) {
            data = data.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.symbol.toLowerCase().includes(search.toLowerCase()));
        }
        return data;
    }, [assets, filter, search]);

    const handleUpdateAsset = (id: string, updates: Partial<Asset>) => {
        const updated = assets.map(a => a.id === id ? { ...a, ...updates } : a);
        setAssets(updated);
        
        // Update Active Symbols in Settings if toggled
        if (updates.isActive !== undefined) {
            const asset = assets.find(a => a.id === id);
            if (asset) {
                let newSymbols = settings.activeSymbols;
                if (updates.isActive && !newSymbols.includes(asset.symbol)) {
                    newSymbols = [...newSymbols, asset.symbol];
                } else if (!updates.isActive) {
                    newSymbols = newSymbols.filter(s => s !== asset.symbol);
                }
                onUpdate({ ...settings, activeSymbols: newSymbols });
            }
        }
    };

    const handleDeleteAsset = async (id: string) => {
        const ok = await (await import('../../shared/confirm')).confirm("Are you sure you want to delete this asset?");
        if (ok) setAssets(assets.filter(a => a.id !== id));
    };

    const handleCreateAsset = () => {
        if (!newAssetData.name || !newAssetData.symbol) {
            notify.info("Name and Symbol required");
            return;
        }
        
        const newAsset: Asset = {
            id: Date.now().toString(),
            name: newAssetData.name!,
            symbol: newAssetData.symbol!.toUpperCase(),
            type: newAssetData.type || AssetType.CRYPTO,
            price: Number(newAssetData.price),
            change24h: 0,
            payout: Number(newAssetData.payout),
            isActive: true,
            forceOTC: newAssetData.forceOTC || false,
            payoutSchedule: []
        };

        setAssets([...assets, newAsset]);
        // Also activate it in global settings
        onUpdate({ ...settings, activeSymbols: [...settings.activeSymbols, newAsset.symbol] });
        
        setShowCreateModal(false);
        setNewAssetData({ name: '', symbol: '', type: AssetType.CRYPTO, price: 100, payout: 85, isActive: true, forceOTC: false });
    };

    const handleAddSchedule = () => {
        if (!scheduleModalAsset) return;
        const scheduleItem: PayoutSchedule = {
            id: Math.random().toString(36).substr(2, 9),
            startHour: Number(newSchedule.start),
            endHour: Number(newSchedule.end),
            payout: Number(newSchedule.percent)
        };
        const updatedAsset = {
            ...scheduleModalAsset,
            payoutSchedule: [...(scheduleModalAsset.payoutSchedule || []), scheduleItem]
        };
        setScheduleModalAsset(updatedAsset);
        handleUpdateAsset(updatedAsset.id, { payoutSchedule: updatedAsset.payoutSchedule });
    };

    const handleRemoveSchedule = (id: string) => {
        if (!scheduleModalAsset) return;
        const updatedAsset = {
            ...scheduleModalAsset,
            payoutSchedule: (scheduleModalAsset.payoutSchedule || []).filter(s => s.id !== id)
        };
        setScheduleModalAsset(updatedAsset);
        handleUpdateAsset(updatedAsset.id, { payoutSchedule: updatedAsset.payoutSchedule });
    };

    // Helper to get price to display
    const getDisplayPrice = (asset: Asset) => {
        // Construct key for map (remove /)
        const key = asset.symbol.replace('/', '').toUpperCase();
        // Check map, fallback to asset.price
        // For Forex/Stocks in our simulation, we also keyed them by symbol
        // For Crypto, keys are from Binance (e.g. BTCUSDT)
        
        // Try direct key (Crypto)
        let price = livePrices[key];
        
        // Try simulation key (Forex/Stock might have different casing or stored logic)
        if (!price && asset.type !== AssetType.CRYPTO) {
             price = livePrices[asset.symbol.replace('/', '')];
        }

        return price || asset.price;
    };

    // --- NEW STATS HELPER ---
    const getAssetStats = (symbol: string) => {
        const assetTrades = trades.filter(t => t.assetSymbol === symbol);
        
        // 1. Active Traders (Currently Open Trades)
        const activeCount = assetTrades.filter(t => t.status === 'OPEN').length;
        
        // 2. Total Volume (Sum of all trade amounts)
        const volume = assetTrades.reduce((acc, t) => acc + t.amount, 0);

        // 3. User Win/Loss Ratio
        const closedTrades = assetTrades.filter(t => t.status !== 'OPEN');
        const winCount = closedTrades.filter(t => t.status === 'WIN').length;
        const totalClosed = closedTrades.length;
        const userWinRate = totalClosed > 0 ? (winCount / totalClosed) * 100 : 0;

        // 4. House Profit (Loss Amount - Win Payout)
        const houseProfit = assetTrades.reduce((acc, t) => {
            if (t.status === 'LOSS') return acc + t.amount;
            if (t.status === 'WIN') return acc - (t.amount * (t.payoutAtTrade / 100));
            // OPEN or TIE doesn't affect PnL yet
            return acc;
        }, 0);

        return { activeCount, volume, userWinRate, houseProfit };
    };

    return (
        <div className="flex flex-col h-full bg-[#161a1e]">
            
            {/* --- CREATE MODAL --- */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1e2329] w-full max-w-lg rounded-xl border border-[#2b3139] shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="p-5 border-b border-[#2b3139] flex justify-between items-center bg-[#2b3139]">
                            <h3 className="text-white font-bold">Add New Asset</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-[#848e9c] hover:text-white"><i className="fa-solid fa-xmark text-lg"></i></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-[#848e9c] font-bold block mb-1">Asset Name</label>
                                    <input type="text" placeholder="e.g. Gold" value={newAssetData.name} onChange={e => setNewAssetData({...newAssetData, name: e.target.value})} className="w-full bg-[#131722] border border-[#474d57] rounded px-3 py-2 text-white text-sm outline-none focus:border-[#fcd535]" />
                                </div>
                                <div>
                                    <label className="text-xs text-[#848e9c] font-bold block mb-1">Symbol</label>
                                    <input type="text" placeholder="e.g. XAU/USD" value={newAssetData.symbol} onChange={e => setNewAssetData({...newAssetData, symbol: e.target.value})} className="w-full bg-[#131722] border border-[#474d57] rounded px-3 py-2 text-white text-sm outline-none focus:border-[#fcd535]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-[#848e9c] font-bold block mb-1">Type</label>
                                    <select value={newAssetData.type} onChange={e => setNewAssetData({...newAssetData, type: e.target.value as AssetType})} className="w-full bg-[#131722] border border-[#474d57] rounded px-3 py-2 text-white text-sm outline-none focus:border-[#fcd535]">
                                        <option value={AssetType.CRYPTO}>Crypto</option>
                                        <option value={AssetType.STOCKS}>Stocks</option>
                                        <option value={AssetType.FOREX}>Currencies (Forex)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-[#848e9c] font-bold block mb-1">Base Price</label>
                                    <input type="number" value={newAssetData.price} onChange={e => setNewAssetData({...newAssetData, price: Number(e.target.value)})} className="w-full bg-[#131722] border border-[#474d57] rounded px-3 py-2 text-white text-sm outline-none focus:border-[#fcd535]" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-[#848e9c] font-bold block mb-1">Default Payout (%)</label>
                                <input type="number" value={newAssetData.payout} onChange={e => setNewAssetData({...newAssetData, payout: Number(e.target.value)})} className="w-full bg-[#131722] border border-[#474d57] rounded px-3 py-2 text-white text-sm outline-none focus:border-[#fcd535]" />
                            </div>
                            <div className="flex items-center space-x-3 bg-[#131722] p-3 rounded border border-[#474d57]">
                                <input type="checkbox" checked={newAssetData.forceOTC} onChange={e => setNewAssetData({...newAssetData, forceOTC: e.target.checked})} className="w-4 h-4 accent-[#fcd535]" />
                                <span className="text-sm text-white font-bold">Force OTC Mode (Simulated Data)</span>
                            </div>
                            <button onClick={handleCreateAsset} className="w-full bg-[#fcd535] text-black py-3 rounded font-bold hover:bg-[#ffe252]">CREATE ASSET</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SCHEDULE MODAL --- */}
            {scheduleModalAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1e2329] w-full max-w-lg rounded-xl border border-[#2b3139] shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="p-4 border-b border-[#2b3139] flex justify-between items-center bg-[#2b3139]">
                            <h3 className="text-white font-bold">Payout Schedule: {scheduleModalAsset.symbol}</h3>
                            <button onClick={() => setScheduleModalAsset(null)} className="text-[#848e9c] hover:text-white"><i className="fa-solid fa-xmark text-lg"></i></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="bg-[#161a1e] p-4 rounded-lg border border-[#2b3139]">
                                <h4 className="text-xs font-bold text-[#848e9c] uppercase mb-3">Add Time Rule (UTC)</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[#848e9c] block mb-1">Start (0-23)</label>
                                        <input type="number" min="0" max="23" value={newSchedule.start} onChange={(e) => setNewSchedule({...newSchedule, start: parseInt(e.target.value)})} className="w-full bg-[#1e2329] border border-[#2b3139] rounded px-2 py-2 text-white text-xs" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[#848e9c] block mb-1">End (0-23)</label>
                                        <input type="number" min="0" max="24" value={newSchedule.end} onChange={(e) => setNewSchedule({...newSchedule, end: parseInt(e.target.value)})} className="w-full bg-[#1e2329] border border-[#2b3139] rounded px-2 py-2 text-white text-xs" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[#848e9c] block mb-1">Payout %</label>
                                        <input type="number" value={newSchedule.percent} onChange={(e) => setNewSchedule({...newSchedule, percent: parseInt(e.target.value)})} className="w-full bg-[#1e2329] border border-[#2b3139] rounded px-2 py-2 text-[#fcd535] font-bold text-xs" />
                                    </div>
                                </div>
                                <button onClick={handleAddSchedule} className="mt-3 w-full bg-[#3b82f6] text-white py-2 rounded text-xs font-bold hover:bg-[#2563eb]"><i className="fa-solid fa-plus mr-1"></i> Add Rule</button>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-[#848e9c] uppercase mb-3">Active Schedules</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                    {scheduleModalAsset.payoutSchedule && scheduleModalAsset.payoutSchedule.length > 0 ? (
                                        scheduleModalAsset.payoutSchedule.map(s => (
                                            <div key={s.id} className="flex items-center justify-between p-3 bg-[#161a1e] rounded border border-[#2b3139]">
                                                <div className="flex items-center space-x-3">
                                                    <i className="fa-regular fa-clock text-[#848e9c]"></i>
                                                    <span className="text-sm font-mono text-white">{s.startHour}:00 - {s.endHour}:00</span>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-sm font-bold text-[#0ecb81]">{s.payout}%</span>
                                                    <button onClick={() => handleRemoveSchedule(s.id)} className="text-[#f6465d] hover:text-white"><i className="fa-solid fa-trash"></i></button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-[#848e9c] text-xs italic">No active schedules.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FIXED HEADER CONTROLS --- */}
            <div className="px-4 pt-4 pb-2 shrink-0 z-20">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#1e2329] p-3 rounded-xl border border-[#2b3139] shadow-lg">
                    <div className="flex bg-[#161a1e] p-1 rounded-lg border border-[#2b3139]">
                        {['ALL', 'CRYPTO', 'STOCKS', 'FOREX'].map(f => (
                            <button 
                                key={f} 
                                onClick={() => setFilter(f as any)} 
                                className={`px-4 py-2 text-xs font-bold rounded transition-all ${filter === f ? 'bg-[#fcd535] text-black shadow' : 'text-[#848e9c] hover:text-white'}`}
                            >
                                {f === 'FOREX' ? 'Currencies' : f.charAt(0) + f.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                    <div className="flex w-full md:w-auto gap-4">
                        <div className="relative flex-1 md:w-64">
                            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[#848e9c] text-xs"></i>
                            <input type="text" placeholder="Search Assets..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-[#161a1e] border border-[#2b3139] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#fcd535]" />
                        </div>
                        <button onClick={() => setShowCreateModal(true)} className="bg-[#0ecb81] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#0aa869] whitespace-nowrap">
                            <i className="fa-solid fa-plus mr-2"></i> Create Asset
                        </button>
                    </div>
                </div>
            </div>

            {/* --- SCROLLABLE TABLE AREA --- */}
            <div className="flex-1 overflow-hidden px-4 py-2 pb-4">
                <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] shadow-lg flex flex-col h-full overflow-hidden">
                    <div className="overflow-y-auto custom-scrollbar flex-1 relative">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#2b3139] text-[#848e9c] text-[10px] font-bold uppercase tracking-wider sticky top-0 z-50 shadow-md">
                                <tr>
                                    <th className="px-6 py-4 bg-[#2b3139]">Asset</th>
                                    <th className="px-6 py-4 bg-[#2b3139]">Live Price</th>
                                    <th className="px-6 py-4 bg-[#2b3139]">Active Users</th>
                                    <th className="px-6 py-4 bg-[#2b3139]">Volume</th>
                                    <th className="px-6 py-4 bg-[#2b3139]">Win Rate (User)</th>
                                    <th className="px-6 py-4 bg-[#2b3139]">House PnL</th>
                                    <th className="px-6 py-4 bg-[#2b3139]">Payout %</th>
                                    <th className="px-6 py-4 bg-[#2b3139] text-center">Active</th>
                                    <th className="px-6 py-4 bg-[#2b3139] text-center">Force OTC</th>
                                    <th className="px-6 py-4 bg-[#2b3139] text-center">Schedule</th>
                                    <th className="px-6 py-4 bg-[#2b3139] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2b3139]">
                                {filteredAssets.length > 0 ? filteredAssets.map(asset => {
                                    const displayPrice = getDisplayPrice(asset);
                                    const stats = getAssetStats(asset.symbol);

                                    return (
                                        <tr key={asset.id} className="hover:bg-[#2b3139]/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="shrink-0">
                                                        <AssetIcon asset={asset} className="mr-0" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{asset.symbol}</p>
                                                        <p className="text-[10px] text-[#848e9c]">{asset.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`text-xs font-mono font-bold transition-colors duration-300 ${displayPrice > asset.price ? 'text-[#0ecb81]' : displayPrice < asset.price ? 'text-[#f6465d]' : 'text-white'}`}>
                                                        ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: asset.type === AssetType.FOREX ? 4 : 2 })}
                                                    </span>
                                                    {asset.type === AssetType.CRYPTO && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#0ecb81] animate-pulse" title="Live WS Feed"></div>
                                                    )}
                                                </div>
                                            </td>
                                            
                                            {/* --- NEW STATS COLUMNS --- */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-1">
                                                    <i className="fa-solid fa-user text-[10px] text-[#848e9c]"></i>
                                                    <span className="text-xs font-bold text-white">{stats.activeCount}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-mono font-bold text-white">${stats.volume.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-12 h-1 bg-[#161a1e] rounded-full overflow-hidden">
                                                        <div className={`h-full ${stats.userWinRate > 50 ? 'bg-[#0ecb81]' : 'bg-[#f6465d]'}`} style={{width: `${stats.userWinRate}%`}}></div>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-[#848e9c]">{stats.userWinRate.toFixed(0)}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-mono font-bold ${stats.houseProfit >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                                                    {stats.houseProfit >= 0 ? '+' : ''}${stats.houseProfit.toFixed(2)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2 bg-[#161a1e] px-2 py-1 rounded border border-[#2b3139] w-20">
                                                    <input 
                                                        type="number" 
                                                        value={asset.payout} 
                                                        onChange={(e) => handleUpdateAsset(asset.id, { payout: Number(e.target.value) })}
                                                        className="w-full bg-transparent text-xs font-bold text-white text-center focus:outline-none"
                                                    />
                                                    <span className="text-[10px] text-[#848e9c]">%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => handleUpdateAsset(asset.id, { isActive: !asset.isActive })}
                                                    className={`w-10 h-5 rounded-full relative transition-colors ${asset.isActive ? 'bg-[#0ecb81]' : 'bg-[#474d57]'}`}
                                                >
                                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${asset.isActive ? 'left-6' : 'left-1'}`}></div>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => handleUpdateAsset(asset.id, { forceOTC: !asset.forceOTC })}
                                                    className={`w-10 h-5 rounded-full relative transition-colors ${asset.forceOTC ? 'bg-[#f6465d]' : 'bg-[#474d57]'}`}
                                                >
                                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${asset.forceOTC ? 'left-6' : 'left-1'}`}></div>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => setScheduleModalAsset(asset)}
                                                    className={`w-8 h-8 rounded flex items-center justify-center border transition-all ${asset.payoutSchedule?.length ? 'border-[#fcd535] text-[#fcd535] bg-[#fcd535]/10' : 'border-[#2b3139] text-[#848e9c] hover:text-white hover:bg-[#2b3139]'}`}
                                                >
                                                    <i className="fa-regular fa-clock"></i>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleDeleteAsset(asset.id)} className="text-[#848e9c] hover:text-[#f6465d] transition-colors p-2">
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={11} className="px-6 py-12 text-center text-[#848e9c] text-xs uppercase tracking-widest">
                                            No assets found matching filters
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetsTab;
