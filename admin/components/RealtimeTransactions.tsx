import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const RealtimeTransactions: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const channel = supabase.channel('transactions_channel');

    // subscribe to Postgres changes via replication (supabase-js v2)
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, payload => {
      if (!mounted) return;
      try {
        const rec = payload.record || payload.new || payload;
        const ev = { type: payload.event, transaction: rec, received_at: new Date().toISOString() };
        setEvents(prev => [ev, ...prev].slice(0, 20));
      } catch (e) {
        console.error('RealtimeTransactions payload error', e, payload);
      }
    });

    channel.subscribe(status => {
      // console.log('transactions channel status', status);
    });

    return () => {
      mounted = false;
      channel.unsubscribe();
    };
  }, []);

  const handleConfirm = async (txnId: string) => {
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session?.data?.session?.access_token;
      if (!accessToken) {
        alert('Not authenticated as admin');
        return;
      }

      const res = await fetch('/api/admin/confirm-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ transaction_id: txnId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Confirm failed');
      // optimistic UI: mark event as completed
      setEvents(prev => prev.map(e => e.transaction?.id === txnId ? { ...e, transaction: { ...e.transaction, status: 'COMPLETED' } } : e));
    } catch (e) {
      console.error('confirm error', e);
      alert('Confirm failed');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-96 overflow-y-auto z-50">
      <div className="bg-slate-900/80 text-white rounded-lg shadow-lg p-3 text-sm">
        <div className="flex items-center justify-between mb-2">
          <strong>Live transactions</strong>
          <span className="text-xs text-slate-400">{events.length}</span>
        </div>
        <ul className="space-y-2">
          {events.map((e, i) => (
            <li key={i} className="bg-[#0b1220] p-2 rounded text-xs">
              <div className="font-semibold text-emerald-300">{e.transaction?.type} • {e.transaction?.status}</div>
              <div className="text-slate-400 truncate">{e.transaction?.reference || e.transaction?.id} — {e.transaction?.amount} {e.transaction?.currency}</div>
              <div className="text-[11px] text-slate-500 mt-1">{new Date(e.received_at).toLocaleTimeString()}</div>
            </li>
          ))}
          {events.length === 0 && <li className="text-slate-400">No recent transactions</li>}
        </ul>
      </div>
    </div>
  );
};

export default RealtimeTransactions;
