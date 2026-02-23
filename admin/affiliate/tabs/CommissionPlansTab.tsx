import React, { useState } from 'react';
import { CommissionPlan, CommissionGroup, CommissionHistoryEntry } from '../types';
import type { User, AdminThemeSettings } from '../../../shared/types';

interface CommissionPlansTabProps {
  users: User[];
  commissionPlans: CommissionPlan[];
  setCommissionPlans: (plans: CommissionPlan[]) => void;
  commissionGroups: CommissionGroup[];
  setCommissionGroups: (groups: CommissionGroup[]) => void;
  commissionHistory: CommissionHistoryEntry[];
  theme?: AdminThemeSettings;
}

const CommissionPlansTab: React.FC<CommissionPlansTabProps> = (props) => {
  // Inject demo data if empty
  let {
    users,
    commissionPlans,
    setCommissionPlans,
    commissionGroups,
    setCommissionGroups,
    commissionHistory,
    theme,
  } = props;

  // Demo data
  if (!users || users.length === 0) {
    users = [
      { id: 'u1', name: 'Alice Smith', email: 'alice@example.com' },
      { id: 'u2', name: 'Bob Lee', email: 'bob@example.com' },
      { id: 'u3', name: 'Charlie Kim', email: 'charlie@example.com' },
    ];
  }
  if (!commissionGroups || commissionGroups.length === 0) {
    commissionGroups = [
      { id: 'g1', name: 'Bronze', commissionRate: 5, minReferrals: 0, minVolume: 0, minDeposits: 0, isDefault: true, description: 'Entry level' },
      { id: 'g2', name: 'Silver', commissionRate: 10, minReferrals: 10, minVolume: 1000, minDeposits: 5, isDefault: false, description: 'Mid tier' },
      { id: 'g3', name: 'Gold', commissionRate: 15, minReferrals: 25, minVolume: 5000, minDeposits: 10, isDefault: false, description: 'Top tier' },
    ];
  }
  if (!commissionPlans || commissionPlans.length === 0) {
    commissionPlans = [
      { id: 'p1', name: 'Promo for Alice', userId: 'u1', promoRate: 12, promoStart: Date.now() - 86400000 * 10, promoEnd: Date.now() + 86400000 * 10, isActive: true },
      { id: 'p2', name: 'Promo for Bob', userId: 'u2', promoRate: 8, promoStart: Date.now() - 86400000 * 5, promoEnd: Date.now() + 86400000 * 5, isActive: false },
    ];
  }
  if (!commissionHistory || commissionHistory.length === 0) {
    commissionHistory = [
      { id: 'h1', userId: 'u1', groupId: 'g1', customRate: 5, promo: '', amount: 120.5, status: 'PAID', createdAt: Date.now() - 86400000 * 30, paidAt: Date.now() - 86400000 * 25 },
      { id: 'h2', userId: 'u2', groupId: 'g2', customRate: 10, promo: 'Spring', amount: 300, status: 'PENDING', createdAt: Date.now() - 86400000 * 10, paidAt: undefined },
      { id: 'h3', userId: 'u3', groupId: 'g3', customRate: 15, promo: 'VIP', amount: 800, status: 'HOLD', createdAt: Date.now() - 86400000 * 5, paidAt: undefined },
    ];
  }
  // Tab state
  const [activeTab, setActiveTab] = useState<'GROUPS' | 'PROMO' | 'HISTORY'>('GROUPS');

  // Group add/edit state
  const [newGroup, setNewGroup] = useState<Partial<CommissionGroup>>({ name: '', commissionRate: 0 });
  const [editGroupId, setEditGroupId] = useState<string | null>(null);
  const [editGroup, setEditGroup] = useState<Partial<CommissionGroup>>({});
  const [groupError, setGroupError] = useState<string>('');

  // Promo add/edit state
  const [newPromo, setNewPromo] = useState<{ userId?: string; promoRate?: number; promoStart?: string; promoEnd?: string }>({});
  const [promoError, setPromoError] = useState<string>('');

  // History filter/search state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterUser, setFilterUser] = useState('');

  // Groups Table Rows
  const groupRows = commissionGroups.map(g => ({
    id: g.id,
    name: g.name,
    commissionRate: g.commissionRate,
    minReferrals: g.minReferrals,
    minVolume: g.minVolume,
    minDeposits: g.minDeposits,
    isDefault: g.isDefault,
    description: g.description,
    group: g,
  }));

  // Promo Table Rows
  const promoRows = commissionPlans.filter(p => p.userId).map(p => ({
    id: p.id,
    userId: p.userId,
    userName: users.find(u => u.id === p.userId)?.name || p.userId,
    promoRate: p.promoRate,
    promoStart: p.promoStart,
    promoEnd: p.promoEnd,
    isActive: p.isActive,
    promo: p,
  }));

  // Commission History Table Rows
  let historyRows = commissionHistory.map(row => {
    const affiliateName = users.find(u => u.id === row.userId)?.name || row.userId;
    const groupName = commissionGroups.find(g => g.id === row.groupId)?.name || '-';
    return {
      ...row,
      affiliateName,
      groupName,
      createdAtStr: row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-',
      paidAtStr: row.paidAt ? new Date(row.paidAt).toLocaleDateString() : '-',
    };
  });
  // Filter/search for history
  historyRows = historyRows.filter(row => {
    if (filterStatus && row.status !== filterStatus) return false;
    if (filterGroup && row.groupId !== filterGroup) return false;
    if (filterUser && row.userId !== filterUser) return false;
    if (search) {
      if (
        !String(row.affiliateName).toLowerCase().includes(search.toLowerCase()) &&
        !String(row.groupName).toLowerCase().includes(search.toLowerCase()) &&
        !String(row.status).toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
    }
    return true;
  });

  // Add new group
  const handleAddGroup = () => {
    if (!newGroup.name || !newGroup.commissionRate) {
      setGroupError('গ্রুপের নাম ও কমিশন রেট দিন');
      return;
    }
    setCommissionGroups(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newGroup.name!,
        commissionRate: Number(newGroup.commissionRate),
        description: newGroup.description || '',
        minReferrals: Number(newGroup.minReferrals) || 0,
        minVolume: Number(newGroup.minVolume) || 0,
        minDeposits: Number(newGroup.minDeposits) || 0,
        isDefault: !!newGroup.isDefault,
      }
    ]);
    setNewGroup({ name: '', commissionRate: 0 });
    setGroupError('');
  };

  // Add new promo
  const handleAddPromo = () => {
    if (!newPromo.userId || !newPromo.promoRate) {
      setPromoError('অ্যাফিলিয়েট ও কাস্টম রেট দিন');
      return;
    }
    setCommissionPlans(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: `Override for ${users.find(u => u.id === newPromo.userId)?.name || ''}`,
        userId: newPromo.userId,
        promoRate: Number(newPromo.promoRate),
        promoStart: newPromo.promoStart ? new Date(newPromo.promoStart).getTime() : undefined,
        promoEnd: newPromo.promoEnd ? new Date(newPromo.promoEnd).getTime() : undefined,
        isActive: true,
      }
    ]);
    setNewPromo({});
    setPromoError('');
  };

  // Edit group
  const handleEditGroup = (group: CommissionGroup) => {
    setEditGroupId(group.id);
    setEditGroup({ ...group });
    setError('');
  };
  const handleSaveEditGroup = () => {
    if (!editGroup.name || !editGroup.commissionRate) {
      setError('গ্রুপের নাম ও কমিশন রেট দিন');
      return;
    }
    setCommissionGroups(prev => prev.map(g => g.id === editGroupId ? { ...g, ...editGroup, commissionRate: Number(editGroup.commissionRate) } : g));
    setEditGroupId(null);
    setEditGroup({});
    setError('');
  };
  const handleDeleteGroup = (id: string) => {
    setCommissionGroups(prev => prev.filter(g => g.id !== id));
    if (editGroupId === id) setEditGroupId(null);
  };

  return (
    <div className="rounded-lg border bg-white p-6 text-gray-800 shadow">
      <h1 className="text-2xl font-bold mb-6">Commission Management</h1>
      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6">
        <button className={`px-4 py-2 rounded-t-lg font-semibold text-xs uppercase tracking-wider border-b-2 ${activeTab === 'GROUPS' ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 bg-gray-100 hover:bg-blue-50'}`} onClick={() => setActiveTab('GROUPS')}>Groups</button>
        <button className={`px-4 py-2 rounded-t-lg font-semibold text-xs uppercase tracking-wider border-b-2 ${activeTab === 'PROMO' ? 'border-green-600 text-green-700 bg-green-50' : 'border-transparent text-gray-500 bg-gray-100 hover:bg-green-50'}`} onClick={() => setActiveTab('PROMO')}>Promo/Override</button>
        <button className={`px-4 py-2 rounded-t-lg font-semibold text-xs uppercase tracking-wider border-b-2 ${activeTab === 'HISTORY' ? 'border-yellow-600 text-yellow-700 bg-yellow-50' : 'border-transparent text-gray-500 bg-gray-100 hover:bg-yellow-50'}`} onClick={() => setActiveTab('HISTORY')}>Commission History</button>
      </div>

      {/* Groups Tab */}
      {activeTab === 'GROUPS' && (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full text-sm bg-white">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-blue-100 text-gray-800">
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Rate (%)</th>
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Min Referrals</th>
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Min Volume</th>
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Min Deposits</th>
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Default</th>
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Actions</th>
              </tr>
              <tr className="bg-blue-50">
                <td className="border px-2 py-1"><input type="text" className="border rounded px-2 py-1 text-xs w-24" placeholder="Group Name" value={newGroup.name || ''} onChange={e => setNewGroup(g => ({ ...g, name: e.target.value }))} /></td>
                <td className="border px-2 py-1"><input type="number" className="border rounded px-2 py-1 text-xs w-16" placeholder="Rate" value={newGroup.commissionRate || ''} onChange={e => setNewGroup(g => ({ ...g, commissionRate: Number(e.target.value) }))} min={0} max={100} /></td>
                <td className="border px-2 py-1"><input type="number" className="border rounded px-2 py-1 text-xs w-16" placeholder="Min Ref" value={newGroup.minReferrals || ''} onChange={e => setNewGroup(g => ({ ...g, minReferrals: Number(e.target.value) }))} min={0} /></td>
                <td className="border px-2 py-1"><input type="number" className="border rounded px-2 py-1 text-xs w-16" placeholder="Min Vol" value={newGroup.minVolume || ''} onChange={e => setNewGroup(g => ({ ...g, minVolume: Number(e.target.value) }))} min={0} /></td>
                <td className="border px-2 py-1"><input type="number" className="border rounded px-2 py-1 text-xs w-16" placeholder="Min Dep" value={newGroup.minDeposits || ''} onChange={e => setNewGroup(g => ({ ...g, minDeposits: Number(e.target.value) }))} min={0} /></td>
                <td className="border px-2 py-1 text-center"><input type="checkbox" checked={!!newGroup.isDefault} onChange={e => setNewGroup(g => ({ ...g, isDefault: e.target.checked }))} /></td>
                <td className="border px-2 py-1"><button className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs" onClick={handleAddGroup}>Add</button></td>
              </tr>
            </thead>
            <tbody>
              {groupError && <tr><td colSpan={7} className="text-red-500 text-xs px-2 py-1">{groupError}</td></tr>}
              {groupRows.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-400 py-4">No groups configured yet.</td></tr>
              )}
              {groupRows.map(row => (
                <tr key={row.id} className="bg-yellow-50">
                  <td className="border px-2 py-1">{row.name}</td>
                  <td className="border px-2 py-1">{row.commissionRate}</td>
                  <td className="border px-2 py-1">{row.minReferrals || 0}</td>
                  <td className="border px-2 py-1">{row.minVolume || 0}</td>
                  <td className="border px-2 py-1">{row.minDeposits || 0}</td>
                  <td className="border px-2 py-1 text-center">{row.isDefault ? '✔️' : ''}</td>
                  <td className="border px-2 py-1">
                    <button className="bg-yellow-400 text-white px-2 py-0.5 rounded text-xs mr-1" onClick={() => handleEditGroup(row.group)}>Edit</button>
                    <button className="bg-red-500 text-white px-2 py-0.5 rounded text-xs" onClick={() => handleDeleteGroup(row.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Promo/Override Tab */}
      {activeTab === 'PROMO' && (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full text-sm bg-white">
            <thead>
              <tr className="bg-gradient-to-r from-green-50 to-green-100 text-gray-800">
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Affiliate</th>
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Custom Rate</th>
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Promo Start</th>
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Promo End</th>
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Actions</th>
              </tr>
              <tr className="bg-green-50">
                <td className="border px-2 py-1">
                  <select className="border rounded px-2 py-1 text-xs w-full" value={newPromo.userId || ''} onChange={e => setNewPromo(p => ({ ...p, userId: e.target.value }))}>
                    <option value="">Select user</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                </td>
                <td className="border px-2 py-1"><input type="number" className="border rounded px-2 py-1 text-xs w-20" placeholder="Rate" value={newPromo.promoRate || ''} onChange={e => setNewPromo(p => ({ ...p, promoRate: Number(e.target.value) }))} min={0} max={100} /></td>
                <td className="border px-2 py-1"><input type="date" className="border rounded px-2 py-1 text-xs" value={newPromo.promoStart || ''} onChange={e => setNewPromo(p => ({ ...p, promoStart: e.target.value }))} /></td>
                <td className="border px-2 py-1"><input type="date" className="border rounded px-2 py-1 text-xs" value={newPromo.promoEnd || ''} onChange={e => setNewPromo(p => ({ ...p, promoEnd: e.target.value }))} /></td>
                <td className="border px-2 py-1">-</td>
                <td className="border px-2 py-1"><button className="bg-green-600 text-white px-2 py-0.5 rounded text-xs" onClick={handleAddPromo}>Add</button></td>
              </tr>
            </thead>
            <tbody>
              {promoError && <tr><td colSpan={6} className="text-red-500 text-xs px-2 py-1">{promoError}</td></tr>}
              {promoRows.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-400 py-4">No promos configured yet.</td></tr>
              )}
              {promoRows.map(row => (
                <tr key={row.id} className="bg-green-50">
                  <td className="border px-2 py-1">{row.userName}</td>
                  <td className="border px-2 py-1">{row.promoRate ? `${row.promoRate}%` : '-'}</td>
                  <td className="border px-2 py-1">{row.promoStart ? new Date(row.promoStart).toLocaleDateString() : '-'}</td>
                  <td className="border px-2 py-1">{row.promoEnd ? new Date(row.promoEnd).toLocaleDateString() : '-'}</td>
                  <td className="border px-2 py-1">{row.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="border px-2 py-1">
                    <button className="bg-red-500 text-white px-2 py-0.5 rounded text-xs" onClick={() => setCommissionPlans(prev => prev.filter(p => p.id !== row.id))}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Commission History Tab */}
      {activeTab === 'HISTORY' && (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full text-sm bg-white">
            <thead>
              <tr className="bg-gradient-to-r from-yellow-50 to-yellow-100 text-gray-800">
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Affiliate</th>
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Group</th>
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Custom Rate</th>
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Promo</th>
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Commission Amount</th>
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Paid</th>
                <th className="px-4 py-3 border-b font-semibold text-xs uppercase tracking-wider">Actions</th>
              </tr>
              <tr className="bg-yellow-50">
                <td className="px-2 py-2">
                  <select className="border rounded px-2 py-1 text-xs w-full" value={filterUser} onChange={e => setFilterUser(e.target.value)}>
                    <option value="">All</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </td>
                <td className="px-2 py-2">
                  <select className="border rounded px-2 py-1 text-xs w-full" value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
                    <option value="">All</option>
                    {commissionGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2">
                  <input type="text" className="border rounded px-2 py-1 text-xs w-full" placeholder="Search promo..." value={search} onChange={e => setSearch(e.target.value)} />
                </td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2">
                  <select className="border rounded px-2 py-1 text-xs w-full" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All</option>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="HOLD">Hold</option>
                  </select>
                </td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
              </tr>
            </thead>
            <tbody>
              {historyRows.length === 0 && (
                <tr><td colSpan={9} className="text-center text-gray-400 py-4">No commission records found.</td></tr>
              )}
              {historyRows.map(row => (
                <tr key={row.id} className="bg-yellow-50">
                  <td className="border px-2 py-1">{row.affiliateName}</td>
                  <td className="border px-2 py-1">{row.groupName}</td>
                  <td className="border px-2 py-1">{row.customRate ? `${row.customRate}%` : '-'}</td>
                  <td className="border px-2 py-1">{row.promo ? row.promo : '-'}</td>
                  <td className="border px-2 py-1">${row.amount.toFixed(2)}</td>
                  <td className="border px-2 py-1">{row.status}</td>
                  <td className="border px-2 py-1">{row.createdAtStr}</td>
                  <td className="border px-2 py-1">{row.paidAtStr}</td>
                  <td className="border px-2 py-1">
                    <button className="bg-emerald-600 text-white px-2 py-0.5 rounded text-xs mr-1">Approve</button>
                    <button className="bg-yellow-400 text-white px-2 py-0.5 rounded text-xs mr-1">Hold</button>
                    <button className="bg-slate-300 text-gray-700 px-2 py-0.5 rounded text-xs mr-1">Edit</button>
                    <button className="bg-red-500 text-white px-2 py-0.5 rounded text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CommissionPlansTab;
