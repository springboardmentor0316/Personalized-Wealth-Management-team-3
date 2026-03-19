import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { getSavingsStreak } from "../services/portfolio";
import formatApiError from "../utils/formatApiError";

export default function Dashboard() {
  const { user } = useAuth();
  const [streakMessage, setStreakMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStreak = async () => {
      try {
        const data = await getSavingsStreak();
        setStreakMessage(data.message);
      } catch (err) {
        setError(formatApiError(err, "Failed to load streak"));
      }
    };
    loadStreak();
  }, []);

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <Layout>
      {/* Streak banner */}
      {streakMessage && (
        <div className="streak-banner">
          <span className="streak-icon">🔥</span>
          <div>
            <div className="streak-headline">Savings Streak</div>
            <div className="streak-body">{streakMessage}</div>
          </div>
        </div>
      )}

      {error && <p className="form-error" style={{ marginBottom: 16 }}>{error}</p>}

      {/* Metric cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-top-bar" style={{ background: "linear-gradient(90deg, #4f46e5, #06b6d4)" }} />
          <div className="metric-label">Welcome back</div>
          <div className="metric-value" style={{ fontSize: "1.15rem" }}>
            {user?.full_name || "User"}
          </div>
          <div className="metric-sub neutral">{user?.email}</div>
        </div>

        <div className="metric-card">
          <div className="metric-top-bar" style={{ background: "linear-gradient(90deg, #10b981, #06b6d4)" }} />
          <div className="metric-label">Risk Profile</div>
          <div className="metric-value" style={{ fontSize: "1.15rem" }}>
            {user?.risk_profile || "Not set"}
          </div>
          <div className="metric-sub neutral">Investment style</div>
        </div>

        <div className="metric-card">
          <div className="metric-top-bar" style={{ background: "linear-gradient(90deg, #f59e0b, #ef4444)" }} />
          <div className="metric-label">KYC Status</div>
          <div className="metric-value" style={{ fontSize: "1.15rem" }}>
            {user?.kyc_status || "Pending"}
          </div>
          <div className="metric-sub neutral">Verification</div>
        </div>

        <div className="metric-card">
          <div className="metric-top-bar" style={{ background: "linear-gradient(90deg, #818cf8, #4f46e5)" }} />
          <div className="metric-label">Account</div>
          <div className="metric-value" style={{ fontSize: "1.15rem" }}>Active</div>
          <div className="metric-sub">↑ All systems go</div>
        </div>
      </div>

      {/* Quick links */}
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Quick Actions</h2>
        </div>
        <div className="grid-two">
          <a href="/goals" style={{ textDecoration: "none" }}>
            <div style={{
              border: "0.5px solid var(--border)",
              borderRadius: 14,
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              transition: "background 0.18s",
              background: "var(--surface)",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--surface-muted)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--surface)"}
            >
              <div style={{ fontSize: 28 }}>🎯</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>Manage Goals</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>Track your savings milestones</div>
              </div>
            </div>
          </a>
          <a href="/portfolio" style={{ textDecoration: "none" }}>
            <div style={{
              border: "0.5px solid var(--border)",
              borderRadius: 14,
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              transition: "background 0.18s",
              background: "var(--surface)",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--surface-muted)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--surface)"}
            >
              <div style={{ fontSize: 28 }}>📈</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>View Portfolio</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>Monitor your investments</div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </Layout>
  );
}
