
import React, { useState, useMemo, useEffect, type CSSProperties } from 'react';
import { useSiteConfig } from '../shared/siteConfig';
import { MarketSettings, Trade, User, Asset, PaymentRequest } from '../shared/types.ts';

// Import Components
import UserDetailView from './components/UserDetailView.tsx';
import DashboardTab from './tabs/DashboardTab.tsx';
import UsersTab from './tabs/UsersTab.tsx';
import TradingTab from './tabs/TradingTab.tsx';
import AssetsTab from './tabs/AssetsTab.tsx';
import AiTab from './tabs/AiTab.tsx';
import LeaderboardTab from './tabs/LeaderboardTab.tsx';
import SystemSettingsTab from './tabs/SystemSettingsTab.tsx';
import LiveChatTab from './tabs/LiveChatTab.tsx';
import DeviceViewControlTab from './tabs/DeviceViewControlTab.tsx';
import NotificationCenter from './components/NotificationCenter.tsx';
import UserManagementMenu from './components/UserManagementMenu.tsx';
import DepositsMenu from './components/DepositsMenu.tsx';
import WithdrawalsMenu from './components/WithdrawalsMenu';
import AffiliateMenu from './components/AffiliateMenu.tsx';
import NotificationComposer from './components/NotificationComposer';
import RealtimeTransactions from './components/RealtimeTransactions';
import AllDeposits from './tabs/deposits/AllDeposits.tsx';
import PendingDeposits from './tabs/deposits/PendingDeposits.tsx';
import ApprovedDeposits from './tabs/deposits/ApprovedDeposits.tsx';
import SuccessfulDeposits from './tabs/deposits/SuccessfulDeposits.tsx';
import RejectedDeposits from './tabs/deposits/RejectedDeposits.tsx';
import InitiatedDeposits from './tabs/deposits/InitiatedDeposits.tsx';
import AllWithdrawals from './tabs/withdrawals/AllWithdrawals.tsx';
import PendingWithdrawals from './tabs/withdrawals/PendingWithdrawals.tsx';
import ApprovedWithdrawals from './tabs/withdrawals/ApprovedWithdrawals.tsx';
import RejectedWithdrawals from './tabs/withdrawals/RejectedWithdrawals.tsx';
import AffiliateDashboardTab from './affiliate/tabs/AffiliateDashboardTab.tsx';
import AffiliatesListTab from './affiliate/tabs/AffiliatesListTab.tsx';
import CommissionPlansTab from './affiliate/tabs/CommissionPlansTab.tsx';
import PlaceholderTab from './affiliate/tabs/PlaceholderTab.tsx';
import ReferralTrackingPage from './affiliate/referralTracking/ReferralTrackingPage.tsx';
import PerformanceReports from './affiliate/PerformanceReports.tsx';
import PromoMaterials from './affiliate/PromoMaterials.tsx';
import PayoutManagement from './affiliate/PayoutManagement.tsx';
import FraudDetection from './affiliate/FraudDetection.tsx';
import AffiliateSettingsPage from './affiliate/AffiliateSettings.tsx';
import AdminLogin from './AdminLogin.tsx';
import type { UserFilterType } from './userFilters.ts';
import { filterUsersByType } from './userFilters.ts';

interface AdminPanelProps {
    settings: MarketSettings;
    onUpdate: (settings: MarketSettings) => void;
  trades: Trade[];
  users: User[];
  setUsers: (users: User[]) => void;
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  paymentRequests: PaymentRequest[];
  onProcessPayment: (reqId: string, action: 'APPROVED' | 'REJECTED') => void;
}

type MenuType =
    | 'DASHBOARD'
    | 'USERS'
    | 'BROADCAST'
    | 'LIVE_CHAT'
    | 'TRADING'
    | 'AI'
    | 'ASSETS'
    | 'AFFILIATE_DASHBOARD'
    | 'AFFILIATE_AFFILIATES'
    | 'AFFILIATE_COMMISSIONS'
    | 'AFFILIATE_REFERRALS'
    | 'AFFILIATE_PAYOUTS'
    | 'AFFILIATE_PROMO'
    | 'AFFILIATE_REPORTS'
    | 'AFFILIATE_FRAUD'
    | 'AFFILIATE_SETTINGS'
    | 'LEADERBOARD'
    | 'DEVICE_VIEW'
    | 'SYSTEM_SETTINGS'
    | 'DEPOSITS_ALL'
    | 'DEPOSITS_PENDING'
    | 'DEPOSITS_APPROVED'
    | 'DEPOSITS_SUCCESSFUL'
    | 'DEPOSITS_REJECTED'
    | 'DEPOSITS_INITIATED'
    | 'WITHDRAWALS_ALL'
    | 'WITHDRAWALS_PENDING'
    | 'WITHDRAWALS_APPROVED'
    | 'WITHDRAWALS_REJECTED'
    | 'SITE_SETTINGS';
