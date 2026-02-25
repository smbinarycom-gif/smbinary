
import React, { useState } from 'react';
import { notify } from '../../shared/notify';
import { User, AdminNote } from '../../shared/types.ts';

interface UserDetailViewProps {
    user: User;
    onBack: () => void;
    onUpdate: (u: User) => void;
    onDelete: () => void;
}

const UserDetailView: React.FC<UserDetailViewProps> = ({ user, onBack, onUpdate, onDelete }) => {
    const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TRADING' | 'FINANCE' | 'SECURITY' | 'KYC' | 'NOTES'>('DASHBOARD');
    const [balanceAdjust, setBalanceAdjust] = useState('');
    const [adjustMode, setAdjustMode] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
    const [newNote, setNewNote] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleBalanceAdjust = () => {
        const amount = Number(balanceAdjust);
        if (!amount) return;
        const newBal = adjustMode === 'CREDIT' ? user.balance + amount : user.balance - amount;
        onUpdate({ ...user, balance: newBal });
        setBalanceAdjust('');
    };

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        const note: AdminNote = {
            id: Date.now().toString(),
            content: newNote,
            date: Date.now(),
            author: 'Admin'
        };
        onUpdate({ ...user, adminNotes: [note, ...user.adminNotes] });
        setNewNote('');
    };

    const handleLoginAs = async () => {
        const ok = await (await import('../../shared/confirm')).confirm(`Are you sure you want to login as ${user.name}? This would normally start a user session.`);
        if (ok) notify.info(`Redirecting to user dashboard as ${user.name}... (Simulation)`);
    };

    const handleResetPassword = () => {
        onUpdate({ ...user, forcePasswordReset: true });
        notify.info(`Password reset link sent to ${user.email}. User will be forced to change password on next login.`);
    };

    const handleKillSessions = () => {
        notify.info(`All active sessions for ${user.name} (ID: ${user.id}) have been terminated.`);
    };

    const handleDisable2FA = async () => {
        const ok = await (await import('../../shared/confirm')).confirm("Disable Two-Factor Authentication for this user?");
        if (ok) {
            onUpdate({ ...user, twoFactorEnabled: false });
            notify.success("2FA has been disabled.");
        }
    };

    const TabButton = ({ tab, label, icon }: { tab: typeof activeTab, label: string, icon: string }) => (
        <button 
            onClick={() => setActiveTab(tab)}
            className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all ${activeTab === tab ? 'border-[#fcd535] text-white' : 'border-transparent text-[#848e9c] hover:text-white'}`}
        >
            <i className={`${icon} text-sm`}></i>
            <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-[#161a1e] animate-in fade-in slide-in-from-right-4 duration-300 relative">
            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-4xl w-full p-4 mx-4 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setPreviewImage(null)} className="absolute -top-10 right-0 text-white hover:text-[#fcd535] transition-colors"><i className="fa-solid fa-xmark text-2xl"></i></button>
                        <img src={previewImage} className="w-full rounded-lg shadow-2xl border border-[#2b3139] max-h-[80vh] object-contain bg-[#161a1e]" alt="Preview"/>
                    </div>
                </div>
            )}

            {/* Header / Nav */}
            <div className="h-16 bg-[#1e2329] border-b border-[#2b3139] flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center space-x-4">
                    <button onClick={onBack} className="text-[#848e9c] hover:text-white transition-colors flex items-center space-x-2 bg-[#2b3139] px-3 py-1.5 rounded-lg border border-[#3b414d]">
                        <i className="fa-solid fa-arrow-left"></i>
                        <span className="text-xs font-bold uppercase">Back to List</span>
                    </button>
                    <div className="h-8 w-[1px] bg-[#3b414d]"></div>
                    <h2 className="text-lg font-bold text-white flex items-center">
                        User Profile <span className="text-[#848e9c] text-sm font-normal ml-2">#{user.id.substring(0,8)}</span>
                    </h2>
                </div>
                <div className="flex items-center space-x-3">
                     {user.status === 'ACTIVE' ? (
                        <button onClick={() => onUpdate({...user, status: 'BLOCKED'})} className="px-4 py-2 bg-[#f6465d]/10 text-[#f6465d] border border-[#f6465d]/50 rounded-lg text-xs font-bold hover:bg-[#f6465d] hover:text-white transition-all uppercase">
                            <i className="fa-solid fa-ban mr-2"></i>Block User
                        </button>
                    ) : (
                        <button onClick={() => onUpdate({...user, status: 'ACTIVE'})} className="px-4 py-2 bg-[#0ecb81]/10 text-[#0ecb81] border border-[#0ecb81]/50 rounded-lg text-xs font-bold hover:bg-[#0ecb81] hover:text-white transition-all uppercase">
                            <i className="fa-solid fa-check mr-2"></i>Unblock
                        </button>
                    )}
                    <button onClick={handleLoginAs} className="px-4 py-2 bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/50 rounded-lg text-xs font-bold hover:bg-[#3b82f6] hover:text-white transition-all uppercase">
                        <i className="fa-solid fa-right-to-bracket mr-2"></i>Login As
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Left Sidebar: Identity Card */}
                <div className="w-full lg:w-80 bg-[#1e2329] border-b lg:border-b-0 lg:border-r border-[#2b3139] overflow-y-auto custom-scrollbar p-6 space-y-6">
                     <div className="flex flex-col items-center text-center">
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[#fcd535] to-[#f69d35] mb-4 relative">
                            <div className="w-full h-full rounded-full bg-[#161a1e] flex items-center justify-center border-4 border-[#1e2329]">
                                <span className="text-4xl font-black text-white">{user.name.charAt(0)}</span>
                            </div>
                            {user.kycStatus === 'VERIFIED' && (
                                <div className="absolute bottom-2 right-2 w-8 h-8 bg-[#0ecb81] rounded-full border-4 border-[#1e2329] flex items-center justify-center text-white text-xs" title="Verified">
                                    <i className="fa-solid fa-check"></i>
                                </div>
                            )}
                        </div>
                        <h1 className="text-xl font-bold text-white mb-1">{user.name}</h1>
                        <p className="text-[#848e9c] text-xs mb-4">{user.email}</p>
                        
                        <div className="flex gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${user.riskLabel === 'VIP' ? 'bg-[#fcd535] text-black' : user.riskLabel === 'HIGH_RISK' ? 'bg-[#f6465d] text-white' : 'bg-[#2b3139] text-[#848e9c]'}`}>
                                {user.riskLabel}
                            </span>
                             <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${user.status === 'ACTIVE' ? 'bg-[#0ecb81]/20 text-[#0ecb81]' : 'bg-[#f6465d]/20 text-[#f6465d]'}`}>
                                {user.status}
                            </span>
                        </div>
                     </div>

                     <div className="bg-[#161a1e] rounded-xl border border-[#2b3139] p-4">
                        <p className="text-[10px] text-[#848e9c] font-bold uppercase mb-2">Live Balance</p>
                        <h2 className="text-3xl font-mono font-bold text-white">${user.balance.toFixed(2)}</h2>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#2b3139]">
                            <div>
                                <p className="text-[10px] text-[#848e9c] uppercase">Total PnL</p>
                                <p className={`text-sm font-bold ${user.netPnL >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                                    {user.netPnL >= 0 ? '+' : ''}${user.netPnL.toFixed(2)}
                                </p>
                            </div>
                             <div>
                                <p className="text-[10px] text-[#848e9c] uppercase text-right">Win Rate</p>
                                <p className="text-sm font-bold text-[#fcd535] text-right">68.5%</p>
                            </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                         <div>
                             <p className="text-[10px] text-[#848e9c] font-bold uppercase mb-2">Details</p>
                             <div className="space-y-2 text-xs">
                                 <div className="flex justify-between">
                                     <span className="text-[#555e70]">Country</span>
                                     <span className="text-white flex items-center"><img src={`https://flagcdn.com/24x18/${user.country === 'Bangladesh' ? 'bd' : 'us'}.png`} className="w-4 h-3 mr-2 rounded-[2px]"/> {user.country}</span>
                                 </div>
                                 <div className="flex justify-between">
                                     <span className="text-[#555e70]">Joined</span>
                                     <span className="text-white">{new Date(user.joinedAt).toLocaleDateString()}</span>
                                 </div>
                                 <div className="flex justify-between">
                                     <span className="text-[#555e70]">Last IP</span>
                                     <span className="text-white font-mono">{user.ipAddress}</span>
                                 </div>
                             </div>
                         </div>
                         <div>
                             <p className="text-[10px] text-[#848e9c] font-bold uppercase mb-2">Device Info</p>
                             <div className="flex items-center space-x-3 bg-[#161a1e] p-3 rounded-lg border border-[#2b3139]">
                                 <i className="fa-brands fa-windows text-xl text-[#3b82f6]"></i>
                                 <div>
                                     <p className="text-xs text-white font-bold">{user.device}</p>
                                     <p className="text-[10px] text-[#848e9c]">Last login: 2 mins ago</p>
                                 </div>
                             </div>
                         </div>
                     </div>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 flex flex-col bg-[#161a1e] overflow-hidden">
                    {/* Tabs */}
                    <div className="bg-[#1e2329] border-b border-[#2b3139] flex overflow-x-auto custom-scrollbar shrink-0">
                        <TabButton tab="DASHBOARD" label="Dashboard" icon="fa-solid fa-chart-line" />
                        <TabButton tab="TRADING" label="Trading & Risk" icon="fa-solid fa-sliders" />
                        <TabButton tab="FINANCE" label="Wallet & Funds" icon="fa-solid fa-wallet" />
                        <TabButton tab="SECURITY" label="Security" icon="fa-solid fa-shield-halved" />
                        <TabButton tab="KYC" label="Documents" icon="fa-solid fa-id-card" />
                        <TabButton tab="NOTES" label="Notes" icon="fa-solid fa-note-sticky" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
                        {activeTab === 'DASHBOARD' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-[#1e2329] p-4 rounded-xl border border-[#2b3139]">
                                        <p className="text-[10px] text-[#848e9c] uppercase font-bold">Total Deposited</p>
                                        <p className="text-xl font-mono font-bold text-white mt-1">${user.totalDeposited.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-[#1e2329] p-4 rounded-xl border border-[#2b3139]">
                                        <p className="text-[10px] text-[#848e9c] uppercase font-bold">Total Withdrawn</p>
                                        <p className="text-xl font-mono font-bold text-white mt-1">${user.totalWithdrawn.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-[#1e2329] p-4 rounded-xl border border-[#2b3139]">
                                        <p className="text-[10px] text-[#848e9c] uppercase font-bold">Turnover</p>
                                        <p className="text-xl font-mono font-bold text-[#3b82f6] mt-1">${user.totalTurnover.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-[#1e2329] p-4 rounded-xl border border-[#2b3139]">
                                        <p className="text-[10px] text-[#848e9c] uppercase font-bold">Net PnL</p>
                                        <p className={`text-xl font-mono font-bold mt-1 ${user.netPnL >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{user.netPnL >= 0 ? '+' : ''}${user.netPnL.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139]">
                                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">Risk Assessment</h3>
                                        <div className="flex items-center space-x-6">
                                            <div className="relative w-32 h-32 flex items-center justify-center">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle cx="64" cy="64" r="56" stroke="#2b3139" strokeWidth="12" fill="none" />
                                                    <circle cx="64" cy="64" r="56" stroke={user.riskScore > 70 ? '#f6465d' : user.riskScore > 40 ? '#fcd535' : '#0ecb81'} strokeWidth="12" fill="none" strokeDasharray="351.86" strokeDashoffset={351.86 * (1 - user.riskScore / 100)} />
                                                </svg>
                                                <span className="absolute text-2xl font-black text-white">{user.riskScore}</span>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-xs text-[#848e9c]">Risk Category: <span className="text-white font-bold">{user.riskLabel}</span></p>
                                                <div className="flex gap-2">
                                                    <button onClick={() => onUpdate({...user, riskLabel: 'REGULAR', riskScore: 20})} className="px-3 py-1 bg-[#2b3139] border border-[#3b414d] rounded text-[10px] font-bold text-[#848e9c] hover:text-white">Regular</button>
                                                    <button onClick={() => onUpdate({...user, riskLabel: 'HIGH_RISK', riskScore: 85})} className="px-3 py-1 bg-[#f6465d]/10 border border-[#f6465d]/20 rounded text-[10px] font-bold text-[#f6465d] hover:bg-[#f6465d] hover:text-white">High Risk</button>
                                                    <button onClick={() => onUpdate({...user, riskLabel: 'VIP', riskScore: 5})} className="px-3 py-1 bg-[#fcd535]/10 border border-[#fcd535]/20 rounded text-[10px] font-bold text-[#fcd535] hover:bg-[#fcd535] hover:text-black">VIP</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'TRADING' && (
                            <div className="space-y-6">
                                <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139]">
                                    <h3 className="text-sm font-bold text-white mb-6 border-b border-[#2b3139] pb-4">Result Manipulation (Force Result)</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <button onClick={() => onUpdate({...user, forceResult: 'WIN'})} className={`py-6 rounded-xl border transition-all flex flex-col items-center justify-center space-y-2 ${user.forceResult === 'WIN' ? 'bg-[#0ecb81] border-[#0ecb81] text-white shadow-lg shadow-green-500/20' : 'bg-[#161a1e] border-[#2b3139] text-[#848e9c] hover:bg-[#2b3139]'}`}>
                                            <i className="fa-solid fa-trophy text-2xl"></i>
                                            <span className="text-xs font-black uppercase tracking-wider">Force Win</span>
                                        </button>
                                        <button onClick={() => onUpdate({...user, forceResult: 'LOSS'})} className={`py-6 rounded-xl border transition-all flex flex-col items-center justify-center space-y-2 ${user.forceResult === 'LOSS' ? 'bg-[#f6465d] border-[#f6465d] text-white shadow-lg shadow-red-500/20' : 'bg-[#161a1e] border-[#2b3139] text-[#848e9c] hover:bg-[#2b3139]'}`}>
                                            <i className="fa-solid fa-skull text-2xl"></i>
                                            <span className="text-xs font-black uppercase tracking-wider">Force Loss</span>
                                        </button>
                                        <button onClick={() => onUpdate({...user, forceResult: 'NONE'})} className={`py-6 rounded-xl border transition-all flex flex-col items-center justify-center space-y-2 ${user.forceResult === 'NONE' ? 'bg-[#3b82f6] border-[#3b82f6] text-white shadow-lg shadow-blue-500/20' : 'bg-[#161a1e] border-[#2b3139] text-[#848e9c] hover:bg-[#2b3139]'}`}>
                                            <i className="fa-solid fa-scale-balanced text-2xl"></i>
                                            <span className="text-xs font-black uppercase tracking-wider">Natural Market</span>
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-[#fcd535] mt-4"><i className="fa-solid fa-triangle-exclamation mr-1"></i> Warning: This overrides global market algorithms for this specific user.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139]">
                                         <h3 className="text-sm font-bold text-white mb-4">Trade Limits</h3>
                                         <div className="space-y-4">
                                            <div>
                                                <label className="text-xs text-[#848e9c] font-bold block mb-1">Max Bet Size ($)</label>
                                                <input type="number" value={user.maxBetSize} onChange={(e) => onUpdate({...user, maxBetSize: Number(e.target.value)})} className="w-full bg-[#161a1e] border border-[#3b414d] rounded px-3 py-2 text-white font-mono focus:border-[#fcd535] outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-[#848e9c] font-bold block mb-1">Execution Delay (ms)</label>
                                                <input type="number" value={user.tradeDelayMs} onChange={(e) => onUpdate({...user, tradeDelayMs: Number(e.target.value)})} className="w-full bg-[#161a1e] border border-[#3b414d] rounded px-3 py-2 text-white font-mono focus:border-[#fcd535] outline-none" />
                                            </div>
                                         </div>
                                     </div>
                                     <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139]">
                                         <h3 className="text-sm font-bold text-white mb-4">Profit Control</h3>
                                         <div className="space-y-4">
                                            <div>
                                                <label className="text-xs text-[#848e9c] font-bold block mb-1">Daily Profit Limit ($)</label>
                                                <input type="number" value={user.dailyProfitLimit} onChange={(e) => onUpdate({...user, dailyProfitLimit: Number(e.target.value)})} className="w-full bg-[#161a1e] border border-[#3b414d] rounded px-3 py-2 text-white font-mono focus:border-[#fcd535] outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-[#848e9c] font-bold block mb-1">Payout Override (%)</label>
                                                <input type="number" value={user.payoutOverride} onChange={(e) => onUpdate({...user, payoutOverride: Number(e.target.value)})} className="w-full bg-[#161a1e] border border-[#3b414d] rounded px-3 py-2 text-white font-mono focus:border-[#fcd535] outline-none" placeholder="0 = Default" />
                                            </div>
                                         </div>
                                     </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'FINANCE' && (
                            <div className="space-y-6">
                                <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139]">
                                    <h3 className="text-sm font-bold text-white mb-6">Manual Fund Management</h3>
                                    <div className="flex flex-col md:flex-row gap-4 items-end">
                                        <div className="flex-1 w-full">
                                            <label className="text-xs text-[#848e9c] font-bold block mb-2">Amount ($)</label>
                                            <input type="number" value={balanceAdjust} onChange={(e) => setBalanceAdjust(e.target.value)} className="w-full bg-[#161a1e] border border-[#3b414d] rounded px-4 py-3 text-white text-lg font-mono focus:border-[#fcd535] outline-none" placeholder="0.00" />
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button onClick={() => { setAdjustMode('CREDIT'); handleBalanceAdjust(); }} className="flex-1 md:flex-none px-8 py-3 bg-[#0ecb81] text-white rounded font-bold hover:bg-[#0aa869] transition-all">CREDIT</button>
                                            <button onClick={() => { setAdjustMode('DEBIT'); handleBalanceAdjust(); }} className="flex-1 md:flex-none px-8 py-3 bg-[#f6465d] text-white rounded font-bold hover:bg-[#e63737] transition-all">DEBIT</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'SECURITY' && (
                            <div className="space-y-6">
                                <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139]">
                                    <h3 className="text-sm font-bold text-white mb-6">Account Security</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button onClick={handleResetPassword} className="p-4 bg-[#161a1e] border border-[#3b414d] rounded-xl hover:border-[#fcd535] transition-all text-left group">
                                            <i className="fa-solid fa-key text-[#fcd535] text-xl mb-2"></i>
                                            <h4 className="text-sm font-bold text-white">Reset Password</h4>
                                            <p className="text-[10px] text-[#848e9c] mt-1 group-hover:text-white">Send reset link to user email</p>
                                        </button>
                                        <button onClick={handleKillSessions} className="p-4 bg-[#161a1e] border border-[#3b414d] rounded-xl hover:border-[#f6465d] transition-all text-left group">
                                            <i className="fa-solid fa-right-from-bracket text-[#f6465d] text-xl mb-2"></i>
                                            <h4 className="text-sm font-bold text-white">Kill Sessions</h4>
                                            <p className="text-[10px] text-[#848e9c] mt-1 group-hover:text-white">Logout from all devices</p>
                                        </button>
                                        <button onClick={handleDisable2FA} className="p-4 bg-[#161a1e] border border-[#3b414d] rounded-xl hover:border-[#3b82f6] transition-all text-left group">
                                            <i className={`fa-solid fa-shield-halved ${user.twoFactorEnabled ? 'text-[#0ecb81]' : 'text-[#3b82f6]'} text-xl mb-2`}></i>
                                            <h4 className="text-sm font-bold text-white">{user.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}</h4>
                                            <p className="text-[10px] text-[#848e9c] mt-1 group-hover:text-white">{user.twoFactorEnabled ? 'Remove two-factor auth' : 'Turn on security'}</p>
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139]">
                                    <h3 className="text-sm font-bold text-white mb-4">Login Logs</h3>
                                    <div className="overflow-hidden rounded-lg border border-[#2b3139]">
                                        <table className="w-full text-left">
                                            <thead className="bg-[#2b3139]">
                                                <tr>
                                                    <th className="px-4 py-2 text-[10px] text-[#848e9c] font-bold uppercase">Action</th>
                                                    <th className="px-4 py-2 text-[10px] text-[#848e9c] font-bold uppercase">IP Address</th>
                                                    <th className="px-4 py-2 text-[10px] text-[#848e9c] font-bold uppercase">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#2b3139] bg-[#161a1e]">
                                                {user.activityLogs.map(log => (
                                                    <tr key={log.id}>
                                                        <td className="px-4 py-2 text-xs text-white">{log.action}</td>
                                                        <td className="px-4 py-2 text-xs text-[#848e9c] font-mono">{log.ip}</td>
                                                        <td className="px-4 py-2 text-xs text-[#555e70]">{new Date(log.timestamp).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'KYC' && (
                             <div className="space-y-6">
                                 <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139]">
                                     <div className="flex justify-between items-center mb-6">
                                         <h3 className="text-sm font-bold text-white">KYC Documents</h3>
                                         <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${user.kycStatus === 'VERIFIED' ? 'bg-[#0ecb81]/20 text-[#0ecb81]' : user.kycStatus === 'PENDING' ? 'bg-[#fcd535]/20 text-[#fcd535]' : 'bg-[#2b3139] text-[#848e9c]'}`}>{user.kycStatus}</span>
                                     </div>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <div 
                                            onClick={() => setPreviewImage('https://placehold.co/600x400/161a1e/FFF?text=Front+ID+Document')}
                                            className="aspect-video bg-[#161a1e] rounded-lg border border-[#2b3139] flex items-center justify-center text-[#474d57] flex-col relative group cursor-pointer hover:border-[#fcd535] transition-all"
                                         >
                                             <i className="fa-solid fa-id-card text-4xl mb-2 group-hover:scale-110 transition-transform"></i>
                                             <span className="text-xs font-bold">Front ID</span>
                                             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                 <span className="text-white text-xs font-bold">View Image</span>
                                             </div>
                                         </div>
                                         <div 
                                            onClick={() => setPreviewImage('https://placehold.co/600x400/161a1e/FFF?text=Back+ID+Document')}
                                            className="aspect-video bg-[#161a1e] rounded-lg border border-[#2b3139] flex items-center justify-center text-[#474d57] flex-col relative group cursor-pointer hover:border-[#fcd535] transition-all"
                                         >
                                             <i className="fa-solid fa-id-card text-4xl mb-2 group-hover:scale-110 transition-transform"></i>
                                             <span className="text-xs font-bold">Back ID</span>
                                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                 <span className="text-white text-xs font-bold">View Image</span>
                                             </div>
                                         </div>
                                     </div>
                                     <div className="flex gap-4 mt-6 pt-6 border-t border-[#2b3139]">
                                         <button onClick={async () => {
                                             try {
                                                 const mod = await import('../../supabaseClient');
                                                 const sessionRes = await mod.supabase.auth.getSession();
                                                 const token = (sessionRes as any)?.data?.session?.access_token;
                                                 const res = await fetch('/api/admin-kyc-review', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ userId: user.id, action: 'approve' }) });
                                                 const json = await res.json();
                                                 if (!res.ok) throw new Error(json.error || 'Failed');
                                                 onUpdate({ ...user, kycStatus: 'VERIFIED' });
                                                 notify.success('KYC approved');
                                             } catch (err: any) {
                                                 notify.error(err?.message || 'Failed to approve');
                                             }
                                         }} className="flex-1 bg-[#0ecb81] text-white py-3 rounded-lg text-sm font-bold hover:bg-[#0aa869] transition-all">APPROVE DOCUMENTS</button>
                                         <button onClick={async () => {
                                             const reason = prompt('Reason for rejection (optional)') || '';
                                             try {
                                                 const mod = await import('../../supabaseClient');
                                                 const sessionRes = await mod.supabase.auth.getSession();
                                                 const token = (sessionRes as any)?.data?.session?.access_token;
                                                 const res = await fetch('/api/admin-kyc-review', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ userId: user.id, action: 'reject', reason }) });
                                                 const json = await res.json();
                                                 if (!res.ok) throw new Error(json.error || 'Failed');
                                                 onUpdate({ ...user, kycStatus: 'REJECTED' });
                                                 notify.success('KYC rejected');
                                             } catch (err: any) {
                                                 notify.error(err?.message || 'Failed to reject');
                                             }
                                         }} className="flex-1 bg-[#f6465d] text-white py-3 rounded-lg text-sm font-bold hover:bg-[#e63737] transition-all">REJECT DOCUMENTS</button>
                                     </div>
                                 </div>
                             </div>
                        )}

                        {activeTab === 'NOTES' && (
                             <div className="space-y-6">
                                 <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139] flex flex-col h-[600px]">
                                     <h3 className="text-sm font-bold text-white mb-4">Internal Notes</h3>
                                     <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-4 pr-2">
                                         {user.adminNotes.length > 0 ? user.adminNotes.map(note => (
                                             <div key={note.id} className="flex flex-col items-end">
                                                 <div className="bg-[#fcd535]/10 border border-[#fcd535]/20 p-3 rounded-l-xl rounded-tr-xl max-w-[80%]">
                                                     <p className="text-sm text-white">{note.content}</p>
                                                 </div>
                                                 <span className="text-[10px] text-[#848e9c] mt-1 mr-1">{note.author} • {new Date(note.date).toLocaleString()}</span>
                                             </div>
                                         )) : (
                                             <div className="h-full flex flex-col items-center justify-center text-[#474d57]">
                                                 <i className="fa-regular fa-clipboard text-4xl mb-2"></i>
                                                 <p className="text-xs">No notes yet</p>
                                             </div>
                                         )}
                                     </div>
                                     <div className="flex gap-3 pt-4 border-t border-[#2b3139]">
                                         <input 
                                            type="text" 
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="Write a note about this user..."
                                            className="flex-1 bg-[#161a1e] border border-[#3b414d] rounded-lg px-4 py-3 text-sm text-white focus:border-[#fcd535] outline-none"
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                         />
                                         <button onClick={handleAddNote} className="px-6 bg-[#fcd535] text-black rounded-lg font-bold text-sm hover:bg-[#ffe252]">SEND</button>
                                     </div>
                                 </div>
                             </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailView;
