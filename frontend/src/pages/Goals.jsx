import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import formatApiError from "../utils/formatApiError";
import { createGoal, deleteGoal, getGoalProgress, getGoals, updateGoal } from "../services/goals";

const emptyForm = {
  name: "",
  notes: "",
  target_amount: "",
  target_date: "",
  monthly_contribution: "",
};

const GOAL_ICONS = ["🏠", "✈️", "💻", "🎓", "🚗", "💍", "🏖️", "💰", "🏋️", "🎯"];

function pickIcon(name = "") {
  const n = name.toLowerCase();
  if (n.includes("home") || n.includes("house")) return "🏠";
  if (n.includes("travel") || n.includes("trip") || n.includes("vacation")) return "✈️";
  if (n.includes("laptop") || n.includes("computer") || n.includes("tech")) return "💻";
  if (n.includes("edu") || n.includes("school") || n.includes("course")) return "🎓";
  if (n.includes("car") || n.includes("vehicle")) return "🚗";
  if (n.includes("wedding") || n.includes("ring")) return "💍";
  if (n.includes("emergency") || n.includes("fund")) return "💰";
  return GOAL_ICONS[name.charCodeAt(0) % GOAL_ICONS.length] || "🎯";
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
      {/* Header */}
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

      {/* Form panel */}
      {showForm && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <h2 className="panel-subtitle" style={{ marginBottom: 16 }}>
            {editingId ? "Edit Goal" : "Create a New Goal"}
          </h2>
          <form onSubmit={handleSubmit} className="form-stack">
            <div className="grid-two">
              <div className="form-field">
                <label className="form-label" htmlFor="name">Goal Name</label>
                <input
                  id="name" name="name" value={formData.name}
                  onChange={handleChange} required className="form-input"
                  placeholder="e.g. Emergency Fund"
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="target_amount">Target Amount (₹)</label>
                <input
                  id="target_amount" name="target_amount" type="number"
                  min="0.01" step="0.01" value={formData.target_amount}
                  onChange={handleChange} required className="form-input"
                  placeholder="100000"
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="target_date">Target Date</label>
                <input
                  id="target_date" name="target_date" type="date"
                  value={formData.target_date} onChange={handleChange}
                  required className="form-input"
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="monthly_contribution">Monthly Contribution (₹)</label>
                <input
                  id="monthly_contribution" name="monthly_contribution" type="number"
                  min="0" step="0.01" value={formData.monthly_contribution}
                  onChange={handleChange} required className="form-input"
                  placeholder="5000"
                />
              </div>
              <div className="form-field full-width">
                <label className="form-label" htmlFor="notes">Notes (optional)</label>
                <textarea
                  id="notes" name="notes" value={formData.notes}
                  onChange={handleChange} rows={2} className="form-input"
                  placeholder="Any extra details about this goal…"
                />
              </div>
            </div>
            <div className="button-row">
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? "Saving…" : submitLabel}
              </button>
              {editingId && (
                <button type="button" className="secondary-button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {message && <p className="form-success" style={{ marginBottom: 14 }}>{message}</p>}
      {error && <p className="form-error" style={{ marginBottom: 14 }}>{error}</p>}

      {/* Goals list */}
      {loading ? (
        <p className="muted-text">Loading goals…</p>
      ) : (
        <div className="list-stack">
          {goals.map((goal) => {
            const progress = progressMap[goal.id];
            const pct = Math.min(100, progress?.progress_percentage ?? 0);
            const nearComplete = pct >= 80;
            const icon = pickIcon(goal.name);

            return (
              <article key={goal.id} className={`goal-card${nearComplete ? " near-complete" : ""}`}>
                <div className="goal-card-head">
                  <div className="goal-card-identity">
                    <div className="goal-icon" style={{ background: nearComplete ? "var(--success-bg)" : "var(--surface-muted)" }}>
                      {icon}
                    </div>
                    <div>
                      <h3 className="goal-title">{goal.name}</h3>
                      <div className="goal-date-hint">Target: {goal.target_date}</div>
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
                    ₹{Number(progress?.estimated_contributed || 0).toLocaleString()} of ₹{Number(goal.target_amount).toLocaleString()}
                    {goal.monthly_contribution ? ` · ₹${Number(goal.monthly_contribution).toLocaleString()}/mo` : ""}
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