import SiteSettings from './SiteSettings';

import { CommissionPlan, CommissionGroup, CommissionHistoryEntry } from './affiliate/types';

const AdminPanel: React.FC<AdminPanelProps> = ({ settings, onUpdate, trades, users, setUsers, assets, setAssets, paymentRequests, onProcessPayment }) => {
        // Commission plans state (for demo, ideally would be loaded from backend)
        const [commissionPlans, setCommissionPlans] = useState<CommissionPlan[]>([]);
        const [commissionGroups, setCommissionGroups] = useState<CommissionGroup[]>([]);
        const [commissionHistory, setCommissionHistory] = useState<CommissionHistoryEntry[]>([]);
        const { config } = useSiteConfig();
    const [activeMenu, setActiveMenu] = useState<MenuType>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Always require login on panel entry (dev fallback). Do not auto-trust localStorage.
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
        const [currentTime, setCurrentTime] = useState<string>('');
            const [chatUnreadCount, setChatUnreadCount] = useState<number>(0);
        const [userFilter, setUserFilter] = useState<UserFilterType>('ALL');
        const [broadcastSegment, setBroadcastSegment] = useState<UserFilterType>('ALL');
  
  // Header State
  const [globalSearch, setGlobalSearch] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    // Clock Effect - show Bangladesh time (Asia/Dhaka)
    useEffect(() => {
        const formatter = new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'Asia/Dhaka',
        });

        const updateTime = () => {
            const now = new Date();
            setCurrentTime(formatter.format(now) + ' BDT');
        };

        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

  // Full Screen Effect Listener
  useEffect(() => {
    const handleFullScreenChange = () => {
        setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  // Full Screen Toggle Function
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  };

    

  // --- ANALYTICS CALCULATIONS ---
    const totalVolume = useMemo(() => trades.reduce((acc, t) => acc + t.amount, 0), [trades]);
    const companyProfit = useMemo(() => trades.reduce((acc, t) => {
    if (t.status === 'LOSS') return acc + t.amount;
    if (t.status === 'WIN') return acc - (t.amount * (t.payoutAtTrade / 100));
    return acc;
  }, 0), [trades]);

  const openCount = trades.filter(t => t.status === 'OPEN').length;
  const finishedTrades = trades.filter(t => t.status !== 'OPEN');
  const houseWinRate = finishedTrades.length > 0 
    ? (finishedTrades.filter(t => t.status === 'LOSS').length / finishedTrades.length) * 100 
    : 50;

    const totalDeposits = paymentRequests.filter(p => p.type === 'DEPOSIT' && p.status === 'APPROVED').reduce((acc, p) => acc + p.amount, 0);
    const totalWithdrawals = paymentRequests.filter(p => p.type === 'WITHDRAWAL' && p.status === 'APPROVED').reduce((acc, p) => acc + p.amount, 0);
  const topWinners = [...users].sort((a, b) => b.netPnL - a.netPnL).slice(0, 5);

    const pendingKycUsers = useMemo(
        () => users.filter(u => u.kycStatus === 'PENDING'),
        [users]
    );
    const pendingDepositRequests = useMemo(
        () => paymentRequests.filter(p => p.type === 'DEPOSIT' && p.status === 'PENDING'),
        [paymentRequests]
    );
    const pendingWithdrawalRequests = useMemo(
        () => paymentRequests.filter(p => p.type === 'WITHDRAWAL' && p.status === 'PENDING'),
        [paymentRequests]
    );
    const rejectedDepositCount = useMemo(
        () => paymentRequests.filter(p => p.type === 'DEPOSIT' && p.status === 'REJECTED').length,
        [paymentRequests]
    );
    const rejectedWithdrawalCount = useMemo(
        () => paymentRequests.filter(p => p.type === 'WITHDRAWAL' && p.status === 'REJECTED').length,
        [paymentRequests]
    );
    const totalNotifications = pendingKycUsers.length + pendingDepositRequests.length + pendingWithdrawalRequests.length;

  const pendingRequestsList = useMemo(() => paymentRequests.filter(req => req.status === 'PENDING'), [paymentRequests]);
  const [pnlHistory] = useState([120, 350, 200, 450, -50, 320, 800, 600, companyProfit > 0 ? companyProfit : 150]);

    const filteredUsers = useMemo(() => {
        // SEND_NOTIFICATION is an action, not a list filter; treat as ALL for table
        const effectiveFilter: UserFilterType = userFilter === 'SEND_NOTIFICATION' ? 'ALL' : userFilter;
        return filterUsersByType(users, effectiveFilter);
    }, [userFilter, users]);

  // --- SEARCH LOGIC ---
  const searchResults = useMemo(() => {
    if (!globalSearch.trim()) return null;
    const lower = globalSearch.toLowerCase();
    
    return {
        users: users.filter(u => u.name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower) || u.id.includes(lower)),
        transactions: paymentRequests.filter(p => p.transactionId?.toLowerCase().includes(lower) || p.userName.toLowerCase().includes(lower) || p.id.includes(lower)),
        assets: assets.filter(a => a.symbol.toLowerCase().includes(lower) || a.name.toLowerCase().includes(lower))
    };
    
  }, [globalSearch, users, paymentRequests, assets]);

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setSelectedUser(updatedUser); 
  };

        const depositMenuCounts = useMemo(() => {
            const deposits = paymentRequests.filter(p => p.type === 'DEPOSIT');
            const pending = deposits.filter(p => p.status === 'PENDING').length;
            const approved = deposits.filter(p => p.status === 'APPROVED').length;
            const rejected = deposits.filter(p => p.status === 'REJECTED').length;

            return {
                DEPOSITS_ALL: deposits.length,
                DEPOSITS_PENDING: pending,
                DEPOSITS_APPROVED: approved,
                DEPOSITS_SUCCESSFUL: approved,
                DEPOSITS_REJECTED: rejected,
                DEPOSITS_INITIATED: pending,
            } as Record<string, number>;
        }, [paymentRequests]);

        const withdrawalMenuCounts = useMemo(() => {
            const withdrawals = paymentRequests.filter(p => p.type === 'WITHDRAWAL');
            const pending = withdrawals.filter(p => p.status === 'PENDING').length;
            const approved = withdrawals.filter(p => p.status === 'APPROVED').length;
            const rejected = withdrawals.filter(p => p.status === 'REJECTED').length;

            return {
                WITHDRAWALS_ALL: withdrawals.length,
                WITHDRAWALS_PENDING: pending,
                WITHDRAWALS_APPROVED: approved,
                WITHDRAWALS_REJECTED: rejected,
            } as Record<string, number>;
        }, [paymentRequests]);

    const userFilterCounts = useMemo(() => {
        const filters: UserFilterType[] = [
            'ALL',
            'ACTIVE',
            'WITH_BALANCE',
            'BANNED',
            'EMAIL_UNVERIFIED',
            'MOBILE_UNVERIFIED',
            'KYC_UNVERIFIED',
            'KYC_PENDING',
            'KYC_REJECTED',
            'KYC_VERIFIED',
            'VPN_DETECTED',
        ];

        const counts: Partial<Record<UserFilterType, number>> = {};
        for (const f of filters) {
            counts[f] = filterUsersByType(users, f).length;
        }
        return counts;
    }, [users]);

        const handleUserFilterSelect = (filter: UserFilterType) => {
                setActiveMenu('USERS');
                setUserFilter(filter);
                setIsSidebarOpen(false);
                setGlobalSearch('');
                setIsMobileSearchOpen(false);
                setSelectedUser(null);
        };

        const handleOpenNotificationComposer = () => {
            setActiveMenu('BROADCAST');
            setBroadcastSegment(userFilter);
                setIsSidebarOpen(false);
                setGlobalSearch('');
                setIsMobileSearchOpen(false);
                setSelectedUser(null);
        };

        const SidebarItem = ({ id, iconClass, label, badgeCount }: { id: MenuType; iconClass: string; label: string; badgeCount?: number }) => (
        <button 
            onClick={() => { setActiveMenu(id); setIsSidebarOpen(false); setGlobalSearch(''); setIsMobileSearchOpen(false); setSelectedUser(null); }}
			className={`w-full flex items-center justify-between px-7 py-4 border-l-4 text-[13px] font-semibold font-binance tracking-wide truncate ${
                    activeMenu === id && !selectedUser
                        ? (theme.mode === 'LIGHT'
                                ? 'border-[#2563eb] bg-[#e5f0ff] text-[#0f172a]'
                                : 'border-[#fcd535] bg-[#2b3139] text-[#fcd535]')
                        : theme.mode === 'LIGHT'
                                ? 'border-transparent text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#111827]'
                                : 'border-transparent text-[#848e9c] hover:bg-[#2b3139] hover:text-white'
                }`}
    >
                <span className="flex items-center space-x-3.5">
                    <span className={`w-9 h-9 rounded-2xl flex items-center justify-center border shadow-sm ${
                            theme.mode === 'LIGHT' ? 'bg-white border-[#e5e7eb]' : 'bg-[#161a1e] border-[#2b3139]'
                    }`}>
                        <i className={`${iconClass} text-[15px]`}></i>
                    </span>
                    <span className="truncate">{label}</span>
                </span>
            {badgeCount && badgeCount > 0 && (
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-[#f6465d] text-white text-[10px] font-bold min-w-[22px] text-center">
                    {badgeCount > 9 ? '9+' : badgeCount}
                </span>
            )}
    </button>
  );

        const theme = settings.adminTheme || {
            mode: 'LIGHT',
            primaryColor: '#0f172a',
            accentColor: '#2563eb',
            backgroundColor: '#f5f6f8',
            sidebarBackground: '#f9fafb',
            headerBackground: '#f9fafb',
            surfaceBackground: '#ffffff',
            textColor: '#020617',
        };

        const isLight = theme.mode === 'LIGHT';
        const themedSidebarStyle: CSSProperties = { backgroundColor: theme.sidebarBackground };
        const themedHeaderStyle: CSSProperties = { backgroundColor: theme.headerBackground };
        const themedMainStyle: CSSProperties = { backgroundColor: theme.backgroundColor };

    // If not authenticated show the dev login fallback
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <AdminLogin onSuccess={() => setIsAuthenticated(true)} />
            </div>
        );
    }

    return (
        <div
                className="flex h-full w-full overflow-hidden font-binance relative"
                style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
        >
          <RealtimeTransactions />
      
      {/* ================= MODALS ================= */}
      
      {/* Proof Modal */}
      {selectedProof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setSelectedProof(null)}>
              <div className="relative max-w-2xl w-full p-4 mx-4">
                  <button onClick={() => setSelectedProof(null)} className="absolute -top-10 right-0 text-white hover:text-[#fcd535]"><i className="fa-solid fa-xmark text-2xl"></i></button>
                  <img src={selectedProof} className="w-full rounded-lg shadow-2xl border border-[#2b3139] max-h-[80vh] object-contain" alt="proof"/>
              </div>
          </div>
      )}

      {/* Sidebar Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Sidebar */}
            <aside
	  	  className={`fixed inset-y-0 left-0 z-50 w-64 border-r flex flex-col transform transition-transform duration-300 lg:static lg:translate-x-0 ${
				isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
			} ${isLight ? 'border-[#e5e7eb]' : 'border-[#2b3139]'}`}
	  	  style={themedSidebarStyle}
            >
                <div className={`p-6 flex items-center justify-between border-b ${isLight ? 'border-[#e5e7eb]' : 'border-[#2b3139]'}`}>
                <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                                <span className="text-[#0f172a]">{config.siteName}</span>
                        </h1>
                        <span className="text-[10px] text-[#6b7280] font-bold uppercase tracking-[2px]">Admin Terminal</span>
                    </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-[#848e9c]"><i className="fa-solid fa-xmark text-xl"></i></button>
        </div>
                <nav className="flex-1 py-3 overflow-y-auto custom-scrollbar space-y-1.5">
                    <SidebarItem id="DASHBOARD" iconClass="fa-solid fa-chart-line" label="Overview" />
                    <UserManagementMenu
                                                isActive={(activeMenu === 'USERS' || activeMenu === 'BROADCAST') && !selectedUser}
                        currentFilter={userFilter}
                        onSelectFilter={handleUserFilterSelect}
                        onOpenNotificationComposer={handleOpenNotificationComposer}
                                                isBroadcastActive={activeMenu === 'BROADCAST'}
                                totalUsers={users.length}
                                filterCounts={userFilterCounts}
                                theme={theme}
                    />

                    <DepositsMenu
                        activeMenu={activeMenu}
                        depositCounts={depositMenuCounts}
                        onSelect={(menu) => {
                            setActiveMenu(menu as MenuType);
                            setIsSidebarOpen(false);
                            setGlobalSearch('');
                            setIsMobileSearchOpen(false);
                            setSelectedUser(null);
                        }}
                        theme={theme}
                    />

                    <WithdrawalsMenu
                        activeMenu={activeMenu}
                        withdrawalCounts={withdrawalMenuCounts}
                        onSelect={(menu) => {
                            setActiveMenu(menu as MenuType);
                            setIsSidebarOpen(false);
                            setGlobalSearch('');
                            setIsMobileSearchOpen(false);
                            setSelectedUser(null);
                        }}
                        theme={theme}
                    />

                    <SidebarItem id="LIVE_CHAT" iconClass="fa-solid fa-comments" label="Live Chat" badgeCount={chatUnreadCount} />
          <SidebarItem id="LEADERBOARD" iconClass="fa-solid fa-trophy" label="Leader Board" />
                    <AffiliateMenu
                        activeMenu={activeMenu}
                        onSelect={(menu) => {
                            setActiveMenu(menu as MenuType);
                            setIsSidebarOpen(false);
                            setGlobalSearch('');
                            setIsMobileSearchOpen(false);
                            setSelectedUser(null);
                        }}
                        theme={theme}
                    />
          <SidebarItem id="TRADING" iconClass="fa-solid fa-sliders" label="Trading Engine" />
                      <SidebarItem id="DEVICE_VIEW" iconClass="fa-solid fa-display" label="Device View Control" />
          {/* Finance & Verify removed as requested */}
          <SidebarItem id="ASSETS" iconClass="fa-solid fa-coins" label="Market Assets" />
          <SidebarItem id="AI" iconClass="fa-solid fa-robot" label="AI Analyst" />
                    <SidebarItem id="SYSTEM_SETTINGS" iconClass="fa-solid fa-gear" label="System Settings" />
                    <SidebarItem id="SITE_SETTINGS" iconClass="fa-solid fa-paint-brush" label="Branding" />
        </nav>
      </aside>

    <main className="flex-1 flex flex-col min-w-0 relative" style={themedMainStyle}>
        {/* ==========================
            HEADER
           ========================== */}
        {!selectedUser && ( 
        <header
            className={`h-16 border-b flex items-center justify-between px-4 lg:px-8 shadow-md z-30 shrink-0 relative ${
			isLight ? 'border-[#e5e7eb]' : 'border-[#2b3139]'
		}`}
            style={themedHeaderStyle}
        >
            {isMobileSearchOpen ? (
                <div className="absolute inset-0 bg-[#1e2329] z-50 flex items-center px-4 animate-in fade-in slide-in-from-top-2">
                    <i className="fa-solid fa-magnifying-glass text-[#fcd535] mr-3"></i>
                    <input 
                        autoFocus
                        type="text" 
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        placeholder="Search users, tx id..." 
                        className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none focus:ring-0"
                    />
                    <button onClick={() => { setIsMobileSearchOpen(false); setGlobalSearch(''); }} className="p-2 ml-2 text-[#848e9c] hover:text-white">
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>
            ) : (
                <>
                <div className="flex items-center space-x-4">
                    <button onClick={() => setIsSidebarOpen(true)} className={`lg:hidden ${isLight ? 'text-[#6b7280] hover:text-[#111827]' : 'text-[#848e9c] hover:text-white'}`}><i className="fa-solid fa-bars text-xl"></i></button>
                    <h2 className={`text-lg font-bold capitalize tracking-wide hidden sm:block ${isLight ? 'text-[#111827]' : 'text-white'}`}>
                        {globalSearch ? 'Global Search' : activeMenu.replace('_', ' ')}
                    </h2>
                </div>

                <div className="hidden lg:flex flex-1 max-w-xl mx-8 relative group">
                    <i
						className={`fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs ${
                            globalSearch ? (isLight ? 'text-[#2563eb]' : 'text-[#fcd535]') : isLight ? 'text-[#9ca3af]' : 'text-[#848e9c]'
                        }`}
                    ></i>
                    <input 
                            type="text" 
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            placeholder="Search users, transactions, assets..." 
							className={`w-full rounded-lg pl-9 pr-8 py-2 text-xs focus:outline-none border ${
                                isLight
                                    ? 'bg-white border-[#e5e7eb] text-[#111827] focus:border-[#2563eb]'
                                    : 'bg-[#161a1e] border-[#2b3139] text-white focus:border-[#fcd535]'
                            }`}
                    />
                    {globalSearch && (
                        <button onClick={() => setGlobalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#848e9c] hover:text-white">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    )}
                    {!globalSearch && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
                            <span
                                className={`px-1.5 py-0.5 rounded text-[9px] border ${
                                    isLight
                                        ? 'bg-[#f3f4f6] text-[#9ca3af] border-[#e5e7eb]'
                                        : 'bg-[#2b3139] text-[#848e9c] border-[#3b414d]'
                                }`}
                            >
                                CMD+K
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-3 lg:space-x-5">
                 	<button
                        onClick={() => setIsMobileSearchOpen(true)}
                        className={`lg:hidden w-9 h-9 flex items-center justify-center rounded-lg ${
                            isLight ? 'text-[#6b7280] hover:text-[#111827] hover:bg-[#e5e7eb]' : 'text-[#848e9c] hover:text-white hover:bg-[#2b3139]'
                        }`}
                    >
                        <i className="fa-solid fa-magnifying-glass"></i>
                     </button>

                    <div
                        className={`hidden xl:flex items-center space-x-2 px-3 py-1 rounded border ${
                            isLight ? 'bg-white border-[#e5e7eb]' : 'bg-[#161a1e] border-[#2b3139]'
                        }`}
                    >
                        <i className={`fa-regular fa-clock text-xs ${isLight ? 'text-[#2563eb]' : 'text-[#fcd535]'}`}></i>
                        <span className={`text-xs font-mono font-bold tracking-wide ${isLight ? 'text-[#111827]' : 'text-white'}`}>{currentTime || '00:00:00 BDT'}</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-2" title="System Operational">
                        <span className={`w-2.5 h-2.5 rounded-full ${settings.maintenanceMode ? 'bg-[#f6465d] animate-pulse' : 'bg-[#0ecb81]'}`}></span>
                        <span className="text-[10px] font-bold text-[#848e9c] uppercase tracking-wider">{settings.maintenanceMode ? 'MAINTENANCE' : 'SYSTEM LIVE'}</span>
                    </div>

                    <button 
                            onClick={toggleFullScreen}
							className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                isLight
                                    ? 'bg-white border border-[#e5e7eb] text-[#6b7280] hover:text-[#111827] hover:border-[#2563eb]'
                                    : 'bg-[#2b3139] text-[#848e9c] hover:text-white hover:bg-[#3b414d]'
                            }`}
                            title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                    >
                        <i className={`fa-solid ${isFullScreen ? 'fa-compress' : 'fa-expand'}`}></i>
                    </button>

                    <button 
			    onClick={() => setIsNotificationOpen(prev => !prev)}
							className={`w-9 h-9 rounded-lg flex items-center justify-center relative ${
                                isLight
                                    ? 'bg-white border border-[#e5e7eb] text-[#6b7280] hover:text-[#111827] hover:border-[#2563eb]'
                                    : 'bg-[#2b3139] text-[#848e9c] hover:text-white hover:bg-[#3b414d]'
                            }`}
                    >
                        <i className="fa-regular fa-bell"></i>
                        {totalNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#f6465d] text-white text-[9px] font-bold flex items-center justify-center border-2 border-[#1e2329]">
                                {totalNotifications > 9 ? '9+' : totalNotifications}
                            </span>
                        )}
                    </button>

                    <div className="relative">
                        <div
                            className={`flex items-center space-x-3 pl-3 border-l cursor-pointer ${
                                isLight ? 'border-[#e5e7eb]' : 'border-[#2b3139]'
                            }`}
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                            <div className="text-right hidden md:block">
                                <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#9ca3af]' : 'text-[#848e9c]'}`}>Super Admin</p>
                                <p className={`text-xs font-bold ${isLight ? 'text-[#111827]' : 'text-white'}`}>Root Access</p>
                            </div>
                            <button className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#fcd535] to-[#f69d35] flex items-center justify-center text-[#1e2329] border-2 border-transparent shadow-md hover:scale-105 transition-transform">
                                <i className="fa-solid fa-user-astronaut"></i>
                            </button>
                        </div>
                        {isProfileOpen && (
                            <div
                                className={`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 border ${
                                    isLight ? 'bg-white border-[#e5e7eb]' : 'bg-[#1e2329] border-[#2b3139]'
                                }`}
                            >
                                <button
                                    onClick={() => { localStorage.removeItem('admin_auth'); setIsAuthenticated(false); setIsProfileOpen(false); }}
                                    className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-opacity-80 ${
                                        isLight ? 'text-[#f6465d] hover:bg-[#f3f4f6]' : 'text-[#f6465d] hover:bg-[#2b3139]'
                                    }`}
                                >
                                    <i className="fa-solid fa-power-off mr-2"></i> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                </>
            )}
        </header>
        )}

        {/* ==========================
            MAIN CONTENT
           ========================== */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {selectedUser ? (
             <UserDetailView 
                user={selectedUser} 
                onBack={() => setSelectedUser(null)} 
                onUpdate={handleUpdateUser} 
                onDelete={() => {}} 
             />
          ) : (globalSearch && activeMenu !== 'DEVICE_VIEW') ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 space-y-6">
                  {/* Search Results logic... */}
              </div>
          ) : (
            <>
            {/* Scrollable Tabs Wrapper */}
            {[
                'DASHBOARD',
                'USERS',
                'TRADING',
                'AI',
                'LEADERBOARD',
                'SYSTEM_SETTINGS',
                'LIVE_CHAT',
                'BROADCAST',
                'DEVICE_VIEW',
                'DEPOSITS_ALL',
                'DEPOSITS_PENDING',
                'DEPOSITS_APPROVED',
                'DEPOSITS_SUCCESSFUL',
                'DEPOSITS_REJECTED',
                'DEPOSITS_INITIATED',
                'WITHDRAWALS_ALL',
                'WITHDRAWALS_PENDING',
                'WITHDRAWALS_APPROVED',
                'WITHDRAWALS_REJECTED',
                'AFFILIATE_DASHBOARD',
                'AFFILIATE_AFFILIATES',
                'AFFILIATE_COMMISSIONS',
                'AFFILIATE_REFERRALS',
                'AFFILIATE_PAYOUTS',
                'AFFILIATE_PROMO',
                'AFFILIATE_REPORTS',
                'AFFILIATE_FRAUD',
                'AFFILIATE_SETTINGS',
            ].includes(activeMenu) && (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
                    {activeMenu === 'DASHBOARD' && (
                        <DashboardTab 
                            companyProfit={companyProfit}
                            totalVolume={totalVolume}
                            users={users}
                            openCount={openCount}
                            trades={trades}
                            houseWinRate={houseWinRate}
                            totalDeposits={totalDeposits}
                            totalWithdrawals={totalWithdrawals}
                            depositPendingCount={pendingDepositRequests.length}
                            withdrawalPendingCount={pendingWithdrawalRequests.length}
                            depositRejectedCount={rejectedDepositCount}
                            withdrawalRejectedCount={rejectedWithdrawalCount}
                            pendingCount={pendingRequestsList.length}
                            pnlHistory={pnlHistory}
                            topWinners={topWinners}
                            setActiveMenu={setActiveMenu}
                            theme={theme}
                        />
                    )}

                    {activeMenu === 'USERS' && (
                        <UsersTab users={filteredUsers} onSelectUser={setSelectedUser} setUsers={setUsers} theme={theme} />
                    )}

                    {activeMenu === 'LIVE_CHAT' && (
                        <LiveChatTab users={users} onUnreadChange={setChatUnreadCount} theme={theme} />
                    )}

                    {activeMenu === 'LEADERBOARD' && (
                        <LeaderboardTab settings={settings} onUpdate={onUpdate} trades={trades} users={users} theme={theme} />
                    )}

                    {activeMenu === 'AFFILIATE_DASHBOARD' && (
                        <AffiliateDashboardTab users={users} theme={theme} />
                    )}

                    {activeMenu === 'AFFILIATE_AFFILIATES' && (
                        <AffiliatesListTab users={users} setUsers={setUsers} theme={theme} />
                    )}

                    {activeMenu === 'AFFILIATE_COMMISSIONS' && (
                        <CommissionPlansTab
                          users={users}
                          commissionPlans={commissionPlans}
                          setCommissionPlans={setCommissionPlans}
                          commissionGroups={commissionGroups}
                          setCommissionGroups={setCommissionGroups}
                          commissionHistory={commissionHistory}
                          theme={theme}
                        />
                    )}

                    {activeMenu === 'AFFILIATE_REFERRALS' && (
                        <React.Suspense fallback={<div>Loading...</div>}>
                            <ReferralTrackingPage />
                        </React.Suspense>
                    )}

                    {activeMenu === 'AFFILIATE_PAYOUTS' && (
                        <PayoutManagement />
                    )}

                    {activeMenu === 'AFFILIATE_PROMO' && (
                        <PromoMaterials />
                    )}

                    {activeMenu === 'AFFILIATE_REPORTS' && (
                        <PerformanceReports />
                    )}

                    {activeMenu === 'AFFILIATE_FRAUD' && (
                        <FraudDetection />
                    )}

                    {activeMenu === 'AFFILIATE_SETTINGS' && (
                        <AffiliateSettingsPage />
                    )}

                    {activeMenu === 'TRADING' && (
                        <TradingTab settings={settings} onUpdate={onUpdate} theme={theme} />
                    )}

                                        {activeMenu === 'DEVICE_VIEW' && (
                                                <DeviceViewControlTab
                                                    settings={settings}
                                                    onUpdate={onUpdate}
                                                    theme={theme}
                                                    searchQuery={globalSearch}
                                                />
                    )}

                    {activeMenu === 'AI' && (
                        <AiTab settings={settings} onUpdate={onUpdate} theme={theme} />
                    )}

                    {activeMenu === 'SYSTEM_SETTINGS' && (
                        <SystemSettingsTab settings={settings} onUpdate={onUpdate} theme={theme} />
                    )}

                    {activeMenu === 'SITE_SETTINGS' && (
                        <div className="flex-1 px-6 py-5">
                            <SiteSettings />
                        </div>
                    )}

                    {activeMenu === 'BROADCAST' && (
                        <NotificationComposer
                            users={users}
                            initialSegment={broadcastSegment}
                            theme={theme}
                            onSend={({ segment, subject, message }) => {
                                const targetUsers = filterUsersByType(users, segment);
                                // TODO: Replace with real email/broadcast API integration
                                console.log('Broadcast email', {
                                    segment,
                                    subject,
                                    message,
                                    recipients: targetUsers.map(u => u.email),
                                });
                                window.alert(`Email queued to ${targetUsers.length} users.`);
                            }}
                        />
                    )}

                    {activeMenu === 'DEPOSITS_ALL' && (
                        <AllDeposits
                            paymentRequests={paymentRequests}
                            onProcessPayment={onProcessPayment}
                            onViewProof={(url) => setSelectedProof(url)}
                        />
                    )}

                    {activeMenu === 'DEPOSITS_PENDING' && (
                        <PendingDeposits
                            paymentRequests={paymentRequests}
                            onProcessPayment={onProcessPayment}
                            onViewProof={(url) => setSelectedProof(url)}
                        />
                    )}

                    {activeMenu === 'DEPOSITS_APPROVED' && (
                        <ApprovedDeposits
                            paymentRequests={paymentRequests}
                            onProcessPayment={onProcessPayment}
                            onViewProof={(url) => setSelectedProof(url)}
                        />
                    )}

                    {activeMenu === 'DEPOSITS_SUCCESSFUL' && (
                        <SuccessfulDeposits
                            paymentRequests={paymentRequests}
                            onProcessPayment={onProcessPayment}
                            onViewProof={(url) => setSelectedProof(url)}
                        />
                    )}

                    {activeMenu === 'DEPOSITS_REJECTED' && (
                        <RejectedDeposits
                            paymentRequests={paymentRequests}
                            onProcessPayment={onProcessPayment}
                            onViewProof={(url) => setSelectedProof(url)}
                        />
                    )}

                    {activeMenu === 'DEPOSITS_INITIATED' && (
                        <InitiatedDeposits
                            paymentRequests={paymentRequests}
                            onProcessPayment={onProcessPayment}
                            onViewProof={(url) => setSelectedProof(url)}
                        />
                    )}

                    {activeMenu === 'WITHDRAWALS_ALL' && (
                        <AllWithdrawals
                            paymentRequests={paymentRequests}
                            onProcessPayment={onProcessPayment}
                            onViewProof={(url) => setSelectedProof(url)}
                        />
                    )}

                    {activeMenu === 'WITHDRAWALS_PENDING' && (
                        <PendingWithdrawals
                            paymentRequests={paymentRequests}
                            onProcessPayment={onProcessPayment}
                            onViewProof={(url) => setSelectedProof(url)}
                        />
                    )}

                    {activeMenu === 'WITHDRAWALS_APPROVED' && (
                        <ApprovedWithdrawals
                            paymentRequests={paymentRequests}
                            onProcessPayment={onProcessPayment}
                            onViewProof={(url) => setSelectedProof(url)}
                        />
                    )}

                    {activeMenu === 'WITHDRAWALS_REJECTED' && (
                        <RejectedWithdrawals
                            paymentRequests={paymentRequests}
                            onProcessPayment={onProcessPayment}
                            onViewProof={(url) => setSelectedProof(url)}
                        />
                    )}
                </div>
            )}

            {/* Fixed Height Tabs (Manage their own scroll) */}
            {activeMenu === 'ASSETS' && (
                <AssetsTab 
                    assets={assets} 
                    setAssets={setAssets} 
                    settings={settings} 
                    onUpdate={onUpdate}
                    trades={trades}
                    theme={theme}
                />
            )}
            </>
          )}
        </div>
      </main>

            {/* Notification Center */}
            <NotificationCenter
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                pendingDeposits={pendingDepositRequests}
                pendingWithdrawals={pendingWithdrawalRequests}
                pendingKycUsers={pendingKycUsers}
                settings={settings}
                paymentRequests={paymentRequests}
                users={users}
                theme={theme}
            />

    </div>
  );
};

export default AdminPanel;
