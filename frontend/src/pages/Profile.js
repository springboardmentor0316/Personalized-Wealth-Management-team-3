import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({
        name: 'User',
        email: '...',
        risk_profile: 'moderate',
        kyc_status: 'unverified'
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/profile');
                setUser(res.data);
            } catch (err) {
                console.log("Mock data active");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleRiskUpdate = async (level) => {
        try {
            setUser({ ...user, risk_profile: level });
            await api.put('/auth/profile', { risk_profile: level });
        } catch (err) {
            alert("Update failed");
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

    if (loading) return (
        <div className="flex h-screen bg-[#f8fafc]">
            <div className="w-64 bg-[#0f172a] shrink-0 h-full"></div>
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );

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
                <header className="mb-6 shrink-0">
                    <h1 className="text-2xl font-black text-[#0f172a] italic uppercase tracking-tight">User Identity</h1>
                    <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.2em]">Profile & Security Settings</p>
                </header>

                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Personal Details Card */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-6 mb-8 border-b border-slate-50 pb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#2563eb] to-[#0f172a] rounded-2xl flex items-center justify-center text-2xl text-white font-black shadow-lg">
                                        {user.name[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-[#0f172a] italic uppercase tracking-tight">{user.name}</h2>
                                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{user.email}</p>
                                    </div>
                                </div>

                                <h3 className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-[0.2em] italic">Account Information</h3>
                                <div className="grid grid-cols-2 gap-5">
                                    <InfoBox label="Full Name" value={user.name} />
                                    <InfoBox label="Email Address" value={user.email} />
                                    <InfoBox label="KYC Status" value={user.kyc_status} isStatus />
                                    <InfoBox label="Member Since" value="March 2026" />
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">To update details, contact admin</p>
                                <button className="bg-[#0f172a] text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                                    Edit Account
                                </button>
                            </div>
                        </div>

                        {/* Security & Risk Summary Sidebar */}
                        <div className="flex flex-col gap-6">
                            {/* Strategy Card */}
                            <div className="bg-gradient-to-br from-[#2563eb] to-[#0f172a] p-8 rounded-[2.5rem] text-white shadow-2xl flex flex-col justify-center">
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-300 italic mb-2">Current Strategy</span>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-6">{user.risk_profile}</h3>
                                
                                <div className="grid grid-cols-3 gap-2">
                                    <SmallRiskBtn label="C" active={user.risk_profile === 'conservative'} onClick={() => handleRiskUpdate('conservative')} />
                                    <SmallRiskBtn label="M" active={user.risk_profile === 'moderate'} onClick={() => handleRiskUpdate('moderate')} />
                                    <SmallRiskBtn label="A" active={user.risk_profile === 'aggressive'} onClick={() => handleRiskUpdate('aggressive')} />
                                </div>
                                <p className="text-[8px] font-bold mt-4 opacity-60 text-center uppercase tracking-widest italic">Quick Switch Risk Level</p>
                            </div>

                            {/* Security Status Card */}
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex-1">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-6">Security Check</h4>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-[9px] font-black mb-2 uppercase">
                                            <span>Profile Safety</span>
                                            <span className="text-[#2563eb]">85%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                            <div className="w-[85%] h-full bg-[#2563eb] rounded-full shadow-[0_0_8px_rgba(37,99,235,0.3)]"></div>
                                        </div>
                                    </div>
                                    <button className="w-full py-3.5 bg-slate-50 border border-slate-100 rounded-xl font-black uppercase tracking-widest text-[8px] text-[#0f172a] hover:bg-[#2563eb] hover:text-white transition-all">
                                        Verify Identity
                                    </button>
                                </div>
                            </div>

                            {/* Tip Box */}
                            <div className="bg-[#0f172a] p-6 rounded-[2rem] shadow-xl shrink-0">
                                <h4 className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2 italic">Security Advisory</h4>
                                <p className="text-[10px] font-bold text-slate-300 leading-tight">
                                    Keep your KYC updated to ensure seamless withdrawals and market transactions.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoBox = ({ label, value, isStatus }) => (
    <div className="space-y-1.5">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <div className={`w-full p-3.5 rounded-xl bg-slate-50 font-bold text-xs ${isStatus && value === 'verified' ? 'text-green-600' : isStatus ? 'text-orange-500' : 'text-[#0f172a] uppercase'}`}>
            {value}
        </div>
    </div>
);

const SmallRiskBtn = ({ label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`py-2 rounded-lg font-black text-xs transition-all ${
            active ? 'bg-white text-[#2563eb] shadow-lg' : 'bg-white/10 text-white/40 hover:bg-white/20'
        }`}
    >
        {label}
    </button>
);

export default Profile;