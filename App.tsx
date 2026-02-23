
import React, { useState, useEffect, useRef } from 'react';
import { Asset, CandleData, Trade, MarketSettings, User, AssetType, PaymentRequest } from './shared/types.ts';
import { INITIAL_ASSETS } from './shared/constants.ts';
import UserPanel from './user/UserPanel.tsx';
import AdminPanel from './admin/AdminPanel.tsx';
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

export const UserAuthScreen: React.FC<UserAuthScreenProps & { initialMode?: 'LOGIN' | 'SIGNUP' }> = ({ onSubmit, embedded, initialMode }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>(initialMode || 'LOGIN');
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

  const formContent = (
    <div className="w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-950 to-black border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/60 p-4 sm:p-8 space-y-6 mx-auto mt-8 sm:mt-16" style={{ minWidth: 0 }}>
      <div className="pt-4 text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-lg">Welcome to <span className="text-emerald-400">SMBinary.COM</span></h1>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-[0.25em]">Secure Trading Access</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {mode === 'SIGNUP' && (
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-black/40 border border-emerald-400/20 px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
              placeholder="John Doe"
            />
          </div>
        )}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-black/40 border border-emerald-400/20 px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-black/40 border border-emerald-400/20 px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-black text-xs font-black uppercase tracking-[0.25em] shadow-lg hover:from-emerald-500 hover:to-cyan-500 transition-all disabled:opacity-60 disabled:pointer-events-none"
        >
          {mode === 'LOGIN' ? 'Enter Terminal' : 'Create Account'}
        </button>
        <p className="text-[10px] text-slate-500 text-center mt-2">This is a demo auth layer (no real backend).</p>
      </form>
    </div>
  );

  // Add Home navigation
  const header = (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl w-full">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/40">
            <span className="text-lg font-black text-slate-950">GX</span>
          </div>
          <div className="flex-col text-xs font-semibold text-slate-300">
            <span className="text-sm font-black tracking-tight text-white">SMBinary.COM</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-300/80">Options Trading</span>
          </div>
        </div>
        {/* Center nav */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-medium text-slate-300">
          <a href="#demo" className="hover:text-emerald-300 transition-colors">Demo account</a>
          <a href="#about" className="hover:text-emerald-300 transition-colors">About us</a>
          <a href="#faq" className="hover:text-emerald-300 transition-colors">FAQ</a>
          <a href="#blog" className="hover:text-emerald-300 transition-colors">Blog</a>
        </nav>
        {/* Right actions */}
        <div className="flex items-center space-x-3 text-xs">
          <button
            className="rounded-full border border-slate-500/60 px-4 py-1.5 font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-300 transition-colors"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
          >
            Home
          </button>
          <button
            className={`rounded-full border border-slate-500/60 px-4 py-1.5 font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-300 transition-colors ${mode === 'LOGIN' ? 'bg-emerald-500 text-black border-emerald-400' : ''}`}
            onClick={() => setMode('LOGIN')}
          >
            Log in
          </button>
          <button
            className={`rounded-full bg-emerald-500 px-4 py-1.5 font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 transition-transform hover:-translate-y-0.5 ${mode === 'SIGNUP' ? 'ring-2 ring-emerald-400' : ''}`}
            onClick={() => setMode('SIGNUP')}
          >
            Sign up
          </button>
          <button className="inline-flex items-center space-x-1 rounded-full border border-slate-600/70 bg-slate-900/60 px-3 py-1.5 font-semibold text-slate-200 text-[11px]">
            <span>EN</span>
            <i className="fa-solid fa-chevron-down text-[9px]" />
          </button>
        </div>
      </div>
    </header>
  );

  if (embedded) return formContent;

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-[#020617] text-white">
      {header}
      <div className="flex-1 flex items-center justify-center px-4">
        {formContent}
      </div>
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

interface AppProps {
  authScreenMode?: 'LOGIN' | 'SIGNUP';
}

const App: React.FC<AppProps> = ({ authScreenMode }) => {
  const [viewMode, setViewMode] = useState<'USER' | 'ADMIN'>(() => {
    // Ensure admin dashboard is rendered immediately on /st reload
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

  // For live usage, if no user is authenticated on the user view and
  // we're not on an explicit auth screen, automatically create a demo
  // user session so the User Panel opens directly.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (authUser || viewMode !== 'USER' || authScreenMode) return;
    const demoUser = { email: 'demo@geminix.pro', name: 'Demo User' };
    try {
      window.localStorage.setItem('smbinary_auth_user', JSON.stringify(demoUser));
    } catch {
      // ignore storage errors
    }
    setAuthUser(demoUser);
  }, [authUser, viewMode, authScreenMode]);

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

  // Payment Requests State (seeded with demo data in non-production)
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(() => {
    // if (import.meta.env.PROD) {
    //   return [];
    // }

    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const demoProof = 'https://via.placeholder.com/800x500?text=Payment+Proof';

    const deposits: PaymentRequest[] = [
      {
        id: 'dep-1',
        userId: 'u1',
        userName: 'Active VIP Trader',
        type: 'DEPOSIT',
        amount: 500,
        method: 'BINANCE_PAY',
        status: 'APPROVED',
        date: now - 3 * day,
        proofUrl: demoProof,
        transactionId: 'DP-548201-0001',
      },
      {
        id: 'dep-2',
        userId: 'u1',
        userName: 'Active VIP Trader',
        type: 'DEPOSIT',
        amount: 250,
        method: 'BINANCE_PAY',
        status: 'PENDING',
        date: now - 12 * 60 * 60 * 1000,
        proofUrl: demoProof,
        transactionId: 'DP-548201-0002',
      },
      {
        id: 'dep-3',
        userId: 'u2',
        userName: 'KYC Pending User',
        type: 'DEPOSIT',
        amount: 100,
        method: 'BINANCE_PAY',
        status: 'PENDING',
        date: now - 6 * 60 * 60 * 1000,
        proofUrl: demoProof,
        transactionId: 'DP-548201-0003',
      },
      {
        id: 'dep-4',
        userId: 'u2',
        userName: 'KYC Pending User',
        type: 'DEPOSIT',
        amount: 300,
        method: 'BINANCE_PAY',
        status: 'APPROVED',
        date: now - 7 * day,
        proofUrl: demoProof,
        transactionId: 'DP-548201-0004',
      },
      {
        id: 'dep-5',
        userId: 'u3',
        userName: 'Banned VPN User',
        type: 'DEPOSIT',
        amount: 200,
        method: 'BINANCE_PAY',
        status: 'REJECTED',
        date: now - 2 * day,
        proofUrl: demoProof,
        transactionId: 'DP-548201-0005',
      },
      {
        id: 'dep-6',
        userId: 'u3',
        userName: 'Banned VPN User',
        type: 'DEPOSIT',
        amount: 150,
        method: 'BINANCE_PAY',
        status: 'PENDING',
        date: now - 18 * 60 * 60 * 1000,
        proofUrl: demoProof,
        transactionId: 'DP-548201-0006',
      },
      {
        id: 'dep-7',
        userId: 'u4',
        userName: 'New Unverified User',
        type: 'DEPOSIT',
        amount: 50,
        method: 'BINANCE_PAY',
        status: 'APPROVED',
        date: now - 5 * day,
        proofUrl: demoProof,
        transactionId: 'DP-548201-0007',
      },
      {
        id: 'dep-8',
        userId: 'u4',
        userName: 'New Unverified User',
        type: 'DEPOSIT',
        amount: 75,
        method: 'BINANCE_PAY',
        status: 'REJECTED',
        date: now - 36 * 60 * 60 * 1000,
        proofUrl: demoProof,
        transactionId: 'DP-548201-0008',
      },
      {
        id: 'dep-9',
        userId: 'u1',
        userName: 'Active VIP Trader',
        type: 'DEPOSIT',
        amount: 1200,
        method: 'BINANCE_PAY',
        status: 'APPROVED',
        date: now - 10 * day,
        proofUrl: demoProof,
        transactionId: 'DP-548201-0009',
      },
      {
        id: 'dep-10',
        userId: 'u2',
        userName: 'KYC Pending User',
        type: 'DEPOSIT',
        amount: 40,
        method: 'BINANCE_PAY',
        status: 'PENDING',
        date: now - 90 * 60 * 1000,
        proofUrl: demoProof,
        transactionId: 'DP-548201-0010',
      },
    ];

    const withdrawals: PaymentRequest[] = [
      {
        id: 'wd-1',
        userId: 'u1',
        userName: 'Active VIP Trader',
        type: 'WITHDRAWAL',
        amount: 300,
        method: 'BINANCE_PAY',
        status: 'APPROVED',
        date: now - 4 * day,
        proofUrl: demoProof,
        transactionId: 'WD-772301-0001',
        targetWallet: 'USDT-TRC20-XXXX-001',
      },
      {
        id: 'wd-2',
        userId: 'u1',
        userName: 'Active VIP Trader',
        type: 'WITHDRAWAL',
        amount: 150,
        method: 'BINANCE_PAY',
        status: 'PENDING',
        date: now - 3 * 60 * 60 * 1000,
        proofUrl: demoProof,
        transactionId: 'WD-772301-0002',
        targetWallet: 'USDT-TRC20-XXXX-002',
      },
      {
        id: 'wd-3',
        userId: 'u2',
        userName: 'KYC Pending User',
        type: 'WITHDRAWAL',
        amount: 50,
        method: 'BINANCE_PAY',
        status: 'PENDING',
        date: now - 5 * 60 * 60 * 1000,
        proofUrl: demoProof,
        transactionId: 'WD-772301-0003',
        targetWallet: 'USDT-TRC20-XXXX-003',
      },
      {
        id: 'wd-4',
        userId: 'u2',
        userName: 'KYC Pending User',
        type: 'WITHDRAWAL',
        amount: 80,
        method: 'BINANCE_PAY',
        status: 'REJECTED',
        date: now - 2 * day,
        proofUrl: demoProof,
        transactionId: 'WD-772301-0004',
        targetWallet: 'USDT-TRC20-XXXX-004',
      },
      {
        id: 'wd-5',
        userId: 'u3',
        userName: 'Banned VPN User',
        type: 'WITHDRAWAL',
        amount: 120,
        method: 'BINANCE_PAY',
        status: 'REJECTED',
        date: now - 30 * 60 * 1000,
        proofUrl: demoProof,
        transactionId: 'WD-772301-0005',
        targetWallet: 'USDT-TRC20-XXXX-005',
      },
      {
        id: 'wd-6',
        userId: 'u3',
        userName: 'Banned VPN User',
        type: 'WITHDRAWAL',
        amount: 60,
        method: 'BINANCE_PAY',
        status: 'PENDING',
        date: now - 8 * 60 * 60 * 1000,
        proofUrl: demoProof,
        transactionId: 'WD-772301-0006',
        targetWallet: 'USDT-TRC20-XXXX-006',
      },
      {
        id: 'wd-7',
        userId: 'u4',
        userName: 'New Unverified User',
        type: 'WITHDRAWAL',
        amount: 20,
        method: 'BINANCE_PAY',
        status: 'PENDING',
        date: now - 18 * 60 * 60 * 1000,
        proofUrl: demoProof,
        transactionId: 'WD-772301-0007',
        targetWallet: 'USDT-TRC20-XXXX-007',
      },
      {
        id: 'wd-8',
        userId: 'u4',
        userName: 'New Unverified User',
        type: 'WITHDRAWAL',
        amount: 40,
        method: 'BINANCE_PAY',
        status: 'APPROVED',
        date: now - 9 * day,
        proofUrl: demoProof,
        transactionId: 'WD-772301-0008',
        targetWallet: 'USDT-TRC20-XXXX-008',
      },
      {
        id: 'wd-9',
        userId: 'u1',
        userName: 'Active VIP Trader',
        type: 'WITHDRAWAL',
        amount: 500,
        method: 'BINANCE_PAY',
        status: 'APPROVED',
        date: now - 14 * day,
        proofUrl: demoProof,
        transactionId: 'WD-772301-0009',
        targetWallet: 'USDT-TRC20-XXXX-009',
      },
      {
        id: 'wd-10',
        userId: 'u2',
        userName: 'KYC Pending User',
        type: 'WITHDRAWAL',
        amount: 30,
        method: 'BINANCE_PAY',
        status: 'PENDING',
        date: now - 45 * 60 * 1000,
        proofUrl: demoProof,
        transactionId: 'WD-772301-0010',
        targetWallet: 'USDT-TRC20-XXXX-010',
      },
    ];

    return [...deposits, ...withdrawals];
  });
  
  // Mock User List for Admin Simulation
  // Seed demo users for the admin panel only in non-production builds.
  // When you connect a real database / API in production, import.meta.env.PROD will be true
  // and this initializer will return an empty array so demo users are not created.
  const [users, setUsers] = useState<User[]>(() => {
    // if (import.meta.env.PROD) {
    //   return [];
    // }

    const now = Date.now();

    const demoUsers: User[] = [
      {
        id: 'u1',
        name: 'Active VIP Trader',
        email: 'vip.trader@example.com',
        password: 'password123',
        balance: 4500,
        bonusBalance: 500,
        status: 'ACTIVE',
        forceResult: 'NONE',
        maxBetSize: 5000,
        dailyProfitLimit: 20000,
        payoutOverride: 0,
        tradeDelayMs: 0,
        joinedAt: now - 86400000 * 45,
        ipAddress: '103.145.12.10',
        country: 'Bangladesh',
        device: 'Chrome / Windows 11',
        lastLogin: now - 15 * 60 * 1000,
        totalDeposited: 8000,
        totalWithdrawn: 3500,
        totalTurnover: 42000,
        netPnL: 1200,
        isBalanceFrozen: false,
        forcePasswordReset: false,
        twoFactorEnabled: true,
        kycStatus: 'VERIFIED',
        kycDocs: { front: '', back: '', selfie: '' },
        riskScore: 35,
        riskLabel: 'VIP',
        tags: ['WITH_BALANCE', 'KYC_VERIFIED'],
        activityLogs: [
          { id: 'l1', action: 'Login', timestamp: now - 30 * 60 * 1000, ip: '103.145.12.10', details: 'Successful login from Dhaka', type: 'INFO' },
        ],
        adminNotes: [
          { id: 'n1', content: 'High value regular trader.', date: now - 86400000 * 20, author: 'Admin' },
        ],
        referralCode: 'VIPTRADER',
      },
      {
        id: 'u2',
        name: 'KYC Pending User',
        email: 'kyc.pending@example.com',
        password: 'password123',
        balance: 150,
        bonusBalance: 0,
        status: 'ACTIVE',
        forceResult: 'NONE',
        maxBetSize: 500,
        dailyProfitLimit: 2000,
        payoutOverride: 0,
        tradeDelayMs: 0,
        joinedAt: now - 86400000 * 7,
        ipAddress: '102.89.22.5',
        country: 'Bangladesh',
        device: 'Safari / iOS',
        lastLogin: now - 2 * 60 * 60 * 1000,
        totalDeposited: 200,
        totalWithdrawn: 0,
        totalTurnover: 1200,
        netPnL: -40,
        isBalanceFrozen: false,
        forcePasswordReset: false,
        twoFactorEnabled: false,
        kycStatus: 'PENDING',
        kycDocs: { front: '', back: '', selfie: '' },
        riskScore: 20,
        riskLabel: 'REGULAR',
        tags: ['EMAIL_UNVERIFIED'],
        activityLogs: [
          { id: 'l2', action: 'KYC submitted', timestamp: now - 3 * 60 * 60 * 1000, ip: '102.89.22.5', details: 'Submitted basic KYC documents', type: 'INFO' },
        ],
        adminNotes: [
          { id: 'n2', content: 'Waiting for compliance review.', date: now - 3 * 60 * 60 * 1000, author: 'Compliance' },
        ],
      },
      {
        id: 'u3',
        name: 'Banned VPN User',
        email: 'vpn.user@example.com',
        password: 'password123',
        balance: 300,
        bonusBalance: 0,
        status: 'BLOCKED',
        forceResult: 'NONE',
        maxBetSize: 200,
        dailyProfitLimit: 1000,
        payoutOverride: 0,
        tradeDelayMs: 0,
        joinedAt: now - 86400000 * 10,
        ipAddress: '185.220.101.4',
        country: 'Bangladesh',
        device: 'Firefox / Linux',
        lastLogin: now - 86400000,
        totalDeposited: 500,
        totalWithdrawn: 0,
        totalTurnover: 2500,
        netPnL: -300,
        isBalanceFrozen: true,
        forcePasswordReset: false,
        twoFactorEnabled: false,
        kycStatus: 'REJECTED',
        kycDocs: { front: '', back: '', selfie: '' },
        riskScore: 85,
        riskLabel: 'HIGH_RISK',
        tags: ['VPN_DETECTED', 'MOBILE_UNVERIFIED'],
        activityLogs: [
          { id: 'l3', action: 'Suspicious login', timestamp: now - 86400000, ip: '185.220.101.4', details: 'Multiple failed logins from VPN', type: 'DANGER' },
        ],
        adminNotes: [
          { id: 'n3', content: 'Account blocked due to VPN abuse.', date: now - 86400000, author: 'Security' },
        ],
      },
      {
        id: 'u4',
        name: 'New Unverified User',
        email: 'new.user@example.com',
        password: 'password123',
        balance: 0,
        bonusBalance: 0,
        status: 'ACTIVE',
        forceResult: 'NONE',
        maxBetSize: 200,
        dailyProfitLimit: 1000,
        payoutOverride: 0,
        tradeDelayMs: 0,
        joinedAt: now - 86400000 * 1,
        ipAddress: '103.120.55.20',
        country: 'Bangladesh',
        device: 'Chrome / Android',
        lastLogin: now - 6 * 60 * 60 * 1000,
        totalDeposited: 0,
        totalWithdrawn: 0,
        totalTurnover: 0,
        netPnL: 0,
        isBalanceFrozen: false,
        forcePasswordReset: false,
        twoFactorEnabled: false,
        kycStatus: 'NOT_SUBMITTED',
        kycDocs: { front: '', back: '', selfie: '' },
        riskScore: 10,
        riskLabel: 'REGULAR',
        tags: ['EMAIL_UNVERIFIED', 'MOBILE_UNVERIFIED'],
        activityLogs: [
          { id: 'l4', action: 'Registration', timestamp: now - 86400000, ip: '103.120.55.20', details: 'New account created', type: 'INFO' },
        ],
        adminNotes: [
          { id: 'n4', content: 'Encourage KYC and first deposit.', date: now - 86400000, author: 'Marketing' },
        ],
      },
      {
        id: 'u5',
        name: 'BD Affiliate Pro',
        email: 'affiliate.bd@example.com',
        password: 'password123',
        balance: 1200,
        bonusBalance: 100,
        status: 'ACTIVE',
        forceResult: 'NONE',
        maxBetSize: 2000,
        dailyProfitLimit: 10000,
        payoutOverride: 0,
        tradeDelayMs: 0,
        joinedAt: now - 86400000 * 25,
        ipAddress: '103.145.33.21',
        country: 'Bangladesh',
        device: 'Chrome / Windows 10',
        lastLogin: now - 40 * 60 * 1000,
        totalDeposited: 3000,
        totalWithdrawn: 900,
        totalTurnover: 15000,
        netPnL: 350,
        isBalanceFrozen: false,
        forcePasswordReset: false,
        twoFactorEnabled: true,
        kycStatus: 'VERIFIED',
        kycDocs: { front: '', back: '', selfie: '' },
        riskScore: 28,
        riskLabel: 'REGULAR',
        tags: ['WITH_BALANCE', 'KYC_VERIFIED'],
        activityLogs: [
          { id: 'l5', action: 'New referral registered', timestamp: now - 2 * 60 * 60 * 1000, ip: '103.145.33.21', details: 'Referred user from Facebook campaign', type: 'INFO' },
        ],
        adminNotes: [
          { id: 'n5', content: 'Strong BD affiliate, stable traffic.', date: now - 86400000 * 10, author: 'Affiliate Manager' },
        ],
        referralCode: 'BD-AFF-01',
      },
      {
        id: 'u6',
        name: 'IN Performance Partner',
        email: 'affiliate.in@example.com',
        password: 'password123',
        balance: 900,
        bonusBalance: 0,
        status: 'ACTIVE',
        forceResult: 'NONE',
        maxBetSize: 1500,
        dailyProfitLimit: 8000,
        payoutOverride: 0,
        tradeDelayMs: 0,
        joinedAt: now - 86400000 * 15,
        ipAddress: '49.207.22.14',
        country: 'India',
        device: 'Chrome / Windows 11',
        lastLogin: now - 75 * 60 * 1000,
        totalDeposited: 2200,
        totalWithdrawn: 400,
        totalTurnover: 11000,
        netPnL: 180,
        isBalanceFrozen: false,
        forcePasswordReset: false,
        twoFactorEnabled: false,
        kycStatus: 'VERIFIED',
        kycDocs: { front: '', back: '', selfie: '' },
        riskScore: 40,
        riskLabel: 'VIP',
        tags: ['WITH_BALANCE', 'KYC_VERIFIED'],
        activityLogs: [
          { id: 'l6', action: 'Referral payout processed', timestamp: now - 6 * 60 * 60 * 1000, ip: '49.207.22.14', details: 'Commission paid for January traffic', type: 'INFO' },
        ],
        adminNotes: [
          { id: 'n6', content: 'High quality Indian traffic, low fraud.', date: now - 86400000 * 5, author: 'Affiliate Manager' },
        ],
        referralCode: 'IN-AFF-01',
      },
      {
        id: 'u7',
        name: 'EU Growth Partner',
        email: 'affiliate.eu@example.com',
        password: 'password123',
        balance: 1600,
        bonusBalance: 200,
        status: 'ACTIVE',
        forceResult: 'NONE',
        maxBetSize: 2500,
        dailyProfitLimit: 12000,
        payoutOverride: 0,
        tradeDelayMs: 0,
        joinedAt: now - 86400000 * 35,
        ipAddress: '195.201.14.88',
        country: 'Germany',
        device: 'Chrome / macOS',
        lastLogin: now - 3 * 60 * 60 * 1000,
        totalDeposited: 4000,
        totalWithdrawn: 1200,
        totalTurnover: 20000,
        netPnL: 420,
        isBalanceFrozen: false,
        forcePasswordReset: false,
        twoFactorEnabled: true,
        kycStatus: 'VERIFIED',
        kycDocs: { front: '', back: '', selfie: '' },
        riskScore: 30,
        riskLabel: 'REGULAR',
        tags: ['WITH_BALANCE', 'KYC_VERIFIED'],
        activityLogs: [
          { id: 'l7', action: 'New campaign launched', timestamp: now - 12 * 60 * 60 * 1000, ip: '195.201.14.88', details: 'Started EU SEO campaign', type: 'INFO' },
        ],
        adminNotes: [
          { id: 'n7', content: 'Good EU coverage, test higher CPA.', date: now - 86400000 * 3, author: 'Affiliate Manager' },
        ],
        referralCode: 'EU-AFF-01',
      },
      {
        id: 'u8',
        name: 'Referred Trader A',
        email: 'ref.a@example.com',
        password: 'password123',
        balance: 500,
        bonusBalance: 50,
        status: 'ACTIVE',
        forceResult: 'NONE',
        maxBetSize: 800,
        dailyProfitLimit: 3000,
        payoutOverride: 0,
        tradeDelayMs: 0,
        joinedAt: now - 86400000 * 5,
        ipAddress: '103.145.55.31',
        country: 'Bangladesh',
        device: 'Android / Chrome',
        lastLogin: now - 50 * 60 * 1000,
        totalDeposited: 700,
        totalWithdrawn: 100,
        totalTurnover: 3500,
        netPnL: 90,
        isBalanceFrozen: false,
        forcePasswordReset: false,
        twoFactorEnabled: false,
        kycStatus: 'PENDING',
        kycDocs: { front: '', back: '', selfie: '' },
        riskScore: 18,
        riskLabel: 'REGULAR',
        tags: ['WITH_BALANCE'],
        activityLogs: [],
        adminNotes: [],
        uplineId: 'u5',
      },
      {
        id: 'u9',
        name: 'Referred Trader B',
        email: 'ref.b@example.com',
        password: 'password123',
        balance: 300,
        bonusBalance: 0,
        status: 'ACTIVE',
        forceResult: 'NONE',
        maxBetSize: 600,
        dailyProfitLimit: 2500,
        payoutOverride: 0,
        tradeDelayMs: 0,
        joinedAt: now - 86400000 * 3,
        ipAddress: '49.207.55.21',
        country: 'India',
        device: 'iOS / Safari',
        lastLogin: now - 90 * 60 * 1000,
        totalDeposited: 500,
        totalWithdrawn: 0,
        totalTurnover: 2600,
        netPnL: -40,
        isBalanceFrozen: false,
        forcePasswordReset: false,
        twoFactorEnabled: false,
        kycStatus: 'NOT_SUBMITTED',
        kycDocs: { front: '', back: '', selfie: '' },
        riskScore: 22,
        riskLabel: 'REGULAR',
        tags: [],
        activityLogs: [],
        adminNotes: [],
        uplineId: 'u6',
      },
      {
        id: 'u10',
        name: 'Referred Trader C',
        email: 'ref.c@example.com',
        password: 'password123',
        balance: 750,
        bonusBalance: 0,
        status: 'ACTIVE',
        forceResult: 'NONE',
        maxBetSize: 1000,
        dailyProfitLimit: 4000,
        payoutOverride: 0,
        tradeDelayMs: 0,
        joinedAt: now - 86400000 * 2,
        ipAddress: '80.145.77.19',
        country: 'Germany',
        device: 'Desktop / Chrome',
        lastLogin: now - 30 * 60 * 1000,
        totalDeposited: 1200,
        totalWithdrawn: 0,
        totalTurnover: 5000,
        netPnL: 130,
        isBalanceFrozen: false,
        forcePasswordReset: false,
        twoFactorEnabled: false,
        kycStatus: 'PENDING',
        kycDocs: { front: '', back: '', selfie: '' },
        riskScore: 26,
        riskLabel: 'REGULAR',
        tags: ['WITH_BALANCE'],
        activityLogs: [],
        adminNotes: [],
        uplineId: 'u7',
      },
    ];

    return demoUsers;
  });

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
    },
    adminTheme: {
      mode: 'LIGHT',
      primaryColor: '#0f172a',
      accentColor: '#2563eb',
      // Fully light workspace including shell elements.
      backgroundColor: '#f3f4f6',
      sidebarBackground: '#f9fafb',
      headerBackground: '#f9fafb',
      surfaceBackground: '#ffffff',
      textColor: '#020617',
    },
    notifications: {
      master: {
        systemNotificationsEnabled: true,
        userAlertsEnabled: true,
        financialAlertsEnabled: true,
        securityAlertsEnabled: true,
        marketingAnnouncementsEnabled: true,
        emergencyOverrideActive: false,
      },
      channels: {
        inAppEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        browserPushEnabled: false,
        mobilePushEnabled: false,
        telegramEnabled: false,
        whatsappEnabled: false,
      },
      eventRules: [
        {
          eventKey: 'REGISTRATION_WELCOME',
          enabled: true,
          channels: ['IN_APP', 'EMAIL'],
          priority: 'LOW',
        },
        {
          eventKey: 'DEPOSIT_UPDATE',
          enabled: true,
          channels: ['IN_APP', 'EMAIL'],
          priority: 'MEDIUM',
        },
        {
          eventKey: 'WITHDRAWAL_UPDATE',
          enabled: true,
          channels: ['IN_APP', 'EMAIL'],
          priority: 'MEDIUM',
        },
        {
          eventKey: 'KYC_STATUS_CHANGE',
          enabled: true,
          channels: ['IN_APP', 'EMAIL'],
          priority: 'MEDIUM',
        },
        {
          eventKey: 'TRADE_RESULT',
          enabled: true,
          channels: ['IN_APP'],
          priority: 'LOW',
        },
        {
          eventKey: 'BIG_PROFIT_ALERT',
          enabled: true,
          channels: ['IN_APP'],
          priority: 'MEDIUM',
        },
        {
          eventKey: 'SUSPICIOUS_LOGIN',
          enabled: true,
          channels: ['IN_APP', 'EMAIL'],
          priority: 'HIGH',
        },
        {
          eventKey: 'PASSWORD_CHANGE',
          enabled: true,
          channels: ['IN_APP', 'EMAIL'],
          priority: 'HIGH',
        },
        {
          eventKey: 'ACCOUNT_LOCKED',
          enabled: true,
          channels: ['IN_APP', 'EMAIL'],
          priority: 'HIGH',
        },
      ],
      templates: [],
      userDefaults: {
        inAppEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: false,
        marketingOptIn: true,
        quietHoursEnabled: false,
        quietHoursFrom: '23:00',
        quietHoursTo: '07:00',
      },
      scheduling: {
        allowScheduledAnnouncements: true,
        allowMaintenanceScheduling: true,
        timezoneAwareDelivery: true,
        defaultSendDelaySeconds: 0,
      },
      inAppUx: {
        toastPosition: 'TOP_RIGHT',
        autoDismissSeconds: 6,
        soundEnabled: true,
        unreadBadgeEnabled: true,
      },
      logging: {
        keepHistoryDays: 30,
        trackOpens: true,
        trackClicks: true,
        enableResend: true,
      },
      push: {
        browserPushEnabled: false,
        mobilePushEnabled: false,
        requireExplicitOptIn: true,
      },
      language: {
        enabledLanguages: ['en'],
        defaultLanguage: 'en',
      },
      queueing: {
        preventDuplicates: true,
        rateLimitPerMinute: 120,
        enableQueue: true,
        maxRetries: 3,
      },
    },
    branding: {
      logos: {},
      favicons: {},
      sizing: {
        desktopLogoHeight: 32,
        mobileLogoHeight: 24,
        sidebarLogoScale: 1,
        retinaScale: 2,
      },
      primaryBrandColor: '#fcd535',
      brandingHistory: [],
    },
    deviceViewPresets: [
      {
        id: 'desktop-1920',
        name: 'Desktop 1920×1080',
        category: 'DESKTOP',
        width: 1920,
        height: 1080,
        note: 'Standard full HD desktop monitor',
        orientation: 'LANDSCAPE',
        status: 'ACTIVE',
      },
      {
        id: 'laptop-1366',
        name: 'Laptop 1366×768',
        category: 'LAPTOP',
        width: 1366,
        height: 768,
        note: 'Common notebook resolution',
        orientation: 'LANDSCAPE',
        status: 'ACTIVE',
      },
      {
        id: 'tablet-1024',
        name: 'Tablet 1024×768',
        category: 'TABLET',
        width: 1024,
        height: 768,
        note: 'Landscape tablet layout',
        orientation: 'LANDSCAPE',
        status: 'ACTIVE',
      },
      {
        id: 'mobile-iphone-12-pro',
        name: 'iPhone 12 Pro 390×844',
        category: 'MOBILE',
        width: 390,
        height: 844,
        note: 'Typical modern iPhone viewport',
        orientation: 'PORTRAIT',
        status: 'ACTIVE',
      },
    ],
    activeDeviceCategory: 'DESKTOP'
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

  // Dedicated login/signup page
  if ((authScreenMode === 'LOGIN' || authScreenMode === 'SIGNUP') && viewMode === 'USER' && !authUser) {
    return (
      <UserAuthScreen
        onSubmit={handleAuthSubmit}
        embedded={false}
        // Set initial mode
        {...(authScreenMode === 'SIGNUP' ? { initialMode: 'SIGNUP' } : {})}
      />
    );
  }

  const adminTheme = marketSettings.adminTheme;
  const isAdminView = viewMode === 'ADMIN';

  const appBg = isAdminView
    ? adminTheme?.backgroundColor || '#f3f4f6'
    : '#020617';
  const appText = isAdminView
    ? adminTheme?.textColor || '#020617'
    : '#EAECEF';

  return (
    <div
      className="flex h-[100dvh] w-screen overflow-hidden font-sans"
      style={{
        backgroundColor: appBg,
        color: appText,
      }}
    >
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
        ) : (
          <div className="flex-1 flex items-center justify-center bg-black text-slate-300 text-sm">
            Initializing demo trading terminal...
          </div>
        )
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
