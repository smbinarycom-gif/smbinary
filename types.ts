export enum AssetType {
  CRYPTO = 'Crypto',
  FOREX = 'Forex',
  STOCKS = 'Stocks'
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
}

export interface Trade {
  id: string;
  assetId: string;
  assetSymbol: string;
  type: 'CALL' | 'PUT';
  amount: number;
  entryPrice: number;
  startTime: number; 
  expiryTime: number;
  status: 'OPEN' | 'WIN' | 'LOSS';
  payoutAtTrade: number;
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

export interface MarketSettings {
  payoutMultiplier: number;
  marketTrend: 'RANDOM' | 'PUMP' | 'DUMP';
  forceLoss: boolean;
  activeSymbols: string[];
  investmentShortcuts: number[];
  minInvestment: number;
  maxInvestment: number;
  activeTimeFrames: string[];
  activeTradeDurations: number[]; // Added dynamic durations in seconds
}
