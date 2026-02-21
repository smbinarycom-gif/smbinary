
export enum AssetType {
  CRYPTO = 'Crypto',
  FOREX = 'Forex',
  STOCKS = 'Stocks'
}

export interface PayoutSchedule {
  id: string;
  startHour: number; // 0-23
  endHour: number;   // 0-23
  payout: number;
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  type: AssetType;
  price: number;
  change24h: number;
  payout: number;
  isActive?: boolean;
  forceOTC?: boolean;
  iconUrl?: string;
  payoutSchedule?: PayoutSchedule[];
}

export interface Trade {
  id: string;
  assetId: string;
  assetSymbol: string;
  type: 'CALL' | 'PUT';
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  startTime: number; 
  expiryTime: number;
  status: 'OPEN' | 'WIN' | 'LOSS' | 'TIE';
  payoutAtTrade: number;
  userId?: string;
  accountType: 'DEMO' | 'LIVE';
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  method: 'BINANCE_PAY';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: number;
  proofUrl?: string;
  transactionId?: string;
  targetWallet?: string;
}

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AnalysisResult {
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  reasoning: string;
}

export interface AiAnalystSettings {
  isEnabled: boolean;
  status: 'ACTIVE' | 'MAINTENANCE';
  maintenanceMessage: string;
  minConfidence: number;
  targetDevices: ('MOBILE' | 'DESKTOP')[];
  targetUsers: string[];
  targetIps: string[];
  activeUntil: number | null;
}

export interface LeaderboardConfig {
  minTradeCount: number;
  minTradeVolume: number;
  rankingBasis: 'NET_PROFIT' | 'ROI' | 'TOTAL_VOLUME';
  excludedUserIds: string[];
  autoRefreshEnabled: boolean;
  refreshInterval: number; // in seconds
}

export interface MarketSettings {
  marketMode: 'REAL' | 'OTC';
  payoutMultiplier: number;
  marketTrend: 'RANDOM' | 'PUMP' | 'DUMP';
  otcLossPercentage: number;
  manipulationTarget: ('DEMO' | 'LIVE')[];
  forceLoss: boolean;
  isKillSwitchActive: boolean;
  maintenanceMode: boolean;
  globalAnnouncement: string;
  activeSymbols: string[];
  investmentShortcuts: number[];
  minInvestment: number;
  maxInvestment: number;
  activeTimeFrames: string[];
  activeTradeDurations: number[];
  aiAnalyst: AiAnalystSettings;
  adminBinancePayId: string;
  isLeaderboardEnabled: boolean;
  leaderboardConfig: LeaderboardConfig; // New integrated config
}

export interface AdminNote {
  id: string;
  content: string;
  date: number;
  author: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: number;
  ip: string;
  details: string;
  type: 'INFO' | 'WARNING' | 'DANGER';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  balance: number;
  bonusBalance: number; 
  status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';
  forceResult: 'NONE' | 'WIN' | 'LOSS';
  maxBetSize: number; 
  dailyProfitLimit: number; 
  payoutOverride: number; 
  tradeDelayMs: number; 
  joinedAt: number;
  ipAddress: string;
  country: string;
  device: string;
  lastLogin: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalTurnover: number; 
  netPnL: number; 
  isBalanceFrozen: boolean;
  forcePasswordReset: boolean;
  twoFactorEnabled: boolean; 
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_SUBMITTED';
  kycDocs?: { front: string; back: string; selfie: string }; 
  riskScore: number; 
  riskLabel: 'VIP' | 'HIGH_RISK' | 'REGULAR' | 'WHALE';
  tags: string[];
  activityLogs: ActivityLog[];
  adminNotes: AdminNote[];
  referralCode?: string;
  uplineId?: string;
}
