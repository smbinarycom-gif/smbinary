
import React from 'react';
import { MarketSettings, PaymentRequest } from '../../shared/types.ts';

interface FinanceTabProps {
    settings: MarketSettings;
    onUpdate: (settings: MarketSettings) => void;
    paymentRequests: PaymentRequest[];
    onProcessPayment: (reqId: string, action: 'APPROVED' | 'REJECTED') => void;
    onViewProof: (url: string) => void;
}

const FinanceTab: React.FC<FinanceTabProps> = ({ settings, onUpdate, paymentRequests, onProcessPayment, onViewProof }) => {
    return (
        <div className="space-y-8">
            <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139] shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4">Payment Configuration</h3>
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-[#848e9c] block mb-1">Official Binance Pay ID (For Deposits)</label>
                        <input type="text" value={settings.adminBinancePayId} onChange={(e) => onUpdate({ ...settings, adminBinancePayId: e.target.value })} className="w-full bg-[#131722] border border-[#474d57] rounded px-3 py-2 text-sm font-mono text-white focus:border-[#fcd535] outline-none" />
                    </div>
                    <button className="bg-[#fcd535] text-[#1e2329] px-6 py-2 rounded font-bold text-sm hover:bg-[#ffe252]">Save Configuration</button>
                </div>
            </div>
            <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] overflow-hidden">
                <div className="p-4 border-b border-[#2b3139] flex justify-between items-center"><h3 className="text-sm font-bold text-white">Pending Verification ({paymentRequests.length})</h3></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#2b3139] text-[#848e9c] text-xs uppercase font-bold">
                            <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Details</th><th className="px-4 py-3">Proof</th><th className="px-4 py-3 text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-[#2b3139]">
                            {paymentRequests.map(req => (
                                <tr key={req.id} className="hover:bg-[#2b3139]/50">
                                    <td className="px-4 py-3 text-sm font-bold text-white">{req.userName}</td>
                                    <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-1 rounded ${req.type === 'DEPOSIT' ? 'bg-[#0ecb81]/10 text-[#0ecb81]' : 'bg-[#f6465d]/10 text-[#f6465d]'}`}>{req.type}</span></td>
                                    <td className="px-4 py-3 text-sm font-mono text-white">{req.amount} USDT</td>
                                    <td className="px-4 py-3 text-xs text-[#848e9c]">{req.type === 'DEPOSIT' ? `TxID: ${req.transactionId}` : `Target: ${req.targetWallet}`}</td>
                                    <td className="px-4 py-3">{req.proofUrl ? (<button onClick={() => onViewProof(req.proofUrl!)} className="text-[#3b82f6] underline text-xs font-bold">View Proof</button>) : '-'}</td>
                                    <td className="px-4 py-3 text-right space-x-2"><button onClick={() => onProcessPayment(req.id, 'APPROVED')} className="bg-[#0ecb81] text-white px-3 py-1 rounded text-xs font-bold hover:bg-[#0aa869]">Approve</button><button onClick={() => onProcessPayment(req.id, 'REJECTED')} className="bg-[#f6465d] text-white px-3 py-1 rounded text-xs font-bold hover:bg-[#e63737]">Reject</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinanceTab;
