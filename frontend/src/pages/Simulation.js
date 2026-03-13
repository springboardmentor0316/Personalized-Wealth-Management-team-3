import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Simulation = () => {
    const navigate = useNavigate();
    const [monthly, setMonthly] = useState("");
    const [years, setYears] = useState("");
    const [returns, setReturns] = useState("12");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const runSimulation = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            
            const res = await api.post("/simulate", null, {
                params: {
                    monthly_investment: monthly,
                    years: years,
                    expected_return: returns
                }
            });
            setResult(res.data);
        } catch (err) {
        
            const p = parseFloat(monthly);
            const n = parseFloat(years) * 12;
            const r = parseFloat(returns) / 100 / 12;
            const finalValue = p * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
            
            setResult({
                total_invested: Math.round(p * n),
                final_value: Math.round(finalValue),
                profit: Math.round(finalValue - (p * n))
            });
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
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center font-bold italic text-lg">W</div>
                    <span className="text-xl font-black italic tracking-tight">Wealth<span className="text-[#2563eb]">Track</span></span>
                </div>
                <nav className="flex-1 mt-4">
                    {menuItems.map((item) => (
                        <button key={item.name} onClick={() => navigate(item.path)} 
                            className={`w-full flex items-center px-8 py-3 transition-all text-left font-bold text-[11px] tracking-widest uppercase ${
                                window.location.pathname === item.path ? 'text-[#2563eb] bg-blue-500/5 border-r-4 border-[#2563eb]' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <span className="mr-4 text-lg">{item.icon}</span> {item.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-black text-[#0f172a] italic uppercase tracking-tight">Future Simulator</h1>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Projection Engine v1.0</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto pr-2">
                    {/* Input Panel */}
                    <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-fit">
                        <h2 className="text-sm font-black text-[#0f172a] mb-6 italic uppercase border-b-4 border-[#2563eb] inline-block pb-1">Set Parameters</h2>
                        <form onSubmit={runSimulation} className="space-y-5">
                            <SimInput label="Monthly SIP (₹)" value={monthly} onChange={setMonthly} placeholder="5000" />
                            <SimInput label="Time Horizon (Years)" value={years} onChange={setYears} placeholder="10" />
                            <SimInput label="Expected Return (%)" value={returns} onChange={setReturns} placeholder="12" />
                            
                            <button type="submit" disabled={loading} className="w-full bg-[#0f172a] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#2563eb] transition-all shadow-xl">
                                {loading ? "Computing..." : "Run Future Projection"}
                            </button>
                        </form>
                    </div>

                    {/* Results Display */}
                    <div className="lg:col-span-2 space-y-6">
                        {result ? (
                            <div className="animate-in fade-in slide-in-from-right duration-500">
                                <div className="bg-[#0f172a] p-10 rounded-[3rem] text-white relative overflow-hidden mb-6">
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2">Estimated Wealth</p>
                                        <h2 className="text-5xl font-black italic tracking-tighter">₹{result.final_value.toLocaleString()}</h2>
                                        <div className="grid grid-cols-2 gap-8 mt-10">
                                            <div>
                                                <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Total Invested</p>
                                                <p className="text-xl font-bold">₹{result.total_invested.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Est. Returns</p>
                                                <p className="text-xl font-bold text-green-400">+₹{result.profit.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                                </div>

                                
                                <div className="grid grid-cols-2 gap-4">
                                    <ScenarioCard title="Conservative (8%)" value={result.final_value * 0.8} color="border-orange-200" />
                                    <ScenarioCard title="Aggressive (15%)" value={result.final_value * 1.2} color="border-green-200" />
                                </div>
                            </div>
                        ) : (
                            <div className="h-full border-2 border-dashed border-slate-200 rounded-[3rem] flex items-center justify-center text-slate-400">
                                <p className="text-[10px] font-black uppercase tracking-widest">Adjust parameters to see the future</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SimInput = ({ label, value, onChange, placeholder }) => (
    <div className="space-y-1.5">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input 
            type="number" 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-sm outline-none focus:ring-2 ring-blue-500/20 transition-all"
            required
        />
    </div>
);

const ScenarioCard = ({ title, value, color }) => (
    <div className={`bg-white p-6 rounded-3xl border ${color} shadow-sm`}>
        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">{title}</p>
        <p className="text-lg font-black text-[#0f172a] italic">₹{Math.round(value).toLocaleString()}</p>
    </div>
);

export default Simulation;