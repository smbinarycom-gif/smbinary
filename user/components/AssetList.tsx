
import React, { useState, useMemo } from 'react';
import { Asset, AssetType, AdminThemeSettings } from '../../shared/types.ts';
import { AssetIcon } from './AssetIcon.tsx';

interface AssetListProps {
  assets: Asset[];
  selectedId: string;
  onSelect: (asset: Asset) => void;
  onClose?: () => void;
  isGlobalOTC: boolean; // New prop to determine global OTC state
}
const AssetList: React.FC<AssetListProps & { theme?: AdminThemeSettings }> = ({ assets, selectedId, onSelect, onClose, isGlobalOTC, theme }) => {
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

  const isLight = theme?.mode === 'LIGHT';
  // In dark mode we deliberately force #1e222d for the Markets panel shell
  // and header so the full column (including empty space at bottom) uses
  // exactly this color, independent from the global user shell background.
  const shellBg = isLight
    ? (theme?.backgroundColor || '#f8fafc')
    : '#1e222d';
  const headerBg = isLight
    ? (theme?.headerBackground || '#ffffff')
    : '#1e222d';
  const borderColor = isLight ? 'rgba(148,163,184,0.4)' : '#2a3040';
  const inputBg = isLight ? '#f9fafb' : '#131722';
  const inputBorder = borderColor;
  const textPrimary = theme?.textColor || (isLight ? '#020617' : '#ffffff');
  const textMuted = isLight ? '#6b7280' : '#7d8699';

  return (
    <div
      className="flex flex-col h-full border-r"
      style={{ backgroundColor: shellBg, borderColor }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ backgroundColor: headerBg, borderColor }}
      >
          <h2 className="text-lg font-bold" style={{ color: textPrimary }}>
            Markets
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="hover:text-white transition-colors"
              style={{ color: textMuted }}
            >
                <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          )}
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b" style={{ borderColor }}>
        <div className="relative">
            <i
              className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: textMuted }}
            ></i>
            <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..." 
                className="w-full rounded h-9 pl-9 pr-3 text-xs focus:outline-none"
                style={{
                  backgroundColor: inputBg,
                  borderColor: inputBorder,
                  color: textPrimary,
                } as any}
            />
        </div>
      </div>
      
      {/* Category Tabs */}
      <div className="flex items-center px-4 border-b space-x-4" style={{ borderColor }}>
          {categories.map((cat, i) => (
              <button 
                key={i} 
                onClick={() => setActiveCategory(cat)}
                className={`py-3 text-[10px] font-bold uppercase border-b-2 transition-colors ${
                  activeCategory === cat ? '' : 'border-transparent'
                }`}
                style={{
                  color:
                    activeCategory === cat
                      ? isLight
                        ? '#0faf59'
                        : '#0faf59'
                      : textMuted,
                  borderColor:
                    activeCategory === cat
                      ? isLight
                        ? '#0faf59'
                        : '#0faf59'
                      : 'transparent',
                }}
              >
                  {cat}
              </button>
          ))}
      </div>

      {/* Asset List Scroll Area */}
    		  <div className="overflow-y-auto flex-1 custom-scrollbar pb-1" style={{ backgroundColor: shellBg }}>
        {filteredAssets.length > 0 ? (
            filteredAssets.map(asset => {
              // Determine if this specific asset should show OTC label
              // Show OTC if Global Mode is OTC OR Asset has forced OTC flag
              const isOTC = isGlobalOTC || asset.forceOTC;

              return (
                <button 
                    key={asset.id} 
                    onClick={() => onSelect(asset)} 
                    className={`w-full flex items-center justify-between p-3 border-b transition-colors group ${
                      selectedId === asset.id
                        ? isLight
                          ? 'bg-gray-200'
                          : 'bg-[#2a3040]'
                        : 'hover:bg-[#111827]'
                    }`}
                    style={{ borderColor }}
                >
                    <div className="flex items-center">
                    <AssetIcon asset={asset} className="mr-3" />
                    <div className="flex flex-col items-start">
                        <span
                          className="text-xs font-bold flex items-center"
                          style={{
                            color:
                              selectedId === asset.id
                                ? textPrimary
                                : isLight
                                ? '#111827'
                                : '#ccddbb',
                          }}
                        >
                            {asset.symbol}
                            {isOTC && (
                              <span className="text-[9px] font-normal ml-1" style={{ color: textMuted }}>
                                (OTC)
                              </span>
                            )}
                        </span>
                        <span className="text-[9px] font-medium" style={{ color: textMuted }}>
                          {asset.type}
                        </span>
                    </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className="text-xs font-bold"
                        style={{ color: isLight ? '#0faf59' : '#0faf59' }}
                      >
                        {asset.payout}%
                      </span>
                    </div>
                </button>
            )})
        ) : (
            <div className="flex flex-col items-center justify-center py-10" style={{ color: textMuted }}>
                <span className="text-xs">No assets found</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default AssetList;
