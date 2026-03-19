import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthFinanceBg } from "../components/FinanceBg";

export default function Login() {
  const { login, user, error } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(formData.email, formData.password);
      if (localStorage.getItem("access_token")) {
        navigate("/dashboard", { replace: true });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <AuthFinanceBg />

      <form onSubmit={handleSubmit} className="auth-card">
        <div>
          <h1 className="auth-brand">Wealth<span>Track</span></h1>
          <p className="auth-sub">Sign in to manage your financial goals</p>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email" name="email" type="email"
            value={formData.email} onChange={handleChange}
            placeholder="you@example.com" required
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password" name="password" type="password"
            value={formData.password} onChange={handleChange}
            placeholder="Min. 8 characters" required minLength={8}
            className="form-input"
          />
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" disabled={submitting} className="form-button">
          {submitting ? "Signing in…" : "Sign In"}
        </button>

        <div className="or-divider">or</div>

        <p className="form-caption" style={{ textAlign: "center" }}>
          Don't have an account?{" "}
          <Link to="/register" className="form-link">Register</Link>
        </p>
      </form>
    </div>
  );
}
