import React from "react";

/**
 * ErrorBoundary — catches uncaught JS errors anywhere in the component tree.
 * Wrap your top-level routes or individual pages with this.
 *
 * Usage in App.js:
 *   import ErrorBoundary from "./components/ErrorBoundary";
 *   <ErrorBoundary><YourPage /></ErrorBoundary>
 *
 * Or wrap the whole app:
 *   <ErrorBoundary><App /></ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/dashboard";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg, #f7f6f2)",
        padding: 24,
      }}>
        <div style={{
          background: "var(--surface, #fff)",
          border: "0.5px solid var(--border, #e8e4f0)",
          borderRadius: 20,
          padding: "40px 36px",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 4px 32px rgba(79,70,229,0.10)",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.4rem",
            color: "var(--text, #1a1a2e)",
            margin: "0 0 8px",
          }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted, #8888aa)", margin: "0 0 24px", lineHeight: 1.6 }}>
            An unexpected error occurred. Your data is safe — please return to the dashboard.
          </p>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre style={{
              background: "#fff0f0",
              color: "#991b1b",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: "0.72rem",
              textAlign: "left",
              overflowX: "auto",
              marginBottom: 20,
            }}>
              {this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            style={{
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "11px 24px",
              fontFamily: "inherit",
              fontSize: "0.88rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
}
