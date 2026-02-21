
import React, { useState, useRef } from 'react';
import { notify } from '../../shared/notify';
import { PaymentRequest } from '../../shared/types';

interface WalletPanelProps {
  balance: number;
  adminPayId: string;
  paymentHistory: PaymentRequest[];
  onDeposit: (amount: number, txId: string, proof: string) => void;
  onWithdraw: (amount: number, targetPayId: string) => void;
  onClose?: () => void; // For mobile close
}

const WalletPanel: React.FC<WalletPanelProps> = ({ balance, adminPayId, paymentHistory, onDeposit, onWithdraw, onClose }) => {
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

  return (
    <div className="flex flex-col h-full bg-[#1e2329] text-white overflow-hidden font-binance">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2b3139] bg-[#1e2329]">
        <h2 className="text-xl font-bold text-[#fcd535]">Wallet Overview</h2>
        {onClose && (
            <button onClick={onClose} className="text-[#848e9c] hover:text-white">
                <i className="fa-solid fa-xmark text-xl"></i>
            </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Balance Card (Binance Style) */}
            <div className="bg-[#2b3139] p-6 rounded-2xl shadow-lg border border-[#3b414d]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                        <h3 className="text-[#848e9c] text-sm font-bold mb-1">Total Balance</h3>
                        <div className="flex items-end space-x-2">
                            <span className="text-3xl font-bold text-white tracking-tight">
                                {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-lg font-bold text-[#848e9c] mb-1">USDT</span>
                        </div>
                        <p className="text-xs text-[#848e9c] mt-2">≈ {balance.toLocaleString()} USD</p>
                    </div>
                    <div className="flex space-x-3 w-full md:w-auto">
                        <button 
                            onClick={() => setActiveTab('DEPOSIT')}
                            className={`flex-1 md:flex-none px-8 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'DEPOSIT' ? 'bg-[#fcd535] text-black' : 'bg-[#fcd535] text-[#1e2329] hover:bg-[#ffe252]'}`}
                        >
                            Deposit
                        </button>
                        <button 
                            onClick={() => setActiveTab('WITHDRAW')}
                            className={`flex-1 md:flex-none px-8 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'WITHDRAW' ? 'bg-[#474d57] text-white' : 'bg-[#474d57] text-white hover:bg-[#5e6673]'}`}
                        >
                            Withdraw
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-[#2b3139] rounded-2xl shadow-lg border border-[#3b414d] overflow-hidden min-h-[400px]">
                
                {/* DEPOSIT FORM */}
                {activeTab === 'DEPOSIT' && (
                    <div className="p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-lg font-bold text-white mb-6 border-b border-[#3b414d] pb-4">Deposit USDT</h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                {/* Admin Pay ID Display */}
                                <div className="bg-[#1e2329] p-4 rounded-lg border border-[#fcd535]/30">
                                    <label className="text-xs text-[#848e9c] font-bold uppercase block mb-2">Send Payment To (Binance Pay ID)</label>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-mono font-bold text-[#fcd535]">{adminPayId || 'CONTACT ADMIN'}</span>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(adminPayId)}
                                            className="text-[#848e9c] hover:text-white"
                                        >
                                            <i className="fa-regular fa-copy"></i>
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-[#848e9c] mt-2">
                                        <i className="fa-solid fa-circle-info mr-1"></i>
                                        Only send USDT via Binance Pay. Other methods may be lost.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#848e9c] mb-2">Amount (USDT)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={depAmount}
                                            onChange={(e) => setDepAmount(e.target.value)}
                                            placeholder="Minimum 10 USDT"
                                            className="w-full bg-[#1e2329] border border-[#474d57] rounded-lg p-3 text-white focus:border-[#fcd535] focus:outline-none"
                                        />
                                        <span className="absolute right-3 top-3 text-sm font-bold text-[#848e9c]">USDT</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#848e9c] mb-2">Transaction ID (TxID)</label>
                                    <input 
                                        type="text" 
                                        value={txId}
                                        onChange={(e) => setTxId(e.target.value)}
                                        placeholder="Enter the transaction ID from Binance"
                                        className="w-full bg-[#1e2329] border border-[#474d57] rounded-lg p-3 text-white focus:border-[#fcd535] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-[#848e9c] mb-2">Payment Proof (Screenshot)</label>
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-[#474d57] rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer hover:border-[#fcd535] hover:bg-[#2a3040] transition-colors relative overflow-hidden"
                                    >
                                        {proofFile ? (
                                            <img src={proofFile} alt="proof" className="w-full h-full object-contain" />
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-cloud-arrow-up text-3xl text-[#848e9c] mb-2"></i>
                                                <span className="text-sm text-[#848e9c]">Click to upload screenshot</span>
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
                                    <button onClick={() => setActiveTab('OVERVIEW')} className="flex-1 bg-[#474d57] text-white py-3 rounded-lg font-bold hover:bg-[#5e6673]">Cancel</button>
                                    <button onClick={submitDeposit} className="flex-1 bg-[#0ecb81] text-white py-3 rounded-lg font-bold hover:bg-[#0aa869]">Confirm Deposit</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* WITHDRAW FORM */}
                {activeTab === 'WITHDRAW' && (
                    <div className="p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-lg font-bold text-white mb-6 border-b border-[#3b414d] pb-4">Withdraw USDT</h3>
                        
                        <div className="max-w-xl mx-auto space-y-6">
                            <div className="bg-[#f6465d]/10 border border-[#f6465d]/20 p-4 rounded-lg">
                                <p className="text-xs text-[#f6465d] font-bold">
                                    <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                                    Ensure your Binance Pay ID is correct. Transactions cannot be reversed.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#848e9c] mb-2">Your Binance Pay ID</label>
                                <input 
                                    type="text" 
                                    value={userPayId}
                                    onChange={(e) => setUserPayId(e.target.value)}
                                    placeholder="Enter your Binance Pay ID"
                                    className="w-full bg-[#1e2329] border border-[#474d57] rounded-lg p-3 text-white focus:border-[#fcd535] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#848e9c] mb-2">Amount (USDT)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={wdAmount}
                                        onChange={(e) => setWdAmount(e.target.value)}
                                        placeholder="Minimum 10 USDT"
                                        className="w-full bg-[#1e2329] border border-[#474d57] rounded-lg p-3 text-white focus:border-[#fcd535] focus:outline-none"
                                    />
                                    <div className="absolute right-3 top-3 flex items-center space-x-2">
                                        <button onClick={() => setWdAmount(balance.toString())} className="text-[10px] text-[#fcd535] font-bold uppercase hover:underline">MAX</button>
                                        <span className="text-sm font-bold text-[#848e9c]">USDT</span>
                                    </div>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-[10px] text-[#848e9c]">Available: {balance.toFixed(2)} USDT</span>
                                </div>
                            </div>

                            <div className="flex space-x-4 pt-4">
                                <button onClick={() => setActiveTab('OVERVIEW')} className="flex-1 bg-[#474d57] text-white py-3 rounded-lg font-bold hover:bg-[#5e6673]">Cancel</button>
                                <button onClick={submitWithdraw} className="flex-1 bg-[#fcd535] text-[#1e2329] py-3 rounded-lg font-bold hover:bg-[#ffe252]">Confirm Withdrawal</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* OVERVIEW / HISTORY */}
                {activeTab === 'OVERVIEW' && (
                    <div className="flex flex-col h-full">
                        <div className="p-4 bg-[#2b3139] border-b border-[#3b414d]">
                            <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
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
