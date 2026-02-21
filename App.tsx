
import React, { useState, useEffect, useRef } from 'react';
import { Asset, CandleData, Trade, MarketSettings, User, AssetType, PaymentRequest } from './shared/types.ts';
import { INITIAL_ASSETS } from './shared/constants.ts';
import UserPanel from './user/UserPanel.tsx';
import AdminPanel from './admin/AdminPanel.tsx';
import OptionsTradingHomePage from './components/OptionsTradingHomePage.tsx';
import { ToastContainer, notify } from './shared/notify';
import { ConfirmDialog } from './shared/confirm';

interface StoredUser {
  email: string;
  password: string;
  name: string;
  createdAt: number;
}

interface UserAuthScreenProps {
  onSubmit: (
    mode: 'LOGIN' | 'SIGNUP',
    payload: { email: string; password: string; name?: string }
  ) => void;
  embedded?: boolean;
}

const UserAuthScreen: React.FC<UserAuthScreenProps> = ({ onSubmit, embedded }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === 'SIGNUP' && !name)) return;
    setLoading(true);
    onSubmit(mode, { email: email.trim(), password, name: name.trim() || undefined });
    setLoading(false);
  };

  const content = (
      <div className="w-full max-w-md bg-[#020617] border border-white/5 rounded-3xl shadow-2xl shadow-black/60 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">GEMINI<span className="text-[#0ecb81]">X</span></h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-[0.25em]">
            Secure Trading Access
          </p>
        </div>

        <div className="flex bg-black/40 rounded-full p-1 border border-white/5 text-[11px] font-bold uppercase tracking-wide">
          <button
            type="button"
            onClick={() => setMode('LOGIN')}
            className={`flex-1 py-2 rounded-full transition-colors ${
              mode === 'LOGIN'
                ? 'bg-[#0ecb81] text-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('SIGNUP')}
            className={`flex-1 py-2 rounded-full transition-colors ${
              mode === 'SIGNUP'
                ? 'bg-[#22c55e]/10 text-[#22c55e]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {mode === 'SIGNUP' && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-xs focus:outline-none focus:border-[#0ecb81]"
                placeholder="John Doe"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-xs focus:outline-none focus:border-[#0ecb81]"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-xs focus:outline-none focus:border-[#0ecb81]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-lg bg-[#0ecb81] text-black text-xs font-black uppercase tracking-[0.25em] disabled:opacity-60 disabled:pointer-events-none"
          >
            {mode === 'LOGIN' ? 'Enter Terminal' : 'Create Account'}
          </button>

          <p className="text-[10px] text-slate-500 text-center mt-2">
            This is a demo auth layer (no real backend).
          </p>
        </form>
      </div>
  );

  if (embedded) return content;

  return (
    <div className="flex h-[100dvh] w-screen bg-[#020617] text-white items-center justify-center px-4">
      {content}
    </div>
  );
};

interface LandingPageProps {
  onAuthSubmit: UserAuthScreenProps['onSubmit'];
}

const LandingPage: React.FC<LandingPageProps> = ({ onAuthSubmit }) => {
  return (
    <div className="flex h-[100dvh] w-screen bg-[#020617] text-white overflow-hidden">
      <div className="max-w-6xl mx-auto w-full px-4 md:px-8 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0ecb81] mr-2 animate-pulse" />
            Real-Time Binary Engine
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Trade digital contracts on a
            <span className="text-[#0ecb81]"> simulated </span>
            engine.
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto md:mx-0">
            Practice high‑frequency binary trading with live‑like price action,
            OTC controls and AI overlays — all in a safe demo environment.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center md:justify-start text-xs">
            <div className="flex items-center space-x-2 text-slate-400">
              <i className="fa-solid fa-shield-halved text-[#0ecb81]" />
              <span>Demo only · No real funds</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-500">
              <i className="fa-solid fa-gauge-high text-[#eab308]" />
              <span>Lightning-fast execution</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex justify-center md:justify-end w-full">
          <UserAuthScreen onSubmit={onAuthSubmit} embedded />
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'USER' | 'ADMIN'>(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/st') return 'ADMIN';
    return 'USER';
  });

  const [authUser, setAuthUser] = useState<{ email: string; name: string } | null>(null);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      setViewMode(window.location.pathname === '/st' ? 'ADMIN' : 'USER');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('smbinary_auth_user');
      if (raw) {
        const parsed = JSON.parse(raw) as { email: string; name: string };
        if (parsed && parsed.email) setAuthUser(parsed);
      }
    } catch {
      // ignore
    }
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

  const handleAuthSubmit = (
    mode: 'LOGIN' | 'SIGNUP',
    payload: { email: string; password: string; name?: string }
  ) => {
    if (typeof window === 'undefined') return;
    const key = 'smbinary_users';
    let usersStore: StoredUser[] = [];
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) usersStore = JSON.parse(raw) as StoredUser[];
    } catch {
      usersStore = [];
    }

    const email = payload.email.toLowerCase();

    if (mode === 'SIGNUP') {
      if (usersStore.some(u => u.email === email)) {
        notify.error('Account already exists with this email');
        return;
      }
      const name = payload.name || email.split('@')[0];
      const newUser: StoredUser = {
        email,
        password: payload.password,
        name,
        createdAt: Date.now()
      };
      usersStore.push(newUser);
      window.localStorage.setItem(key, JSON.stringify(usersStore));
      const authInfo = { email, name };
      window.localStorage.setItem('smbinary_auth_user', JSON.stringify(authInfo));
      setAuthUser(authInfo);
      notify.success('Account created. Logged in as demo user.');
      return;
    }

    const existing = usersStore.find(
      u => u.email === email && u.password === payload.password
    );
    if (!existing) {
      notify.error('Invalid email or password');
      return;
    }
    const authInfo = { email: existing.email, name: existing.name };
    window.localStorage.setItem('smbinary_auth_user', JSON.stringify(authInfo));
    setAuthUser(authInfo);
    notify.success('Welcome back');
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

  // Unauthenticated home: dedicated marketing landing + auth overlay
  if (viewMode === 'USER' && !authUser) {
    return (
      <>
        <OptionsTradingHomePage
          onLoginClick={() => setShowAuthOverlay(true)}
          onSignupClick={() => setShowAuthOverlay(true)}
          onPrimaryCtaClick={() => setShowAuthOverlay(true)}
        />
        {showAuthOverlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <UserAuthScreen onSubmit={handleAuthSubmit} />
          </div>
        )}
        <ToastContainer />
        <ConfirmDialog />
      </>
    );
  }

  return (
    <div className="flex h-[100dvh] w-screen bg-black text-white overflow-hidden font-sans">
      {viewMode === 'USER' ? (
        authUser ? (
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
        ) : null
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
