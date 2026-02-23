import React, { useMemo } from 'react';
import { PaymentRequest } from '../../../shared/types.ts';

interface PendingWithdrawalsProps {
  paymentRequests: PaymentRequest[];
  onProcessPayment: (reqId: string, action: 'APPROVED' | 'REJECTED') => void;
  onViewProof: (url: string) => void;
}

const PendingWithdrawals: React.FC<PendingWithdrawalsProps> = ({ paymentRequests, onProcessPayment, onViewProof }) => {
  const withdrawals = useMemo(
    () => paymentRequests.filter((req) => req.type === 'WITHDRAWAL' && req.status === 'PENDING'),
    [paymentRequests]
  );

  const formatRelativeTime = (timestamp: number): string => {
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 1) return `${diffDays} days ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffHours > 1) return `${diffHours} hours ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffMin > 1) return `${diffMin} minutes ago`;
    if (diffMin === 1) return '1 minute ago';
    return 'Just now';
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-indigo-600 text-white text-[11px] uppercase font-semibold">
              <tr>
                <th className="px-4 py-2.5">Payout | Transaction</th>
                <th className="px-4 py-2.5">Initiated</th>
                <th className="px-4 py-2.5">User</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">Payout To</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {withdrawals.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50">
                  {/* Payout | Transaction */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col text-sm">
                      <div className="inline-flex items-center space-x-2 font-semibold text-slate-900">
                        <i className="fa-solid fa-money-bill-transfer text-[12px] text-indigo-500"></i>
                        <span>{req.method || 'Payout'}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500 font-mono truncate max-w-[220px]">
                        {req.transactionId || req.id}
                      </div>
                    </div>
                  </td>

                  {/* Initiated */}
                  <td className="px-4 py-3 align-top text-[11px] text-slate-600 whitespace-nowrap">
                    <div>{new Date(req.date).toLocaleString()}</div>
                    <div className="mt-0.5 text-slate-400">{formatRelativeTime(req.date)}</div>
                  </td>

                  {/* User */}
                  <td className="px-4 py-3 align-top text-sm text-slate-900 whitespace-nowrap">
                    <div className="font-semibold">{req.userName}</div>
                    <div className="text-[11px] text-slate-500">@demo_user</div>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-3 align-top text-sm text-slate-900 whitespace-nowrap">
                    <div className="font-mono">${req.amount.toFixed(2)} USD</div>
                    <div className="text-[11px] text-emerald-600 font-semibold">- $0.00 USD fee</div>
                  </td>

                  {/* Payout To */}
                  <td className="px-4 py-3 align-top text-[11px] text-slate-600 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{req.targetWallet || 'Destination wallet'}</div>
                    <div className="text-slate-400">Network: USDT</div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 align-top">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border border-amber-300 text-amber-600 bg-amber-50">
                      Pending
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                    <button
                      onClick={() => onViewProof(req.proofUrl || '')}
                      disabled={!req.proofUrl}
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border text-[11px] font-semibold text-indigo-600 border-indigo-200 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed mr-2"
                    >
                      <i className="fa-regular fa-rectangle-list mr-1"></i>
                      Details
                    </button>
                    <button
                      onClick={() => onProcessPayment(req.id, 'APPROVED')}
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-emerald-500 text-white text-[11px] font-semibold hover:bg-emerald-600 mr-1"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onProcessPayment(req.id, 'REJECTED')}
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-rose-500 text-white text-[11px] font-semibold hover:bg-rose-600"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}

              {withdrawals.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-xs text-slate-400" colSpan={7}>
                    No pending withdrawals.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PendingWithdrawals;
