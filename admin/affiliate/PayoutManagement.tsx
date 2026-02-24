import React, { useMemo, useState } from 'react';

type PayoutStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED' | 'FAILED' | 'SCHEDULED';

type PayoutRequest = {
	id: string;
	affiliateId: string;
	affiliateName: string;
	method: string;
	amount: number;
	fee: number;
	net: number;
	status: PayoutStatus;
	requestedAt: number;
	paidAt?: number;
	note?: string;
	history?: { ts: number; action: string; by?: string }[];
	scheduled?: boolean;
};

const demoPayouts: PayoutRequest[] = [
	{ id: 'pr1', affiliateId: 'u1', affiliateName: 'Alice Smith', method: 'Bank Transfer', amount: 1200, fee: 12, net: 1188, status: 'PENDING', requestedAt: Date.now() - 1000 * 60 * 60 * 24 * 5, history: [{ ts: Date.now() - 1000 * 60 * 60 * 24 * 5, action: 'Requested' }] },
	{ id: 'pr2', affiliateId: 'u2', affiliateName: 'Bob Lee', method: 'PayPal', amount: 300, fee: 3, net: 297, status: 'APPROVED', requestedAt: Date.now() - 1000 * 60 * 60 * 24 * 3, history: [{ ts: Date.now() - 1000 * 60 * 60 * 24 * 3, action: 'Requested' }, { ts: Date.now() - 1000 * 60 * 60 * 24 * 2, action: 'Approved' }] },
	{ id: 'pr3', affiliateId: 'u3', affiliateName: 'Charlie Kim', method: 'E-Wallet', amount: 850, fee: 8.5, net: 841.5, status: 'PAID', requestedAt: Date.now() - 1000 * 60 * 60 * 24 * 15, paidAt: Date.now() - 1000 * 60 * 60 * 24 * 10, history: [{ ts: Date.now() - 1000 * 60 * 60 * 24 * 15, action: 'Requested' }, { ts: Date.now() - 1000 * 60 * 60 * 24 * 12, action: 'Approved' }, { ts: Date.now() - 1000 * 60 * 60 * 24 * 10, action: 'Paid' }] },
];

const currency = (n: number) => `$${n.toFixed(2)}`;

