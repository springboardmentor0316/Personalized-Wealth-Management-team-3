import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const resetPassword = () => {
    if (!email) {
      alert("Please enter your registered email");
      return;
    }
    setLoading(true);
    // Mimicking API call
    setTimeout(() => {
      alert("Success! Password reset link sent to " + email);
      setLoading(false);
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans">
      
      {/* LEFT SIDE - Matching the Login Theme */}
      <div className="hidden lg:flex w-1/2 bg-[#0f172a] p-20 flex-col justify-center text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-[#2563eb] rounded-2xl flex items-center justify-center font-black text-2xl italic shadow-xl shadow-blue-500/40">W</div>
            <span className="text-3xl font-black tracking-tighter italic">Wealth<span className="text-[#2563eb]">Track</span></span>
          </div>

          <h1 className="text-6xl font-black leading-[1.1] tracking-tight mb-6">
            Recover Your <br />
            <span className="text-[#2563eb]">Account.</span>
          </h1>

          <p className="text-slate-400 text-xl leading-relaxed max-w-lg mb-12 font-medium">
            Don't worry, it happens to the best of us. Let's get you back to managing your assets.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm w-fit pr-10">
              <span className="text-2xl">🔒</span>
              <span className="font-bold text-slate-200">Secure Recovery Process</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm w-fit pr-10">
              <span className="text-2xl">⚡</span>
              <span className="font-bold text-slate-200">Instant Verification Link</span>
            </div>
          </div>
        </div>

        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#2563eb]/10 rounded-full blur-[120px]"></div>
      </div>

      {/* RIGHT SIDE - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white lg:bg-transparent">
        <div className="w-full max-w-[420px] bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 lg:shadow-none">
          <h2 className="text-4xl font-black text-[#0f172a] mb-2 tracking-tight italic">Forgot Password?</h2>
          <p className="text-slate-500 mb-10 font-bold">No problem! Enter your email to reset.</p>

          <div className="space-y-6">
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

            <button
              onClick={resetPassword}
              disabled={loading}
              className="w-full bg-[#0f172a] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#2563eb] transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 mt-4 tracking-tight"
            >
              {loading ? "SENDING LINK..." : "SEND RECOVERY LINK"}
            </button>
          </div>

          <p className="mt-10 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
            Wait, I remember! <span onClick={() => navigate("/login")} className="text-[#2563eb] cursor-pointer hover:underline ml-1">Back to Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}