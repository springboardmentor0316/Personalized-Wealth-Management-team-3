// Updated frontend/src/App.js
// Add these two new routes to your existing App.js

// 1. Add these imports at the top of App.js:
//    import Simulations from "./pages/Simulations";
//    import Recommendations from "./pages/Recommendations";

// 2. Add these routes inside your <Routes> block:
//    <Route path="/simulations" element={<ProtectedRoute><Simulations /></ProtectedRoute>} />
//    <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />

// 3. Add recharts to frontend (needed for Simulations chart):
//    cd frontend && npm install recharts

// ─────────────────────────────────────────────────────────────────────────
// Full updated App.js (replace your existing file):

import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Goals from "./pages/Goals";
import GoalDetails from "./pages/GoalDetails";
import Portfolio from "./pages/Portfolio";
import Simulations from "./pages/Simulations";         // ← NEW
import Recommendations from "./pages/Recommendations"; // ← NEW

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          <Route path="/goals/:goalId" element={<ProtectedRoute><GoalDetails /></ProtectedRoute>} />
          <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
          <Route path="/simulations" element={<ProtectedRoute><Simulations /></ProtectedRoute>} />           {/* ← NEW */}
          <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />   {/* ← NEW */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
