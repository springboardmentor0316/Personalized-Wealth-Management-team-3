import { useEffect, useState } from "react";
import api from "../api";

export default function Risk() {
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

  useEffect(() => {
    api.get("/profile").then(res => {
      setForm({
        risk_profile: res.data.risk_profile || "moderate",
        age: res.data.age || "",
        monthly_income: res.data.monthly_income || "",
        investment_duration: res.data.investment_duration || "",
        preferred_sector: res.data.preferred_sector || "",
        expected_return: res.data.expected_return || ""
      });
    });
  }, []);

  const update = (k, v) => setForm({ ...form, [k]: v });

  // ✅ manual save (tumhara original)
  const save = async () => {
    await api.put("/profile", {
      ...form,
      age: Number(form.age),
      monthly_income: Number(form.monthly_income),
      investment_duration: Number(form.investment_duration),
      expected_return: Number(form.expected_return)
    });
    setSaved(true);
  };

  // ✅ smart auto risk engine call
  const autoScore = async () => {
    const res = await api.post("/risk/score", {
      age: Number(form.age),
      annual_income: Number(form.monthly_income) * 12,
      investment_years: Number(form.investment_duration)
    });

    setAutoResult(res.data);

    // auto update dropdown also
    setForm(f => ({
      ...f,
      risk_profile: res.data.risk_profile
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg space-y-5">

        <h1 className="text-2xl font-bold text-indigo-700">
          Advanced Risk Profiling — Krishna
        </h1>

        {/* risk dropdown */}
        <select
          value={form.risk_profile}
          onChange={e => update("risk_profile", e.target.value)}
          className="border p-3 rounded w-full"
        >
          <option value="conservative">Conservative</option>
          <option value="moderate">Moderate</option>
          <option value="aggressive">Aggressive</option>
        </select>

        <input className="border p-3 rounded w-full"
          placeholder="Age"
          value={form.age}
          onChange={e => update("age", e.target.value)}
        />

        <input className="border p-3 rounded w-full"
          placeholder="Monthly Income"
          value={form.monthly_income}
          onChange={e => update("monthly_income", e.target.value)}
        />

        <input className="border p-3 rounded w-full"
          placeholder="Investment Duration (years)"
          value={form.investment_duration}
          onChange={e => update("investment_duration", e.target.value)}
        />

        <input className="border p-3 rounded w-full"
          placeholder="Preferred Sector"
          value={form.preferred_sector}
          onChange={e => update("preferred_sector", e.target.value)}
        />

        <input className="border p-3 rounded w-full"
          placeholder="Expected Return %"
          value={form.expected_return}
          onChange={e => update("expected_return", e.target.value)}
        />

        {/* buttons row */}
        <div className="grid grid-cols-2 gap-4">

          <button
            onClick={save}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded font-semibold"
          >
            Save Profile
          </button>

          <button
            onClick={autoScore}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded font-semibold"
          >
            Auto Risk Score
          </button>

        </div>

        {saved && (
          <p className="text-green-600 font-medium">
            Saved successfully ✅
          </p>
        )}

        {autoResult && (
          <div className="bg-green-50 p-4 rounded border">
            <p>Smart Score: {autoResult.score}</p>
            <p>Suggested Profile: {autoResult.risk_profile}</p>
          </div>
        )}

      </div>
    </div>
  );
}
