
import React from 'react';
import { Asset } from '../types';

interface AssetListProps {
  assets: Asset[];
  selectedId: string;
  onSelect: (asset: Asset) => void;
}

const AssetList: React.FC<AssetListProps> = ({ assets, selectedId, onSelect }) => {
  return (
    <div className="flex flex-col h-full bg-[#050505]">
      <div className="p-4 lg:p-6 border-b border-white/5 flex items-center justify-between bg-[#0a0a0c] sticky top-0 z-10">
        <h2 className="text-[9px] lg:text-[10px] font-black text-white/40 uppercase tracking-[3px]">Marketplace</h2>
        <span className="text-[8px] bg-white/10 text-white/60 px-2 py-0.5 rounded font-black border border-white/5">{assets.length} PAIRS</span>
      </div>
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {assets.length > 0 ? assets.map(asset => (
          <button
            key={asset.id}
            onClick={() => onSelect(asset)}
            className={`w-full flex items-center justify-between p-4 lg:p-5 border-b border-white/5 transition-all relative group active:bg-white/5 ${
              selectedId === asset.id 
                ? 'bg-[#8b5cf6]/5 after:content-[""] after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-[#8b5cf6]' 
                : 'hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex flex-col items-start">
              <span className={`text-base lg:text-sm font-black tracking-tight ${selectedId === asset.id ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                {asset.symbol}
              </span>
              <span className="text-[8px] text-white/20 font-black uppercase tracking-widest mt-0.5">{asset.type}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-base lg:text-sm font-black text-[#0ecb81] tabular-nums">
                {asset.payout}%
              </span>
              <span className="text-[8px] text-white/20 font-black uppercase tracking-[1px]">Profit</span>
            </div>
          </button>
        )) : (
          <div className="p-20 text-center opacity-20 italic text-xs uppercase font-black tracking-[4px]">
            Searching Market...
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetList;
