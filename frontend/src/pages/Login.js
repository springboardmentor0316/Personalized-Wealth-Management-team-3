import { useState } from "react";
import api from "../api"; 
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) {
      alert("Enter email & password");
      return;
    }
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("username", email.trim());
      params.append("password", password);
      const res = await api.post("/auth/login", params);
      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (error) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-[#0f172a]">
      
      <div className="hidden lg:flex w-1/2 bg-[#0f172a] p-16 flex-col justify-center text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#2563eb] rounded-xl flex items-center justify-center font-black text-xl italic shadow-lg shadow-blue-500/20">W</div>
            <span className="text-2xl font-black tracking-tighter italic uppercase">Wealth<span className="text-[#2563eb]">Track</span></span>
          </div>

          <h1 className="text-5xl font-black leading-tight tracking-tighter mb-5 italic">
            Build Your Financial <br />
            <span className="text-[#2563eb]">Future Today.</span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed max-w-md mb-10 font-medium">
            Track investments, manage goals and grow wealth with our modern intelligent platform designed for excellence.
          </p>

          <div className="space-y-3">
            <FeatureItem icon="🛡️" label="Secure Investment Tracking" />
            <FeatureItem icon="📈" label="Smart Risk Insights" />
            <FeatureItem icon="🎯" label="Goal Progress Monitoring" />
          </div>
        </div>

        <p className="absolute bottom-10 left-16 text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase opacity-50">
          © 2026 WealthTrack Exclusive System
        </p>
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#2563eb]/10 rounded-full blur-[120px]"></div>
      </div>

      
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white lg:bg-transparent">
        <div className="w-full max-w-[400px] bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-slate-50">
          <h2 className="text-3xl font-black text-[#0f172a] mb-1 tracking-tight italic uppercase">Welcome Back</h2>
          <p className="text-slate-400 mb-10 font-bold text-[11px] uppercase tracking-wider">Please enter your terminal access keys</p>

          <div className="space-y-5">
            <div className="space-y-2">
              
              <label className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-xl border-2 border-slate-50 bg-slate-50 focus:border-[#2563eb]/20 focus:bg-white outline-none transition-all font-bold text-sm text-slate-800"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                
                <label className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest">Access Key</label>
                <span onClick={() => navigate("/forgot-password")} className="text-[10px] font-black text-[#2563eb] cursor-pointer hover:underline uppercase">Forgot?</span>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-xl border-2 border-slate-50 bg-slate-50 focus:border-[#2563eb]/20 focus:bg-white outline-none transition-all font-bold text-sm text-slate-800"
              />
            </div>

            
            <button
              onClick={login}
              disabled={loading}
              className="w-full bg-[#0f172a] text-white py-5 rounded-xl font-black text-xs uppercase tracking-[0.3em] hover:bg-[#2563eb] transition-all shadow-xl shadow-blue-500/10 active:scale-95 disabled:opacity-50 mt-4"
            >
              {loading ? "Verifying..." : "Initialize Session"}
            </button>
          </div>

          <p className="mt-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            New user? <span onClick={() => navigate("/register")} className="text-[#2563eb] cursor-pointer hover:underline ml-1">Request Access</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const FeatureItem = ({ icon, label }) => (
  <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-xl border border-white/10 backdrop-blur-sm w-fit pr-8 hover:bg-white/10 transition-all cursor-default">
    <span className="text-xl">{icon}</span>
    <span className="font-bold text-slate-200 text-xs tracking-wide">{label}</span>
  </div>
);