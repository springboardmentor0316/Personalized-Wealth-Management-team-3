import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer, 
    LineChart, 
    Line, 
    CartesianGrid 
} from 'recharts';


const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ 
        totalPortfolio: 0, 
        monthlyInvest: 0, 
        goalsAchieved: 0, 
        netWorth: 30000 
    });
    const [goalData, setGoalData] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/v1/dashboard/summary', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data.stats);
                setGoalData(response.data.goals);
                setPerformanceData(response.data.performance);
            } catch (error) {
                // Default mock data for visualization testing
                setGoalData([
                    { name: 'Retirement', current: 12000, target: 50000 }, 
                    { name: 'Home', current: 8000, target: 100000 }
                ]);
                setPerformanceData([
                    { month: 'Jan', value: 20000 }, 
                    { month: 'Feb', value: 25000 }, 
                    { month: 'Mar', value: 30000 }
                ]);
            }
        };
        fetchDashboardData();
    }, [navigate]);

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: '📊' },
        { name: 'Goals', path: '/goals', icon: '🎯' },
        { name: 'Portfolio', path: '/portfolio', icon: '💼' },
        { name: 'Profile', path: '/profile', icon: '👤' },
        { name: 'Transactions', path: '/transactions', icon: '💸' },
        { name: 'Risk Profile', path: '/risk', icon: '⚖️' }
    ];

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleDownloadReport = () => {
        alert("Action: Generating Financial Report PDF...");
    };

    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900">
            {/* Navigation Sidebar */}
            <div className="w-64 bg-[#0f172a] text-white flex flex-col shrink-0 shadow-xl">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20">W</div>
                        <span className="text-xl font-bold tracking-tight italic">Wealth<span className="text-[#2563eb]">Track</span></span>
                    </div>

                    <button 
                        onClick={handleDownloadReport}
                        className="w-full bg-white/5 border border-white/10 hover:bg-[#2563eb] hover:border-[#2563eb] py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 group"
                    >
                        <span className="text-xs">📄</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 group-hover:text-white">Download Report</span>
                    </button>
                </div>
                
                <nav className="flex-1 mt-4">
                    {menuItems.map((item) => (
                        <button 
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center px-8 py-4 transition-all text-left font-semibold text-[13px] tracking-wide uppercase ${
                                window.location.pathname === item.path ? 'text-[#2563eb] bg-blue-500/5 border-r-4 border-[#2563eb]' : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <span className="mr-4 text-lg opacity-80">{item.icon}</span> {item.name}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-800">
                    <button onClick={handleLogout} className="w-full bg-[#2563eb] py-3 rounded-xl text-center font-bold shadow-lg text-white uppercase tracking-wider text-[10px] hover:bg-blue-600 transition-colors">
                        Logout System
                    </button>
                </div>
            </div>

            {/* Content Viewport */}
            <div className="flex-1 overflow-y-auto p-10">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-[#0f172a] tracking-tight italic">Dashboard Summary</h1>
                        <p className="text-slate-500 font-medium text-xs mt-1 uppercase tracking-wider">User Account: <span className="text-[#2563eb] font-bold">Krishna</span></p>
                    </div>
                    <button onClick={() => navigate('/simulation')} className="bg-[#2563eb] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/15 hover:bg-[#0f172a] transition-all tracking-wider uppercase text-[10px]">
                        Run Simulation
                    </button>
                </header>

                {/* Performance Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <StatCard title="Total Portfolio" value={`₹ ${stats.totalPortfolio}`} />
                    <StatCard title="Monthly Investment" value={`₹ ${stats.monthlyInvest}`} />
                    <StatCard title="Goals Achieved" value={stats.goalsAchieved} />
                    <StatCard title="Net Worth" value={`₹ ${stats.netWorth}`} highlight={true} />
                </div>

                {/* Analytical Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-[0.2em] mb-8 italic text-center">Goal Progress Analysis</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={goalData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 10}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600, fontSize: 10}} />
                                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}} />
                                    <Bar dataKey="current" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                                    <Bar dataKey="target" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-[0.2em] mb-8 italic text-center">Portfolio Performance</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 10}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600, fontSize: 10}} />
                                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}} />
                                    <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4} dot={{ r: 6, fill: '#2563eb', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const StatCard = ({ title, value, highlight = false }) => (
    <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-all">
        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.15em] mb-2">{title}</p>
        <p className={`text-2xl font-black tracking-tight ${highlight ? 'text-[#2563eb]' : 'text-slate-800'}`}>
            {value}
        </p>
    </div>
);

export default Dashboard;