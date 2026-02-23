
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { notify } from '../../shared/notify';
import { Asset, MarketSettings, PayoutSchedule, AssetType, Trade, AdminThemeSettings } from '../../shared/types.ts';
import { AssetIcon } from '../../user/components/AssetIcon.tsx';

interface AssetsTabProps {
    assets: Asset[];
    setAssets: (assets: Asset[]) => void;
    settings: MarketSettings;
    onUpdate: (settings: MarketSettings) => void;
    trades: Trade[]; // Added trades prop for stats calculation
}

const AssetsTab: React.FC<AssetsTabProps & { theme?: AdminThemeSettings }> = ({ assets, setAssets, settings, onUpdate, trades = [], theme }) => {
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

    const isLight = theme?.mode === 'LIGHT';
    const cardBg = theme?.surfaceBackground || (isLight ? '#ffffff' : '#1e2329');
    const borderColor = isLight ? 'rgba(226,232,240,1)' : '#2b3139';
    const headerBg = theme?.headerBackground || (isLight ? '#f9fafb' : '#1e2329');
    const subtleBg = isLight ? '#f3f4f6' : '#161a1e';
    const textPrimary = theme?.textColor || (isLight ? '#020617' : '#EAECEF');
    const textMuted = isLight ? '#6b7280' : '#848e9c';
    const inputBg = isLight ? '#f9fafb' : '#111827';
    const inputBorder = isLight ? 'rgba(226,232,240,1)' : '#2b3139';
    const accentColor = '#fcd535';

    // --- SUMMARY STATS (ALL ASSETS) ---
    const totalAssets = assets.length;
    const activeAssets = assets.filter(a => a.isActive).length;
    const cryptoCount = assets.filter(a => a.type === AssetType.CRYPTO).length;
    const stocksCount = assets.filter(a => a.type === AssetType.STOCKS).length;
    const forexCount = assets.filter(a => a.type === AssetType.FOREX).length;

    return (
        <div className="flex flex-col h-full">
            
            {/* --- CREATE MODAL --- */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-xl border shadow-2xl animate-in fade-in zoom-in-95" style={{ backgroundColor: cardBg, borderColor }}>
                        <div className="p-5 border-b flex justify-between items-center" style={{ backgroundColor: headerBg, borderColor }}>
                            <h3 className="font-bold" style={{ color: textPrimary }}>Add New Asset</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className={`transition-colors ${isLight ? 'text-[#6b7280] hover:text-[#111827]' : 'text-[#848e9c] hover:text-white'}`}
                            >
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold block mb-1" style={{ color: textMuted }}>Asset Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Gold"
                                        value={newAssetData.name}
                                        onChange={e => setNewAssetData({ ...newAssetData, name: e.target.value })}
                                        className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-[#fcd535]"
                                        style={{
                                            backgroundColor: inputBg,
                                            borderColor: inputBorder,
                                            color: textPrimary,
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-1" style={{ color: textMuted }}>Symbol</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. XAU/USD"
                                        value={newAssetData.symbol}
                                        onChange={e => setNewAssetData({ ...newAssetData, symbol: e.target.value })}
                                        className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-[#fcd535]"
                                        style={{
                                            backgroundColor: inputBg,
                                            borderColor: inputBorder,
                                            color: textPrimary,
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold block mb-1" style={{ color: textMuted }}>Type</label>
                                    <select
                                        value={newAssetData.type}
                                        onChange={e => setNewAssetData({ ...newAssetData, type: e.target.value as AssetType })}
                                        className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-[#fcd535]"
                                        style={{
                                            backgroundColor: inputBg,
                                            borderColor: inputBorder,
                                            color: textPrimary,
                                        }}
                                    >
                                        <option value={AssetType.CRYPTO}>Crypto</option>
                                        <option value={AssetType.STOCKS}>Stocks</option>
                                        <option value={AssetType.FOREX}>Currencies (Forex)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-1" style={{ color: textMuted }}>Base Price</label>
                                    <input
                                        type="number"
                                        value={newAssetData.price}
                                        onChange={e => setNewAssetData({ ...newAssetData, price: Number(e.target.value) })}
                                        className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-[#fcd535]"
                                        style={{
                                            backgroundColor: inputBg,
                                            borderColor: inputBorder,
                                            color: textPrimary,
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1" style={{ color: textMuted }}>Default Payout (%)</label>
                                <input
                                    type="number"
                                    value={newAssetData.payout}
                                    onChange={e => setNewAssetData({ ...newAssetData, payout: Number(e.target.value) })}
                                    className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-[#fcd535]"
                                    style={{
                                        backgroundColor: inputBg,
                                        borderColor: inputBorder,
                                        color: textPrimary,
                                    }}
                                />
                            </div>
                            <div
                                className="flex items-center space-x-3 p-3 rounded border"
                                style={{ backgroundColor: subtleBg, borderColor }}
                            >
                                <input
                                    type="checkbox"
                                    checked={newAssetData.forceOTC}
                                    onChange={e => setNewAssetData({ ...newAssetData, forceOTC: e.target.checked })}
                                    className="w-4 h-4 accent-[#fcd535]"
                                />
                                <span className="text-sm font-bold" style={{ color: textPrimary }}>
                                    Force OTC Mode (Simulated Data)
                                </span>
                            </div>
                            <button
                                onClick={handleCreateAsset}
                                className="w-full py-3 rounded font-bold hover:brightness-105 border shadow-sm"
                                style={{ backgroundColor: accentColor, color: '#000000', borderColor: '#fbbf24' }}
                            >
                                CREATE ASSET
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SCHEDULE MODAL --- */}
            {scheduleModalAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-xl border shadow-2xl animate-in fade-in zoom-in-95" style={{ backgroundColor: cardBg, borderColor }}>
                        <div className="p-4 border-b flex justify-between items-center" style={{ backgroundColor: headerBg, borderColor }}>
                            <h3 className="font-bold" style={{ color: textPrimary }}>Payout Schedule: {scheduleModalAsset.symbol}</h3>
                            <button
                                onClick={() => setScheduleModalAsset(null)}
                                className={`transition-colors ${isLight ? 'text-[#6b7280] hover:text-[#111827]' : 'text-[#848e9c] hover:text-white'}`}
                            >
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="p-4 rounded-lg border" style={{ backgroundColor: subtleBg, borderColor }}>
                                <h4 className="text-xs font-bold uppercase mb-3" style={{ color: textMuted }}>Add Time Rule (UTC)</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[10px] block mb-1" style={{ color: textMuted }}>Start (0-23)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="23"
                                            value={newSchedule.start}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, start: parseInt(e.target.value) })}
                                            className="w-full border rounded px-2 py-2 text-xs outline-none focus:border-[#fcd535]"
                                            style={{
                                                backgroundColor: inputBg,
                                                borderColor: inputBorder,
                                                color: textPrimary,
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] block mb-1" style={{ color: textMuted }}>End (0-23)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="24"
                                            value={newSchedule.end}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, end: parseInt(e.target.value) })}
                                            className="w-full border rounded px-2 py-2 text-xs outline-none focus:border-[#fcd535]"
                                            style={{
                                                backgroundColor: inputBg,
                                                borderColor: inputBorder,
                                                color: textPrimary,
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] block mb-1" style={{ color: textMuted }}>Payout %</label>
                                        <input
                                            type="number"
                                            value={newSchedule.percent}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, percent: parseInt(e.target.value) })}
                                            className="w-full border rounded px-2 py-2 font-bold text-xs outline-none focus:border-[#fcd535]"
                                            style={{
                                                backgroundColor: inputBg,
                                                borderColor: inputBorder,
                                                color: accentColor,
                                            }}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddSchedule}
                                    className="mt-3 w-full py-2 rounded text-xs font-bold hover:brightness-105 border"
                                    style={{
                                        backgroundColor: isLight ? '#2563eb' : '#3b82f6',
                                        color: '#ffffff',
                                        borderColor: isLight ? '#2563eb' : '#1d4ed8',
                                    }}
                                >
                                    <i className="fa-solid fa-plus mr-1"></i> Add Rule
                                </button>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase mb-3" style={{ color: textMuted }}>Active Schedules</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                    {scheduleModalAsset.payoutSchedule && scheduleModalAsset.payoutSchedule.length > 0 ? (
                                        scheduleModalAsset.payoutSchedule.map(s => (
                                            <div
                                                key={s.id}
                                                className="flex items-center justify-between p-3 rounded border"
                                                style={{ backgroundColor: subtleBg, borderColor }}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <i className="fa-regular fa-clock" style={{ color: textMuted }}></i>
                                                    <span className="text-sm font-mono" style={{ color: textPrimary }}>{s.startHour}:00 - {s.endHour}:00</span>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-sm font-bold text-[#0ecb81]">{s.payout}%</span>
                                                    <button
                                                        onClick={() => handleRemoveSchedule(s.id)}
                                                        className={`transition-colors ${isLight ? 'text-[#b91c1c] hover:text-[#7f1d1d]' : 'text-[#f6465d] hover:text-white'}`}
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-xs italic" style={{ color: textMuted }}>No active schedules.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FIXED HEADER CONTROLS --- */}
            <div className="px-4 pt-4 pb-2 shrink-0 z-20 space-y-3">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 rounded-xl border shadow-lg" style={{ backgroundColor: cardBg, borderColor }}>
                    <div className="flex p-1 rounded-lg border" style={{ backgroundColor: subtleBg, borderColor }}>
                        {['ALL', 'CRYPTO', 'STOCKS', 'FOREX'].map(f => (
                            <button 
                                key={f} 
                                onClick={() => setFilter(f as any)} 
                                className={`px-4 py-2 text-xs font-bold rounded transition-all ${filter === f ? 'bg-[#fcd535] text-black shadow' : ''}`}
                                style={filter === f ? undefined : { color: textMuted }}
                            >
                                {f === 'FOREX' ? 'Currencies' : f.charAt(0) + f.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                    <div className="flex w-full md:w-auto gap-4">
                        <div className="relative flex-1 md:w-64">
                            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: textMuted }}></i>
                            <input
                                type="text"
                                placeholder="Search Assets..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full rounded-lg pl-9 pr-3 py-2 text-xs border outline-none focus:border-[#fcd535]"
                                style={{
                                    backgroundColor: inputBg,
                                    borderColor: inputBorder,
                                    color: textPrimary,
                                }}
                            />
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap border shadow-sm hover:brightness-105"
                            style={{ backgroundColor: '#0ecb81', color: '#ffffff', borderColor: '#10b981' }}
                        >
                            <i className="fa-solid fa-plus mr-2"></i> Create Asset
                        </button>
                    </div>
                </div>
                {/* --- SUMMARY CARDS --- */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="rounded-lg border px-3 py-2 shadow-sm" style={{ backgroundColor: cardBg, borderColor }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: textMuted }}>Total Assets</p>
                        <p className="mt-1 text-lg font-bold" style={{ color: textPrimary }}>{totalAssets}</p>
                    </div>
                    <div className="rounded-lg border px-3 py-2 shadow-sm" style={{ backgroundColor: cardBg, borderColor }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: textMuted }}>Active Assets</p>
                        <p className="mt-1 text-lg font-bold" style={{ color: isLight ? '#16a34a' : '#0ecb81' }}>{activeAssets}</p>
                    </div>
                    <div className="rounded-lg border px-3 py-2 shadow-sm" style={{ backgroundColor: cardBg, borderColor }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: textMuted }}>Crypto</p>
                        <p className="mt-1 text-lg font-bold" style={{ color: textPrimary }}>{cryptoCount}</p>
                    </div>
                    <div className="rounded-lg border px-3 py-2 shadow-sm" style={{ backgroundColor: cardBg, borderColor }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: textMuted }}>Stocks</p>
                        <p className="mt-1 text-lg font-bold" style={{ color: textPrimary }}>{stocksCount}</p>
                    </div>
                    <div className="rounded-lg border px-3 py-2 shadow-sm" style={{ backgroundColor: cardBg, borderColor }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: textMuted }}>Forex</p>
                        <p className="mt-1 text-lg font-bold" style={{ color: textPrimary }}>{forexCount}</p>
                    </div>
                </div>
            </div>

            {/* --- SCROLLABLE TABLE AREA --- */}
            <div className="flex-1 overflow-hidden px-4 py-2 pb-4">
                <div className="rounded-xl border shadow-lg flex flex-col h-full overflow-hidden" style={{ backgroundColor: cardBg, borderColor }}>
                    <div className="overflow-y-auto custom-scrollbar flex-1 relative">
                        <table className="w-full text-left border-collapse">
                            <thead
                                className="text-[10px] font-bold uppercase tracking-wider sticky top-0 z-50 shadow-md"
                                style={{ backgroundColor: headerBg, color: textMuted }}
                            >
                                <tr>
                                    <th className="px-6 py-3">Asset</th>
                                    <th className="px-6 py-3">Live Price</th>
                                    <th className="px-6 py-3">Active Users</th>
                                    <th className="px-6 py-3">Volume</th>
                                    <th className="px-6 py-3">Win Rate (User)</th>
                                    <th className="px-6 py-3">House PnL</th>
                                    <th className="px-6 py-3">Payout %</th>
                                    <th className="px-6 py-3 text-center">Active</th>
                                    <th className="px-6 py-3 text-center">Force OTC</th>
                                    <th className="px-6 py-3 text-center">Schedule</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody
                                className="divide-y"
                                style={{ borderColor: isLight ? 'rgba(226,232,240,0.9)' : 'rgba(148,163,184,0.15)' }}
                            >
                                {filteredAssets.length > 0 ? filteredAssets.map((asset, idx) => {
                                    const displayPrice = getDisplayPrice(asset);
                                    const stats = getAssetStats(asset.symbol);

                                    const rowBg = isLight
                                        ? idx % 2 === 0
                                            ? '#ffffff'
                                            : '#f9fafb'
                                        : 'transparent';

                                    return (
                                        <tr
                                            key={asset.id}
                                            className={`transition-colors group ${
                                                isLight ? 'hover:bg-[#e5e7eb]' : 'hover:bg-[#2b3139]/30'
                                            }`}
                                            style={{ backgroundColor: rowBg }}
                                        >
                                            <td className="px-6 py-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="shrink-0">
                                                        <AssetIcon asset={asset} className="mr-0" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold" style={{ color: textPrimary }}>{asset.symbol}</p>
                                                        <p className="text-[10px]" style={{ color: textMuted }}>{asset.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center space-x-2">
                                                    <span
                                                        className="text-xs font-mono font-bold transition-colors duration-300"
                                                        style={{
                                                            color:
                                                                displayPrice > asset.price
                                                                    ? '#0ecb81'
                                                                    : displayPrice < asset.price
                                                                    ? '#f6465d'
                                                                    : textPrimary,
                                                        }}
                                                    >
                                                        ${displayPrice.toLocaleString(undefined, {
                                                            minimumFractionDigits: asset.type === AssetType.FOREX ? 4 : 2,
                                                        })}
                                                    </span>
                                                    {asset.type === AssetType.CRYPTO && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#0ecb81] animate-pulse" title="Live WS Feed"></div>
                                                    )}
                                                </div>
                                            </td>
                                            
                                            {/* --- NEW STATS COLUMNS --- */}
                                            <td className="px-6 py-3">
                                                <div className="flex items-center space-x-1">
                                                    <i className="fa-solid fa-user text-[10px]" style={{ color: textMuted }}></i>
                                                    <span className="text-xs font-bold" style={{ color: textPrimary }}>{stats.activeCount}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-xs font-mono font-bold" style={{ color: textPrimary }}>
                                                    ${stats.volume.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className="w-12 h-1 rounded-full overflow-hidden"
                                                        style={{ backgroundColor: isLight ? '#e5e7eb' : '#161a1e' }}
                                                    >
                                                        <div className={`h-full ${stats.userWinRate > 50 ? 'bg-[#0ecb81]' : 'bg-[#f6465d]'}`} style={{width: `${stats.userWinRate}%`}}></div>
                                                    </div>
                                                    <span className="text-[10px] font-bold" style={{ color: textMuted }}>
                                                        {stats.userWinRate.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={`text-xs font-mono font-bold ${stats.houseProfit >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                                                    {stats.houseProfit >= 0 ? '+' : ''}${stats.houseProfit.toFixed(2)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div
                                                    className="flex items-center space-x-2 px-2 py-1 rounded border w-20"
                                                    style={{ backgroundColor: isLight ? '#f9fafb' : '#161a1e', borderColor }}
                                                >
                                                    <input 
                                                        type="number" 
                                                        value={asset.payout} 
                                                        onChange={(e) => handleUpdateAsset(asset.id, { payout: Number(e.target.value) })}
                                                        className="w-full bg-transparent text-xs font-bold text-center focus:outline-none"
                                                        style={{ color: textPrimary }}
                                                    />
                                                    <span className="text-[10px]" style={{ color: textMuted }}>%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <button 
                                                    onClick={() => handleUpdateAsset(asset.id, { isActive: !asset.isActive })}
                                                    className={`w-10 h-5 rounded-full relative transition-colors ${asset.isActive
                                                        ? 'bg-[#0ecb81]'
                                                        : isLight
                                                            ? 'bg-[#e5e7eb]'
                                                            : 'bg-[#474d57]'}`}
                                                >
                                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${asset.isActive ? 'left-6' : 'left-1'}`}></div>
                                                </button>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <button 
                                                    onClick={() => handleUpdateAsset(asset.id, { forceOTC: !asset.forceOTC })}
                                                    className={`w-10 h-5 rounded-full relative transition-colors ${
                                                        asset.forceOTC
                                                            ? 'bg-[#f6465d]'
                                                            : isLight
                                                            ? 'bg-[#e5e7eb]'
                                                            : 'bg-[#474d57]'
                                                    }`}
                                                >
                                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${asset.forceOTC ? 'left-6' : 'left-1'}`}></div>
                                                </button>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <button 
                                                    onClick={() => setScheduleModalAsset(asset)}
                                                    className={`w-8 h-8 rounded flex items-center justify-center border text-xs font-semibold transition-all ${
                                                        asset.payoutSchedule?.length
                                                            ? 'border-[#fcd535] text-[#fcd535] bg-[#fcd535]/10'
                                                            : isLight
                                                            ? 'border-[#e5e7eb] text-[#6b7280] hover:bg-[#f3f4f6]'
                                                            : 'border-[#2b3139] text-[#848e9c] hover:text-white hover:bg-[#2b3139]'
                                                    }`}
                                                >
                                                    <i className="fa-regular fa-clock"></i>
                                                </button>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <button
                                                    onClick={() => handleDeleteAsset(asset.id)}
                                                    className="transition-colors p-2"
                                                    style={{ color: textMuted }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.color = isLight ? '#b91c1c' : '#f6465d')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.color = textMuted)}
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td
                                            colSpan={11}
                                            className="px-6 py-8 text-center text-xs uppercase tracking-widest"
                                            style={{ color: textMuted }}
                                        >
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
