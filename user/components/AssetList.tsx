
import React, { useState, useMemo } from 'react';
import { Asset, AssetType } from '../../shared/types.ts';
import { AssetIcon } from './AssetIcon.tsx';

interface AssetListProps {
  assets: Asset[];
  selectedId: string;
  onSelect: (asset: Asset) => void;
  onClose?: () => void;
  isGlobalOTC: boolean; // New prop to determine global OTC state
}

const AssetList: React.FC<AssetListProps> = ({ assets, selectedId, onSelect, onClose, isGlobalOTC }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Crypto', 'Stocks', 'Currencies'];

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            asset.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesCategory = true;
      if (activeCategory === 'Crypto') matchesCategory = asset.type === AssetType.CRYPTO;
      if (activeCategory === 'Currencies') matchesCategory = asset.type === AssetType.FOREX;
      if (activeCategory === 'Stocks') matchesCategory = asset.type === AssetType.STOCKS;

      return matchesSearch && matchesCategory;
    });
  }, [assets, searchQuery, activeCategory]);

  return (
    <div className="flex flex-col h-full bg-[#1e222d] border-r border-[#2a3040]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2a3040]">
          <h2 className="text-lg font-bold text-white">Markets</h2>
          {onClose && (
            <button onClick={onClose} className="text-[#848e9c] hover:text-white transition-colors">
                <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          )}
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-[#2a3040]">
        <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[#7d8699] text-xs"></i>
            <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..." 
                className="w-full bg-[#131722] border border-[#2a3040] rounded h-9 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-[#00b85e] placeholder-[#7d8699]"
            />
        </div>
      </div>
      
      {/* Category Tabs */}
      <div className="flex items-center px-4 border-b border-[#2a3040] space-x-4">
          {categories.map((cat, i) => (
              <button 
                key={i} 
                onClick={() => setActiveCategory(cat)}
                className={`py-3 text-[10px] font-bold uppercase border-b-2 transition-colors ${activeCategory === cat ? 'text-[#00b85e] border-[#00b85e]' : 'text-[#7d8699] border-transparent hover:text-white'}`}
              >
                  {cat}
              </button>
          ))}
      </div>

      {/* Asset List with Extra Bottom Padding for Mobile Nav */}
      <div className="overflow-y-auto flex-1 custom-scrollbar pb-16">
        {filteredAssets.length > 0 ? (
            filteredAssets.map(asset => {
              // Determine if this specific asset should show OTC label
              // Show OTC if Global Mode is OTC OR Asset has forced OTC flag
              const isOTC = isGlobalOTC || asset.forceOTC;

              return (
                <button 
                    key={asset.id} 
                    onClick={() => onSelect(asset)} 
                    className={`w-full flex items-center justify-between p-3 border-b border-[#2a3040] transition-colors hover:bg-[#2a3040] group ${selectedId === asset.id ? 'bg-[#2a3040]' : ''}`}
                >
                    <div className="flex items-center">
                    <AssetIcon asset={asset} className="mr-3" />
                    <div className="flex flex-col items-start">
                        <span className={`text-xs font-bold flex items-center ${selectedId === asset.id ? 'text-white' : 'text-[#ccddbb] group-hover:text-white'}`}>
                            {asset.symbol}
                            {isOTC && <span className="text-[#7d8699] text-[9px] font-normal ml-1">(OTC)</span>}
                        </span>
                        <span className="text-[9px] text-[#7d8699] font-medium">{asset.type}</span>
                    </div>
                    </div>
                    <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-[#00b85e]">{asset.payout}%</span>
                    </div>
                </button>
            )})
        ) : (
            <div className="flex flex-col items-center justify-center py-10 text-[#7d8699]">
                <span className="text-xs">No assets found</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default AssetList;
