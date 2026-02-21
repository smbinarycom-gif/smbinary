
import React from 'react';
import { Asset, AssetType } from '../../shared/types';

interface AssetIconProps {
  asset: Partial<Asset>;
  className?: string;
}

// Helper to map Currency Codes to Country Codes for FlagCDN
const getCountryCode = (currency: string): string => {
    const map: Record<string, string> = {
        'USD': 'us', 'EUR': 'eu', 'GBP': 'gb', 'JPY': 'jp',
        'AUD': 'au', 'CAD': 'ca', 'CHF': 'ch', 'CNY': 'cn',
        'NZD': 'nz', 'INR': 'in', 'BRL': 'br', 'RUB': 'ru',
        'ZAR': 'za', 'TRY': 'tr', 'KRW': 'kr', 'SGD': 'sg',
        'HKD': 'hk', 'MXN': 'mx', 'IDR': 'id', 'MYR': 'my',
        'PHP': 'ph', 'THB': 'th', 'VND': 'vn', 'NGN': 'ng'
    };
    return map[currency.toUpperCase()] || currency.substring(0, 2).toLowerCase();
};

export const AssetIcon: React.FC<AssetIconProps> = ({ asset, className = "" }) => {
  let type = asset.type;
  
  // Auto-detect type if missing
  if (!type && asset.symbol) {
      if (asset.symbol.includes('USDT') || asset.symbol.includes('BTC') || asset.symbol.includes('ETH')) type = AssetType.CRYPTO;
      else if (asset.symbol.includes('/')) type = AssetType.FOREX;
      else type = AssetType.STOCKS;
  }

  // 1. Custom Admin Icon (Highest Priority)
  if (asset.iconUrl) {
    return (
      <img 
        src={asset.iconUrl} 
        className={`w-6 h-6 rounded-full object-cover bg-white ${className}`} 
        alt={asset.symbol || 'asset'}
      />
    );
  }

  // 2. Crypto Pair Dual Icon
  if (type === AssetType.CRYPTO && asset.symbol?.includes('/')) {
    const [base, quote] = asset.symbol.split('/');
    return (
      <div className={`relative w-9 h-6 ${className} flex-shrink-0`}>
        <img 
            src={`https://assets.coincap.io/assets/icons/${base.toLowerCase()}@2x.png`} 
            className="w-6 h-6 absolute top-0 left-0 z-10 rounded-full bg-white ring-2 ring-[#1e222d]"
            onError={(e) => (e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg')} 
            alt={base}
        />
        <img 
            src={`https://assets.coincap.io/assets/icons/${quote.toLowerCase()}@2x.png`} 
            className="w-6 h-6 absolute top-0 right-0 z-0 rounded-full bg-white opacity-80"
            onError={(e) => (e.currentTarget.src = 'https://cryptologos.cc/logos/tether-usdt-logo.png')} 
            alt={quote}
        />
      </div>
    );
  }

  // 3. Forex Pair Dual Icon (Fixed sizing to match Crypto)
  if (type === AssetType.FOREX && asset.symbol?.includes('/')) {
    const [base, quote] = asset.symbol.split('/');
    const baseFlag = getCountryCode(base);
    const quoteFlag = getCountryCode(quote);

    return (
      <div className={`relative w-9 h-6 ${className} flex-shrink-0`}>
        {/* Base Currency Flag (Front) */}
        <img 
            src={`https://flagcdn.com/w40/${baseFlag}.png`} 
            className="w-6 h-6 absolute top-0 left-0 z-10 rounded-full object-cover bg-[#1e222d] ring-2 ring-[#1e222d]"
            alt={base}
        />
        {/* Quote Currency Flag (Back) */}
        <img 
            src={`https://flagcdn.com/w40/${quoteFlag}.png`} 
            className="w-6 h-6 absolute top-0 right-0 z-0 rounded-full object-cover opacity-80 bg-[#1e222d]"
            alt={quote}
        />
      </div>
    );
  }

  // 4. Stocks (Brand Logos)
  if (type === AssetType.STOCKS) {
     const name = asset.name || asset.symbol || 'Stock';
     return (
        <div className={`w-6 h-6 rounded-full bg-white p-0.5 overflow-hidden flex items-center justify-center flex-shrink-0 ${className}`}>
            <img 
                src={`https://logo.clearbit.com/${name.split(' ')[0].toLowerCase()}.com`} 
                className="w-full h-full object-contain"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
                alt={asset.symbol}
            />
            {/* Fallback Initials */}
            <div className="hidden w-full h-full bg-[#2a3040] flex items-center justify-center text-[8px] font-bold text-white rounded-full">
                {asset.symbol?.substring(0, 2)}
            </div>
        </div>
     );
  }

  // 5. Default Fallback
  return (
    <img 
        src={`https://flagcdn.com/24x18/${asset.symbol?.includes('USD') ? 'us' : asset.symbol?.includes('EUR') ? 'eu' : 'gb'}.png`} 
        className={`w-5 h-3.5 rounded-[2px] opacity-80 flex-shrink-0 ${className}`} 
        alt="flag"
    />
  );
};
