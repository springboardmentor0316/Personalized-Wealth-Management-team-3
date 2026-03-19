import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { getGoal, getGoalProgress } from "../services/goals";
import formatApiError from "../utils/formatApiError";

const TYPE_META = {
  retirement: { icon: "🏖️", label: "Retirement",  color: "#818cf8" },
  home:       { icon: "🏠", label: "Home",         color: "#06b6d4" },
  education:  { icon: "🎓", label: "Education",    color: "#f59e0b" },
  custom:     { icon: "🎯", label: "Custom Goal",  color: "#10b981" },
};

function formatMoney(val) {
  if (!val) return "₹0";
  const n = Number(val);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString()}`;
}

function monthsUntil(dateStr) {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.max(0, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));
}

export default function GoalDetails() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [goalData, progressData] = await Promise.all([
          getGoal(goalId),
          getGoalProgress(goalId),
        ]);
        setGoal(goalData);
        setProgress(progressData);
      } catch (err) {
        setError(formatApiError(err, "Failed to load goal details"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [goalId]);

  if (loading) return (
    <Layout>
      <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
        Loading goal details…
      </div>
    </Layout>
  );

  const meta = TYPE_META[goal?.goal_type] || TYPE_META.custom;
  const pct = Math.min(100, progress?.progress_percentage ?? 0);
  const remaining = goal ? Math.max(0, Number(goal.target_amount) - (progress?.estimated_contributed ?? 0)) : 0;
  const mLeft = goal ? monthsUntil(goal.target_date) : 0;
  const onTrack = goal && mLeft > 0
    ? (Number(goal.monthly_contribution) * mLeft) >= remaining
    : pct >= 100;

  return (
    <Layout>
      {/* Back link */}
      <div style={{ marginBottom: 20 }}>
        <Link to="/goals" className="secondary-button" style={{ display: "inline-flex" }}>
          ← Back to Goals
        </Link>
      </div>

      {error && <p className="form-error" style={{ marginBottom: 16 }}>{error}</p>}

      {goal && (
        <>
          {/* Hero card */}
          <div className="panel" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                background: `${meta.color}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28,
              }}>
                {meta.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <h1 className="page-title" style={{ margin: 0 }}>{goal.name}</h1>
                  <span style={{
                    background: `${meta.color}18`, color: meta.color,
                    fontSize: "0.72rem", fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                  }}>
                    {meta.label}
                  </span>
                  <span style={{
                    background: onTrack ? "var(--success-bg)" : "var(--danger-bg)",
                    color: onTrack ? "var(--success)" : "var(--danger)",
                    fontSize: "0.72rem", fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                  }}>
                    {onTrack ? "✓ On track" : "⚠ Needs attention"}
                  </span>
                </div>
                {goal.notes && (
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                    {goal.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.82rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Progress</span>
                <span style={{ fontWeight: 600, color: pct >= 80 ? "var(--success)" : "var(--primary)" }}>
                  {pct.toFixed(1)}%{pct >= 100 ? " 🎉" : ""}
                </span>
              </div>
              <div className="progress-wrap" style={{ height: 10 }}>
                <div
                  className={`progress-bar${pct >= 80 ? " green" : ""}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: "0.76rem", color: "var(--text-muted)" }}>
                <span>{formatMoney(progress?.estimated_contributed)} contributed</span>
                <span>{formatMoney(goal.target_amount)} target</span>
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div className="metrics-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))", marginBottom: 20 }}>
            <div className="metric-card">
              <div className="metric-top-bar" style={{ background: "linear-gradient(90deg,#4f46e5,#06b6d4)" }} />
              <div className="metric-label">Target Amount</div>
              <div className="metric-value" style={{ fontSize: "1.15rem" }}>{formatMoney(goal.target_amount)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-top-bar" style={{ background: "linear-gradient(90deg,#10b981,#06b6d4)" }} />
              <div className="metric-label">Contributed</div>
              <div className="metric-value" style={{ fontSize: "1.15rem", color: "var(--success)" }}>
                {formatMoney(progress?.estimated_contributed)}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-top-bar" style={{ background: "linear-gradient(90deg,#f59e0b,#ef9f27)" }} />
              <div className="metric-label">Still Needed</div>
              <div className="metric-value" style={{ fontSize: "1.15rem" }}>{formatMoney(remaining)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-top-bar" style={{ background: "linear-gradient(90deg,#818cf8,#4f46e5)" }} />
              <div className="metric-label">Months Left</div>
              <div className="metric-value" style={{ fontSize: "1.15rem" }}>{mLeft}</div>
              <div className="metric-sub neutral">Until {goal.target_date}</div>
            </div>
          </div>

          {/* Details + simulation CTA */}
          <div className="grid-two" style={{ gap: 20 }}>
            <div className="panel">
              <h2 className="panel-subtitle" style={{ marginBottom: 16 }}>Goal Details</h2>
              {[
                ["Monthly Contribution", formatMoney(goal.monthly_contribution)],
                ["Target Date", goal.target_date],
                ["Goal Type", meta.label],
                ["Created", new Date(goal.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "0.5px solid var(--border)", fontSize: "0.85rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{value}</span>
                </div>
              ))}
            </div>

            <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 className="panel-subtitle">Run a Simulation</h2>
              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
                Want to see if you can reach <strong>{formatMoney(goal.target_amount)}</strong> faster?
                Try a what-if simulation — adjust your monthly contribution or expected return rate to
                explore different scenarios.
              </p>
              <button
                className="primary-button"
                style={{ width: "fit-content" }}
                onClick={() => navigate("/simulations")}
              >
                📊 Open Simulations →
              </button>

              <div style={{ marginTop: 8, borderTop: "0.5px solid var(--border)", paddingTop: 16 }}>
                <h2 className="panel-subtitle" style={{ marginBottom: 10 }}>Quick Actions</h2>
                <div className="button-row">
                  <Link to="/goals" className="secondary-button">Edit Goal</Link>
                  <button className="secondary-button" onClick={() => navigate("/recommendations")}>
                    💡 Get Advice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
