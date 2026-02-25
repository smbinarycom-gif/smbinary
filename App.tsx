
import React, { useState, useEffect, useRef } from 'react';
import { Asset, CandleData, Trade, MarketSettings, User, AssetType, PaymentRequest } from './shared/types.ts';
import { INITIAL_ASSETS } from './shared/constants.ts';
import UserPanel from './user/UserPanel.tsx';
import AdminPanel from './admin/AdminPanel.tsx';
import { ToastContainer, notify } from './shared/notify';
import { ConfirmDialog } from './shared/confirm';
import LandingPage from './LandingPage';
import UserAuthScreen from './auth/UserAuthScreen';
import ProtectedRoute from './auth/ProtectedRoute';
import useAuth from './auth/useAuth';
import { supabase } from './supabaseClient';

interface StoredUser {
  email: string;
  password: string;
  name: string;
  createdAt: number;
}

interface AppProps {
  authScreenMode?: 'LOGIN' | 'SIGNUP';
}

const App: React.FC<AppProps> = ({ authScreenMode }) => {
  const [viewMode, setViewMode] = useState<'USER' | 'ADMIN'>(() => {
    // Ensure admin dashboard is rendered immediately on /st reload
    if (typeof window !== 'undefined' && window.location.pathname === '/st') return 'ADMIN';
    return 'USER';
  });

  const [showAuthOverlay, setShowAuthOverlay] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      setViewMode(window.location.pathname === '/st' ? 'ADMIN' : 'USER');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // No automatic demo login: require explicit signup/login to access trading.

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

  // App-level auth flow delegated to AuthProvider via `useAuth` hook below.
  
  const auth = useAuth();

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

  // If Supabase is configured, load users from DB and subscribe to realtime changes
  useEffect(() => {
    let mounted = true;
    if (!supabase || !supabase.from) return;

    (async () => {
      try {
        const { data, error } = await supabase.from('users').select('*');
        if (!error && data && mounted) {
          // Map DB rows to app User type where possible
          const mapped = (data as any[]).map((r) => ({
            id: r.id || r.user_id || (r.email ? r.email : Math.random().toString(36).slice(2)),
            name: r.name || r.full_name || r.user_metadata?.name || r.email?.split('@')[0] || 'User',
            email: r.email || '',
            password: r.password || '',
            balance: r.balance || 0,
            bonusBalance: r.bonusBalance || 0,
            status: r.status || 'ACTIVE',
            forceResult: r.forceResult || 'NONE',
            maxBetSize: r.maxBetSize || 1000,
            dailyProfitLimit: r.dailyProfitLimit || 0,
            payoutOverride: r.payoutOverride || 0,
            tradeDelayMs: r.tradeDelayMs || 0,
            joinedAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
            ipAddress: r.ipAddress || '',
            country: r.country || '',
            device: r.device || '',
            lastLogin: r.last_login ? new Date(r.last_login).getTime() : Date.now(),
            totalDeposited: r.totalDeposited || 0,
            totalWithdrawn: r.totalWithdrawn || 0,
            totalTurnover: r.totalTurnover || 0,
            netPnL: r.netPnL || 0,
            isBalanceFrozen: r.isBalanceFrozen || false,
            forcePasswordReset: r.forcePasswordReset || false,
            twoFactorEnabled: r.twoFactorEnabled || false,
            kycStatus: r.kyc_status || r.kycStatus || 'UNVERIFIED',
            kycDocs: r.kycDocs || {},
            riskScore: r.riskScore || 0,
            riskLabel: r.riskLabel || '',
            tags: r.tags || [],
            activityLogs: r.activityLogs || [],
            adminNotes: r.adminNotes || [],
            referralCode: r.referralCode || '',
          } as User));
          setUsers(mapped.concat([]));
        }
      } catch (e) {
        // ignore fetch errors
      }
    })();

    const channel = supabase.channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        const ev = payload.eventType; // INSERT, UPDATE, DELETE
        const newRow = payload.new as any;
        const oldRow = payload.old as any;
        if (ev === 'INSERT') {
          setUsers(prev => {
            const u = {
              id: newRow.id || newRow.email,
              name: newRow.name || newRow.full_name || newRow.email.split('@')[0],
              email: newRow.email || '',
            } as any;
            return [u, ...prev];
          });
        } else if (ev === 'UPDATE') {
          setUsers(prev => prev.map(p => (p.id === newRow.id || p.email === newRow.email) ? ({ ...p, ...(newRow as any) }) : p));
        } else if (ev === 'DELETE') {
          setUsers(prev => prev.filter(p => p.id !== oldRow.id && p.email !== oldRow.email));
        }
      })
      .subscribe();

    return () => {
      mounted = false;
      try { supabase.removeChannel(channel); } catch (e) {}
    };
  }, []);

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
        <ProtectedRoute fallback={<LandingPage onAuthSubmit={(mode, payload) => {
          if (mode === 'SIGNUP') return auth.signUp(payload as any);
          return auth.signIn(payload as any);
        }} /> }>
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
        </ProtectedRoute>
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
