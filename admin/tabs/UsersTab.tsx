
import React from 'react';
import { notify } from '../../shared/notify';
import { User, AdminThemeSettings } from '../../shared/types.ts';

interface UsersTabProps {
    users: User[];
    onSelectUser: (user: User) => void;
    setUsers: (users: User[]) => void; // Used for inline toggle if needed
}

const UsersTab: React.FC<UsersTabProps & { theme?: AdminThemeSettings }> = ({ users, onSelectUser, setUsers, theme }) => {
    const isLight = theme?.mode === 'LIGHT';
    const cardBg = isLight ? '#ffffff' : '#1e2329';
    const subtleBg = isLight ? '#f9fafb' : '#1e2329';
    const borderColor = isLight ? '#e5e7eb' : '#2b3139';
    const headerBg = isLight ? '#f9fafb' : '#2b3139';
    const headerTextColor = isLight ? '#4b5563' : '#848e9c';
    const dividerColor = isLight ? '#e5e7eb' : '#2b3139';
    const rowHoverClass = isLight ? 'hover:bg-[#f3f4f6]' : 'hover:bg-[#2b3139]/50';
    return (
        <div className="space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border flex flex-col justify-center" style={{ backgroundColor: cardBg, borderColor }}>
                    <span className="text-[10px] text-[#848e9c] font-bold uppercase tracking-widest">Total Users</span>
                    <div className="flex items-center justify-between mt-1">
                        <span className={`text-2xl font-black ${isLight ? 'text-[#111827]' : 'text-white'}`}>{users.length}</span>
                        <i className="fa-solid fa-users text-[#3b82f6] text-xl opacity-50"></i>
                    </div>
                </div>
                <div className="p-4 rounded-xl border flex flex-col justify-center" style={{ backgroundColor: cardBg, borderColor }}>
                    <span className="text-[10px] text-[#848e9c] font-bold uppercase tracking-widest">Active Now</span>
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-2xl font-black text-[#0ecb81]">{users.filter(u => u.status === 'ACTIVE').length}</span>
                        <i className="fa-solid fa-bolt text-[#0ecb81] text-xl opacity-50"></i>
                    </div>
                </div>
                <div className="p-4 rounded-xl border flex flex-col justify-center" style={{ backgroundColor: cardBg, borderColor }}>
                    <span className="text-[10px] text-[#848e9c] font-bold uppercase tracking-widest">KYC Verified</span>
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-2xl font-black text-[#fcd535]">{users.filter(u => u.kycStatus === 'VERIFIED').length}</span>
                        <i className="fa-solid fa-shield-halved text-[#fcd535] text-xl opacity-50"></i>
                    </div>
                </div>
                <div className="p-4 rounded-xl border flex flex-col justify-center" style={{ backgroundColor: cardBg, borderColor }}>
                    <span className="text-[10px] text-[#848e9c] font-bold uppercase tracking-widest">High Risk</span>
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-2xl font-black text-[#f6465d]">{users.filter(u => u.riskLabel === 'HIGH_RISK').length}</span>
                        <i className="fa-solid fa-triangle-exclamation text-[#f6465d] text-xl opacity-50"></i>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: cardBg, borderColor }}>
                <div className="p-4 border-b flex justify-between items-center" style={{ backgroundColor: subtleBg, borderColor }}>
                    <h3 className={`text-sm font-bold uppercase tracking-wide ${isLight ? 'text-[#111827]' : 'text-white'}`}>User Database</h3>
                    <button className="bg-[#0ecb81] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-[#0aa869]"><i className="fa-solid fa-plus mr-2"></i>Add User</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs uppercase font-bold" style={{ backgroundColor: headerBg, color: headerTextColor }}>
                            <tr>
                                <th className="px-4 py-3">Identity</th>
                                <th className="px-4 py-3">Live Balance</th>
                                <th className="px-4 py-3">KYC</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 hidden md:table-cell">Country & IP</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: dividerColor }}>
                            {users.map(u => (
                                <tr key={u.id} className={`group transition-colors ${rowHoverClass}`}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-[#3b82f6]/20 text-[#3b82f6] flex items-center justify-center font-bold text-xs">{u.name.charAt(0)}</div>
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-bold flex items-center ${isLight ? 'text-[#111827]' : 'text-white'}`}>
                                                    {u.name}
                                                    {u.riskLabel === 'VIP' && <i className="fa-solid fa-crown text-[#fcd535] ml-2 text-[10px]"></i>}
                                                </span>
                                                <span className="text-[10px] text-[#848e9c]">{u.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-mono text-[#0ecb81] font-bold">${u.balance.toFixed(2)}</span>
                                            <span className={`text-[10px] font-bold ${u.netPnL >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>PnL: {u.netPnL >= 0 ? '+' : ''}{u.netPnL}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[9px] font-bold px-2 py-1 rounded border ${u.kycStatus === 'VERIFIED' ? 'border-[#0ecb81] text-[#0ecb81]' : u.kycStatus === 'PENDING' ? 'border-[#fcd535] text-[#fcd535]' : 'border-[#474d57] text-[#848e9c]'}`}>
                                            {u.kycStatus}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[9px] font-bold px-2 py-1 rounded ${u.status === 'ACTIVE' ? 'bg-[#0ecb81]/10 text-[#0ecb81]' : 'bg-[#f6465d]/10 text-[#f6465d]'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <div className="flex flex-col">
                                            <div className="flex items-center space-x-2">
                                                <img src={`https://flagcdn.com/24x18/${u.country === 'Bangladesh' ? 'bd' : 'us'}.png`} alt="flag" className="w-4 h-3 rounded-[2px]" />
                                                <span className={`text-xs ${isLight ? 'text-[#4b5563]' : 'text-[#ccddbb]'}`}>{u.country}</span>
                                            </div>
                                            <span className="text-[10px] text-[#848e9c] font-mono mt-0.5">{u.ipAddress}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => onSelectUser(u)} className="w-7 h-7 rounded bg-[#2b3139] text-[#3b82f6] hover:bg-[#3b82f6] hover:text-white flex items-center justify-center transition-colors" title="Edit User">
                                                <i className="fa-solid fa-pen-to-square text-xs"></i>
                                            </button>
                                            <button onClick={() => setUsers(users.map(user => user.id === u.id ? {...u, status: u.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'} : user))} className={`w-7 h-7 rounded bg-[#2b3139] hover:text-white flex items-center justify-center transition-colors ${u.status === 'ACTIVE' ? 'text-[#f6465d] hover:bg-[#f6465d]' : 'text-[#0ecb81] hover:bg-[#0ecb81]'}`} title={u.status === 'ACTIVE' ? 'Ban User' : 'Unban User'}>
                                                <i className={`fa-solid ${u.status === 'ACTIVE' ? 'fa-ban' : 'fa-check'} text-xs`}></i>
                                            </button>
                                            <button onClick={async () => { const ok = await (await import('../../shared/confirm')).confirm(`Login as ${u.name}?`); if (ok) notify.info(`Logging in as ${u.name}...`); }} className="w-7 h-7 rounded bg-[#2b3139] text-[#848e9c] hover:bg-[#fcd535] hover:text-black flex items-center justify-center transition-colors" title="Login as User">
                                                <i className="fa-solid fa-right-to-bracket text-xs"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t flex justify-between items-center text-[#848e9c] text-xs" style={{ backgroundColor: subtleBg, borderColor }}>
                     <span>Showing {users.length} users</span>
                     <div className="flex space-x-2">
                         <button className="px-3 py-1 rounded hover:text-white disabled:opacity-50" style={{ backgroundColor: isLight ? '#e5e7eb' : '#2b3139' }}>Prev</button>
                         <button className="px-3 py-1 rounded hover:text-white" style={{ backgroundColor: isLight ? '#e5e7eb' : '#2b3139' }}>Next</button>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default UsersTab;
