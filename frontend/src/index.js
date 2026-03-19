import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import './background.css'; 
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
