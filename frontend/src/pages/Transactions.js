import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Transactions = () => {
    const navigate = useNavigate();
    const [txns, setTxns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        fetchTransactions();
    }, [navigate]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/transactions');
            setTxns(response.data);
        } catch (error) {
          
            setTxns([
                { id: 1, symbol: 'RELIANCE', type: 'buy', quantity: 10, price: 2540.50, executed_at: '2024-03-10' },
                { id: 2, symbol: 'HDFC_BANK', type: 'buy', quantity: 15, price: 1420.00, executed_at: '2024-03-12' },
                { id: 3, symbol: 'CASH_DEP', type: 'contribution', quantity: 1, price: 50000, executed_at: '2024-03-15' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: '📊' },
        { name: 'Goals', path: '/goals', icon: '🎯' },
        { name: 'Portfolio', path: '/portfolio', icon: '💼' },
        { name: 'Profile', path: '/profile', icon: '👤' },
        { name: 'Transactions', path: '/transactions', icon: '💸' },
        { name: 'Risk Profile', path: '/risk', icon: '⚖️' }
    ];

    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-[#0f172a] text-white flex flex-col shrink-0 z-10 shadow-xl">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center font-bold italic">W</div>
                        <span className="text-xl font-black italic tracking-tight">Wealth<span className="text-[#2563eb]">Track</span></span>
                    </div>
                </div>
                <nav className="flex-1 mt-4">
                    {menuItems.map((item) => (
                        <button key={item.name} onClick={() => navigate(item.path)} 
                            className={`w-full flex items-center px-8 py-3 transition-all text-left font-bold text-[11px] tracking-widest uppercase ${
                                window.location.pathname === item.path ? 'text-[#2563eb] bg-blue-500/5 border-r-4 border-[#2563eb]' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <span className="mr-4 text-lg opacity-80">{item.icon}</span> {item.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden p-8">
                <header className="mb-8 shrink-0">
                    <h1 className="text-3xl font-black text-[#0f172a] tracking-tight italic uppercase">Execution Ledger</h1>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Transaction History & Logs</p>
                </header>

                <div className="flex-1 overflow-y-auto bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset / Symbol</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Qty</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="6" className="py-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Syncing with Ledger...</td></tr>
                            ) : txns.map((t) => (
                                <tr key={t.id} className="hover:bg-blue-50/30 transition-all group">
                                    <td className="px-8 py-5 text-[11px] font-bold text-slate-500">{t.executed_at}</td>
                                    <td className="px-8 py-5 font-black text-[#0f172a] italic text-xs uppercase tracking-tight">{t.symbol}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                                            t.type === 'buy' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                            {t.type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right font-bold text-slate-600 text-xs">{t.quantity}</td>
                                    <td className="px-8 py-5 text-right font-bold text-slate-600 text-xs">₹{t.price.toLocaleString()}</td>
                                    <td className="px-8 py-5 text-right font-black text-[#0f172a] text-xs italic">
                                        ₹{(t.quantity * t.price).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transactions;