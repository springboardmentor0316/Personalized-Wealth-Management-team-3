import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Goals from "./pages/Goals";
import GoalDetails from "./pages/GoalDetails";
import Portfolio from "./pages/Portfolio";
import Simulations from "./pages/Simulations";
import Recommendations from "./pages/Recommendations";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard"       element={<ProtectedRoute><ErrorBoundary><Dashboard /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/profile"         element={<ProtectedRoute><ErrorBoundary><Profile /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/goals"           element={<ProtectedRoute><ErrorBoundary><Goals /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/goals/:goalId"   element={<ProtectedRoute><ErrorBoundary><GoalDetails /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/portfolio"       element={<ProtectedRoute><ErrorBoundary><Portfolio /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/simulations"     element={<ProtectedRoute><ErrorBoundary><Simulations /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/recommendations" element={<ProtectedRoute><ErrorBoundary><Recommendations /></ErrorBoundary></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
