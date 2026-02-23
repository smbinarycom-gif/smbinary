
import React, { useState, useRef } from 'react';
import { notify } from '../../shared/notify';
import { PaymentRequest, AdminThemeSettings } from '../../shared/types';

interface WalletPanelProps {
  balance: number;
  adminPayId: string;
  paymentHistory: PaymentRequest[];
  onDeposit: (amount: number, txId: string, proof: string) => void;
  onWithdraw: (amount: number, targetPayId: string) => void;
  onClose?: () => void; // For mobile close
    theme?: AdminThemeSettings;
}
const WalletPanel: React.FC<WalletPanelProps> = ({ balance, adminPayId, paymentHistory, onDeposit, onWithdraw, onClose, theme }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DEPOSIT' | 'WITHDRAW'>('OVERVIEW');
  
  // Deposit State
  const [depAmount, setDepAmount] = useState('');
  const [txId, setTxId] = useState('');
  const [proofFile, setProofFile] = useState<string | null>(null);
  
  // Withdraw State
  const [wdAmount, setWdAmount] = useState('');
  const [userPayId, setUserPayId] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

    const submitDeposit = () => {
        if (!depAmount || !txId || !proofFile) {
            notify.info("Please fill all fields and upload screenshot.");
            return;
        }
    onDeposit(Number(depAmount), txId, proofFile);
    setDepAmount('');
    setTxId('');
    setProofFile(null);
    setActiveTab('OVERVIEW');
  };

  const submitWithdraw = () => {
        if (!wdAmount || !userPayId) {
            notify.info("Please fill all fields.");
            return;
        }
        if (Number(wdAmount) > balance) {
            notify.error("Insufficient balance.");
            return;
        }
    onWithdraw(Number(wdAmount), userPayId);
    setWdAmount('');
    setUserPayId('');
    setActiveTab('OVERVIEW');
  };

  const sortedHistory = [...paymentHistory].sort((a, b) => b.date - a.date);

    const isLight = theme?.mode === 'LIGHT';
    // Dark mode: use #1e222d as the main Wallet Overview panel background,
    // while keeping inner cards slightly elevated and not too cluttered.
    const shellBg = theme?.backgroundColor || (isLight ? '#f3f4f6' : '#1e222d');
    const cardBg = theme?.surfaceBackground || (isLight ? '#ffffff' : '#2b3139');
    const headerBg = theme?.headerBackground || cardBg;
    const borderColor = isLight ? 'rgba(148,163,184,0.4)' : '#3b414d';
    const textPrimary = theme?.textColor || (isLight ? '#020617' : '#ffffff');
    const textMuted = isLight ? '#6b7280' : '#848e9c';
    const inputBg = isLight ? '#f9fafb' : '#1e2329';
    const inputBorder = isLight ? 'rgba(148,163,184,0.6)' : '#474d57';
    const warningBg = isLight ? 'rgba(248,113,113,0.05)' : 'rgba(246,70,93,0.1)';
    const warningBorder = isLight ? 'rgba(248,113,113,0.35)' : 'rgba(246,70,93,0.2)';

  return (
        <div
            className="flex flex-col h-full overflow-hidden font-binance"
            style={{ backgroundColor: shellBg, color: textPrimary }}
        >
      {/* Header */}
            <div
                className="flex items-center justify-between p-4 border-b"
                style={{ backgroundColor: headerBg, borderColor }}
            >
                <h2
                    className="text-xl font-bold"
                    style={{ color: theme?.primaryColor || (isLight ? '#eab308' : '#fcd535') }}
                >
                    Wallet Overview
                </h2>
        {onClose && (
                        <button
                            onClick={onClose}
                            className="hover:text-white"
                            style={{ color: textMuted }}
                        >
                <i className="fa-solid fa-xmark text-xl"></i>
            </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
            
                        {/* Balance Card */}
                        <div
                            className="p-6 rounded-2xl shadow-lg border"
                            style={{ backgroundColor: cardBg, borderColor }}
                        >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                                                <h3 className="text-sm font-bold mb-1" style={{ color: textMuted }}>
                                                    Total Balance
                                                </h3>
                        <div className="flex items-end space-x-2">
                                                        <span className="text-3xl font-bold tracking-tight" style={{ color: textPrimary }}>
                                {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                                                        <span className="text-lg font-bold mb-1" style={{ color: textMuted }}>
                                                            USDT
                                                        </span>
                        </div>
                                                <p className="text-xs mt-2" style={{ color: textMuted }}>
                                                    ≈ {balance.toLocaleString()} USD
                                                </p>
                    </div>
                    <div className="flex space-x-3 w-full md:w-auto">
                        <button 
                            onClick={() => setActiveTab('DEPOSIT')}
                                                        className={`flex-1 md:flex-none px-8 py-2.5 rounded-lg font-bold text-sm transition-all ${
                                                            activeTab === 'DEPOSIT'
                                                                ? 'text-black'
                                                                : 'text-[#1e2329] hover:bg-[#ffe252]'
                                                        }`}
                                                        style={{ backgroundColor: theme?.primaryColor || '#fcd535' }}
                        >
                            Deposit
                        </button>
                        <button 
                            onClick={() => setActiveTab('WITHDRAW')}
                                                        className={`flex-1 md:flex-none px-8 py-2.5 rounded-lg font-bold text-sm transition-all ${
                                                            activeTab === 'WITHDRAW'
                                                                ? 'text-white'
                                                                : 'text-white hover:bg-[#5e6673]'
                                                        }`}
                                                        style={{ backgroundColor: isLight ? '#0f172a' : '#474d57' }}
                        >
                            Withdraw
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
                        <div
                            className="rounded-2xl shadow-lg border overflow-hidden min-h-[400px]"
                            style={{ backgroundColor: cardBg, borderColor }}
                        >
                
                {/* DEPOSIT FORM */}
                {activeTab === 'DEPOSIT' && (
                    <div className="p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                                <h3
                                                    className="text-lg font-bold mb-6 border-b pb-4"
                                                    style={{ color: textPrimary, borderColor }}
                                                >
                                                    Deposit USDT
                                                </h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                {/* Admin Pay ID Display */}
                                                                <div
                                                                    className="p-4 rounded-lg border"
                                                                    style={{ backgroundColor: inputBg, borderColor: theme?.primaryColor ? `${theme.primaryColor}55` : '#fcd53555' }}
                                                                >
                                                                        <label
                                                                            className="text-xs font-bold uppercase block mb-2"
                                                                            style={{ color: textMuted }}
                                                                        >
                                                                            Send Payment To (Binance Pay ID)
                                                                        </label>
                                    <div className="flex items-center justify-between">
                                                                                <span
                                                                                    className="text-xl font-mono font-bold"
                                                                                    style={{ color: theme?.primaryColor || '#fcd535' }}
                                                                                >
                                                                                    {adminPayId || 'CONTACT ADMIN'}
                                                                                </span>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(adminPayId)}
                                                                                        className="hover:text-white"
                                                                                        style={{ color: textMuted }}
                                        >
                                            <i className="fa-regular fa-copy"></i>
                                        </button>
                                    </div>
                                    <p className="text-[10px] mt-2" style={{ color: textMuted }}>
                                        <i className="fa-solid fa-circle-info mr-1"></i>
                                        Only send USDT via Binance Pay. Other methods may be lost.
                                    </p>
                                </div>

                                <div>
                                                                        <label
                                                                            className="block text-sm font-bold mb-2"
                                                                            style={{ color: textMuted }}
                                                                        >
                                                                            Amount (USDT)
                                                                        </label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={depAmount}
                                            onChange={(e) => setDepAmount(e.target.value)}
                                                                                        placeholder="Minimum 10 USDT"
                                                                                        className="w-full rounded-lg p-3 focus:outline-none"
                                                                                        style={{
                                                                                            backgroundColor: inputBg,
                                                                                            borderColor: inputBorder,
                                                                                            color: textPrimary,
                                                                                        }}
                                        />
                                                                                <span
                                                                                    className="absolute right-3 top-3 text-sm font-bold"
                                                                                    style={{ color: textMuted }}
                                                                                >
                                                                                    USDT
                                                                                </span>
                                    </div>
                                </div>

                                <div>
                                                                        <label
                                                                            className="block text-sm font-bold mb-2"
                                                                            style={{ color: textMuted }}
                                                                        >
                                                                            Transaction ID (TxID)
                                                                        </label>
                                    <input 
                                        type="text" 
                                        value={txId}
                                        onChange={(e) => setTxId(e.target.value)}
                                                                                placeholder="Enter the transaction ID from Binance"
                                                                                className="w-full rounded-lg p-3 focus:outline-none"
                                                                                style={{
                                                                                    backgroundColor: inputBg,
                                                                                    borderColor: inputBorder,
                                                                                    color: textPrimary,
                                                                                }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                                                        <label
                                                                            className="block text-sm font-bold mb-2"
                                                                            style={{ color: textMuted }}
                                                                        >
                                                                            Payment Proof (Screenshot)
                                                                        </label>
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                                                                className="border-2 border-dashed rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden"
                                                                                style={{
                                                                                    borderColor: inputBorder,
                                                                                    backgroundColor: isLight ? '#f9fafb' : '#2a3040',
                                                                                }}
                                    >
                                        {proofFile ? (
                                            <img src={proofFile} alt="proof" className="w-full h-full object-contain" />
                                        ) : (
                                            <>
                                                                                                <i className="fa-solid fa-cloud-arrow-up text-3xl mb-2" style={{ color: textMuted }}></i>
                                                                                                <span className="text-sm" style={{ color: textMuted }}>
                                                                                                    Click to upload screenshot
                                                                                                </span>
                                            </>
                                        )}
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleFileChange} 
                                            accept="image/*" 
                                            className="hidden" 
                                        />
                                    </div>
                                </div>

                                <div className="flex space-x-4 pt-4">
                                                                        <button
                                                                            onClick={() => setActiveTab('OVERVIEW')}
                                                                            className="flex-1 text-white py-3 rounded-lg font-bold hover:bg-[#5e6673]"
                                                                            style={{ backgroundColor: isLight ? '#4b5563' : '#474d57' }}
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={submitDeposit}
                                                                            className="flex-1 text-white py-3 rounded-lg font-bold hover:bg-[#0aa869]"
                                                                            style={{ backgroundColor: theme?.accentColor || '#0ecb81' }}
                                                                        >
                                                                            Confirm Deposit
                                                                        </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* WITHDRAW FORM */}
                {activeTab === 'WITHDRAW' && (
                    <div className="p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                                <h3
                                                    className="text-lg font-bold mb-6 border-b pb-4"
                                                    style={{ color: textPrimary, borderColor }}
                                                >
                                                    Withdraw USDT
                                                </h3>
                        
                        <div className="max-w-xl mx-auto space-y-6">
                                                        <div
                                                            className="p-4 rounded-lg"
                                                            style={{ backgroundColor: warningBg, borderColor: warningBorder, borderWidth: 1 }}
                                                        >
                                                                <p className="text-xs font-bold" style={{ color: isLight ? '#ef4444' : '#f6465d' }}>
                                    <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                                    Ensure your Binance Pay ID is correct. Transactions cannot be reversed.
                                </p>
                            </div>

                            <div>
                                                                <label
                                                                    className="block text-sm font-bold mb-2"
                                                                    style={{ color: textMuted }}
                                                                >
                                                                    Your Binance Pay ID
                                                                </label>
                                <input 
                                    type="text" 
                                    value={userPayId}
                                    onChange={(e) => setUserPayId(e.target.value)}
                                                                        placeholder="Enter your Binance Pay ID"
                                                                        className="w-full rounded-lg p-3 focus:outline-none"
                                                                        style={{
                                                                            backgroundColor: inputBg,
                                                                            borderColor: inputBorder,
                                                                            color: textPrimary,
                                                                        }}
                                />
                            </div>

                            <div>
                                                                <label
                                                                    className="block text-sm font-bold mb-2"
                                                                    style={{ color: textMuted }}
                                                                >
                                                                    Amount (USDT)
                                                                </label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={wdAmount}
                                        onChange={(e) => setWdAmount(e.target.value)}
                                                                                placeholder="Minimum 10 USDT"
                                                                                className="w-full rounded-lg p-3 focus:outline-none"
                                                                                style={{
                                                                                    backgroundColor: inputBg,
                                                                                    borderColor: inputBorder,
                                                                                    color: textPrimary,
                                                                                }}
                                    />
                                    <div className="absolute right-3 top-3 flex items-center space-x-2">
                                                                                <button
                                                                                    onClick={() => setWdAmount(balance.toString())}
                                                                                    className="text-[10px] font-bold uppercase hover:underline"
                                                                                    style={{ color: theme?.primaryColor || '#fcd535' }}
                                                                                >
                                                                                    MAX
                                                                                </button>
                                                                                <span className="text-sm font-bold" style={{ color: textMuted }}>
                                                                                    USDT
                                                                                </span>
                                    </div>
                                </div>
                                <div className="flex justify-between mt-1">
                                                                        <span className="text-[10px]" style={{ color: textMuted }}>
                                                                            Available: {balance.toFixed(2)} USDT
                                                                        </span>
                                </div>
                            </div>

                            <div className="flex space-x-4 pt-4">
                                                                <button
                                                                    onClick={() => setActiveTab('OVERVIEW')}
                                                                    className="flex-1 text-white py-3 rounded-lg font-bold hover:bg-[#5e6673]"
                                                                    style={{ backgroundColor: isLight ? '#4b5563' : '#474d57' }}
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={submitWithdraw}
                                                                    className="flex-1 py-3 rounded-lg font-bold hover:bg-[#ffe252]"
                                                                    style={{ backgroundColor: theme?.primaryColor || '#fcd535', color: '#111827' }}
                                                                >
                                                                    Confirm Withdrawal
                                                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* OVERVIEW / HISTORY */}
                {activeTab === 'OVERVIEW' && (
                    <div className="flex flex-col h-full">
                                                <div
                                                    className="p-4 border-b"
                                                    style={{ backgroundColor: cardBg, borderColor }}
                                                >
                                                        <h3 className="text-sm font-bold" style={{ color: textPrimary }}>
                                                            Recent Transactions
                                                        </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#1e2329] text-[#848e9c] text-xs uppercase font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 hidden md:table-cell">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#3b414d]">
                                    {sortedHistory.length > 0 ? sortedHistory.map((item) => (
                                        <tr key={item.id} className="hover:bg-[#323842] transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${item.type === 'DEPOSIT' ? 'bg-[#0ecb81]/10 text-[#0ecb81]' : 'bg-[#f6465d]/10 text-[#f6465d]'}`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-white">
                                                {item.amount.toLocaleString()} USDT
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-bold ${
                                                    item.status === 'APPROVED' ? 'text-[#0ecb81]' : 
                                                    item.status === 'REJECTED' ? 'text-[#f6465d]' : 
                                                    'text-[#fcd535]'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-[#848e9c]">
                                                {new Date(item.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-[#848e9c] hidden md:table-cell">
                                                {item.type === 'DEPOSIT' ? `TxID: ${item.transactionId?.substring(0, 8)}...` : `To: ${item.targetWallet}`}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-[#848e9c] text-sm">
                                                No transaction history found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPanel;
