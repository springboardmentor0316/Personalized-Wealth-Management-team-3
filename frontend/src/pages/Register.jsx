import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const register = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/register", { name, email, password });
      alert("Account created successfully!");
      navigate("/login");
    } catch (error) {
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans">
      
      {/* LEFT SECTION */}
      <div className="hidden lg:flex w-1/2 bg-[#0f172a] p-20 flex-col justify-center text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-[#2563eb] rounded-2xl flex items-center justify-center font-black text-2xl italic shadow-xl shadow-blue-500/40">W</div>
            <span className="text-3xl font-black tracking-tighter italic">Wealth<span className="text-[#2563eb]">Track</span></span>
          </div>

          <h1 className="text-6xl font-black leading-[1.1] tracking-tight mb-6">
            Start Your <br />
            <span className="text-[#2563eb]">Journey Today.</span>
          </h1>

          <p className="text-slate-400 text-xl leading-relaxed max-w-lg mb-12 font-medium">
            Join thousands of smart investors using WealthTrack to monitor their financial growth.
          </p>

          
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm w-fit pr-10 hover:bg-white/10 transition-all">
              <span className="text-2xl">🔒</span>
              <span className="font-bold text-slate-200">Secure Investment Tracking</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm w-fit pr-10 hover:bg-white/10 transition-all">
              <span className="text-2xl">📊</span>
              <span className="font-bold text-slate-200">Smart Risk Insights</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm w-fit pr-10 hover:bg-white/10 transition-all">
              <span className="text-2xl">🎯</span>
              <span className="font-bold text-slate-200">Goal Progress Monitoring</span>
            </div>
          </div>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#2563eb]/10 rounded-full blur-[120px]"></div>
      </div>

      {/* RIGHT SECTION - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white lg:bg-transparent">
        <div className="w-full max-w-[440px] bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 lg:shadow-none">
          <h2 className="text-4xl font-black text-[#0f172a] mb-2 tracking-tight italic">Create Account</h2>
          <p className="text-slate-500 mb-8 font-bold">Sign up to start managing your wealth</p>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:border-[#2563eb] focus:bg-white outline-none transition-all font-bold text-slate-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Identity</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:border-[#2563eb] focus:bg-white outline-none transition-all font-bold text-slate-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
              <input
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:border-[#2563eb] focus:bg-white outline-none transition-all font-bold text-slate-800"
              />
            </div>

            <button
              onClick={register}
              disabled={loading}
              className="w-full bg-[#0f172a] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#2563eb] transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 mt-4 tracking-tight"
            >
              {loading ? "CREATING ACCOUNT..." : "REGISTER IDENTITY"}
            </button>
          </div>

          <p className="mt-8 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
            Already a member? <span onClick={() => navigate("/login")} className="text-[#2563eb] cursor-pointer hover:underline ml-1">Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}