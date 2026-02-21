import React, { useEffect, useState } from 'react';

type Toast = { id: number; type: 'info' | 'success' | 'error'; message: string };

let pushToast: ((t: Toast) => void) | null = null;

export const notify = {
  info: (msg: string) => pushToast && pushToast({ id: Date.now(), type: 'info', message: msg }),
  success: (msg: string) => pushToast && pushToast({ id: Date.now(), type: 'success', message: msg }),
  error: (msg: string) => pushToast && pushToast({ id: Date.now(), type: 'error', message: msg }),
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    pushToast = (t: Toast) => setToasts((s) => [t, ...s]);
    return () => {
      pushToast = null;
    };
  }, []);

  useEffect(() => {
    const timers = toasts.map((t) =>
      setTimeout(() => setToasts((s) => s.filter((x) => x.id !== t.id)), 4200)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  if (!toasts.length) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div key={t.id} className={`max-w-sm w-full px-4 py-2 rounded shadow-lg text-sm text-white ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-gray-800'}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
};

export default notify;