const PayoutManagement: React.FC = () => {
	const [requests, setRequests] = useState<PayoutRequest[]>(demoPayouts);
	const [search, setSearch] = useState('');
	const [filterStatus, setFilterStatus] = useState<string>('');
	const [filterMethod, setFilterMethod] = useState<string>('');
	const [selected, setSelected] = useState<Record<string, boolean>>({});
	const [showHistoryFor, setShowHistoryFor] = useState<string | null>(null);
	const [notification, setNotification] = useState<string | null>(null);

	// Methods config (dynamic)
	const [methodsConfig, setMethodsConfig] = useState<string[]>(() => Array.from(new Set(demoPayouts.map(r => r.method))));
	const [showMethodModal, setShowMethodModal] = useState(false);
	const [newMethodName, setNewMethodName] = useState('');

	// CSV import state
	const [importing, setImporting] = useState(false);

	// Audit logs
	const [auditLogs, setAuditLogs] = useState<{ ts: number; action: string; ids?: string[]; by?: string }[]>([]);

	const pushAudit = (action: string, ids?: string[]) => {
		const entry = { ts: Date.now(), action, ids, by: 'admin' };
		setAuditLogs(prev => [entry, ...prev].slice(0, 500));
	};

	const totals = useMemo(() => {
		const totalAmount = requests.reduce((s, r) => s + r.amount, 0);
		const pending = requests.filter(r => r.status === 'PENDING').length;
		const paid = requests.filter(r => r.status === 'PAID').length;
		const failed = requests.filter(r => r.status === 'FAILED' || r.status === 'REJECTED').length;
		return { totalAmount, pending, paid, failed };
	}, [requests]);

	// use configured methods list
	const methods = methodsConfig;

	const visible = requests.filter(r => {
		if (filterStatus && r.status !== filterStatus) return false;
		if (filterMethod && r.method !== filterMethod) return false;
		if (search) {
			const s = search.toLowerCase();
			if (!r.affiliateName.toLowerCase().includes(s) && !r.id.toLowerCase().includes(s)) return false;
		}
		return true;
	});

	const toggleSelect = (id: string) => setSelected(prev => ({ ...prev, [id]: !prev[id] }));

	const performAction = (ids: string[], action: 'APPROVE' | 'REJECT' | 'MARK_PAID' | 'SCHEDULE') => {
		setRequests(prev => prev.map(r => {
			if (!ids.includes(r.id)) return r;
			const copy = { ...r };
			const ts = Date.now();
			copy.history = copy.history ? [...copy.history] : [];
			if (action === 'APPROVE') { copy.status = 'APPROVED'; copy.history.push({ ts, action: 'Approved' }); }
			if (action === 'REJECT') { copy.status = 'REJECTED'; copy.history.push({ ts, action: 'Rejected' }); }
			if (action === 'MARK_PAID') { copy.status = 'PAID'; copy.paidAt = ts; copy.history.push({ ts, action: 'Paid' }); }
			if (action === 'SCHEDULE') { copy.status = 'SCHEDULED'; copy.scheduled = true; copy.history.push({ ts, action: 'Scheduled' }); }
			return copy;
		}));
		// clear selection for performed ids
		setSelected(prev => {
			const next = { ...prev };
			ids.forEach(id => delete next[id]);
			return next;
		});
		// audit + notification
		pushAudit(action, ids);
		setNotification(`${action} applied to ${ids.length} request(s)`);
		setTimeout(() => setNotification(null), 2500);
	};

	const exportCSV = (list: PayoutRequest[]) => {
		const header = ['id', 'affiliate', 'method', 'amount', 'fee', 'net', 'status', 'requestedAt', 'paidAt'];
		const lines = [header.join(',')];
		list.forEach(r => {
			lines.push([
				r.id,
				`"${r.affiliateName}"`,
				r.method,
				String(r.amount),
				String(r.fee),
				String(r.net),
				r.status,
				new Date(r.requestedAt).toISOString(),
				r.paidAt ? new Date(r.paidAt).toISOString() : '',
			].join(','));
		});
		const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = 'payout-requests.csv'; a.click(); URL.revokeObjectURL(url);
	};

	// CSV upload handler (simple parser)
	const handleCSVFile = (file?: File) => {
		if (!file) return;
		setImporting(true);
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const text = String(reader.result || '');
				const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
				const header = lines.shift()?.split(',').map(h => h.trim().toLowerCase()) || [];
				const created: PayoutRequest[] = lines.map((ln, idx) => {
					const cols = ln.split(',').map(c => c.trim());
					const obj: any = {};
					header.forEach((h, i) => obj[h] = cols[i]);
					const amount = Number(obj.amount || obj.amt || 0);
					const fee = Number(obj.fee || 0);
					const req: PayoutRequest = {
						id: 'imp-' + Date.now() + '-' + idx,
						affiliateId: obj.affiliateId || 'unknown',
						affiliateName: obj.affiliate || obj.name || 'Unknown',
						method: obj.method || methodsConfig[0] || 'Bank Transfer',
						amount,
						fee,
						net: Math.max(0, amount - fee),
						status: 'PENDING',
						requestedAt: Date.now(),
						history: [{ ts: Date.now(), action: 'Imported' }],
					};
					return req;
				});
				setRequests(prev => [...created, ...prev]);
				pushAudit('CSV Import', created.map(c => c.id));
				setNotification(`Imported ${created.length} payout(s)`);
			} catch (e) {
				console.error(e);
				setNotification('Import failed');
			} finally {
				setImporting(false);
				setTimeout(() => setNotification(null), 2500);
			}
		};
		reader.readAsText(file);
	};

	const addMethod = (name: string) => {
		if (!name) return;
		setMethodsConfig(prev => Array.from(new Set([name, ...prev])));
		setNewMethodName('');
		setShowMethodModal(false);
		pushAudit('Method Added', undefined);
		setNotification(`Method '${name}' added`);
		setTimeout(() => setNotification(null), 2000);
	};

	const bulkSelectedIds = Object.keys(selected).filter(k => selected[k]);

	return (
		<div className="rounded-lg border bg-white p-6 text-gray-800 shadow">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Payout Management</h1>
				<div className="flex items-center space-x-2">
					<button className="text-xs px-3 py-1 border rounded" onClick={() => exportCSV(visible)}>Export Visible CSV</button>
					<button className="text-xs px-3 py-1 bg-blue-600 text-white rounded" onClick={() => exportCSV(requests)}>Export All CSV</button>
				</div>
			</div>

			{/* Summary */}
			<div className="grid grid-cols-4 gap-4 mb-6">
				<div className="p-4 border rounded bg-blue-50">
					<div className="text-xs text-gray-600">Total Amount</div>
					<div className="text-lg font-semibold">{currency(totals.totalAmount)}</div>
				</div>
				<div className="p-4 border rounded bg-yellow-50">
					<div className="text-xs text-gray-600">Pending</div>
					<div className="text-lg font-semibold">{totals.pending}</div>
				</div>
				<div className="p-4 border rounded bg-emerald-50">
					<div className="text-xs text-gray-600">Paid</div>
					<div className="text-lg font-semibold">{totals.paid}</div>
				</div>
				<div className="p-4 border rounded bg-red-50">
					<div className="text-xs text-gray-600">Failed/Rejected</div>
					<div className="text-lg font-semibold">{totals.failed}</div>
				</div>
			</div>

			{/* Controls */}
			<div className="flex items-center space-x-3 mb-4">
				<input placeholder="Search affiliate or id" className="border rounded px-2 py-1 text-sm w-64" value={search} onChange={e => setSearch(e.target.value)} />
				<select className="border rounded px-2 py-1 text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
					<option value="">All Status</option>
					<option value="PENDING">Pending</option>
					<option value="APPROVED">Approved</option>
					<option value="PAID">Paid</option>
					<option value="REJECTED">Rejected</option>
					<option value="FAILED">Failed</option>
				</select>
				<select className="border rounded px-2 py-1 text-sm" value={filterMethod} onChange={e => setFilterMethod(e.target.value)}>
					<option value="">All Methods</option>
					{methods.map(m => <option key={m} value={m}>{m}</option>)}
				</select>

				<div className="ml-auto flex items-center space-x-2">
					<label className="text-xs px-3 py-1 border rounded cursor-pointer">
						{importing ? 'Importing...' : 'Import CSV'}
						<input type="file" accept=".csv" className="hidden" onChange={e => handleCSVFile(e.target.files ? e.target.files[0] : undefined)} />
					</label>
					<button onClick={() => setShowMethodModal(true)} className="text-xs px-3 py-1 border rounded">Methods</button>
					<button disabled={bulkSelectedIds.length===0} onClick={() => performAction(bulkSelectedIds, 'APPROVE')} className="text-xs px-3 py-1 bg-yellow-400 text-white rounded disabled:opacity-50">Bulk Approve</button>
					<button disabled={bulkSelectedIds.length===0} onClick={() => performAction(bulkSelectedIds, 'MARK_PAID')} className="text-xs px-3 py-1 bg-emerald-600 text-white rounded disabled:opacity-50">Bulk Mark Paid</button>
					<button disabled={bulkSelectedIds.length===0} onClick={() => exportCSV(requests.filter(r => bulkSelectedIds.includes(r.id)))} className="text-xs px-3 py-1 border rounded disabled:opacity-50">Export Selected</button>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto rounded-lg shadow border border-gray-200">
				<table className="min-w-full text-sm bg-white">
					<thead>
						<tr className="bg-gray-50 text-gray-700">
							<th className="px-3 py-2 border-b"><input type="checkbox" onChange={e => {
								const checked = e.target.checked;
								const visIds = visible.map(v => v.id);
								setSelected(prev => {
									const next = { ...prev };
									visIds.forEach(id => next[id] = checked);
									return next;
								});
							}} /></th>
							<th className="px-3 py-2 border-b">Affiliate</th>
							<th className="px-3 py-2 border-b">Method</th>
							<th className="px-3 py-2 border-b">Amount</th>
							<th className="px-3 py-2 border-b">Fee</th>
							<th className="px-3 py-2 border-b">Net</th>
							<th className="px-3 py-2 border-b">Status</th>
							<th className="px-3 py-2 border-b">Requested</th>
							<th className="px-3 py-2 border-b">Actions</th>
						</tr>
					</thead>
					<tbody>
						{visible.length === 0 && <tr><td colSpan={9} className="text-center py-6 text-gray-400">No payout requests found.</td></tr>}
						{visible.map(r => (
							<tr key={r.id} className="hover:bg-gray-50">
								<td className="px-3 py-2 border-b text-center"><input type="checkbox" checked={!!selected[r.id]} onChange={() => toggleSelect(r.id)} /></td>
								<td className="px-3 py-2 border-b">
									<div className="font-medium">{r.affiliateName}</div>
									<div className="text-xs text-gray-500">{r.id}</div>
								</td>
								<td className="px-3 py-2 border-b">{r.method}</td>
								<td className="px-3 py-2 border-b">{currency(r.amount)}</td>
								<td className="px-3 py-2 border-b">{currency(r.fee)}</td>
								<td className="px-3 py-2 border-b">{currency(r.net)}</td>
								<td className="px-3 py-2 border-b"><span className={`px-2 py-0.5 rounded text-xs ${r.status==='PAID'?'bg-emerald-100 text-emerald-800':r.status==='APPROVED'?'bg-yellow-100 text-yellow-800':r.status==='REJECTED'?'bg-red-100 text-red-800':'bg-gray-100 text-gray-800'}`}>{r.status}</span></td>
								<td className="px-3 py-2 border-b">{new Date(r.requestedAt).toLocaleDateString()}</td>
								<td className="px-3 py-2 border-b text-right">
									<div className="flex justify-end space-x-2">
										<button onClick={() => performAction([r.id], 'APPROVE')} className="text-xs px-2 py-1 bg-yellow-400 text-white rounded">Approve</button>
										<button onClick={() => performAction([r.id], 'MARK_PAID')} className="text-xs px-2 py-1 bg-emerald-600 text-white rounded">Mark Paid</button>
										<button onClick={() => performAction([r.id], 'REJECT')} className="text-xs px-2 py-1 bg-red-500 text-white rounded">Reject</button>
										<button onClick={() => setShowHistoryFor(r.id)} className="text-xs px-2 py-1 border rounded">History</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* History Modal (simple) */}
			{showHistoryFor && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center">
					<div className="bg-white rounded shadow-lg w-2/5 p-4">
						<h3 className="font-semibold mb-3">History for {showHistoryFor}</h3>
						<div className="text-sm max-h-64 overflow-y-auto">
							{requests.find(r => r.id === showHistoryFor)?.history?.map((h, idx) => (
								<div key={idx} className="mb-2 border-b pb-2">
									<div className="text-xs text-gray-500">{new Date(h.ts).toLocaleString()}</div>
									<div className="font-medium">{h.action}</div>
								</div>
							)) || <div className="text-gray-400">No history available.</div>}
						</div>
						<div className="mt-4 text-right">
							<button className="px-3 py-1 border rounded" onClick={() => setShowHistoryFor(null)}>Close</button>
						</div>
					</div>
				</div>
			)}

			{/* Methods Modal */}
			{showMethodModal && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center">
					<div className="bg-white rounded shadow-lg w-2/5 p-4">
						<h3 className="font-semibold mb-3">Payment Methods</h3>
						<div className="mb-3">
							{methodsConfig.map(m => (
								<div key={m} className="flex items-center justify-between border-b py-2">
									<div>{m}</div>
									<button className="text-xs px-2 py-1 border rounded" onClick={() => setMethodsConfig(prev => prev.filter(x => x !== m))}>Remove</button>
								</div>
							))}
						</div>
						<div className="flex space-x-2">
							<input value={newMethodName} onChange={e => setNewMethodName(e.target.value)} placeholder="New method name" className="border rounded px-2 py-1 w-full" />
							<button onClick={() => addMethod(newMethodName)} className="px-3 py-1 bg-blue-600 text-white rounded">Add</button>
						</div>
						<div className="mt-4 text-right">
							<button className="px-3 py-1 border rounded" onClick={() => setShowMethodModal(false)}>Close</button>
						</div>
					</div>
				</div>
			)}

			{/* Notification */}
			{notification && (
				<div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded">{notification}</div>
			)}

			{/* Audit Logs (compact) */}
			<div className="mt-6">
				<h3 className="font-semibold mb-2">Audit Logs</h3>
				<div className="max-h-40 overflow-y-auto text-xs border rounded p-2 bg-gray-50">
					{auditLogs.length === 0 && <div className="text-gray-400">No audit logs yet.</div>}
					{auditLogs.map((a, i) => (
						<div key={i} className="mb-2">
							<div className="text-xs text-gray-500">{new Date(a.ts).toLocaleString()}</div>
							<div>{a.action} {a.ids ? `(${a.ids.length} items)` : ''}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default PayoutManagement;

