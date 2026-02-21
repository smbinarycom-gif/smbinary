
import { Asset, AssetType } from './types.ts';

// Default assets that are always enabled initially
export const INITIAL_ASSETS: Asset[] = [
  { id: '1', name: 'Bitcoin', symbol: 'BTC/USDT', type: AssetType.CRYPTO, price: 68542.50, change24h: 2.4, payout: 82, isActive: true },
  { id: '2', name: 'Ethereum', symbol: 'ETH/USDT', type: AssetType.CRYPTO, price: 3452.12, change24h: -1.2, payout: 85, isActive: true },
  { id: '3', name: 'Solana', symbol: 'SOL/USDT', type: AssetType.CRYPTO, price: 145.22, change24h: 5.4, payout: 80, isActive: true },
  { id: '4', name: 'BNB', symbol: 'BNB/USDT', type: AssetType.CRYPTO, price: 580.45, change24h: 0.1, payout: 78, isActive: true },
];

// Top 100 Binance USDT Symbols
export const TOP_100_SYMBOLS = [
  "BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE", "SHIB", "AVAX", "DOT", 
  "LINK", "TRX", "MATIC", "BCH", "NEAR", "LTC", "ICP", "UNI", "PEPE", "APT", 
  "STX", "FIL", "ETC", "RENDER", "HBAR", "ATOM", "WIF", "AR", "MKR", "OP", 
  "GRT", "INJ", "THETA", "LDO", "SUI", "FET", "TIA", "VET", "FTM", "RUNE", 
  "FLOKI", "BONK", "SEI", "ALGO", "GALA", "AAVE", "FLOW", "EGLD", "JUP", "SAND", 
  "MANA", "QNT", "BEAM", "AXS", "STRK", "KAS", "PYTH", "DYDX", "ORDI", "KAVA", 
  "CRV", "IMX", "MINA", "RON", "CHZ", "PENDLE", "JASMY", "XLM", "EOS", "BTT", 
  "WOO", "LRC", "CFX", "APE", "EGLD", "SNX", "HOT", "ZIL", "ONE", "ANKR", 
  "IOTA", "RVN", "KSM", "ZEC", "BAT", "WAVES", "QTUM", "DASH", "XMR", "NEO",
  "VTHO", "SLP", "SKL", "GNS", "ID", "ARKM", "MNT", "ZETA", "OMNI", "TAO"
].map(s => `${s}/USDT`);

export const COLORS = {
  up: '#0ecb81', // Binance Green
  down: '#f6465d', // Binance Red
  bg: '#050505',
  sidebar: '#0c0c0e',
  accent: '#8b5cf6', 
  textMain: '#ffffff',
  textSecondary: '#666666'
};
