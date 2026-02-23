
import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { User, AdminThemeSettings } from '../../shared/types.ts';

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

// 2. Styled Bar Chart for P&L (green/red bars per session)
export const PnLChart = ({ data }: { data: number[] }) => {
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-[11px] text-[#6b7280] italic">
                No P&L data yet
            </div>
        );
    }

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const barCount = data.length;
    const gridColor = '#e5e7eb';

    const zeroRatio = (0 - min) / range;
    const hasZeroInRange = zeroRatio >= 0 && zeroRatio <= 1;
    const zeroY = hasZeroInRange ? 100 - zeroRatio * 100 : 100;

    // Normalize values into chart coordinates (0-100 vertically)
    const normalized = data.map((val) => {
        const valueRatio = (val - min) / range; // 0..1
        const valueY = 100 - valueRatio * 100;
        return { value: val, y: valueY };
    });

    const barWidth = 0.6; // in viewBox units
    const xGap = 0.4; // gap between bars

    return (
        <div className="w-full h-full flex items-end relative px-2 pt-3 pb-2">
            <svg
                viewBox={`0 0 ${barCount} 100`}
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
            >
                {/* Subtle horizontal grid */}
                {[25, 50, 75].map((y) => (
                    <line
                        key={y}
                        x1={0}
                        y1={y}
                        x2={barCount}
                        y2={y}
                        stroke={gridColor}
                        strokeWidth={0.3}
                        strokeDasharray="3 3"
                    />
                ))}

                {/* Zero baseline if within range */}
                {hasZeroInRange && (
                    <line
                        x1={0}
                        y1={zeroY}
                        x2={barCount}
                        y2={zeroY}
                        stroke="#d1d5db"
                        strokeWidth={0.6}
                        strokeDasharray="4 2"
                    />
                )}

                {/* Bars */}
                {normalized.map(({ value, y }, index) => {
                    const x = index + xGap / 2;
                    const isGain = value >= 0;
                    const color = isGain ? '#16a34a' : '#dc2626';

                    let barY: number;
                    let barHeight: number;

                    if (hasZeroInRange) {
                        if (isGain) {
                            barY = y;
                            barHeight = zeroY - y;
                        } else {
                            barY = zeroY;
                            barHeight = y - zeroY;
                        }
                    } else {
                        // All values on one side of zero; anchor to bottom
                        barY = y;
                        barHeight = 100 - y;
                    }

                    // Avoid zero-height bars for tiny moves
                    const safeHeight = Math.max(barHeight, 1);

                    return (
                        <rect
                            key={index}
                            x={x}
                            y={barY}
                            width={barWidth}
                            height={safeHeight}
                            rx={0.3}
                            fill={color}
                            opacity={0.9}
                        />
                    );
                })}
            </svg>
        </div>
    );
};

// 3. Live Traffic World Map (light-mode aware, data-driven)
interface CountryAggregate {
    country: string;
    count: number;
    users: User[];
}

interface WorldMapWidgetProps {
    users: User[];
    theme?: AdminThemeSettings;
}

