import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import formatApiError from "../utils/formatApiError";
import { createGoal, deleteGoal, getGoalProgress, getGoals, updateGoal } from "../services/goals";

const emptyForm = {
  name: "",
  goal_type: "custom",
  notes: "",
  target_amount: "",
  target_date: "",
  monthly_contribution: "",
};

const GOAL_TYPES = [
  { value: "retirement", label: "🏖️ Retirement" },
  { value: "home",       label: "🏠 Home" },
  { value: "education",  label: "🎓 Education" },
  { value: "custom",     label: "🎯 Custom" },
];

const TYPE_ICON = { retirement: "🏖️", home: "🏠", education: "🎓", custom: "🎯" };
const TYPE_COLOR = { retirement: "#818cf8", home: "#06b6d4", education: "#f59e0b", custom: "#10b981" };

function formatMoney(val) {
  const n = Number(val);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString()}`;
}

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const submitLabel = useMemo(() => (editingId ? "Update Goal" : "Create Goal"), [editingId]);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const goalsData = await getGoals();
      setGoals(goalsData);
      const progressEntries = await Promise.all(
        goalsData.map(async (goal) => {
          const progress = await getGoalProgress(goal.id);
          return [goal.id, progress];
        })
      );
      setProgressMap(Object.fromEntries(progressEntries));
      setError("");
    } catch (err) {
      setError(formatApiError(err, "Failed to load goals"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadGoals(); }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        name: formData.name.trim(),
        goal_type: formData.goal_type,
        notes: formData.notes.trim() || null,
        target_amount: Number(formData.target_amount),
        target_date: formData.target_date,
        monthly_contribution: Number(formData.monthly_contribution),
      };
      if (editingId) {
        await updateGoal(editingId, payload);
        setMessage("Goal updated.");
      } else {
        await createGoal(payload);
        setMessage("Goal created.");
      }
      resetForm();
      await loadGoals();
    } catch (err) {
      setError(formatApiError(err, "Failed to save goal"));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (goal) => {
    setEditingId(goal.id);
    setFormData({
      name: goal.name,
      goal_type: goal.goal_type || "custom",
      notes: goal.notes || "",
      target_amount: String(goal.target_amount),
      target_date: goal.target_date,
      monthly_contribution: String(goal.monthly_contribution),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm("Delete this goal?")) return;
    try {
      await deleteGoal(goalId);
      if (editingId === goalId) resetForm();
      await loadGoals();
    } catch (err) {
      setError(formatApiError(err, "Failed to delete goal"));
    }
  };

  return (
    <Layout>
      <div className="panel-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Goals</h1>
          <p className="page-subtitle">Track, edit, and grow every savings milestone</p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => { resetForm(); setShowForm((v) => !v); }}
        >
          {showForm && !editingId ? "Cancel" : "+ New Goal"}
        </button>
      </div>

      {showForm && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <h2 className="panel-subtitle" style={{ marginBottom: 16 }}>
            {editingId ? "Edit Goal" : "Create a New Goal"}
          </h2>
          <form onSubmit={handleSubmit} className="form-stack">
            <div className="grid-two">
              <div className="form-field">
                <label className="form-label">Goal Name</label>
                <input name="name" value={formData.name} onChange={handleChange} required className="form-input" placeholder="e.g. Emergency Fund" />
              </div>
              <div className="form-field">
                <label className="form-label">Goal Type</label>
                <select name="goal_type" value={formData.goal_type} onChange={handleChange} className="form-select">
                  {GOAL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Target Amount (₹)</label>
                <input name="target_amount" type="number" min="0.01" step="0.01" value={formData.target_amount} onChange={handleChange} required className="form-input" placeholder="1000000" />
              </div>
              <div className="form-field">
                <label className="form-label">Monthly Contribution (₹)</label>
                <input name="monthly_contribution" type="number" min="0" step="0.01" value={formData.monthly_contribution} onChange={handleChange} required className="form-input" placeholder="10000" />
              </div>
              <div className="form-field">
                <label className="form-label">Target Date</label>
                <input name="target_date" type="date" value={formData.target_date} onChange={handleChange} required className="form-input" />
              </div>
              <div className="form-field full-width">
                <label className="form-label">Notes (optional)</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="form-input" placeholder="Any extra details…" />
              </div>
            </div>
            <div className="button-row">
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? "Saving…" : submitLabel}
              </button>
              {editingId && <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        </div>
      )}

      {message && <p className="form-success" style={{ marginBottom: 14 }}>{message}</p>}
      {error   && <p className="form-error"   style={{ marginBottom: 14 }}>{error}</p>}

      {loading ? (
        <p className="muted-text">Loading goals…</p>
      ) : (
        <div className="list-stack">
          {goals.map((goal) => {
            const progress = progressMap[goal.id];
            const pct = Math.min(100, progress?.progress_percentage ?? 0);
            const nearComplete = pct >= 80;
            const type = goal.goal_type || "custom";
            const icon = TYPE_ICON[type] || "🎯";
            const color = TYPE_COLOR[type] || "#10b981";

            return (
              <article key={goal.id} className={`goal-card${nearComplete ? " near-complete" : ""}`}>
                <div className="goal-card-head">
                  <div className="goal-card-identity">
                    <div className="goal-icon" style={{ background: `${color}18` }}>{icon}</div>
                    <div>
                      <h3 className="goal-title">{goal.name}</h3>
                      <div className="goal-date-hint">
                        <span style={{ background: `${color}18`, color, fontSize: "0.68rem", fontWeight: 600, padding: "2px 8px", borderRadius: 20, marginRight: 6 }}>
                          {GOAL_TYPES.find(t => t.value === type)?.label.split(" ")[1] || "Custom"}
                        </span>
                        Target: {goal.target_date}
                      </div>
                    </div>
                  </div>
                  <div className="goal-actions">
                    <Link to={`/goals/${goal.id}`} className="secondary-button">Details</Link>
                    <button type="button" className="secondary-button" onClick={() => startEdit(goal)}>Edit</button>
                    <button type="button" className="danger-button" onClick={() => handleDelete(goal.id)}>Delete</button>
                  </div>
                </div>

                <div className="progress-wrap">
                  <div className={`progress-bar${nearComplete ? " green" : ""}`} style={{ width: `${pct}%` }} />
                </div>

                <div className="goal-footer">
                  <span className="muted-text">
                    {formatMoney(progress?.estimated_contributed || 0)} of {formatMoney(goal.target_amount)}
                    {goal.monthly_contribution ? ` · ${formatMoney(goal.monthly_contribution)}/mo` : ""}
                  </span>
                  <span className={`goal-pct${nearComplete ? " green" : ""}`}>
                    {pct.toFixed(1)}%{nearComplete ? " 🎉" : ""}
                  </span>
                </div>

                {goal.notes && <p className="muted-text" style={{ marginTop: 6 }}>{goal.notes}</p>}
              </article>
            );
          })}
          {goals.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
              <p style={{ margin: 0, fontWeight: 500 }}>No goals yet</p>
              <p style={{ margin: "6px 0 0", fontSize: "0.82rem" }}>Click "+ New Goal" to get started</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
