import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <nav className="app-navbar">
      <div className="app-navbar-inner">
        <NavLink to="/dashboard" className="app-brand">
          Wealth<span>Track</span>
        </NavLink>

        <div className="nav-links">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            Dashboard
          </NavLink>
          <NavLink to="/goals" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            Goals
          </NavLink>
          <NavLink to="/portfolio" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            Portfolio
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            Profile
          </NavLink>
          <NavLink to="/simulations" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>

           Simulations
          </NavLink>
          <NavLink to="/recommendations" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>

           Recommendations
          </NavLink>

        </div>

        <div className="nav-spacer" />

        <button type="button" className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "☀ Light" : "🌙 Dark"}
        </button>

        <div className="nav-avatar" title={user?.full_name || "User"}>{initials}</div>

        <button type="button" className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
