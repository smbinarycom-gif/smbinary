
import React, { useState, useMemo, useEffect } from 'react';
import { MarketSettings, Trade, User, Asset, PaymentRequest } from '../shared/types.ts';

// Import Components
import UserDetailView from './components/UserDetailView.tsx';
import DashboardTab from './tabs/DashboardTab.tsx';
import UsersTab from './tabs/UsersTab.tsx';
import TradingTab from './tabs/TradingTab.tsx';
import FinanceTab from './tabs/FinanceTab.tsx';
import AssetsTab from './tabs/AssetsTab.tsx';
import AiTab from './tabs/AiTab.tsx';
import LeaderboardTab from './tabs/LeaderboardTab.tsx';

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

type MenuType = 'DASHBOARD' | 'USERS' | 'TRADING' | 'AI' | 'ASSETS' | 'FINANCE' | 'LEADERBOARD';

const AdminPanel: React.FC<AdminPanelProps> = ({ settings, onUpdate, trades, users, setUsers, assets, setAssets, paymentRequests, onProcessPayment }) => {
  const [activeMenu, setActiveMenu] = useState<MenuType>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  
  // Header State
  const [globalSearch, setGlobalSearch] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Clock Effect
  useEffect(() => {
    const timer = setInterval(() => {
        const d = new Date();
        setCurrentTime(d.toUTCString().split(' ')[4] + ' UTC');
    }, 1000);
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

  const pendingKyc = users.filter(u => u.kycStatus === 'PENDING').length;
  const pendingDeposits = paymentRequests.filter(p => p.type === 'DEPOSIT' && p.status === 'PENDING').length;
  const pendingWithdrawals = paymentRequests.filter(p => p.type === 'WITHDRAWAL' && p.status === 'PENDING').length;
  const totalNotifications = pendingKyc + pendingDeposits + pendingWithdrawals;

  const pendingRequestsList = useMemo(() => paymentRequests.filter(req => req.status === 'PENDING'), [paymentRequests]);
  const [pnlHistory] = useState([120, 350, 200, 450, -50, 320, 800, 600, companyProfit > 0 ? companyProfit : 150]);

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

  const SidebarItem = ({ id, iconClass, label }: { id: MenuType; iconClass: string; label: string }) => (
    <button 
      onClick={() => { setActiveMenu(id); setIsSidebarOpen(false); setGlobalSearch(''); setIsMobileSearchOpen(false); setSelectedUser(null); }}
      className={`w-full flex items-center space-x-3 px-6 py-4 transition-all border-l-4 ${activeMenu === id && !selectedUser ? 'text-[#fcd535] bg-[#2b3139] border-[#fcd535]' : 'text-[#848e9c] border-transparent hover:text-white hover:bg-[#2b3139]'}`}
    >
      <i className={`${iconClass} text-lg w-6 text-center`}></i>
      <span className="text-sm font-bold font-binance tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="flex h-full w-full bg-[#161a1e] overflow-hidden text-[#EAECEF] font-binance relative">
      
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
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1e2329] border-r border-[#2b3139] flex flex-col transform transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between border-b border-[#2b3139]">
          <div><h1 className="text-2xl font-bold text-white tracking-tight">GEMINI<span className="text-[#fcd535]">X</span></h1><span className="text-[10px] text-[#848e9c] font-bold uppercase tracking-[2px]">Admin Terminal</span></div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-[#848e9c]"><i className="fa-solid fa-xmark text-xl"></i></button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
          <SidebarItem id="DASHBOARD" iconClass="fa-solid fa-chart-line" label="Overview" />
          <SidebarItem id="USERS" iconClass="fa-solid fa-users-gear" label="User Management" />
          <SidebarItem id="LEADERBOARD" iconClass="fa-solid fa-trophy" label="Leader Board" />
          <SidebarItem id="TRADING" iconClass="fa-solid fa-sliders" label="Trading Engine" />
          <SidebarItem id="FINANCE" iconClass="fa-solid fa-wallet" label="Finance & Verify" />
          <SidebarItem id="ASSETS" iconClass="fa-solid fa-coins" label="Market Assets" />
          <SidebarItem id="AI" iconClass="fa-solid fa-robot" label="AI Analyst" />
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#161a1e] relative">
        {/* ==========================
            HEADER
           ========================== */}
        {!selectedUser && ( 
        <header className="h-16 border-b border-[#2b3139] bg-[#1e2329] flex items-center justify-between px-4 lg:px-6 shadow-md z-30 shrink-0 relative transition-all duration-200">
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
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-[#848e9c] hover:text-white"><i className="fa-solid fa-bars text-xl"></i></button>
                    <h2 className="text-lg font-bold text-white capitalize tracking-wide hidden sm:block">
                        {globalSearch ? 'Global Search' : activeMenu.replace('_', ' ')}
                    </h2>
                </div>

                <div className="hidden lg:flex flex-1 max-w-xl mx-8 relative group">
                    <i className={`fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs transition-colors ${globalSearch ? 'text-[#fcd535]' : 'text-[#848e9c]'}`}></i>
                    <input 
                        type="text" 
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        placeholder="Search users, transactions, assets..." 
                        className="w-full bg-[#161a1e] border border-[#2b3139] rounded-lg pl-9 pr-8 py-2 text-xs text-white focus:outline-none focus:border-[#fcd535] transition-colors"
                    />
                    {globalSearch && (
                        <button onClick={() => setGlobalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#848e9c] hover:text-white">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    )}
                    {!globalSearch && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
                            <span className="px-1.5 py-0.5 rounded bg-[#2b3139] text-[9px] text-[#848e9c] border border-[#3b414d]">CMD+K</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-3 lg:space-x-5">
                     <button onClick={() => setIsMobileSearchOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center text-[#848e9c] hover:text-white rounded-lg hover:bg-[#2b3139]">
                        <i className="fa-solid fa-magnifying-glass"></i>
                     </button>

                    <div className="hidden xl:flex items-center space-x-2 px-3 py-1 bg-[#161a1e] rounded border border-[#2b3139]">
                        <i className="fa-regular fa-clock text-[#fcd535] text-xs"></i>
                        <span className="text-xs font-mono font-bold text-white tracking-wide">{currentTime || '00:00:00 UTC'}</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-2" title="System Operational">
                        <span className={`w-2.5 h-2.5 rounded-full ${settings.maintenanceMode ? 'bg-[#f6465d] animate-pulse' : 'bg-[#0ecb81]'}`}></span>
                        <span className="text-[10px] font-bold text-[#848e9c] uppercase tracking-wider">{settings.maintenanceMode ? 'MAINTENANCE' : 'SYSTEM LIVE'}</span>
                    </div>

                    <button 
                        onClick={toggleFullScreen}
                        className="w-9 h-9 rounded-lg bg-[#2b3139] flex items-center justify-center text-[#848e9c] hover:text-white hover:bg-[#3b414d] transition-colors"
                        title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                    >
                        <i className={`fa-solid ${isFullScreen ? 'fa-compress' : 'fa-expand'}`}></i>
                    </button>

                    <button 
                        onClick={() => { setActiveMenu('FINANCE'); setGlobalSearch(''); }}
                        className="w-9 h-9 rounded-lg bg-[#2b3139] flex items-center justify-center text-[#848e9c] hover:text-white hover:bg-[#3b414d] transition-colors relative"
                    >
                        <i className="fa-regular fa-bell"></i>
                        {totalNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#f6465d] text-white text-[9px] font-bold flex items-center justify-center border-2 border-[#1e2329]">
                                {totalNotifications > 9 ? '9+' : totalNotifications}
                            </span>
                        )}
                    </button>

                    <div className="relative">
                        <div className="flex items-center space-x-3 pl-3 border-l border-[#2b3139] cursor-pointer" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                            <div className="text-right hidden md:block">
                                <p className="text-[10px] text-[#848e9c] font-bold uppercase tracking-wider">Super Admin</p>
                                <p className="text-xs font-bold text-white">Root Access</p>
                            </div>
                            <button className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#fcd535] to-[#f69d35] flex items-center justify-center text-[#1e2329] border-2 border-[#2b3139] shadow-lg hover:scale-105 transition-transform">
                                <i className="fa-solid fa-user-astronaut"></i>
                            </button>
                        </div>
                        {isProfileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1e2329] border border-[#2b3139] rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95">
                                <button onClick={() => window.location.reload()} className="w-full text-left px-4 py-3 text-xs font-bold text-[#f6465d] hover:bg-[#2b3139]">
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
          ) : globalSearch ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 space-y-6">
                  {/* Search Results logic... */}
              </div>
          ) : (
            <>
            {/* Scrollable Tabs Wrapper */}
            {['DASHBOARD', 'USERS', 'TRADING', 'FINANCE', 'AI', 'LEADERBOARD'].includes(activeMenu) && (
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
                            pendingCount={pendingRequestsList.length}
                            pnlHistory={pnlHistory}
                            topWinners={topWinners}
                            setActiveMenu={setActiveMenu}
                        />
                    )}

                    {activeMenu === 'USERS' && (
                        <UsersTab users={users} onSelectUser={setSelectedUser} setUsers={setUsers} />
                    )}

                    {activeMenu === 'LEADERBOARD' && (
                        <LeaderboardTab settings={settings} onUpdate={onUpdate} trades={trades} users={users} />
                    )}

                    {activeMenu === 'TRADING' && (
                        <TradingTab settings={settings} onUpdate={onUpdate} />
                    )}

                    {activeMenu === 'FINANCE' && (
                        <FinanceTab 
                            settings={settings} 
                            onUpdate={onUpdate} 
                            paymentRequests={pendingRequestsList} 
                            onProcessPayment={onProcessPayment} 
                            onViewProof={setSelectedProof} 
                        />
                    )}

                    {activeMenu === 'AI' && (
                        <AiTab settings={settings} onUpdate={onUpdate} />
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
                />
            )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
