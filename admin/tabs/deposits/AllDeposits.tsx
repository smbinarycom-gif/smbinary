import React, { useMemo } from 'react';
import { PaymentRequest } from '../../../shared/types.ts';

interface AllDepositsProps {
  paymentRequests: PaymentRequest[];
  onProcessPayment: (reqId: string, action: 'APPROVED' | 'REJECTED') => void;
  onViewProof: (url: string) => void;
}

const AllDeposits: React.FC<AllDepositsProps> = ({ paymentRequests, onProcessPayment, onViewProof }) => {
  const deposits = useMemo(
    () => paymentRequests.filter((req) => req.type === 'DEPOSIT'),
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

  const totalSuccessful = useMemo(
    () => deposits.filter(d => d.status === 'APPROVED').reduce((sum, d) => sum + d.amount, 0),
    [deposits]
  );
  const totalPending = useMemo(
    () => deposits.filter(d => d.status === 'PENDING').reduce((sum, d) => sum + d.amount, 0),
    [deposits]
  );
  const totalRejected = useMemo(
    () => deposits.filter(d => d.status === 'REJECTED').reduce((sum, d) => sum + d.amount, 0),
    [deposits]
  );
  const totalInitiated = useMemo(
    () => deposits.reduce((sum, d) => sum + d.amount, 0),
    [deposits]
  );

  return (
    <div className="space-y-6">
      {/* Summary cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg border border-emerald-500/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 text-white">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-emerald-50/80 uppercase tracking-wide">Successful Deposit</p>
              <p className="text-sm sm:text-base font-bold text-white">${totalSuccessful.toFixed(2)} USD</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#f97316] to-[#f59e0b] rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg border border-orange-400/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 text-white">
              <i className="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-orange-50/80 uppercase tracking-wide">Pending Deposit</p>
              <p className="text-sm sm:text-base font-bold text-white">${totalPending.toFixed(2)} USD</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#ef4444] to-[#b91c1c] rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg border border-red-500/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 text-white">
              <i className="fa-solid fa-ban"></i>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-red-50/80 uppercase tracking-wide">Rejected Deposit</p>
              <p className="text-sm sm:text-base font-bold text-white">${totalRejected.toFixed(2)} USD</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#6366f1] to-[#4f46e5] rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg border border-indigo-500/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 text-white">
              <i className="fa-solid fa-arrow-trend-up"></i>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-indigo-50/80 uppercase tracking-wide">Initiated Deposit</p>
              <p className="text-sm sm:text-base font-bold text-white">${totalInitiated.toFixed(2)} USD</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-indigo-600 text-white text-[11px] uppercase font-semibold">
              <tr>
                <th className="px-4 py-2.5">Gateway | Transaction</th>
                <th className="px-4 py-2.5">Initiated</th>
                <th className="px-4 py-2.5">User</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">Conversion</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {deposits.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50">
                  {/* Gateway | Transaction */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col text-sm">
                      <div className="inline-flex items-center space-x-2 font-semibold text-slate-900">
                        <i className="fa-solid fa-building-columns text-[12px] text-indigo-500"></i>
                        <span>{req.method || 'Gateway'}</span>
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
                    <div className="text-[11px] text-emerald-600 font-semibold">+ $0.00 USD</div>
                  </td>

                  {/* Conversion */}
                  <td className="px-4 py-3 align-top text-[11px] text-slate-600 whitespace-nowrap">
                    <div>$1.00 USD = 1.00 USD</div>
                    <div className="font-semibold text-slate-900">{req.amount.toFixed(2)} USD</div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border ${
                        req.status === 'PENDING'
                          ? 'border-amber-300 text-amber-600 bg-amber-50'
                          : req.status === 'APPROVED'
                          ? 'border-emerald-300 text-emerald-600 bg-emerald-50'
                          : 'border-rose-300 text-rose-600 bg-rose-50'
                      }`}
                    >
                      {req.status === 'PENDING'
                        ? 'Initiated'
                        : req.status === 'APPROVED'
                        ? 'Successful'
                        : 'Rejected'}
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

              {deposits.length === 0 && (
                <>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col text-sm">
                        <div className="inline-flex items-center space-x-2 font-semibold text-slate-900">
                          <i className="fa-brands fa-cc-paypal text-[14px] text-sky-600"></i>
                          <span>Paypal</span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500 font-mono truncate max-w-[220px]">
                          7QAM3E3FFE5B
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-[11px] text-slate-600 whitespace-nowrap">
                      <div>2026-02-22 11:26 AM</div>
                      <div className="mt-0.5 text-slate-400">21 hours ago</div>
                    </td>
                    <td className="px-4 py-3 align-top text-sm text-slate-900 whitespace-nowrap">
                      <div className="font-semibold">Test Test</div>
                      <div className="text-[11px] text-slate-500">@testortest</div>
                    </td>
                    <td className="px-4 py-3 align-top text-sm text-slate-900 whitespace-nowrap">
                      <div className="font-mono">$100.00 USD</div>
                      <div className="text-[11px] text-emerald-600 font-semibold">+ $2.00 USD</div>
                      <div className="text-[11px] text-slate-500 font-semibold">$102.00 USD</div>
                    </td>
                    <td className="px-4 py-3 align-top text-[11px] text-slate-600 whitespace-nowrap">
                      <div>$1.00 USD = 1.00 USD</div>
                      <div className="font-semibold text-slate-900">102.00 USD</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border border-amber-300 text-amber-600 bg-amber-50">
                        Initiated
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                      <button className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border text-[11px] font-semibold text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                        <i className="fa-regular fa-rectangle-list mr-1"></i>
                        Details
                      </button>
                    </td>
                  </tr>

                  {/* Additional demo rows can be added here similarly */}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllDeposits;
