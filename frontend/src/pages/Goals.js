import { useEffect, useState } from "react";
import api from "../api";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({
    goal_type: "",
    target_amount: "",
    target_date: "",
    monthly_contribution: ""
  });

  const loadGoals = () => {
    api.get("/goals").then(res => setGoals(res.data));
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const addGoal = async () => {
    await api.post("/goals", {
      goal_type: form.goal_type,
      target_amount: Number(form.target_amount),
      target_date: form.target_date,
      monthly_contribution: Number(form.monthly_contribution)
    });

    setForm({
      goal_type: "",
      target_amount: "",
      target_date: "",
      monthly_contribution: ""
    });

    loadGoals();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 space-y-8">

      <h1 className="text-3xl font-bold text-indigo-700">
        Goals Planner
      </h1>

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4 max-w-xl">

        <input
          className="border p-3 rounded w-full"
          placeholder="Goal Type"
          value={form.goal_type}
          onChange={e => update("goal_type", e.target.value)}
        />

        <input
          className="border p-3 rounded w-full"
          placeholder="Target Amount"
          value={form.target_amount}
          onChange={e => update("target_amount", e.target.value)}
        />

        <input
          className="border p-3 rounded w-full"
          type="date"
          value={form.target_date}
          onChange={e => update("target_date", e.target.value)}
        />

        <input
          className="border p-3 rounded w-full"
          placeholder="Monthly Contribution"
          value={form.monthly_contribution}
          onChange={e => update("monthly_contribution", e.target.value)}
        />

        <button
          onClick={addGoal}
          className="bg-indigo-600 text-white px-6 py-3 rounded"
        >
          Add Goal
        </button>
      </div>

      {/* Goals List */}
      <div className="grid gap-4">

        {goals.map(g => {
          const today = new Date();
          const target = new Date(g.target_date);

          const monthsLeft = Math.max(
            1,
            (target.getFullYear() - today.getFullYear()) * 12 +
            (target.getMonth() - today.getMonth())
          );

          const invested =
            Number(g.monthly_contribution) * Math.max(0, 12 - monthsLeft);

          const progress = Math.min(
            100,
            Math.round((invested / Number(g.target_amount)) * 100)
          );

          return (
            <div key={g.id} className="bg-white p-5 rounded-xl shadow space-y-1">

              <h2 className="font-semibold text-lg">{g.goal_type}</h2>

              <p>Target: ₹ {g.target_amount}</p>
              <p>Monthly: ₹ {g.monthly_contribution}</p>
              <p>Date: {g.target_date}</p>

              <div className="w-full bg-gray-200 rounded h-3 mt-2">
                <div
                  className="bg-indigo-600 h-3 rounded"
                  style={{ width: progress + "%" }}
                />
              </div>

              <p className="text-sm text-gray-600">
                Progress: {progress}% • {monthsLeft} months left
              </p>

            </div>
          );
        })}

      </div>

    </div>
  );
}
