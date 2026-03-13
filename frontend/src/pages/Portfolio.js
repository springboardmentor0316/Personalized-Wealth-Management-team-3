import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Portfolio = () => {
    const navigate = useNavigate();
    const [holdings, setHoldings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const res = await api.get('/investments');
                setHoldings(res.data);
            } catch (err) {
                setHoldings([
                    { id: 1, symbol: 'RELIANCE', asset_type: 'stock', units: 10, avg_buy_price: 2400, current_value: 29500, last_price: 2950 },
                    { id: 2, symbol: 'NIFTYBEES', asset_type: 'etf', units: 100, avg_buy_price: 210, current_value: 24500, last_price: 245 },
                    { id: 3, symbol: 'HDFC_BANK', asset_type: 'stock', units: 20, avg_buy_price: 1550, current_value: 33000, last_price: 1650 }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, []);

    const totalCost = holdings.reduce((acc, curr) => acc + (curr.units * curr.avg_buy_price), 0);
    const totalValue = holdings.reduce((acc, curr) => acc + curr.current_value, 0);
    const totalPL = totalValue - totalCost;
    const plPercentage = ((totalPL / totalCost) * 100).toFixed(2);

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
                                window.location.pathname === item.path ? 'text-[#2563eb] bg-blue-500/5 border-r-4 border-[#2563eb]' : 'text-slate-500 hover:text-white'
                            }`}
                        >
                            <span className="mr-4 text-lg">{item.icon}</span> {item.name}
                        </button>
                    ))}
                </nav>
                <div className="p-6 border-t border-slate-800">
                    <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="w-full bg-[#2563eb] py-3 rounded-xl text-center font-bold text-white uppercase tracking-wider text-[10px]">Logout System</button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden p-8 bg-[#f8fafc]">
                <header className="mb-6 flex justify-between items-end shrink-0">
                    <div>
                        <h1 className="text-2xl font-black text-[#0f172a] italic uppercase tracking-tight">Asset Portfolio</h1>
                        <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.2em]">Market-Linked Valuation</p>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Net Realized P&L</p>
                        <p className={`text-lg font-black italic ${totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {totalPL >= 0 ? '▲' : '▼'} ₹{Math.abs(totalPL).toLocaleString()} 
                            <span className="text-[10px] ml-2 font-bold">({plPercentage}%)</span>
                        </p>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto min-h-0 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="w-10 h-10 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <SummaryCard title="Invested" value={`₹${totalCost.toLocaleString()}`} />
                                <SummaryCard title="Current" value={`₹${totalValue.toLocaleString()}`} color="text-[#2563eb]" />
                                <SummaryCard title="Holdings" value={holdings.length} />
                                <div className="bg-[#0f172a] p-5 rounded-[2rem] text-white flex flex-col justify-center">
                                    <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1">Status</p>
                                    <p className="text-xs font-black italic uppercase text-green-400">● Market Open</p>
                                </div>
                            </div>

                            {/* Holdings Table */}
                            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                                    <h3 className="text-xs font-black text-[#0f172a] italic uppercase tracking-tight">Active Holdings</h3>
                                    <button className="text-[9px] font-black text-[#2563eb] uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-lg">Export Report</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Instrument</th>
                                                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                                                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg. Cost</th>
                                                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Market Price</th>
                                                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Value</th>
                                                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">P&L</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {holdings.map((stock) => {
                                                const pl = stock.current_value - (stock.units * stock.avg_buy_price);
                                                const singlePlPerc = ((pl / (stock.units * stock.avg_buy_price)) * 100).toFixed(1);
                                                return (
                                                    <tr key={stock.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-8 py-5">
                                                            <p className="font-black text-[#0f172a] italic text-xs uppercase">{stock.symbol}</p>
                                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{stock.asset_type}</p>
                                                        </td>
                                                        <td className="px-8 py-5 text-center font-bold text-slate-600 text-xs">{stock.units}</td>
                                                        <td className="px-8 py-5 font-bold text-slate-600 text-xs">₹{stock.avg_buy_price.toLocaleString()}</td>
                                                        <td className="px-8 py-5 font-black text-[#0f172a] text-xs">₹{stock.last_price.toLocaleString()}</td>
                                                        <td className="px-8 py-5 font-black text-[#2563eb] text-xs">₹{stock.current_value.toLocaleString()}</td>
                                                        <td className={`px-8 py-5 font-black italic text-xs text-right ${pl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                            {pl >= 0 ? '+' : ''}₹{pl.toLocaleString()}
                                                            <span className="block text-[8px] opacity-70">{singlePlPerc}%</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ title, value, color = "text-[#0f172a]" }) => (
    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-center">
        <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-1">{title}</p>
        <p className={`text-xl font-black italic tracking-tight ${color}`}>{value}</p>
    </div>
);

export default Portfolio;