import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Goals = () => {
    const navigate = useNavigate();
    const [goals, setGoals] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Original Fields Wapas: goal_type, target_amount, target_date, monthly_contribution
    const [newGoal, setNewGoal] = useState({
        goal_type: 'retirement',
        target_amount: '',
        target_date: '',
        monthly_contribution: '' 
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        fetchGoals();
    }, [navigate]);

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const response = await api.get('/goals');
            setGoals(response.data);
        } catch (error) {
            // Demo data for visual testing
            setGoals([
                { id: 1, goal_type: 'RETIREMENT', target_amount: 10000000, current_amount: 500000, target_date: '2045-12-31' },
                { id: 2, goal_type: 'EDUCATION', target_amount: 2000000, current_amount: 150000, target_date: '2030-06-15' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddGoal = async (e) => {
        e.preventDefault();
        try {
            await api.post('/goals', newGoal);
            setShowForm(false);
            setNewGoal({ goal_type: 'retirement', target_amount: '', target_date: '', monthly_contribution: '' }); // Reset
            fetchGoals();
        } catch (error) {
            alert("Error creating goal. Please check your connection.");
        }
    };

    const handleDeleteGoal = async (goalId) => {
        if (!window.confirm("Are you sure you want to delete this financial goal?")) return;
        try {
            await api.delete(`/goals/${goalId}`);
            setGoals(goals.filter(g => g.id !== goalId));
        } catch (error) {
            alert("Error deleting goal.");
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
            {/* Sidebar - Persistent Design */}
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
                <div className="p-6 border-t border-slate-800">
                    <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="w-full bg-[#2563eb] py-3 rounded-xl text-center font-bold text-white uppercase tracking-wider text-[10px]">Logout System</button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden p-8">
                <header className="flex justify-between items-end mb-8 shrink-0">
                    <div>
                        <h1 className="text-3xl font-black text-[#0f172a] tracking-tight italic uppercase">Financial Goals</h1>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Milestone Tracking & Simulation</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className="bg-[#2563eb] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
                        {showForm ? '✕ Close Form' : '+ Create New Goal'}
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
                    {/* NEW GOAL FORM - All 4 fields present as requested */}
                    {showForm && (
                        <div className="mb-10 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in zoom-in duration-300">
                            <h2 className="text-xl font-black mb-8 text-[#0f172a] italic uppercase border-b-4 border-[#2563eb] inline-block pb-1">New Objective</h2>
                            <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Goal Category</label>
                                    <select 
                                        className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold text-sm outline-none appearance-none cursor-pointer"
                                        value={newGoal.goal_type} 
                                        onChange={(e) => setNewGoal({...newGoal, goal_type: e.target.value})}
                                    >
                                        <option value="retirement">Retirement Planning</option>
                                        <option value="home">Home Purchase</option>
                                        <option value="education">Education Fund</option>
                                        <option value="custom">Custom Goal</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Amount (₹)</label>
                                    <input 
                                        type="number" 
                                        placeholder="e.g. 10,00,000"
                                        className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold text-sm outline-none focus:ring-2 ring-blue-500/20"
                                        value={newGoal.target_amount}
                                        onChange={(e) => setNewGoal({...newGoal, target_amount: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Completion Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold text-sm outline-none"
                                        value={newGoal.target_date}
                                        onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly SIP (₹)</label>
                                    <input 
                                        type="number" 
                                        placeholder="Optional monthly contribution"
                                        className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold text-sm outline-none"
                                        value={newGoal.monthly_contribution}
                                        onChange={(e) => setNewGoal({...newGoal, monthly_contribution: e.target.value})} 
                                    />
                                </div>
                                <button type="submit" className="md:col-span-2 bg-[#0f172a] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#2563eb] transition-all shadow-xl">
                                    Initialize Financial Objective
                                </button>
                            </form>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {goals.map((goal) => (
                                <GoalCard key={goal.id} goal={goal} onDelete={handleDeleteGoal} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const GoalCard = ({ goal, onDelete }) => {
    const current = goal.current_amount || 0;
    const target = goal.target_amount || 1;
    const progress = Math.min(Math.round((current / target) * 100), 100);

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative group overflow-hidden transition-all hover:shadow-md">
            {/* Hover Delete Button */}
            <button 
                onClick={() => onDelete(goal.id)} 
                className="absolute top-6 right-6 p-2 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
            >
                <span className="text-[10px] font-bold">🗑️</span>
            </button>

            <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <h3 className="text-2xl font-black text-[#0f172a] italic uppercase tracking-tighter">{goal.goal_type}</h3>
                    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-1 italic underline decoration-[#2563eb] decoration-2 underline-offset-4">Milestone: {goal.target_date}</p>
                </div>
                <div className="bg-blue-50 text-[#2563eb] px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest">
                    {progress}% Done
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                <div>
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">
                        <span>Current Corpus</span>
                        <span className="text-[#0f172a]">₹{current.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                        <div 
                            className="h-full bg-gradient-to-r from-[#2563eb] to-blue-400 rounded-full transition-all duration-1000 shadow-sm" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex justify-between items-end pt-6 border-t border-slate-50">
                    <div>
                        <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-1">Target Wealth</p>
                        <p className="text-2xl font-black text-[#0f172a] tracking-tighter italic">₹{target.toLocaleString()}</p>
                    </div>
                    <button className="bg-[#0f172a] text-white p-3 rounded-xl hover:bg-[#2563eb] transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2">Analyze →</span>
                    </button>
                </div>
            </div>
            {/* Background Aesthetic Circle */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors duration-500"></div>
        </div>
    );
};

export default Goals;