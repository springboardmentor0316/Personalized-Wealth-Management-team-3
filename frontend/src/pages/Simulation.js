import { useState } from "react";
import api from "../api";

export default function Simulation() {

  const [monthly, setMonthly] = useState("");
  const [years, setYears] = useState("");
  const [returns, setReturns] = useState("");
  const [result, setResult] = useState(null);

  const runSimulation = async () => {

    const res = await api.post("/simulate", null, {
      params: {
        monthly_investment: monthly,
        years: years,
        expected_return: returns
      }
    });

    setResult(res.data);
  };

  return (
    <div className="container">

      <h2>Investment Simulation</h2>

      <input
        placeholder="Monthly Investment"
        value={monthly}
        onChange={(e)=>setMonthly(e.target.value)}
      />

      <input
        placeholder="Years"
        value={years}
        onChange={(e)=>setYears(e.target.value)}
      />

      <input
        placeholder="Expected Return %"
        value={returns}
        onChange={(e)=>setReturns(e.target.value)}
      />

      <button onClick={runSimulation}>
        Run Simulation
      </button>

      {result && (
        <div>

          <h3>Results</h3>

          <p>Total Invested: ₹{result.total_invested}</p>

          <p>Final Value: ₹{result.final_value}</p>

          <p>Profit: ₹{result.profit}</p>

        </div>
      )}

    </div>
  );
}