import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import formatApiError from "../utils/formatApiError";

const riskProfiles = ["Conservative", "Moderate", "Aggressive"];

const riskDescriptions = {
  Conservative: "Lower risk, steady returns — ideal for capital preservation.",
  Moderate: "Balanced risk and reward — a mix of growth and stability.",
  Aggressive: "Higher risk, higher potential reward — growth-focused.",
};

export default function Profile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ full_name: "", risk_profile: "Moderate" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        risk_profile: user.risk_profile || "Moderate",
      });
    }
  }, [user]);

  if (!user) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await api.put("/users/me", formData);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(formatApiError(err, "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  };

  const initials = user.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <Layout>
      <div className="panel panel-narrow">
        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: "1.1rem", fontWeight: 600, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <h1 className="panel-title" style={{ marginBottom: 2 }}>{user.full_name || "Your Profile"}</h1>
            <p className="muted-text" style={{ margin: 0 }}>{user.email}</p>
          </div>
        </div>

        {/* Read-only info */}
        <div style={{ marginBottom: 22 }}>
          <div className="profile-info-row">
            <span className="profile-info-label">Email</span>
            <span className="profile-info-value">{user.email}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">KYC Status</span>
            <span className="kyc-badge">{user.kyc_status || "Pending"}</span>
          </div>
        </div>

        {/* Editable form */}
        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-field">
            <label className="form-label" htmlFor="full_name">Full Name</label>
            <input
              id="full_name" name="full_name" type="text"
              value={formData.full_name} onChange={handleChange}
              required className="form-input"
              placeholder="Your full name"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="risk_profile">Risk Profile</label>
            <select
              id="risk_profile" name="risk_profile"
              value={formData.risk_profile} onChange={handleChange}
              className="form-select"
            >
              {riskProfiles.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {formData.risk_profile && (
              <p className="muted-text" style={{ marginTop: 4 }}>
                {riskDescriptions[formData.risk_profile]}
              </p>
            )}
          </div>

          {message && <p className="form-success">{message}</p>}
          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={saving} className="primary-button">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
