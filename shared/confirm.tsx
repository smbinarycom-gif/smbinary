import React, { useEffect, useState } from 'react';

type Req = { id: number; message: string; title?: string; resolve: (v: boolean) => void };

let pushReq: ((r: Req) => void) | null = null;

export function confirm(message: string, title?: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (pushReq) {
      pushReq({ id: Date.now(), message, title, resolve });
    } else {
      // Fallback to native confirm when provider not mounted
      resolve(window.confirm(message));
    }
  });
}

export const ConfirmDialog: React.FC = () => {
  const [queue, setQueue] = useState<Req[]>([]);

  useEffect(() => {
    pushReq = (r: Req) => setQueue((q) => [...q, r]);
    return () => {
      pushReq = null;
    };
  }, []);

  const current = queue[0];
  if (!current) return null;

  const respond = (val: boolean) => {
    current.resolve(val);
    setQueue((q) => q.slice(1));
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
      <div className="bg-[#1e2329] border border-[#2b3139] rounded-lg max-w-md w-full p-6 mx-4">
        {current.title && <h3 className="text-lg font-bold text-white mb-2">{current.title}</h3>}
        <p className="text-sm text-[#cbd5e1] mb-6">{current.message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => respond(false)} className="px-4 py-2 bg-[#474d57] text-white rounded">Cancel</button>
          <button onClick={() => respond(true)} className="px-4 py-2 bg-[#fcd535] text-black rounded font-bold">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default confirm;
