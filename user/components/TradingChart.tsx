
import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType, CrosshairMode, LineStyle, Coordinate, Time } from 'lightweight-charts';
import { CandleData, Trade } from '../../shared/types';

interface TradingChartProps {
  data: CandleData[];
  currentPrice: number;
  symbol: string;
  activeTrades: Trade[];
  currentTimeFrame: string;
  activeTimeFrames: string[];
  onTimeFrameChange: (tf: string) => void;
  onToggleTrades?: () => void;
}

const parseTimeFrameToSeconds = (tf: string): number => {
  const unit = tf.slice(-1);
  const value = parseInt(tf.slice(0, -1));
  if (unit === 's') return value;
  if (unit === 'm') return value * 60;
  if (unit === 'h') return value * 3600;
  if (unit === 'd') return value * 86400;
  return 60;
};

// Explicit list as requested
const AVAILABLE_TIMEFRAMES = [
    '5s', '10s', '15s', '30s',
    '1m', '2m', '3m', '5m',
    '10m', '15m', '30m',
    '1h', '4h', '1d'
];

const TradingChart: React.FC<TradingChartProps> = ({ 
  data, currentPrice, symbol, activeTrades, currentTimeFrame, activeTimeFrames, onTimeFrameChange, onToggleTrades 
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLineRef = useRef<any>(null); 
  
  const [showTimeframeSelector, setShowTimeframeSelector] = useState(false);
  const [countdown, setCountdown] = useState<string>('00:00');
  
  // State for rendering Overlay Elements
  const [tradeBadges, setTradeBadges] = useState<any[]>([]);
  const [tradeLines, setTradeLines] = useState<any[]>([]);
  const [countdownBadge, setCountdownBadge] = useState<{ x: number, y: number, time: string } | null>(null);
  
  const lastCandleRef = useRef<any>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Click outside listener for selector
    const handleClickOutside = (event: MouseEvent) => {
        if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
            setShowTimeframeSelector(false);
        }
    };
    if (showTimeframeSelector) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTimeframeSelector]);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#7d8699', fontSize: 11, fontFamily: 'Inter' },
      grid: { vertLines: { color: 'rgba(42, 48, 64, 0)' }, horzLines: { color: 'rgba(42, 48, 64, 0.05)' } },
      crosshair: { 
          mode: CrosshairMode.Normal,
          vertLine: { width: 1, color: '#ffffff', style: LineStyle.Dashed, labelBackgroundColor: '#2a3040' },
          horzLine: { width: 1, color: '#ffffff', style: LineStyle.Dashed, labelBackgroundColor: '#2a3040' }
      },
      rightPriceScale: { borderColor: 'rgba(42, 48, 64, 1)', visible: true },
      timeScale: { borderColor: 'rgba(42, 48, 64, 1)', timeVisible: true, secondsVisible: true },
      handleScroll: true,
      handleScale: true,
    });

    const candleSeries = (chart as any).addCandlestickSeries({ 
      upColor: '#00b85e', downColor: '#ff3d3d', borderVisible: false, wickUpColor: '#00b85e', wickDownColor: '#ff3d3d',
    });
    candleSeriesRef.current = candleSeries;
    chartRef.current = chart;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || entries[0].target !== chartContainerRef.current) return;
      const newRect = entries[0].contentRect;
      chart.applyOptions({ width: newRect.width, height: newRect.height });
    });
    
    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => { 
      resizeObserver.disconnect(); 
      chart.remove(); 
    };
  }, []);

  useEffect(() => {
    if (candleSeriesRef.current && data.length > 0) {
      const formatted = data.map(d => ({
        time: (new Date(d.time).getTime() / 1000) as Time,
        open: d.open, high: d.high, low: d.low, close: d.close,
      })).sort((a, b) => (a.time as number) - (b.time as number));
      
      const uniqueData = Array.from(new Map(formatted.map(item => [item.time, item])).values());
      candleSeriesRef.current.setData(uniqueData);
      
      lastCandleRef.current = uniqueData[uniqueData.length - 1];
    }
  }, [data]);

  useEffect(() => {
    const duration = parseTimeFrameToSeconds(currentTimeFrame);
    const updateCountdown = () => {
        const now = Math.floor(Date.now() / 1000);
        const elapsed = now % duration;
        const remaining = duration - elapsed;
        
        let display = '';
        if (duration >= 3600) {
             const h = Math.floor(remaining / 3600);
             const m = Math.floor((remaining % 3600) / 60);
             const s = remaining % 60;
             display = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        } else {
             const m = Math.floor(remaining / 60);
             const s = remaining % 60;
             display = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        setCountdown(display);
    };
    updateCountdown(); 
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [currentTimeFrame]);

  // Update Chart Candles & Countdown Line
  useEffect(() => {
    if (!candleSeriesRef.current || !chartRef.current) return;

    if (lastCandleRef.current) {
        const duration = parseTimeFrameToSeconds(currentTimeFrame);
        const now = Math.floor(Date.now() / 1000);
        const candleTime = (Math.floor(now / duration) * duration) as Time;

        let updatedCandle = { ...lastCandleRef.current };
        if (updatedCandle.time === candleTime) {
            updatedCandle.close = currentPrice;
            if (currentPrice > updatedCandle.high) updatedCandle.high = currentPrice;
            if (currentPrice < updatedCandle.low) updatedCandle.low = currentPrice;
        } else if ((candleTime as number) > (updatedCandle.time as number)) {
            updatedCandle = {
                time: candleTime,
                open: currentPrice, high: currentPrice, low: currentPrice, close: currentPrice
            };
        }
        candleSeriesRef.current.update(updatedCandle);
        lastCandleRef.current = updatedCandle;
    }

    if (!priceLineRef.current) {
        priceLineRef.current = candleSeriesRef.current.createPriceLine({
            price: currentPrice,
            color: '#ffffff',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: false, 
            title: '', 
        });
    } else {
        priceLineRef.current.applyOptions({ price: currentPrice });
    }

  }, [currentPrice, countdown, currentTimeFrame]);

    // Badge & Line Positioning Logic
    useEffect(() => {
        // Precompute candle times (in seconds) so we can snap trade times
        // to the nearest existing candle. This ensures buy/sell points sit
        // exactly over candles instead of drifting after them.
        const candleTimesSec = data
            .map(d => Math.floor(new Date(d.time).getTime() / 1000))
            .sort((a, b) => a - b);

        const snapToCandleTime = (ts: number): number | null => {
            if (!candleTimesSec.length) return null;
            // If before first candle, clamp to first
            if (ts <= candleTimesSec[0]) return candleTimesSec[0];
            // If after last candle, clamp to last
            if (ts >= candleTimesSec[candleTimesSec.length - 1]) {
                return candleTimesSec[candleTimesSec.length - 1];
            }
            // Binary search for rightmost candle time <= ts
            let lo = 0;
            let hi = candleTimesSec.length - 1;
            let best = candleTimesSec[0];
            while (lo <= hi) {
                const mid = (lo + hi) >> 1;
                const val = candleTimesSec[mid];
                if (val === ts) {
                    return val;
                }
                if (val < ts) {
                    best = val;
                    lo = mid + 1;
                } else {
                    hi = mid - 1;
                }
            }
            return best;
        };

        const candleMap = new Map<number, CandleData>();
        data.forEach(d => {
            const t = Math.floor(new Date(d.time).getTime() / 1000);
            candleMap.set(t, d);
        });

        const updateOverlay = () => {
        if (!chartRef.current || !candleSeriesRef.current || !lastCandleRef.current) return;
        
        const timeScale = chartRef.current.timeScale();
        const lastTime = lastCandleRef.current.time as number;
        const headX = timeScale.timeToCoordinate(lastTime as Time);
        
        if (headX === null) {
            setTradeBadges([]); 
            setTradeLines([]);
            setCountdownBadge(null);
            return;
        }

        // --- ROBUST COORDINATE SYSTEM ---
        let pxPerSec = 0;
        let refTime = 0;
        let refX = 0;

        const visibleRange = timeScale.getVisibleRange();
        if (visibleRange) {
            const t1 = visibleRange.from as number;
            const t2 = visibleRange.to as number;
            const x1 = timeScale.timeToCoordinate(t1 as Time);
            const x2 = timeScale.timeToCoordinate(t2 as Time);
            
            if (x1 !== null && x2 !== null && t2 > t1) {
                pxPerSec = (x2 - x1) / (t2 - t1);
                refTime = t1;
                refX = x1;
            }
        }

        const getX = (time: number): number | null => {
            const coord = timeScale.timeToCoordinate(time as Time);
            if (coord !== null) return coord;
            if (pxPerSec > 0) {
                const diff = time - refTime;
                return refX + (diff * pxPerSec);
            }
            return null;
        };

        const openTrades = activeTrades.filter(t => t.status === 'OPEN');
        
        let tempBadges: any[] = [];
        const finalLines: any[] = [];

        const tfSeconds = parseTimeFrameToSeconds(currentTimeFrame);

        openTrades.forEach(trade => {
            const y = candleSeriesRef.current!.priceToCoordinate(trade.entryPrice);
            if (y === null) return; 

            const rawEntryTime = Math.floor(trade.startTime / 1000);
            const rawExpiryTime = Math.floor(trade.expiryTime / 1000);

            // Align entry horizontally to centre of its timeframe candle
            const bucketEntryTime = Math.floor(rawEntryTime / tfSeconds) * tfSeconds;
            // Align close horizontally to its own timeframe bucket
            const bucketExitTime = Math.floor(rawExpiryTime / tfSeconds) * tfSeconds;

            const x1 = getX(bucketEntryTime);
            const x2 = getX(bucketExitTime);
            
            if (x1 === null || x2 === null) return;

            const color = trade.type === 'CALL' ? '#00b85e' : '#ff3d3d';

            // Compute close-point Y: top of the closing candle if available
            let closeY = y;
            const exitCandle = candleMap.get(bucketExitTime);
            if (exitCandle) {
                const cy = candleSeriesRef.current!.priceToCoordinate(exitCandle.high);
                if (cy !== null) closeY = cy;
            }

            // 1. MAIN TRADE LINE: horizontal at entry price
            finalLines.push({
                id: trade.id,
                x1: x1,
                y1: y,
                x2: x2, 
                y2: y,
                exitY: closeY,
                color: color,
                isMain: true
            });

            // 2. BADGE DATA PREP
            const now = Date.now();
            const timeLeftMs = Math.max(0, trade.expiryTime - now);
            const totalSeconds = Math.ceil(timeLeftMs / 1000);
            const m = Math.floor(totalSeconds / 60);
            const s = totalSeconds % 60;
            const timeString = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

            tempBadges.push({
                id: trade.id,
                realX: x1, // Actual entry X
                y: y, // Actual Price Y
                // Original behavior: badge aligned with entry price line
                displayY: y,
                type: trade.type,
                amount: trade.amount,
                time: timeString,
                color: color
            });
        });

        // --- HORIZONTAL STACKING (LEFTWARDS) ---
        // We want badges to flow to the LEFT if they overlap in Y (Price).
        tempBadges.sort((a, b) => a.id.localeCompare(b.id));

        const processedBadges: any[] = [];
        const BADGE_WIDTH = 85; 
        const BADGE_HEIGHT_THRESHOLD = 25; 

        for (let i = 0; i < tempBadges.length; i++) {
            let badge = tempBadges[i];
            
            // Original: start slightly left of entry so badge sits
            // to the left of the dot/line.
            let proposedX = badge.realX - 45; 
            let proposedY = badge.displayY;

            let collision = true;
            let attempts = 0;

            while (collision && attempts < 20) {
                collision = false;
                for (const existing of processedBadges) {
                    if (Math.abs(existing.displayY - proposedY) < BADGE_HEIGHT_THRESHOLD) {
                        if (Math.abs(existing.renderX - proposedX) < BADGE_WIDTH) {
                            proposedX = existing.renderX - BADGE_WIDTH;
                            collision = true;
                        }
                    }
                }
                attempts++;
            }
            
            badge.renderX = proposedX;
            processedBadges.push(badge);
        }

        processedBadges.forEach(badge => {
            finalLines.push({
                id: `${badge.id}-connector`,
                x1: badge.renderX, 
                y1: badge.displayY, 
                x2: badge.realX, 
                y2: badge.y, 
                color: badge.color, 
                isMain: false,
                isConnector: true
            });
        });
        
        setTradeBadges(processedBadges);
        setTradeLines(finalLines);

        // --- Countdown Badge Position ---
        const currentPriceY = candleSeriesRef.current!.priceToCoordinate(currentPrice);
        if (currentPriceY !== null) {
            setCountdownBadge({
                x: headX + 50,
                y: currentPriceY,
                time: countdown
            });
        }
    };

    const interval = setInterval(updateOverlay, 16); // 60fps
    
    if (chartRef.current) {
        chartRef.current.timeScale().subscribeVisibleLogicalRangeChange(updateOverlay);
    }

    return () => {
        clearInterval(interval);
        if (chartRef.current) {
             chartRef.current.timeScale().unsubscribeVisibleLogicalRangeChange(updateOverlay);
        }
    };
    }, [activeTrades, currentPrice, countdown, data]);

  return (
    <div className="w-full h-full relative group bg-[#161a1e]">
      <div ref={chartContainerRef} className="w-full h-full" />
      
      {/* SVG Layer for Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
        {tradeLines.map((line) => (
            <g key={line.id}>
                {line.isMain ? (
                    <>
                        <line 
                            x1={line.x1} y1={line.y1} 
                            x2={line.x2} y2={line.y1} 
                            stroke={line.color} strokeWidth="2" strokeOpacity="1"
                        />
                        {/* Entry point at entry price */}
                        <circle cx={line.x1} cy={line.y1} r="3.5" fill="#ffffff" stroke={line.color} strokeWidth="2" />
                        {/* Close point at top of closing candle (if exitY provided) */}
                        <circle cx={line.x2} cy={line.exitY ?? line.y2} r="3.5" fill={line.color} stroke="#ffffff" strokeWidth="2" />
                        <circle cx={line.x2} cy={line.exitY ?? line.y2} r="8" fill="none" stroke={line.color} strokeWidth="1" opacity="0.5">
                            <animate attributeName="r" from="4" to="12" dur="1.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                    </>
                ) : (
                    <line 
                        x1={line.x1} y1={line.y1} 
                        x2={line.x2} y2={line.y2} 
                        stroke={line.color} strokeWidth="1" strokeDasharray="3,3" opacity="0.8" 
                    />
                )}
            </g>
        ))}
      </svg>

      {/* Overlay Layer for Badges */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {tradeBadges.map((badge: any) => (
            <div 
                key={badge.id}
                className="absolute flex items-center px-1.5 py-1 rounded shadow-md transition-transform duration-75 ease-out will-change-transform"
                style={{ 
                    left: badge.renderX, 
                    top: badge.displayY, 
                    // Original: anchor on the right so badge extends
                    // leftwards from the entry line.
                    transform: 'translate(-100%, -50%)', 
                    zIndex: 30,
                    backgroundColor: badge.color,
                    whiteSpace: 'nowrap'
                }}
            >
                <i className={`fa-solid ${badge.type === 'CALL' ? 'fa-arrow-up' : 'fa-arrow-down'} text-white text-[9px] mr-1.5`}></i>
                <span className="text-white font-bold text-[10px] mr-1.5 font-mono">${badge.amount}</span>
                <div className="h-3 w-[1px] bg-white/30 mr-1.5"></div>
                <span className="text-white font-mono font-bold text-[10px] tracking-wide w-[28px] text-center">{badge.time}</span>
            </div>
        ))}

        {/* Countdown Timer Badge */}
        {countdownBadge && (
            <div 
                className="absolute px-1.5 py-0.5 bg-[#1e222d] border border-[#2a3040] rounded flex items-center justify-center shadow-lg z-30"
                style={{
                    left: countdownBadge.x,
                    top: countdownBadge.y,
                    transform: 'translate(0, -50%)'
                }}
            >
                <span className="text-white font-bold font-mono text-[10px] tracking-tight">{countdownBadge.time}</span>
            </div>
        )}
      </div>

      {/* Chart Toolbar - Positioned lower and further left for Tablet/Desktop as requested */}
      <div 
        className="absolute bottom-[35px] left-1 md:bottom-[28px] md:left-2 z-20 flex flex-col space-y-1 select-none transition-all duration-300" 
        ref={selectorRef}
      >
        <div className="flex flex-col space-y-1 bg-[#1b1e28]/95 backdrop-blur-sm p-0.5 rounded-sm border border-white/5 shadow-lg">
            {onToggleTrades ? (
              <button 
                onClick={onToggleTrades} 
                className="w-9 h-9 flex items-center justify-center text-[#848e9c] hover:text-white hover:bg-white/5 rounded-sm transition-all relative group active:scale-90" 
                title="Trade History"
              >
                 <i className="fa-solid fa-list-ul text-sm"></i>
                 {activeTrades.filter(t => t.status === 'OPEN').length > 0 && (
                   <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-[#00b85e] rounded-full border border-[#1e222d] flex items-center justify-center text-[7px] font-black text-white">
                      {activeTrades.filter(t => t.status === 'OPEN').length}
                   </span>
                 )}
              </button>
            ) : (
              <button className="w-9 h-9 flex items-center justify-center text-[#848e9c] hover:text-white hover:bg-white/5 rounded-sm transition-all active:scale-90" title="Chart Type">
                  <i className="fa-solid fa-chart-simple text-sm"></i>
              </button>
            )}
            
            <button 
                onClick={() => setShowTimeframeSelector(!showTimeframeSelector)}
                className={`w-9 h-9 flex items-center justify-center font-black text-[10px] rounded-sm cursor-pointer transition-all active:scale-90 ${
                    showTimeframeSelector 
                    ? 'bg-white text-[#1e222d]' 
                    : 'bg-[#00b85e] text-white'
                }`}
            >
                {currentTimeFrame}
            </button>

            <button className="w-9 h-9 flex items-center justify-center text-[#848e9c] hover:text-white hover:bg-white/5 rounded-sm transition-all active:scale-90" title="Indicators">
                <i className="fa-solid fa-compass text-sm"></i>
            </button>
            <button className="w-9 h-9 flex items-center justify-center text-[#848e9c] hover:text-white hover:bg-white/5 rounded-sm transition-all active:scale-90" title="Drawings">
                <i className="fa-solid fa-pencil text-sm"></i>
            </button>
        </div>

        {/* Timeframe Selector Popup */}
        {showTimeframeSelector && (
            <div className="absolute bottom-0 left-11 z-20 animate-in fade-in slide-in-from-left-1 zoom-in-95 duration-150">
                <div className="bg-[#1b1e28] border border-white/5 rounded-sm p-1.5 shadow-2xl w-56 backdrop-blur-2xl">
                    <div className="text-[9px] font-black text-[#848e9c] uppercase tracking-[0.05em] mb-2 px-1 flex items-center justify-between">
                       <span>Interval</span>
                       <i className="fa-solid fa-clock text-[8px]"></i>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                        {AVAILABLE_TIMEFRAMES.map(tf => (
                            <button 
                                key={tf}
                                onClick={() => {
                                    onTimeFrameChange(tf);
                                    setShowTimeframeSelector(false);
                                }}
                                className={`text-[10px] py-1.5 rounded-sm transition-all font-black border active:scale-95 ${
                                    currentTimeFrame === tf 
                                    ? 'bg-[#00b85e] text-white border-[#00b85e]' 
                                    : 'bg-white/5 text-[#ccddbb] border-transparent hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default TradingChart;
