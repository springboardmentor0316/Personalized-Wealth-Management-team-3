import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Risk from "./pages/Risk";
import Goals from "./pages/Goals";
import Portfolio from "./pages/Portfolio";
import ProtectedRoute from "./ProtectedRoute";
import Investments from "./pages/Investments";
import Transactions from "./pages/Transactions";
import Simulation from "./pages/Simulation";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />

        <Route path="/simulation" element={
          <ProtectedRoute>
            <Simulation />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/risk" element={
          <ProtectedRoute>
            <Risk />
          </ProtectedRoute>
        } />

        <Route path="/goals" element={
          <ProtectedRoute>
            <Goals />
          </ProtectedRoute>
        } />

        <Route path="/portfolio" element={
          <ProtectedRoute>
            <Portfolio />
          </ProtectedRoute>
        } />

        <Route path="/investments" element={
          <ProtectedRoute>
            <Investments/>
          </ProtectedRoute>
        } />

        <Route path="/transactions" element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}