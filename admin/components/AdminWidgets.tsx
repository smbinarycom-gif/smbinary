
import React from 'react';

// 1. House Win Rate Meter
export const HouseWinMeter = ({ winRate }: { winRate: number }) => {
    const color = winRate > 60 ? '#0ecb81' : winRate > 45 ? '#fcd535' : '#f6465d';
    const rotation = (winRate / 100) * 180 - 90;
    return (
        <div className="relative w-full h-40 flex flex-col items-center justify-end overflow-hidden">
            <div className="absolute top-4 w-48 h-24 rounded-t-full border-[16px] border-[#2b3139] border-b-0"></div>
            <div className="absolute top-4 w-48 h-24 rounded-t-full overflow-hidden">
                 <div className="w-full h-full bg-[#2b3139]"></div>
            </div>
            <div 
                className="absolute top-4 w-48 h-24 rounded-t-full border-[16px] border-transparent border-b-0 origin-bottom transition-all duration-1000 ease-out"
                style={{ borderTopColor: color, borderRightColor: 'transparent', borderLeftColor: 'transparent', transform: `rotate(${rotation}deg)` }}
            ></div>
            <div className="absolute bottom-0 text-center z-10">
                <span className="text-4xl font-black text-white tracking-tighter">{winRate.toFixed(1)}%</span>
                <p className="text-[10px] text-[#848e9c] uppercase font-bold tracking-widest mt-1">Win Rate</p>
            </div>
            <div className="absolute bottom-0 w-4 h-2 bg-[#2b3139] rounded-t-full z-20"></div>
        </div>
    );
};

// 2. Styled Line Chart for P&L
export const PnLChart = ({ data }: { data: number[] }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((val - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');
    const isPositive = data[data.length - 1] >= 0;
    const strokeColor = isPositive ? '#0ecb81' : '#f6465d';
    return (
        <div className="w-full h-full flex items-end relative px-2 pt-4 pb-2">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polygon points={`0,100 ${points} 100,100`} fill="url(#chartGradient)" />
                <polyline points={points} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                {data.map((val, i) => {
                    const x = (i / (data.length - 1)) * 100;
                    const y = 100 - ((val - min) / range) * 100;
                    return <circle key={i} cx={x} cy={y} r="3" fill="#1e2329" stroke={strokeColor} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                })}
            </svg>
        </div>
    );
};

// 3. Cybernetic World Map
export const WorldMapWidget = () => (
    <div className="relative w-full h-full bg-[#161a1e] rounded-xl overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#474d57 1px, transparent 1px), linear-gradient(90deg, #474d57 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <i className="fa-solid fa-earth-americas text-[180px] text-[#2b3139] opacity-50 relative z-0"></i>
        <div className="absolute top-1/3 left-1/3 z-10 group cursor-pointer">
            <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0ecb81] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0ecb81]"></span>
            </span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black px-2 py-1 rounded text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">USA: 45 Users</div>
        </div>
        <div className="absolute top-1/2 right-1/4 z-10 group cursor-pointer">
             <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fcd535] opacity-75 [animation-delay:0.3s]"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#fcd535]"></span>
            </span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black px-2 py-1 rounded text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Europe: 82 Users</div>
        </div>
        <div className="absolute bottom-1/3 right-1/3 z-10 group cursor-pointer">
             <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3b82f6] opacity-75 [animation-delay:0.7s]"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#3b82f6]"></span>
            </span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black px-2 py-1 rounded text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Asia: 15 Users</div>
        </div>
        <div className="absolute bottom-4 left-4 flex items-center space-x-4 bg-[#1e2329]/90 backdrop-blur px-4 py-2 rounded-full border border-[#2b3139]">
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#0ecb81]"></div>
                <span className="text-[10px] text-[#848e9c] font-bold">Active</span>
            </div>
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#fcd535]"></div>
                <span className="text-[10px] text-[#848e9c] font-bold">New</span>
            </div>
        </div>
    </div>
);
