import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../api";

const Risk = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        risk_profile: "moderate",
        age: "",
        monthly_income: "",
        investment_duration: "",
        preferred_sector: "",
        expected_return: ""
    });

    const [saved, setSaved] = useState(false);
    const [autoResult, setAutoResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/auth/profile");
                setForm({
                    risk_profile: res.data.risk_profile || "moderate",
                    age: res.data.age || "",
                    monthly_income: res.data.monthly_income || "",
                    investment_duration: res.data.investment_duration || "",
                    preferred_sector: res.data.preferred_sector || "",
                    expected_return: res.data.expected_return || ""
                });
            } catch (err) {
                console.log("Fetch failed");
            }
        };
        fetchProfile();
    }, []);

    const update = (k, v) => { setForm({ ...form, [k]: v }); setSaved(false); };

    const save = async () => {
        setLoading(true);
        try {
            await api.put("/auth/profile", {
                ...form,
                age: Number(form.age),
                monthly_income: Number(form.monthly_income),
                investment_duration: Number(form.investment_duration),
                expected_return: Number(form.expected_return)
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            alert("Sync Error");
        } finally {
            setLoading(false);
        }
    };

    const autoScore = async () => {
        setLoading(true);
        try {
            const res = await api.post("/risk/score", {
                age: Number(form.age),
                annual_income: Number(form.monthly_income) * 12,
                investment_years: Number(form.investment_duration)
            });
            setAutoResult(res.data);
            setForm(f => ({ ...f, risk_profile: res.data.risk_profile }));
        } catch (err) {
            alert("Engine Error");
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
                                window.location.pathname === item.path ? 'text-[#2563eb] bg-blue-500/5 border-r-4 border-[#2563eb]' : 'text-slate-500 hover:text-white'
                            }`}
                        >
                            <span className="mr-4 text-lg">{item.icon}</span> {item.name}
                        </button>
                    ))}
                </nav>
                {/* Logout Button Added Back */}
                <div className="p-6 border-t border-slate-800">
                    <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="w-full bg-[#2563eb] py-3 rounded-xl text-center font-bold text-white uppercase tracking-wider text-[10px]">Logout System</button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden p-8 bg-[#f8fafc]">
                <header className="mb-6 shrink-0">
                    <h1 className="text-2xl font-black text-[#0f172a] italic uppercase tracking-tight">Advanced Profiling</h1>
                    <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.2em]">Risk Intelligence Engine</p>
                </header>

                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xs font-black text-[#0f172a] mb-6 italic uppercase border-b border-slate-50 pb-2">Financial Parameters</h3>
                                <div className="grid grid-cols-2 gap-5">
                                    <InputField label="Age" value={form.age} onChange={v => update("age", v)} type="number" placeholder="25" />
                                    <InputField label="Income (₹/Mo)" value={form.monthly_income} onChange={v => update("monthly_income", v)} type="number" placeholder="50000" />
                                    <InputField label="Tenure (Yrs)" value={form.investment_duration} onChange={v => update("investment_duration", v)} type="number" placeholder="10" />
                                    <InputField label="Target Return (%)" value={form.expected_return} onChange={v => update("expected_return", v)} type="number" placeholder="12" />
                                </div>

                                <div className="mt-6 space-y-5">
                                    <InputField label="Preferred Sector" value={form.preferred_sector} onChange={v => update("preferred_sector", v)} placeholder="e.g. Technology" />
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Strategy Selection</label>
                                        <select 
                                            value={form.risk_profile}
                                            onChange={e => update("risk_profile", e.target.value)}
                                            className="w-full p-3.5 rounded-xl bg-slate-50 border-none font-bold text-xs text-[#0f172a] focus:ring-2 ring-blue-500/10 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="conservative">Conservative (Safety First)</option>
                                            <option value="moderate">Moderate (Balanced)</option>
                                            <option value="aggressive">Aggressive (Wealth Creation)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={save} disabled={loading} className="bg-[#0f172a] text-white py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                                        {loading ? 'SYNCING...' : 'SYNC WITH CLOUD'}
                                    </button>
                                    <button onClick={autoScore} disabled={loading} className="bg-[#2563eb] text-white py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all">
                                        {loading ? 'CALCULATING...' : '🚀 RUN AUTO-SCORE'}
                                    </button>
                                </div>
                                {saved && (
                                    <p className="text-center mt-3 text-green-500 font-black uppercase tracking-widest text-[8px] animate-pulse">
                                        Profile Successfully Synchronized ✅
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            {autoResult ? (
                                <div className="bg-gradient-to-br from-[#2563eb] to-[#0f172a] p-8 rounded-[2.5rem] text-white shadow-2xl flex-1 flex flex-col justify-center animate-in zoom-in-95 duration-500">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-300 italic">Analysis Result</span>
                                        <p className="text-4xl font-black italic tracking-tighter">{autoResult.score}</p>
                                    </div>
                                    <p className="text-2xl font-black uppercase italic tracking-tighter mb-6 leading-none">{autoResult.risk_profile}</p>
                                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <p className="text-[10px] font-bold leading-relaxed opacity-90 italic">
                                            "Strategy optimized. Given your profile, we recommend 
                                            {autoResult.risk_profile === 'aggressive' ? ' heavy equity exposure.' : ' balanced growth assets.'}"
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center flex-1 min-h-[250px]">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-xl mb-4">⌛</div>
                                    <p className="text-slate-300 font-black uppercase tracking-widest text-[9px] leading-relaxed">
                                        Awaiting input data...<br/>Run Auto Score for AI Result
                                    </p>
                                </div>
                            )}

                            <div className="bg-[#0f172a] p-6 rounded-[2rem] shadow-xl">
                                <h4 className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2 italic">Risk Advisory</h4>
                                <p className="text-[10px] font-bold text-slate-300 leading-tight">
                                    {form.risk_profile === 'aggressive' 
                                        ? "Expect high volatility. Keep 12 months liquid cash." 
                                        : "Low volatility path. Consistency is key for target."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InputField = ({ label, value, onChange, type = "text", placeholder }) => (
    <div className="space-y-1.5">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input 
            type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className="w-full p-3.5 rounded-xl bg-slate-50 border-none font-bold text-xs text-[#0f172a] focus:ring-2 ring-blue-500/10 outline-none transition-all placeholder:opacity-20 shadow-inner"
        />
    </div>
);

export default Risk;