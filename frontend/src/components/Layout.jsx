import React from "react";
import { NavLink } from "react-router-dom";
import Navbar from "./Navbar";
import { FinanceBg } from "./FinanceBg";

const sidebarItems = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/goals",     icon: "🎯", label: "Goals" },
  { to: "/portfolio", icon: "📈", label: "Portfolio" },
  { to: "/simulations",     icon: "📊", label: "Simulations" },
  { to: "/recommendations", icon: "💡", label: "Recommendations" },
];

const accountItems = [
  { to: "/profile", icon: "👤", label: "Profile" },
];

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-body">
        <FinanceBg opacity={0.6} />

        <aside className="app-sidebar">
          <div className="sidebar-section-label">Overview</div>
          {sidebarItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-item${isActive ? " active" : ""}`}
            >
              <span className="sidebar-icon">{icon}</span>
              {label}
            </NavLink>
          ))}

          <div className="sidebar-section-label" style={{ marginTop: 8 }}>Account</div>
          {accountItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-item${isActive ? " active" : ""}`}
            >
              <span className="sidebar-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </aside>

        <main className="page-content" style={{ position: "relative", zIndex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
