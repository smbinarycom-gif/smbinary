
import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType, CrosshairMode } from 'lightweight-charts';
import { CandleData } from '../types';

interface TradingChartProps {
  data: CandleData[];
  currentPrice: number;
  symbol: string;
  currentTimeFrame: string;
  activeTimeFrames: string[];
  onTimeFrameChange: (tf: string) => void;
}

const TradingChart: React.FC<TradingChartProps> = ({ 
  data, 
  currentPrice, 
  symbol, 
  currentTimeFrame, 
  activeTimeFrames, 
  onTimeFrameChange 
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: '#848e9c',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.05)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.05)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#707a8a',
          width: 1,
          style: 3,
          labelBackgroundColor: '#2b2f36',
        },
        horzLine: {
          color: '#707a8a',
          width: 1,
          style: 3,
          labelBackgroundColor: '#2b2f36',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.1)',
        scaleMargins: { top: 0.1, bottom: 0.1 },
        visible: true,
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    const candleSeries = (chart as any).addCandlestickSeries({
      upColor: '#0ecb81',
      downColor: '#f6465d',
      borderVisible: false,
      wickUpColor: '#0ecb81',
      wickDownColor: '#f6465d',
    });

    candleSeriesRef.current = candleSeries;
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (candleSeriesRef.current && data.length > 0) {
      const formatted = data.map(d => ({
        time: (new Date(d.time).getTime() / 1000) as any,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      })).sort((a, b) => a.time - b.time);

      const unique = Array.from(new Map(formatted.map(item => [item.time, item])).values());
      candleSeriesRef.current.setData(unique);
    }
  }, [data]);

  return (
    <div className="w-full h-full bg-[#000000] rounded-2xl overflow-hidden relative border border-white/5 shadow-2xl">
      <div ref={chartContainerRef} className="w-full h-full" />
      
      {/* Chart Timeframe Dropdown Button */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 select-none" ref={settingsRef}>
        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border backdrop-blur-md transition-all ${showSettings ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white' : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:bg-black/60'}`}
          >
            <span className="text-[10px] font-black uppercase tracking-[1px] leading-none">{currentTimeFrame}</span>
            <svg className={`w-3 h-3 transition-transform ${showSettings ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          {showSettings && (
            <div className="absolute top-full left-0 mt-2 w-32 bg-[#0c0c0e] border border-white/10 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in duration-150 overflow-hidden">
               <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {activeTimeFrames.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      onTimeFrameChange(tf);
                      setShowSettings(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${currentTimeFrame === tf ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <span>{tf}</span>
                    {currentTimeFrame === tf && (
                       <div className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]"></div>
                    )}
                  </button>
                ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingChart;
