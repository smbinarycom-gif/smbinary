
import React, { useState, useEffect, useRef } from 'react';
import { Asset, AdminThemeSettings } from '../../shared/types';
import { AssetIcon } from './AssetIcon.tsx';

interface TradePanelProps {
  asset: Asset;
  onTrade: (type: 'CALL' | 'PUT', amount: number, durationInSeconds: number) => void;
  balance: number;
  shortcuts?: number[]; 
  minInvestment?: number;
  maxInvestment?: number;
  activeDurations: number[];
  isMobile?: boolean; // Trigger for Mobile Layout
  selectedTimeFrame: string; // Passed from parent (Chart Timeframe)
  isOTC?: boolean; // New prop for labeling
    theme?: AdminThemeSettings;
}

const TradePanel: React.FC<TradePanelProps> = ({ 
    asset,
    onTrade,
    balance,
    shortcuts = [10, 50, 100, 500],
    minInvestment = 1,
    maxInvestment = 1000,
    activeDurations,
    isMobile = false,
    selectedTimeFrame,
    isOTC = false,
    theme,
}) => {
    const isLight = theme?.mode === 'LIGHT';
    const cardBg = theme?.surfaceBackground || (isLight ? '#ffffff' : '#1e222d');
    const subtleBg = theme?.backgroundColor || (isLight ? '#f3f4f6' : '#161a1e');
    const borderColor = isLight ? 'rgba(148,163,184,0.4)' : '#2a3040';
    const textPrimary = theme?.textColor || (isLight ? '#020617' : '#ffffff');
    const textMuted = isLight ? '#6b7280' : '#7d8699';
  const [amount, setAmount] = useState(minInvestment);
  const [durationInSeconds, setDurationInSeconds] = useState(60);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const timeSelectorRef = useRef<HTMLDivElement>(null);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeSelectorRef.current && !timeSelectorRef.current.contains(event.target as Node)) {
        setShowTimeSelector(false);
      }
    };
    if (showTimeSelector) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTimeSelector]);

  // Ensure default duration is set based on timeframe initially
  useEffect(() => {
     // Default to the timeframe length when it changes
     const ms = parseTimeFrameToMs(selectedTimeFrame);
     setDurationInSeconds(ms / 1000);
  }, [selectedTimeFrame]);

  const isOutOfRange = amount < minInvestment || amount > maxInvestment;
  const payoutAmount = (amount * (asset.payout / 100) + amount).toFixed(2);

    // Button height: smaller on desktop/tablet, bigger on mobile
    const tradeButtonHeightClass = isMobile ? 'h-14' : 'h-11';

  // Helper: Format Seconds into MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    if (seconds < 3600) return `${minutes}:${secs}`;
    return `${hours}:${minutes}:${secs}`;
  };

  const adjustAmount = (delta: number) => {
      setAmount(prev => Math.max(minInvestment, Math.min(maxInvestment, prev + delta)));
  };

  // --- UTC TIME LOGIC SYNCED WITH TIMEFRAME ---

  const parseTimeFrameToMs = (tf: string): number => {
      const value = parseInt(tf);
      if (tf.includes('s')) return value * 1000;
      if (tf.includes('m')) return value * 60 * 1000;
      if (tf.includes('h')) return value * 60 * 60 * 1000;
      if (tf.includes('d')) return value * 24 * 60 * 60 * 1000;
      return 60000; // fallback 1m
  };

  // Generate next 9 available slots based on selected timeframe
  const getUTCTimeSlots = () => {
    const now = new Date();
    const intervalMs = parseTimeFrameToMs(selectedTimeFrame);
    const slots = [];
    
    // Calculate the next aligned slot based on the interval
    // Formula: Round UP to the next multiple of intervalMs
    // Example: Interval 5m (300000ms). Now: 10:02. Next aligned: 10:05.
    // We add a small buffer (e.g. 5 seconds) to ensure we don't list a slot that expires in 1 second.
    let nextSlotTime = Math.ceil((now.getTime() + 5000) / intervalMs) * intervalMs;

    for (let i = 0; i < 9; i++) {
        const timestamp = nextSlotTime + (i * intervalMs);
        const date = new Date(timestamp);
        
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const seconds = date.getUTCSeconds().toString().padStart(2, '0');
        
        // Calculate duration from NOW until this slot
        const diffInSeconds = Math.floor((timestamp - now.getTime()) / 1000);
        
        // Label formatting: Show seconds only if interval is small (< 1 hour)
        let label = `${hours}:${minutes}`;
        if (intervalMs < 3600000) { // Less than 1 hour
            // If interval is < 1 minute (e.g. 30s), show seconds
            if (intervalMs < 60000) {
                 label = `${hours}:${minutes}:${seconds}`;
            }
        } else {
             label = `${hours}:${minutes}`;
        }
        
        slots.push({
            label: label,
            value: diffInSeconds,
            timestamp: timestamp
        });
    }
    return slots;
  };

  // Calculate the display time (Expiration Time in UTC) based on current duration
  const getCurrentExpirationTime = () => {
      const now = Date.now();
      const expiry = new Date(now + durationInSeconds * 1000);
      const hours = expiry.getUTCHours().toString().padStart(2, '0');
      const minutes = expiry.getUTCMinutes().toString().padStart(2, '0');
      
      const intervalMs = parseTimeFrameToMs(selectedTimeFrame);
      if (intervalMs < 60000) {
           const seconds = expiry.getUTCSeconds().toString().padStart(2, '0');
           return `${hours}:${minutes}:${seconds}`;
      }
      return `${hours}:${minutes}`;
  };

  const handleTimeSelect = (seconds: number) => {
      setDurationInSeconds(seconds);
      setShowTimeSelector(false);
  };

  const timeSlots = getUTCTimeSlots();

  // ==========================
  // MOBILE LAYOUT
  // ==========================
  if (isMobile) {
      return (
          <div className="flex flex-col select-none">
              {/* Top Row: Time & Investment Inputs */}
              <div className="flex space-x-2 mb-3 relative z-30">
                  
                  {/* Time Input Box (Clickable) */}
                  <div className="flex-1 relative" ref={timeSelectorRef}>
                      <button 
                        onClick={() => setShowTimeSelector(!showTimeSelector)}
                                                className="w-full border rounded-lg h-11 relative flex items-center justify-center transition-colors bg-transparent"
                                                style={{
                                                    borderColor: showTimeSelector ? (isLight ? '#3b82f6' : '#3b82f6') : borderColor,
                                                    backgroundColor: showTimeSelector ? (isLight ? '#e5e7eb' : '#2a3040') : 'transparent',
                                                }}
                      >
                                                    <span
                                                        className="absolute -top-2 left-3 px-1 text-[10px]"
                                                        style={{ backgroundColor: cardBg, color: textMuted }}
                                                    >
                                                        Time (UTC)
                                                    </span>
                                                    <span
                                                        className="font-bold text-sm tracking-wide"
                                                        style={{ color: textPrimary }}
                                                    >
                                                        {getCurrentExpirationTime()}
                                                    </span>
                      </button>

                      {/* Time Selector Popup Grid */}
                                            {showTimeSelector && (
                                                    <div
                                                        className="absolute bottom-full left-0 w-[280px] mb-2 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 border"
                                                        style={{ backgroundColor: cardBg, borderColor }}
                                                    >
                              <div className="grid grid-cols-3 gap-2">
                                  {timeSlots.map((slot, idx) => (
                                      <button
                                          key={idx}
                                          onClick={() => handleTimeSelect(slot.value)}
                                                                                    className="py-3 rounded-lg text-sm font-bold font-mono transition-colors"
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            Math.abs(durationInSeconds - slot.value) < 30
                                                                                                ? isLight ? '#0f172a' : '#ffffff'
                                                                                                : isLight ? '#e5e7eb' : '#2a3040',
                                                                                        color:
                                                                                            Math.abs(durationInSeconds - slot.value) < 30
                                                                                                ? isLight ? '#f9fafb' : '#1e222d'
                                                                                                : isLight ? '#111827' : '#ccddbb',
                                                                                    }}
                                      >
                                          {slot.label}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Investment Input Box */}
                                    <div
                                        className="flex-1 border rounded-lg h-11 relative flex items-center justify-between px-1 bg-transparent"
                                        style={{ borderColor, backgroundColor: isLight ? '#f9fafb' : 'transparent' }}
                                    >
                                            <span
                                                className="absolute -top-2 left-3 px-1 text-[10px]"
                                                style={{ backgroundColor: cardBg, color: textMuted }}
                                            >
                                                Investment
                                            </span>
                      
                      {/* Minus Button (Step: 1) */}
                      <button 
                        onClick={() => adjustAmount(-1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                        style={{ backgroundColor: isLight ? '#e5e7eb' : '#2a3040', color: textMuted }}
                      >
                         <i className="fa-solid fa-minus text-[10px]"></i>
                      </button>
                      
                      {/* Value */}
                                            <div className="font-bold text-sm" style={{ color: textPrimary }}>
                                                {amount} $
                                            </div>
                      
                      {/* Plus Button (Step: 1) */}
                      <button 
                        onClick={() => adjustAmount(1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                        style={{ backgroundColor: isLight ? '#e5e7eb' : '#2a3040', color: textMuted }}
                      >
                         <i className="fa-solid fa-plus text-[10px]"></i>
                      </button>
                  </div>
              </div>

              {/* Payout Text */}
              <div className="text-center mb-2">
                                     <span className="text-xs font-medium mr-2" style={{ color: textMuted }}>
                                         Payout:
                                     </span>
                                     <span className="text-sm font-bold" style={{ color: textPrimary }}>
                                         {payoutAmount} $
                                     </span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                  <button 
                    onClick={() => onTrade('CALL', amount, durationInSeconds)} 
                    className="flex-1 rounded-lg text-white h-11 font-bold text-lg active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                    style={{
                      background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                      boxShadow: '0 4px 12px rgb(255, 149, 0)',
                    }}
                  >
                    <i className="fa-solid fa-arrow-up text-sm"></i>
                    <span>BUY</span>
                  </button>
                  <button 
                    onClick={() => onTrade('PUT', amount, durationInSeconds)} 
                    className="flex-1 rounded-lg text-white h-11 font-bold text-lg active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                    style={{
                      background: 'linear-gradient(135deg,#f97373,#ef4444)',
                      boxShadow: '0 4px 12px rgba(248,113,113,0.35)',
                    }}
                  >
                    <i className="fa-solid fa-arrow-down text-sm"></i>
                    <span>SELL</span>
                  </button>
              </div>
          </div>
      );
  }

  // ==========================
  // DESKTOP QUOTEX LAYOUT
  // ==========================
  return (
    <div className="flex flex-col h-full select-none">
      <div className="flex-1 flex flex-col space-y-4 pt-2">
          {/* Asset Info */}
          <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                 <AssetIcon asset={asset} className="mr-0" />
                                 <span
                                     className="font-bold text-sm tracking-wide"
                                     style={{ color: textPrimary }}
                                 >
                                     {asset.symbol}
                                 </span>
                                 {isOTC && (
                                     <span className="text-xs" style={{ color: textMuted }}>
                                         (OTC)
                                     </span>
                                 )}
              </div>
                            <span
                                className="font-bold text-lg"
                                style={{ color: isLight ? '#0faf59' : '#ffffff' }}
                            >
                                {asset.payout}%
                            </span>
          </div>

          {/* Time Input Section (Desktop) */}
                    <div
                            className="bg-[#1e222d] rounded-lg space-y-1 relative"
                            ref={timeSelectorRef}
                    >
              <div className="flex items-center justify-between px-1">
                                     <label
                                         className="text-[11px] font-medium"
                                         style={{ color: textMuted }}
                                     >
                                         Time (UTC)
                                     </label>
              </div>
              
              <button 
                  onClick={() => setShowTimeSelector(!showTimeSelector)}
                                    className="rounded-[4px] h-[50px] w-full flex items-center justify-center px-2 border transition-colors group relative"
                                    style={{
                                        backgroundColor: isLight ? '#e5e7eb' : '#2a3040',
                                        borderColor: showTimeSelector ? '#3b82f6' : 'transparent',
                                    }}
              >
                                     <span
                                         className="text-xl font-bold tracking-wider font-binance"
                                         style={{ color: textPrimary }}
                                     >
                                         {getCurrentExpirationTime()}
                                     </span>
                                     <i
                                         className="fa-regular fa-clock absolute right-4 text-xs"
                                         style={{ color: textMuted }}
                                     ></i>
              </button>

              {/* Time Selector Popup Grid (Desktop) */}
              {showTimeSelector && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e222d] border border-[#2a3040] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="grid grid-cols-3 gap-2">
                          {timeSlots.map((slot, idx) => (
                              <button
                                  key={idx}
                                  onClick={() => handleTimeSelect(slot.value)}
                                  className={`py-3 rounded text-sm font-bold font-mono transition-colors ${
                                      Math.abs(durationInSeconds - slot.value) < 30 
                                      ? 'bg-white text-[#1e222d]' 
                                      : 'bg-[#2a3040] text-[#ccddbb] hover:bg-[#3b414d] hover:text-white'
                                  }`}
                              >
                                  {slot.label}
                              </button>
                          ))}
                      </div>
                  </div>
              )}
          </div>

          {/* Investment Input Section */}
				  <div className="bg-[#1e222d] rounded-lg space-y-1 mt-2">
              <div className="flex items-center justify-between px-1">
                   <label className="text-[#7d8699] text-[11px] font-medium">Investment</label>
              </div>
              <div className="bg-[#2a3040] rounded-[4px] h-[50px] flex items-center justify-between px-2 border border-transparent hover:border-[#3b82f6] transition-colors group">
                   {/* Minus Button (Step: 1) */}
                   <button 
                      onClick={() => adjustAmount(-1)}
                      className="w-8 h-8 rounded-full bg-[#1e222d] text-[#7d8699] hover:text-white flex items-center justify-center transition-colors shadow-sm"
                   >
                       <i className="fa-solid fa-minus text-[10px]"></i>
                   </button>
                   <div className="flex items-center">
                      <input 
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="bg-transparent text-center text-white text-lg font-bold w-20 focus:outline-none font-binance"
                      />
                      <span className="text-[#7d8699] text-base font-medium">$</span>
                   </div>
                   {/* Plus Button (Step: 1) */}
                   <button 
                      onClick={() => adjustAmount(1)}
                      className="w-8 h-8 rounded-full bg-[#1e222d] text-[#7d8699] hover:text-white flex items-center justify-center transition-colors shadow-sm"
                   >
                       <i className="fa-solid fa-plus text-[10px]"></i>
                   </button>
              </div>
          </div>

          {/* Trade Buttons Stack */}
          <div className="flex flex-col space-y-1 mt-4">
             {/* Buy Button */}
                 <button 
                     disabled={isOutOfRange}
                     onClick={() => onTrade('CALL', amount, durationInSeconds)}
                     className={`w-full bg-[#00b85e] hover:bg-[#00a352] text-white rounded-[4px] ${tradeButtonHeightClass} flex items-center justify-between px-4 shadow-[0_4px_10px_rgba(0,184,94,0.3)] active:scale-[0.99] transition-all relative overflow-hidden group ${isOutOfRange ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
                 <div className="flex flex-col items-start z-10">
                    <span className="text-lg font-bold uppercase tracking-wider">Buy</span>
                 </div>
                 <i className="fa-solid fa-arrow-up text-xl z-10"></i>
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </button>

             {/* Payout Info Text */}
             <div className="flex justify-center items-center py-0">
                 <p className="text-[#ccddbb] text-sm font-medium leading-tight">
                    Your payout: <span className="font-bold text-white text-base">{payoutAmount} $</span>
                 </p>
             </div>

             {/* Sell Button */}
                 <button 
                     disabled={isOutOfRange}
                     onClick={() => onTrade('PUT', amount, durationInSeconds)}
                     className={`w-full bg-[#ff3d3d] hover:bg-[#e63737] text-white rounded-[4px] ${tradeButtonHeightClass} flex items-center justify-between px-4 shadow-[0_4px_10px_rgba(255,61,61,0.3)] active:scale-[0.99] transition-all relative overflow-hidden group ${isOutOfRange ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
                 <div className="flex flex-col items-start z-10">
                    <span className="text-lg font-bold uppercase tracking-wider">Sell</span>
                 </div>
                 <i className="fa-solid fa-arrow-down text-xl z-10"></i>
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </button>
          </div>
      </div>
    </div>
  );
};

export default TradePanel;
