import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

export default function Dashboard() {

  const [goals, setGoals] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [networth, setNetworth] = useState(0);
  const [netHistory, setNetHistory] = useState([]);

  useEffect(() => {

    const loadData = () => {

      api.get("/goals")
        .then(res => setGoals(res.data))
        .catch(() => {
          alert("Please login again");
          window.location.href = "/";
        });

      api.get("/investments")
        .then(res => setInvestments(res.data))
        .catch(() => {});

      api.get("/networth")
        .then(res => setNetworth(res.data.net_worth))
        .catch(() => {});

      api.get("/networth/history")
        .then(res => setNetHistory(res.data))
        .catch(() => {});
    };

    loadData();

    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);

  }, []);

  const totalGoals = goals.length;

  const totalTarget = goals.reduce(
    (s, g) => s + Number(g.target_amount || 0), 0
  );

  const totalInvested = investments.reduce(
    (s, i) => s + Number(i.amount || 0), 0
  );

  const chartData = goals.map(g => ({
    name: g.goal_type,
    target: Number(g.target_amount || 0)
  }));

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (

<div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-8 space-y-10">

{/* HEADER */}

<div className="flex justify-between items-center">

<div>
<h1 className="text-3xl font-bold text-indigo-700">
Wealth Dashboard
</h1>

<p className="text-gray-500 text-sm mt-1">
Manage your investments and financial goals
</p>
</div>

<div className="flex items-center gap-4">

<div className="bg-white px-4 py-2 rounded-lg shadow border text-sm">
👋 Krishna
</div>

<Link
to="/simulation"
className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
>
Simulation
</Link>

<button
onClick={logout}
className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
>
Logout
</button>

</div>

</div>


{/* SUMMARY CARDS */}

<div className="grid md:grid-cols-4 gap-6">

<div className="bg-white p-6 rounded-xl shadow">
<h2 className="text-gray-500">Total Goals</h2>
<p className="text-2xl font-bold">{totalGoals}</p>
</div>

<div className="bg-white p-6 rounded-xl shadow">
<h2 className="text-gray-500">Total Target ₹</h2>
<p className="text-2xl font-bold">{totalTarget}</p>
</div>

<div className="bg-white p-6 rounded-xl shadow">
<h2 className="text-gray-500">Total Invested ₹</h2>
<p className="text-2xl font-bold text-green-600">
₹ {totalInvested}
</p>
</div>

<div className="bg-white p-6 rounded-xl shadow">
<h2 className="text-gray-500">Net Worth ₹</h2>
<p className="text-2xl font-bold">{networth}</p>
</div>

</div>


{/* GOAL TARGET CHART */}

<div className="bg-white p-6 rounded-xl shadow h-80">

<h2 className="font-semibold mb-4">
Goal Target Comparison
</h2>

<ResponsiveContainer width="100%" height="100%">

<BarChart data={chartData}>

<CartesianGrid strokeDasharray="3 3" />

<XAxis dataKey="name" />

<YAxis />

<Tooltip />

<Bar dataKey="target" fill="#6366f1" />

</BarChart>

</ResponsiveContainer>

</div>


{/* NET WORTH GRAPH */}

<div className="bg-white p-6 rounded-xl shadow h-80">

<h2 className="font-semibold mb-4">
Net Worth Growth
</h2>

<ResponsiveContainer width="100%" height="100%">

<LineChart data={netHistory}>

<CartesianGrid strokeDasharray="3 3" />

<XAxis dataKey="month" />

<YAxis />

<Tooltip />

<Line
type="monotone"
dataKey="value"
stroke="#4f46e5"
strokeWidth={3}
/>

</LineChart>

</ResponsiveContainer>

</div>


{/* GOAL PROGRESS */}

<div className="bg-white p-6 rounded-xl shadow">

<h2 className="font-semibold mb-4">
Goal Progress Tracking
</h2>

{goals.map((g) => (

<div key={g.id} className="mb-4">

<div className="flex justify-between text-sm mb-1">

<span className="font-medium">
{g.goal_type}
</span>

<span>
{g.progress || 0}%
</span>

</div>

<div className="w-full bg-gray-200 rounded-full h-4">

<div
className="bg-indigo-600 h-4 rounded-full"
style={{ width: `${g.progress || 0}%` }}
></div>

</div>

</div>

))}

</div>


{/* INVESTMENT PERFORMANCE */}

<div className="bg-white p-6 rounded-xl shadow h-80">

<h2 className="font-semibold mb-4">
Investment Performance
</h2>

<ResponsiveContainer width="100%" height="100%">

<LineChart data={investments}>

<CartesianGrid strokeDasharray="3 3" />

<XAxis dataKey="symbol" />

<YAxis />

<Tooltip />

<Line
type="monotone"
dataKey="amount"
stroke="#22c55e"
strokeWidth={3}
/>

</LineChart>

</ResponsiveContainer>

</div>


{/* NAVIGATION */}

<div className="grid md:grid-cols-4 gap-6">

<Link to="/goals" className="bg-white p-6 rounded-xl shadow">
Goals →
</Link>

<Link to="/risk" className="bg-white p-6 rounded-xl shadow">
Risk Profile →
</Link>

<Link to="/profile" className="bg-white p-6 rounded-xl shadow">
Profile →
</Link>

<Link to="/portfolio" className="bg-white p-6 rounded-xl shadow">
Portfolio →
</Link>

<Link to="/transactions" className="bg-white p-6 rounded-xl shadow">
Transactions →
</Link>

<Link to="/simulation" className="bg-white p-6 rounded-xl shadow">
Simulation →
</Link>

</div>

</div>

  );
}