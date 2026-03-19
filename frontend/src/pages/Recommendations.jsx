import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { generateRecommendation, getRebalanceSuggestions, refreshMarketPrices } from "../services/simulations";
import formatApiError from "../utils/formatApiError";

const ACTION_STYLE = {
  increase: { color: "var(--success)", label: "↑ Increase", bg: "var(--success-bg)" },
  reduce:   { color: "var(--danger)",  label: "↓ Reduce",   bg: "var(--danger-bg)"  },
  on_track: { color: "var(--primary)", label: "✓ On track", bg: "var(--surface-muted)" },
};

function AllocationBar({ label, current, target }) {
  const max = Math.max(current, target, 5);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: 4 }}>
        <span style={{ fontWeight: 600, color: "var(--text)" }}>{label}</span>
        <span style={{ color: "var(--text-muted)" }}>Current: {current}% · Target: {target}%</span>
      </div>
      <div style={{ position: "relative", height: 8, borderRadius: 99, background: "var(--track)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${(current / max) * 100}%`, background: "var(--primary)", opacity: 0.5, borderRadius: 99 }} />
      </div>
      <div style={{ position: "relative", height: 8, borderRadius: 99, background: "transparent", marginTop: 3 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${(target / max) * 100}%`, background: "linear-gradient(90deg,var(--primary),var(--accent))", borderRadius: 99, opacity: 0.35 }} />
      </div>
      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 2 }}>
        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--primary)", opacity: 0.5, marginRight: 4 }} />Current
        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--primary)", opacity: 0.35, marginRight: 4, marginLeft: 10 }} />Target
      </div>
    </div>
  );
}

export default function Recommendations() {
  const [rec, setRec] = useState(null);
  const [rebalance, setRebalance] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRebalance();
  }, []);

  const loadRebalance = async () => {
    try {
      const data = await getRebalanceSuggestions();
      setRebalance(data);
    } catch (err) {
      // silently fail — user may have no portfolio yet
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setMessage("");
    try {
      const data = await generateRecommendation();
      setRec(data);
      setMessage("Recommendation generated!");
      await loadRebalance();
    } catch (err) {
      setError(formatApiError(err, "Failed to generate recommendation"));
    } finally {
      setGenerating(false);
    }
  };

  const handleRefreshPrices = async () => {
    setRefreshing(true);
    setError("");
    try {
      const data = await refreshMarketPrices();
      setRefreshResult(data);
      setMessage(`Refreshed ${data.refreshed} investment prices from market.`);
    } catch (err) {
      setError(formatApiError(err, "Failed to refresh prices"));
    } finally {
      setRefreshing(false);
    }
  };

  const allocation = rec?.suggested_allocation?.target_allocation || null;
  const suggestions = rebalance?.suggestions || rec?.suggested_allocation?.rebalance_suggestions || [];

  return (
    <Layout>
      <div className="panel-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Recommendations</h1>
          <p className="page-subtitle">Personalised allocation advice based on your risk profile</p>
        </div>
        <div className="button-row">
          <button className="secondary-button" onClick={handleRefreshPrices} disabled={refreshing}>
            {refreshing ? "Refreshing…" : "🔄 Refresh Prices"}
          </button>
          <button className="primary-button" onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating…" : "✨ Generate Recommendation"}
          </button>
        </div>
      </div>

      {error && <p className="form-error" style={{ marginBottom: 14 }}>{error}</p>}
      {message && <p className="form-success" style={{ marginBottom: 14 }}>{message}</p>}

      {/* Market price refresh result */}
      {refreshResult && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <h2 className="panel-subtitle" style={{ marginBottom: 12 }}>Market Price Refresh</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {Object.entries(refreshResult.prices).map(([symbol, info]) => (
              <div key={symbol} style={{
                background: info.found ? "var(--success-bg)" : "var(--danger-bg)",
                color: info.found ? "var(--success)" : "var(--danger)",
                borderRadius: 8, padding: "6px 12px", fontSize: "0.78rem", fontWeight: 600,
              }}>
                {symbol}: {info.found ? `₹${Number(info.price).toLocaleString()}` : "Not found"}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid-two" style={{ gap: 20, alignItems: "start" }}>
        {/* Recommendation text + target allocation */}
        <div className="panel">
          <h2 className="panel-subtitle" style={{ marginBottom: 14 }}>
            {rec ? rec.title : "Your Allocation Plan"}
          </h2>

          {rec ? (
            <>
              <p style={{ fontSize: "0.85rem", color: "var(--text-soft)", lineHeight: 1.65, marginBottom: 20 }}>
                {rec.recommendation_text}
              </p>

              {allocation && (
                <>
                  <div className="panel-subtitle" style={{ fontSize: "0.82rem", marginBottom: 14 }}>Target Allocation</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                    {Object.entries(allocation).map(([key, pct]) => (
                      <div key={key} style={{
                        background: "var(--surface-muted)", borderRadius: 20, padding: "5px 12px",
                        fontSize: "0.75rem", fontWeight: 600, color: "var(--primary)",
                      }}>
                        {key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}: {pct}%
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
              <p style={{ fontWeight: 500, margin: 0 }}>No recommendation yet</p>
              <p style={{ fontSize: "0.78rem", marginTop: 6 }}>Click "Generate Recommendation" to get started</p>
            </div>
          )}
        </div>

        {/* Rebalance suggestions */}
        <div className="panel">
          <h2 className="panel-subtitle" style={{ marginBottom: 6 }}>Rebalance Suggestions</h2>
          {rebalance && (
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 16 }}>
              Based on your <strong>{rebalance.risk_profile}</strong> risk profile
            </p>
          )}

          {suggestions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📊</div>
              <p style={{ fontWeight: 500, fontSize: "0.85rem", margin: 0 }}>Add investments to see rebalance suggestions</p>
            </div>
          ) : (
            <>
              {suggestions.map((s, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <AllocationBar label={s.bucket} current={s.current_pct} target={s.target_pct} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      display: "inline-block",
                      background: ACTION_STYLE[s.action]?.bg,
                      color: ACTION_STYLE[s.action]?.color,
                      fontSize: "0.72rem", fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                    }}>
                      {ACTION_STYLE[s.action]?.label}
                    </span>
                    {s.action !== "on_track" && (
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        Move ~₹{Number(s.amount_to_move).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
