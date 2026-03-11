import { useEffect, useState } from "react";
import api from "../api";

export default function Investments() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    asset_name: "",
    asset_type: "",
    amount: ""
  });

  const load = () => {
    api.get("/investments").then(r => setList(r.data));
  };

  useEffect(load, []);

  const add = async () => {
    await api.post("/investments", {
      ...form,
      amount: Number(form.amount)
    });
    setForm({ asset_name: "", asset_type: "", amount: "" });
    load();
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Investments — Krishna</h1>

      <div className="space-y-3">
        <input placeholder="Asset Name"
          value={form.asset_name}
          onChange={e=>setForm({...form, asset_name:e.target.value})}
          className="border p-2 w-full"/>

        <input placeholder="Type"
          value={form.asset_type}
          onChange={e=>setForm({...form, asset_type:e.target.value})}
          className="border p-2 w-full"/>

        <input placeholder="Amount"
          value={form.amount}
          onChange={e=>setForm({...form, amount:e.target.value})}
          className="border p-2 w-full"/>

        <button onClick={add}
          className="bg-indigo-600 text-white px-4 py-2 rounded">
          Add Investment
        </button>
      </div>

      <div className="space-y-2">
        {list.map(i => (
          <div key={i.id} className="border p-3 rounded">
            {i.asset_name} — {i.asset_type} — ₹{i.amount}
          </div>
        ))}
      </div>
    </div>
  );
}
