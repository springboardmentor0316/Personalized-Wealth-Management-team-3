import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthFinanceBg } from "../components/FinanceBg";
export default function Register() {
  const { register, user, error } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    password: "",
    risk_profile: "Moderate",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await register(formData);
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
        <h1 className="auth-title">Register</h1>

        <div className="form-field">
          <label className="form-label" htmlFor="full_name">
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="risk_profile">
            Risk Profile
          </label>
          <select
            id="risk_profile"
            name="risk_profile"
            value={formData.risk_profile}
            onChange={handleChange}
            className="form-select"
          >
            <option value="Conservative">Conservative</option>
            <option value="Moderate">Moderate</option>
            <option value="Aggressive">Aggressive</option>
          </select>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" disabled={submitting} className="form-button">
          {submitting ? "Creating account..." : "Register"}
        </button>

        <p className="form-caption">
          Already have an account?{" "}
          <Link to="/login" className="form-link">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
