import { useEffect, useState } from "react";
import api from "../api";

export default function Portfolio() {

  const [portfolio, setPortfolio] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get("/portfolio")
      .then(res => {
        setPortfolio(res.data.positions);
        setSummary(res.data.summary);
      })
      .catch(() => {
        alert("Please login again");
        window.location.href = "/";
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8 space-y-8">

      <h1 className="text-3xl font-bold text-indigo-700">
        Portfolio Pro Overview
      </h1>

      {/* SUMMARY CARDS */}
      {summary && (
        <div className="grid md:grid-cols-4 gap-6">

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-gray-500">Total Invested</h2>
            <p className="text-xl font-bold">₹ {summary.total_invested}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-gray-500">Current Value</h2>
            <p className="text-xl font-bold">₹ {summary.total_current_value}</p>
          </div>

          <div className={`bg-white p-6 rounded-xl shadow ${
            summary.total_profit >= 0 ? "text-green-600" : "text-red-600"
          }`}>
            <h2 className="text-gray-500">Total Profit</h2>
            <p className="text-xl font-bold">₹ {summary.total_profit}</p>
          </div>

          <div className={`bg-white p-6 rounded-xl shadow ${
            summary.total_profit_percent >= 0 ? "text-green-600" : "text-red-600"
          }`}>
            <h2 className="text-gray-500">Return %</h2>
            <p className="text-xl font-bold">
              {summary.total_profit_percent} %
            </p>
          </div>

        </div>
      )}

      {/* POSITIONS TABLE */}
      <div className="bg-white shadow rounded-xl overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-4">Symbol</th>
              <th className="p-4">Units</th>
              <th className="p-4">Avg Price</th>
              <th className="p-4">Cost Basis</th>
              <th className="p-4">Current Value</th>
              <th className="p-4">P/L</th>
              <th className="p-4">Return %</th>
            </tr>
          </thead>

          <tbody>
            {portfolio.map((p, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">

                <td className="p-4 font-medium">{p.symbol}</td>
                <td className="p-4">{p.units}</td>
                <td className="p-4">₹ {p.avg_buy_price}</td>
                <td className="p-4">₹ {p.cost_basis}</td>
                <td className="p-4">₹ {p.current_value}</td>

                <td className={`p-4 font-semibold ${
                  p.profit_loss >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}>
                  ₹ {p.profit_loss}
                </td>

                <td className={`p-4 font-semibold ${
                  p.profit_percent >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}>
                  {p.profit_percent} %
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}