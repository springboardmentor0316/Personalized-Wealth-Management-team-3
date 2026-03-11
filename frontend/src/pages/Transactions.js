import { useEffect, useState } from "react";
import api from "../api";

export default function Transactions() {

  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/transactions")
      .then(res => {
        setTransactions(res.data);
        setFiltered(res.data);
        setLoading(false);
      })
      .catch(() => {
        alert("Please login again");
        window.location.href = "/";
      });
  }, []);

  // Apply filters
  const applyFilter = () => {
    let data = transactions;

    if (typeFilter) {
      data = data.filter(t => t.type === typeFilter);
    }

    if (dateFilter) {
      data = data.filter(
        t => new Date(t.created_at).toISOString().slice(0, 10) === dateFilter
      );
    }

    setFiltered(data);
  };

  const resetFilter = () => {
    setTypeFilter("");
    setDateFilter("");
    setFiltered(transactions);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-3xl font-bold text-indigo-700 mb-6">
        Transaction History
      </h1>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex gap-4 items-center">

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Types</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          onClick={applyFilter}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Apply
        </button>

        <button
          onClick={resetFilter}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Reset
        </button>

      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No transactions found</p>
      ) : (

        <div className="bg-white shadow rounded-xl overflow-hidden">

          <table className="w-full text-left">

            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Investment ID</th>
                <th className="p-4">Type</th>
                <th className="p-4">Amount ₹</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b hover:bg-gray-50">

                  <td className="p-4">{t.id}</td>
                  <td className="p-4">{t.investment_id}</td>

                  <td className={`p-4 font-semibold ${
                    t.type === "buy"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    {t.type.toUpperCase()}
                  </td>

                  <td className="p-4">₹ {t.amount}</td>

                  <td className="p-4">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}
