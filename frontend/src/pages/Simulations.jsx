import React, { useState, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import Layout from "../components/Layout";
import { runSimulation, saveSimulation, getSimulations, deleteSimulation } from "../services/simulations";
import formatApiError from "../utils/formatApiError";

const DEFAULT_FORM = {
  scenario_name: "My Scenario",
  initial_amount: 50000,
  monthly_contribution: 10000,
  annual_return_pct: 12,
  inflation_pct: 6,
  years: 15,
  target_amount: "",
};

function formatCrore(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
  return `₹${Number(val).toLocaleString()}`;
}

export default function Simulations() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showSaved, setShowSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = () => ({
    scenario_name: form.scenario_name,
    assumptions: {
      initial_amount: Number(form.initial_amount) || 0,
      monthly_contribution: Number(form.monthly_contribution),
      annual_return_pct: Number(form.annual_return_pct),
      inflation_pct: Number(form.inflation_pct),
      years: Number(form.years),
      target_amount: form.target_amount ? Number(form.target_amount) : null,
    },
  });

  const handleRun = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await runSimulation(buildPayload());
      setResult(data);
    } catch (err) {
      setError(formatApiError(err, "Failed to run simulation"));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await saveSimulation(buildPayload());
      setMessage("Scenario saved!");
    } catch (err) {
      setError(formatApiError(err, "Failed to save scenario"));
    } finally {
      setSaving(false);
    }
  };

  const loadSaved = async () => {
    setSavedLoading(true);
    try {
      const data = await getSimulations();
      setSaved(data);
      setShowSaved(true);
    } catch (err) {
      setError(formatApiError(err, "Failed to load saved scenarios"));
    } finally {
      setSavedLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSimulation(id);
      setSaved((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(formatApiError(err, "Failed to delete scenario"));
    }
  };

  const loadScenario = (sim) => {
    const a = sim.assumptions;
    setForm({
      scenario_name: sim.scenario_name,
      initial_amount: a.initial_amount,
      monthly_contribution: a.monthly_contribution,
      annual_return_pct: a.annual_return_pct,
      inflation_pct: a.inflation_pct,
      years: a.years,
      target_amount: a.target_amount || "",
    });
    setResult(sim.results);
    setShowSaved(false);
  };

  return (
    <Layout>
      <div className="panel-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Simulations</h1>
          <p className="page-subtitle">Run what-if scenarios on your investment goals</p>
        </div>
        <button className="secondary-button" onClick={loadSaved} disabled={savedLoading}>
          {savedLoading ? "Loading…" : "📂 Saved Scenarios"}
        </button>
      </div>

      {error && <p className="form-error" style={{ marginBottom: 14 }}>{error}</p>}
      {message && <p className="form-success" style={{ marginBottom: 14 }}>{message}</p>}

      {/* Saved scenarios list */}
      {showSaved && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-header">
            <h2 className="panel-subtitle" style={{ margin: 0 }}>Saved Scenarios</h2>
            <button className="secondary-button" onClick={() => setShowSaved(false)}>Close</button>
          </div>
          {saved.length === 0 ? (
            <p className="muted-text">No saved scenarios yet.</p>
          ) : (
            <div className="list-stack">
              {saved.map((sim) => (
                <div key={sim.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "0.5px solid var(--border)" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{sim.scenario_name}</div>
                    <div className="muted-text">
                      ₹{sim.assumptions.monthly_contribution?.toLocaleString()}/mo · {sim.assumptions.annual_return_pct}% return · {sim.assumptions.years}yrs
                    </div>
                  </div>
                  <div className="button-row">
                    <button className="secondary-button" onClick={() => loadScenario(sim)}>Load</button>
                    <button className="danger-button" onClick={() => handleDelete(sim.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid-two" style={{ gap: 20, alignItems: "start" }}>
        {/* Input form */}
        <div className="panel">
          <h2 className="panel-subtitle" style={{ marginBottom: 18 }}>Scenario Inputs</h2>
          <div className="form-stack">
            <div className="form-field">
              <label className="form-label">Scenario Name</label>
              <input name="scenario_name" value={form.scenario_name} onChange={handleChange} className="form-input" />
            </div>
            <div className="grid-two">
              <div className="form-field">
                <label className="form-label">Initial Amount (₹)</label>
                <input name="initial_amount" type="number" min="0" value={form.initial_amount} onChange={handleChange} className="form-input" placeholder="50000" />
              </div>
              <div className="form-field">
                <label className="form-label">Monthly SIP (₹)</label>
                <input name="monthly_contribution" type="number" min="1" value={form.monthly_contribution} onChange={handleChange} className="form-input" placeholder="10000" required />
              </div>
              <div className="form-field">
                <label className="form-label">Annual Return (%)</label>
                <input name="annual_return_pct" type="number" min="1" max="100" step="0.5" value={form.annual_return_pct} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-field">
                <label className="form-label">Inflation (%)</label>
                <input name="inflation_pct" type="number" min="0" max="30" step="0.5" value={form.inflation_pct} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-field">
                <label className="form-label">Investment Years</label>
                <input name="years" type="number" min="1" max="50" value={form.years} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-field">
                <label className="form-label">Target Amount (₹) <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>optional</span></label>
                <input name="target_amount" type="number" min="0" value={form.target_amount} onChange={handleChange} className="form-input" placeholder="e.g. 5000000" />
              </div>
            </div>
            <div className="button-row">
              <button className="primary-button" onClick={handleRun} disabled={loading}>
                {loading ? "Calculating…" : "▶ Run Simulation"}
              </button>
              {result && (
                <button className="secondary-button" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "💾 Save Scenario"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="panel">
            <h2 className="panel-subtitle" style={{ marginBottom: 18 }}>Results — {form.scenario_name}</h2>

            {/* Goal achievable banner */}
            {form.target_amount && (
              <div style={{
                background: result.goal_achievable ? "var(--success-bg)" : "var(--danger-bg)",
                color: result.goal_achievable ? "var(--success)" : "var(--danger)",
                borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: "0.85rem", fontWeight: 600,
              }}>
                {result.goal_achievable
                  ? `✓ Goal achievable in ${result.months_to_goal} months (${(result.months_to_goal / 12).toFixed(1)} years)`
                  : `✗ Goal of ${formatCrore(Number(form.target_amount))} not reached in ${form.years} years`}
              </div>
            )}

            <div className="metrics-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 18 }}>
              <div className="metric-card">
                <div className="metric-top-bar" style={{ background: "linear-gradient(90deg,#4f46e5,#06b6d4)" }} />
                <div className="metric-label">Projected Value</div>
                <div className="metric-value" style={{ fontSize: "1.2rem" }}>{formatCrore(result.projected_value)}</div>
              </div>
              <div className="metric-card">
                <div className="metric-top-bar" style={{ background: "linear-gradient(90deg,#10b981,#06b6d4)" }} />
                <div className="metric-label">Total Returns</div>
                <div className="metric-value" style={{ fontSize: "1.2rem", color: "var(--success)" }}>+{formatCrore(result.total_returns)}</div>
              </div>
              <div className="metric-card">
                <div className="metric-top-bar" style={{ background: "linear-gradient(90deg,#f59e0b,#ef9f27)" }} />
                <div className="metric-label">Total Invested</div>
                <div className="metric-value" style={{ fontSize: "1.2rem" }}>{formatCrore(result.total_invested)}</div>
              </div>
              <div className="metric-card">
                <div className="metric-top-bar" style={{ background: "linear-gradient(90deg,#818cf8,#4f46e5)" }} />
                <div className="metric-label">Inflation-Adjusted</div>
                <div className="metric-value" style={{ fontSize: "1.2rem" }}>{formatCrore(result.real_value_inflation_adjusted)}</div>
              </div>
            </div>

            {/* Chart */}
            {result.monthly_data && result.monthly_data.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div className="panel-subtitle" style={{ marginBottom: 10, fontSize: "0.82rem" }}>Growth over time</div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.monthly_data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tickFormatter={(v) => `${v}y`} tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                    <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11, fill: "var(--text-muted)" }} width={60} />
                    <Tooltip
                      formatter={(value, name) => [formatCrore(value), name === "value" ? "Portfolio Value" : name === "invested" ? "Invested" : "Returns"]}
                      labelFormatter={(label) => `Year ${label}`}
                      contentStyle={{ fontSize: "0.78rem", borderRadius: 8, border: "0.5px solid var(--border)" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                    <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} dot={false} name="Portfolio Value" />
                    <Line type="monotone" dataKey="invested" stroke="#06b6d4" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Invested" />
                    <Line type="monotone" dataKey="returns" stroke="#10b981" strokeWidth={1.5} dot={false} name="Returns" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
