
import { Asset, AssetType } from './types.ts';

export const INITIAL_ASSETS: Asset[] = [
  // --- Crypto Assets (Top Majors) ---
  { id: '1', name: 'Bitcoin', symbol: 'BTC/USDT', type: AssetType.CRYPTO, price: 68542.50, change24h: 2.4, payout: 82, isActive: true },
  { id: '2', name: 'Ethereum', symbol: 'ETH/USDT', type: AssetType.CRYPTO, price: 3452.12, change24h: -1.2, payout: 85, isActive: true },
  { id: '3', name: 'Solana', symbol: 'SOL/USDT', type: AssetType.CRYPTO, price: 145.22, change24h: 5.4, payout: 80, isActive: true },
  { id: '4', name: 'BNB', symbol: 'BNB/USDT', type: AssetType.CRYPTO, price: 580.45, change24h: 0.1, payout: 78, isActive: true },
  
  // --- Stocks (Tech Giants) ---
  { id: '5', name: 'Apple Inc.', symbol: 'AAPL', type: AssetType.STOCKS, price: 172.50, change24h: 0.5, payout: 90, isActive: true },
  { id: '6', name: 'Tesla', symbol: 'TSLA', type: AssetType.STOCKS, price: 175.30, change24h: -1.5, payout: 92, isActive: true },
  { id: '7', name: 'Google', symbol: 'GOOGL', type: AssetType.STOCKS, price: 150.20, change24h: 1.1, payout: 88, isActive: true },
  { id: '8', name: 'Amazon', symbol: 'AMZN', type: AssetType.STOCKS, price: 180.10, change24h: 0.8, payout: 89, isActive: true },
  { id: '9', name: 'Microsoft', symbol: 'MSFT', type: AssetType.STOCKS, price: 420.45, change24h: 0.2, payout: 87, isActive: true },
  { id: '10', name: 'Nvidia', symbol: 'NVDA', type: AssetType.STOCKS, price: 950.00, change24h: 3.5, payout: 85, isActive: true },

  // --- Forex: Major Pairs ---
  { id: '11', name: 'Euro / US Dollar', symbol: 'EUR/USD', type: AssetType.FOREX, price: 1.0845, change24h: 0.12, payout: 85, isActive: true },
  { id: '12', name: 'British Pound / US Dollar', symbol: 'GBP/USD', type: AssetType.FOREX, price: 1.2630, change24h: -0.05, payout: 85, isActive: true },
  { id: '13', name: 'US Dollar / Japanese Yen', symbol: 'USD/JPY', type: AssetType.FOREX, price: 151.20, change24h: 0.4, payout: 84, isActive: true },
  { id: '14', name: 'US Dollar / Swiss Franc', symbol: 'USD/CHF', type: AssetType.FOREX, price: 0.9025, change24h: 0.1, payout: 82, isActive: true },
  { id: '15', name: 'Australian Dollar / US Dollar', symbol: 'AUD/USD', type: AssetType.FOREX, price: 0.6540, change24h: -0.2, payout: 83, isActive: true },
  { id: '16', name: 'US Dollar / Canadian Dollar', symbol: 'USD/CAD', type: AssetType.FOREX, price: 1.3580, change24h: 0.15, payout: 80, isActive: true },
  { id: '67', name: 'New Zealand Dollar / US Dollar', symbol: 'NZD/USD', type: AssetType.FOREX, price: 0.6010, change24h: 0.05, payout: 80, isActive: true },

  // --- Forex: Minor Crosses (EUR & GBP) ---
  { id: '68', name: 'Euro / British Pound', symbol: 'EUR/GBP', type: AssetType.FOREX, price: 0.8550, change24h: -0.1, payout: 82, isActive: true },
  { id: '69', name: 'Euro / Japanese Yen', symbol: 'EUR/JPY', type: AssetType.FOREX, price: 163.50, change24h: 0.3, payout: 85, isActive: true },
  { id: '70', name: 'British Pound / Japanese Yen', symbol: 'GBP/JPY', type: AssetType.FOREX, price: 191.20, change24h: 0.5, payout: 85, isActive: true },
  { id: '71', name: 'Euro / Australian Dollar', symbol: 'EUR/AUD', type: AssetType.FOREX, price: 1.6540, change24h: 0.2, payout: 80, isActive: true },
  { id: '72', name: 'Euro / Canadian Dollar', symbol: 'EUR/CAD', type: AssetType.FOREX, price: 1.4720, change24h: -0.15, payout: 80, isActive: true },
  { id: '73', name: 'Euro / Swiss Franc', symbol: 'EUR/CHF', type: AssetType.FOREX, price: 0.9750, change24h: 0.05, payout: 78, isActive: true },
  { id: '74', name: 'British Pound / Australian Dollar', symbol: 'GBP/AUD', type: AssetType.FOREX, price: 1.9320, change24h: 0.4, payout: 82, isActive: true },
  { id: '75', name: 'British Pound / Canadian Dollar', symbol: 'GBP/CAD', type: AssetType.FOREX, price: 1.7150, change24h: 0.1, payout: 81, isActive: true },
  { id: '76', name: 'British Pound / Swiss Franc', symbol: 'GBP/CHF', type: AssetType.FOREX, price: 1.1250, change24h: -0.2, payout: 79, isActive: true },

  // --- Forex: JPY & AUD Crosses ---
  { id: '77', name: 'Australian Dollar / Japanese Yen', symbol: 'AUD/JPY', type: AssetType.FOREX, price: 98.50, change24h: 0.6, payout: 83, isActive: true },
  { id: '78', name: 'Canadian Dollar / Japanese Yen', symbol: 'CAD/JPY', type: AssetType.FOREX, price: 110.80, change24h: 0.2, payout: 82, isActive: true },
  { id: '79', name: 'Swiss Franc / Japanese Yen', symbol: 'CHF/JPY', type: AssetType.FOREX, price: 170.20, change24h: 0.15, payout: 80, isActive: true },
  { id: '80', name: 'New Zealand Dollar / Japanese Yen', symbol: 'NZD/JPY', type: AssetType.FOREX, price: 90.50, change24h: 0.4, payout: 80, isActive: true },
  { id: '81', name: 'Australian Dollar / Canadian Dollar', symbol: 'AUD/CAD', type: AssetType.FOREX, price: 0.8950, change24h: -0.1, payout: 78, isActive: true },
  { id: '82', name: 'Australian Dollar / New Zealand Dollar', symbol: 'AUD/NZD', type: AssetType.FOREX, price: 1.0920, change24h: 0.05, payout: 75, isActive: true },
  { id: '83', name: 'Australian Dollar / Swiss Franc', symbol: 'AUD/CHF', type: AssetType.FOREX, price: 0.5840, change24h: -0.3, payout: 76, isActive: true },
  { id: '84', name: 'Canadian Dollar / Swiss Franc', symbol: 'CAD/CHF', type: AssetType.FOREX, price: 0.6520, change24h: 0.1, payout: 76, isActive: true },

  // --- Forex: Exotic & Emerging ---
  { id: '85', name: 'US Dollar / Singapore Dollar', symbol: 'USD/SGD', type: AssetType.FOREX, price: 1.3550, change24h: 0.02, payout: 75, isActive: true },
  { id: '86', name: 'US Dollar / Hong Kong Dollar', symbol: 'USD/HKD', type: AssetType.FOREX, price: 7.8250, change24h: 0.01, payout: 70, isActive: true },
  { id: '87', name: 'US Dollar / Mexican Peso', symbol: 'USD/MXN', type: AssetType.FOREX, price: 16.5020, change24h: -0.5, payout: 85, isActive: true },
  { id: '88', name: 'US Dollar / South African Rand', symbol: 'USD/ZAR', type: AssetType.FOREX, price: 18.8050, change24h: 0.8, payout: 82, isActive: true },
  { id: '89', name: 'US Dollar / Turkish Lira', symbol: 'USD/TRY', type: AssetType.FOREX, price: 32.2050, change24h: 1.2, payout: 80, isActive: true },
  { id: '90', name: 'US Dollar / Chinese Yuan (Offshore)', symbol: 'USD/CNH', type: AssetType.FOREX, price: 7.2540, change24h: 0.1, payout: 78, isActive: true },
  { id: '91', name: 'US Dollar / Brazilian Real', symbol: 'USD/BRL', type: AssetType.FOREX, price: 5.0520, change24h: 0.6, payout: 80, isActive: true },
  { id: '92', name: 'US Dollar / Indian Rupee', symbol: 'USD/INR', type: AssetType.FOREX, price: 83.4050, change24h: 0.05, payout: 70, isActive: true },
  { id: '93', name: 'US Dollar / South Korean Won', symbol: 'USD/KRW', type: AssetType.FOREX, price: 1350.50, change24h: 0.3, payout: 75, isActive: true },

  // --- Additional Crypto Assets ---
  { id: '17', name: 'XRP', symbol: 'XRP/USDT', type: AssetType.CRYPTO, price: 0.62, change24h: 1.5, payout: 80, isActive: true },
  { id: '18', name: 'Cardano', symbol: 'ADA/USDT', type: AssetType.CRYPTO, price: 0.45, change24h: -0.8, payout: 80, isActive: true },
  { id: '19', name: 'Dogecoin', symbol: 'DOGE/USDT', type: AssetType.CRYPTO, price: 0.16, change24h: 4.2, payout: 75, isActive: true },
  { id: '20', name: 'Shiba Inu', symbol: 'SHIB/USDT', type: AssetType.CRYPTO, price: 0.000027, change24h: 2.1, payout: 70, isActive: true },
  { id: '21', name: 'Avalanche', symbol: 'AVAX/USDT', type: AssetType.CRYPTO, price: 47.50, change24h: 3.5, payout: 82, isActive: true },
  { id: '22', name: 'Polkadot', symbol: 'DOT/USDT', type: AssetType.CRYPTO, price: 8.50, change24h: -1.1, payout: 80, isActive: true },
  { id: '23', name: 'Chainlink', symbol: 'LINK/USDT', type: AssetType.CRYPTO, price: 18.20, change24h: 0.5, payout: 81, isActive: true },
  { id: '24', name: 'Tron', symbol: 'TRX/USDT', type: AssetType.CRYPTO, price: 0.12, change24h: 0.2, payout: 78, isActive: true },
  { id: '25', name: 'Polygon', symbol: 'MATIC/USDT', type: AssetType.CRYPTO, price: 0.92, change24h: -0.5, payout: 80, isActive: true },
  { id: '26', name: 'Bitcoin Cash', symbol: 'BCH/USDT', type: AssetType.CRYPTO, price: 480.00, change24h: 1.8, payout: 80, isActive: true },
  { id: '27', name: 'NEAR Protocol', symbol: 'NEAR/USDT', type: AssetType.CRYPTO, price: 6.80, change24h: 5.1, payout: 83, isActive: true },
  { id: '28', name: 'Litecoin', symbol: 'LTC/USDT', type: AssetType.CRYPTO, price: 85.00, change24h: 0.3, payout: 79, isActive: true },
  { id: '29', name: 'Internet Computer', symbol: 'ICP/USDT', type: AssetType.CRYPTO, price: 16.50, change24h: -2.0, payout: 80, isActive: true },
  { id: '30', name: 'Uniswap', symbol: 'UNI/USDT', type: AssetType.CRYPTO, price: 11.20, change24h: 1.2, payout: 82, isActive: true },
  { id: '31', name: 'Pepe', symbol: 'PEPE/USDT', type: AssetType.CRYPTO, price: 0.0000075, change24h: 8.5, payout: 70, isActive: true },
  { id: '32', name: 'Aptos', symbol: 'APT/USDT', type: AssetType.CRYPTO, price: 14.50, change24h: 2.8, payout: 81, isActive: true },
  { id: '33', name: 'Stacks', symbol: 'STX/USDT', type: AssetType.CRYPTO, price: 3.10, change24h: 4.0, payout: 80, isActive: true },
  { id: '34', name: 'Filecoin', symbol: 'FIL/USDT', type: AssetType.CRYPTO, price: 8.90, change24h: -0.9, payout: 78, isActive: true },
  { id: '35', name: 'Ethereum Classic', symbol: 'ETC/USDT', type: AssetType.CRYPTO, price: 30.50, change24h: 0.6, payout: 77, isActive: true },
  { id: '36', name: 'Render', symbol: 'RENDER/USDT', type: AssetType.CRYPTO, price: 10.20, change24h: 6.2, payout: 84, isActive: true },
  { id: '37', name: 'Hedera', symbol: 'HBAR/USDT', type: AssetType.CRYPTO, price: 0.11, change24h: 1.5, payout: 76, isActive: true },
  { id: '38', name: 'Cosmos', symbol: 'ATOM/USDT', type: AssetType.CRYPTO, price: 11.50, change24h: -0.4, payout: 80, isActive: true },
  { id: '39', name: 'dogwifhat', symbol: 'WIF/USDT', type: AssetType.CRYPTO, price: 3.50, change24h: 12.5, payout: 72, isActive: true },
  { id: '40', name: 'Arweave', symbol: 'AR/USDT', type: AssetType.CRYPTO, price: 38.00, change24h: 3.2, payout: 81, isActive: true },
  { id: '41', name: 'Maker', symbol: 'MKR/USDT', type: AssetType.CRYPTO, price: 3200.00, change24h: 0.8, payout: 80, isActive: true },
  { id: '42', name: 'Optimism', symbol: 'OP/USDT', type: AssetType.CRYPTO, price: 3.40, change24h: 1.9, payout: 82, isActive: true },
  { id: '43', name: 'The Graph', symbol: 'GRT/USDT', type: AssetType.CRYPTO, price: 0.35, change24h: -1.5, payout: 79, isActive: true },
  { id: '44', name: 'Injective', symbol: 'INJ/USDT', type: AssetType.CRYPTO, price: 35.00, change24h: 2.5, payout: 83, isActive: true },
  { id: '45', name: 'Theta Network', symbol: 'THETA/USDT', type: AssetType.CRYPTO, price: 2.80, change24h: 0.1, payout: 78, isActive: true },
  { id: '46', name: 'Lido DAO', symbol: 'LDO/USDT', type: AssetType.CRYPTO, price: 2.60, change24h: -0.7, payout: 80, isActive: true },
  { id: '47', name: 'Sui', symbol: 'SUI/USDT', type: AssetType.CRYPTO, price: 1.80, change24h: 4.5, payout: 81, isActive: true },
  { id: '48', name: 'Fetch.ai', symbol: 'FET/USDT', type: AssetType.CRYPTO, price: 2.50, change24h: 7.1, payout: 82, isActive: true },
  { id: '49', name: 'Celestia', symbol: 'TIA/USDT', type: AssetType.CRYPTO, price: 13.00, change24h: -2.3, payout: 80, isActive: true },
  { id: '50', name: 'VeChain', symbol: 'VET/USDT', type: AssetType.CRYPTO, price: 0.045, change24h: 0.9, payout: 75, isActive: true },
  { id: '51', name: 'Fantom', symbol: 'FTM/USDT', type: AssetType.CRYPTO, price: 0.95, change24h: 3.8, payout: 81, isActive: true },
  { id: '52', name: 'THORChain', symbol: 'RUNE/USDT', type: AssetType.CRYPTO, price: 8.20, change24h: 1.4, payout: 80, isActive: true },
  { id: '53', name: 'Floki', symbol: 'FLOKI/USDT', type: AssetType.CRYPTO, price: 0.00022, change24h: 5.5, payout: 70, isActive: true },
  { id: '54', name: 'Bonk', symbol: 'BONK/USDT', type: AssetType.CRYPTO, price: 0.000025, change24h: 4.8, payout: 70, isActive: true },
  { id: '55', name: 'Sei', symbol: 'SEI/USDT', type: AssetType.CRYPTO, price: 0.75, change24h: 2.2, payout: 80, isActive: true },
  { id: '56', name: 'Algorand', symbol: 'ALGO/USDT', type: AssetType.CRYPTO, price: 0.25, change24h: -0.6, payout: 78, isActive: true },
  { id: '57', name: 'Gala', symbol: 'GALA/USDT', type: AssetType.CRYPTO, price: 0.06, change24h: 1.1, payout: 76, isActive: true },
  { id: '58', name: 'Aave', symbol: 'AAVE/USDT', type: AssetType.CRYPTO, price: 120.00, change24h: 0.5, payout: 80, isActive: true },
  { id: '59', name: 'Flow', symbol: 'FLOW/USDT', type: AssetType.CRYPTO, price: 1.20, change24h: -1.0, payout: 79, isActive: true },
  { id: '60', name: 'MultiversX', symbol: 'EGLD/USDT', type: AssetType.CRYPTO, price: 55.00, change24h: 0.8, payout: 80, isActive: true },
  { id: '61', name: 'Jupiter', symbol: 'JUP/USDT', type: AssetType.CRYPTO, price: 1.30, change24h: 6.5, payout: 82, isActive: true },
  { id: '62', name: 'The Sandbox', symbol: 'SAND/USDT', type: AssetType.CRYPTO, price: 0.65, change24h: 0.3, payout: 77, isActive: true },
  { id: '63', name: 'Decentraland', symbol: 'MANA/USDT', type: AssetType.CRYPTO, price: 0.60, change24h: 0.2, payout: 77, isActive: true },
  { id: '64', name: 'Quant', symbol: 'QNT/USDT', type: AssetType.CRYPTO, price: 115.00, change24h: -0.5, payout: 80, isActive: true },
  { id: '65', name: 'Beam', symbol: 'BEAM/USDT', type: AssetType.CRYPTO, price: 0.035, change24h: 2.9, payout: 75, isActive: true },
  { id: '66', name: 'Axie Infinity', symbol: 'AXS/USDT', type: AssetType.CRYPTO, price: 10.50, change24h: 1.0, payout: 78, isActive: true },
];

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
  up: '#0ecb81',
  down: '#f6465d',
  bg: '#f8fafc',
  sidebar: '#ffffff',
  accent: '#8b5cf6', 
  textMain: '#1e293b',
  textSecondary: '#64748b'
};