export const WorldMapWidget: React.FC<WorldMapWidgetProps> = ({ users, theme }) => {
    const isLight = theme?.mode === 'LIGHT';

    const countryStats = useMemo<CountryAggregate[]>(() => {
        const map = new Map<string, CountryAggregate>();
        users.forEach((user) => {
            const country = (user.country && user.country.trim()) || 'Unknown';
            const existing = map.get(country);
            if (existing) {
                existing.count += 1;
                existing.users.push(user);
            } else {
                map.set(country, {
                    country,
                    count: 1,
                    users: [user],
                });
            }
        });

        return Array.from(map.values()).sort((a, b) => b.count - a.count);
    }, [users]);

    const topCountries = countryStats.slice(0, 3);

    const [popupCountry, setPopupCountry] = useState<CountryAggregate | null>(null);

    const handleMarkerClick = (country: CountryAggregate) => {
        setPopupCountry(country);
    };

    const closePopup = () => {
        setPopupCountry(null);
    };

    const formatOnlineDuration = (lastLogin?: number) => {
        if (!lastLogin) return 'Unknown';
        const diffMs = Date.now() - lastLogin;
        if (diffMs <= 0) return 'Just now';
        const totalMinutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${Math.max(minutes, 1)}m`;
    };

    const popupSampleUser = popupCountry?.users[0];

    // Approximate lat/lng for common countries
    const countryCoordinates: Record<string, [number, number]> = {
        Bangladesh: [23.685, 90.3563],
        India: [20.5937, 78.9629],
        Pakistan: [30.3753, 69.3451],
        Nepal: [28.3949, 84.124],
        USA: [37.0902, -95.7129],
        Canada: [56.1304, -106.3468],
        Brazil: [-14.235, -51.9253],
        UK: [55.3781, -3.436],
        Germany: [51.1657, 10.4515],
        France: [46.2276, 2.2137],
        Italy: [41.8719, 12.5674],
        Spain: [40.4637, -3.7492],
        Australia: [-25.2744, 133.7751],
        Japan: [36.2048, 138.2529],
        China: [35.8617, 104.1954],
        Russia: [61.524, 105.3188],
        Singapore: [1.3521, 103.8198],
        Malaysia: [4.2105, 101.9758],
        Indonesia: [-0.7893, 113.9213],
        Nigeria: [9.082, 8.6753],
        Egypt: [26.8206, 30.8025],
        Turkey: [38.9637, 35.2433],
    };

    const tileUrl = isLight
        ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    return (
        <div className="relative w-full h-full flex flex-col md:flex-row">
            {/* Map area */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                <div className="relative z-0 w-full h-full rounded-[32px] overflow-hidden shadow-sm">
                    <MapContainer
                        center={[20, 0]}
                        zoom={2}
                        scrollWheelZoom
                        className="w-full h-full"
                        attributionControl={false}
                    >
                        <TileLayer url={tileUrl} />
                        {topCountries.map((country, index) => {
                            const coords = countryCoordinates[country.country];
                            if (!coords) return null; // skip unknown countries on map, keep them in side list
                            const primary = index === 0;
                            const color = primary
                                ? '#16a34a'
                                : index === 1
                                ? '#f97316'
                                : '#3b82f6';

                            return (
                                <CircleMarker
                                    key={country.country}
                                    center={coords}
                                    radius={8}
                                    pathOptions={{
                                        color,
                                        weight: 2,
                                        fillColor: color,
                                        fillOpacity: 0.8,
                                    }}
                                    eventHandlers={{
                                        click: () => handleMarkerClick(country),
                                    }}
                                >
                                    <Tooltip direction="top" offset={[0, -4]} opacity={0.95}>
                                        <div className="text-[11px]">
                                            <div className="font-semibold">{country.country}</div>
                                            <div className="text-[10px] text-[#6b7280]">
                                                {country.count} users online
                                            </div>
                                        </div>
                                    </Tooltip>
                                </CircleMarker>
                            );
                        })}
                    </MapContainer>

                    {/* Legend & micro-analytics overlay */}
                    <div
                        className={`absolute bottom-4 left-4 flex items-center space-x-4 px-4 py-2 rounded-full text-[10px] font-bold ${
                            isLight
                                ? 'bg-white/90 text-[#111827] border border-[#e5e7eb] shadow'
                                : 'bg-[#111827]/95 text-[#e5e7eb] border border-[#2b3139] shadow'
                        }`}
                    >
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
                            <span>Top region</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
                            <span>Other regions</span>
                        </div>
                    </div>

                    <div
                        className={`absolute top-4 right-4 px-3 py-2 rounded-2xl text-[10px] font-semibold flex flex-col items-end space-y-1 ${
                            isLight
                                ? 'bg-white/95 text-[#111827] border border-[#e5e7eb] shadow'
                                : 'bg-[#050816]/95 text-white border border-[#2b3139] shadow'
                        }`}
                    >
                        <span className="uppercase tracking-widest text-[9px] text-[#6b7280]">
                            Live Users
                        </span>
                        <span className="text-base font-mono">
                            {users.length.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Delayed hover popup with rich user info */}
                {popupCountry && popupSampleUser && (
                    <div
                        className={`absolute top-6 right-6 max-w-xs rounded-2xl shadow-xl p-4 text-[11px] ${
                            isLight
                                ? 'bg-white border border-[#e5e7eb] text-[#111827]'
                                : 'bg-[#111827] border border-[#2b3139] text-white'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6b7280]">
                                    Live Session Snapshot
                                </p>
                                <p className="text-xs font-bold mt-0.5">{popupCountry.country}</p>
                            </div>
                            <button
                                type="button"
                                onClick={closePopup}
                                className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                                    isLight
                                        ? 'bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]'
                                        : 'bg-[#1f2933] text-[#9ca3af] hover:bg-[#374151]'
                                }`}
                            >
                                Close
                            </button>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between">
                                <span className="text-[#6b7280]">Name</span>
                                <span className="font-medium">{popupSampleUser.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#6b7280]">IP</span>
                                <span className="font-mono text-[10px]">
                                    {popupSampleUser.ipAddress || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#6b7280]">Gender</span>
                                <span className="font-medium">
                                    {popupSampleUser.gender ? popupSampleUser.gender : 'Unknown'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#6b7280]">Online</span>
                                <span className="font-medium">
                                    {formatOnlineDuration(popupSampleUser.lastLogin)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#6b7280]">Live Balance</span>
                                <span className="font-mono font-semibold text-[#16a34a]">
                                    ${popupSampleUser.balance.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#6b7280]">Total Deposited</span>
                                <span className="font-mono font-semibold text-[#0ecb81]">
                                    ${popupSampleUser.totalDeposited.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#6b7280]">Total Withdrawn</span>
                                <span className="font-mono font-semibold text-[#f6465d]">
                                    ${popupSampleUser.totalWithdrawn.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Country list on the side */}
            <div
                className={`mt-4 md:mt-0 md:w-56 md:border-l flex-shrink-0 px-4 py-4 overflow-y-auto text-[11px] space-y-2 ${
                    isLight
                        ? 'border-[#e5e7eb] bg-white/60'
                        : 'border-[#2b3139] bg-[#0b1020]/60'
                }`}
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#6b7280]">
                        Countries
                    </span>
                    <span className="text-[10px] text-[#6b7280]">
                        {countryStats.length} regions
                    </span>
                </div>
                {countryStats.length === 0 && (
                    <p className="text-[#9ca3af] italic">No traffic data yet.</p>
                )}
                {countryStats.map((c) => (
                    <div
                        key={c.country}
                        className={`flex items-center justify-between py-1.5 border-b last:border-b-0 ${
                            isLight ? 'border-[#f3f4f6]' : 'border-[#111827]'
                        }`}
                    >
                        <span className="truncate max-w-[120px]">{c.country}</span>
                        <span className="font-mono text-[10px] text-[#4b5563]">
                            {c.count} users
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
