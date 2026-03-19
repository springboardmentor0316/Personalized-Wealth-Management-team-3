import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import formatApiError from "../utils/formatApiError";
import {
  createInvestment,
  createTransaction,
  deleteInvestment,
  downloadPortfolioCsv,
  getFilteredTransactions,
  getInvestments,
  getPortfolioSummary,
} from "../services/portfolio";

const emptyInvestmentForm = { symbol: "", asset_type: "stock" };
const emptyTransactionForm = { investment_id: "", type: "buy", quantity: "", price: "", date: "" };
const emptyFilters = { start_date: "", end_date: "", asset_type: "", profit_loss: "all" };

const ASSET_TYPE_OPTIONS = ["stock", "crypto", "etf", "mutual_fund", "bond", "other"];

export default function Portfolio() {
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState("");
  const [investmentForm, setInvestmentForm] = useState(emptyInvestmentForm);
  const [transactionForm, setTransactionForm] = useState(emptyTransactionForm);
  const [filters, setFilters] = useState(emptyFilters);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");

  const selectedInvestment = useMemo(
    () => investments.find((item) => item.id === selectedInvestmentId),
    [investments, selectedInvestmentId]
  );

  const totalValue = useMemo(
    () => summary.reduce((acc, row) => acc + Number(row.current_value || 0), 0),
    [summary]
  );

  const totalPL = useMemo(
    () => summary.reduce((acc, row) => acc + Number(row.profit_loss || 0), 0),
    [summary]
  );

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const [investmentData, summaryData, filteredTransactions] = await Promise.all([
        getInvestments(),
        getPortfolioSummary(),
        getFilteredTransactions(),
      ]);
      setInvestments(investmentData);
      setSummary(summaryData);
      setTransactions(filteredTransactions);
      const defaultId = selectedInvestmentId || investmentData[0]?.id || "";
      setSelectedInvestmentId(defaultId);
      setTransactionForm((prev) => ({ ...prev, investment_id: defaultId }));
      setError("");
    } catch (err) {
      setError(formatApiError(err, "Failed to load portfolio"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPortfolio(); }, []);

  const handleInvestmentChange = (e) => {
    const { name, value } = e.target;
    setInvestmentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    setTransactionForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitInvestment = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      await createInvestment(investmentForm);
      setInvestmentForm(emptyInvestmentForm);
      setMessage("Investment added.");
      await loadPortfolio();
    } catch (err) {
      setError(formatApiError(err, "Failed to add investment"));
    }
  };

  const submitTransaction = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      if (!transactionForm.investment_id) { setError("Select an investment first."); return; }
      await createTransaction(transactionForm.investment_id, {
        type: transactionForm.type,
        quantity: Number(transactionForm.quantity),
        price: Number(transactionForm.price),
        date: transactionForm.date,
      });
      setTransactionForm((prev) => ({ ...prev, quantity: "", price: "", date: "" }));
      setMessage("Transaction added.");
      await loadPortfolio();
    } catch (err) {
      setError(formatApiError(err, "Failed to add transaction"));
    }
  };

  const onSelectInvestment = (id) => {
    setSelectedInvestmentId(id);
    setTransactionForm((prev) => ({ ...prev, investment_id: id }));
  };

  const onDeleteInvestment = async (id) => {
    if (!window.confirm("Delete this investment and all its transactions?")) return;
    try {
      await deleteInvestment(id);
      await loadPortfolio();
    } catch (err) {
      setError(formatApiError(err, "Failed to delete investment"));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    try {
      const profitLossFlag = filters.profit_loss === "all" ? undefined : filters.profit_loss === "profit";
      setTransactions(await getFilteredTransactions({
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        asset_type: filters.asset_type || undefined,
        profit_loss: profitLossFlag,
      }));
    } catch (err) {
      setError(formatApiError(err, "Failed to filter transactions"));
    }
  };

  const clearFilters = async () => {
    setFilters(emptyFilters);
    try { setTransactions(await getFilteredTransactions()); }
    catch (err) { setError(formatApiError(err, "Failed to load transactions")); }
  };

  const handleDownloadCsv = async () => {
    try {
      const blob = await downloadPortfolioCsv();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "portfolio_report.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(formatApiError(err, "Failed to download CSV"));
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="panel-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Portfolio</h1>
          <p className="page-subtitle">Your investment overview and transaction history</p>
        </div>
        <button type="button" className="secondary-button" onClick={handleDownloadCsv}>
          ↓ Download CSV
        </button>
      </div>

      {/* Metric cards */}
      <div className="metrics-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
        <div className="metric-card">
          <div className="metric-top-bar" style={{ background: "linear-gradient(90deg,#10b981,#06b6d4)" }} />
          <div className="metric-label">Total Portfolio Value</div>
          <div className="metric-value">₹{totalValue.toLocaleString()}</div>
          <div className="metric-sub neutral">{summary.length} assets</div>
        </div>
        <div className="metric-card">
          <div className="metric-top-bar" style={{ background: "linear-gradient(90deg,#4f46e5,#818cf8)" }} />
          <div className="metric-label">Unrealised P&amp;L</div>
          <div className="metric-value" style={{ color: totalPL >= 0 ? "var(--success)" : "var(--danger)" }}>
            {totalPL >= 0 ? "+" : ""}₹{Math.abs(totalPL).toLocaleString()}
          </div>
          <div className={`metric-sub${totalPL < 0 ? "" : ""}`}>
            {totalPL >= 0 ? "▲ Profit" : "▼ Loss"}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-top-bar" style={{ background: "linear-gradient(90deg,#f59e0b,#ef4444)" }} />
          <div className="metric-label">Transactions</div>
          <div className="metric-value">{transactions.length}</div>
          <div className="metric-sub neutral">Total recorded</div>
        </div>
      </div>

      {message && <p className="form-success" style={{ marginBottom: 14 }}>{message}</p>}
      {error && <p className="form-error" style={{ marginBottom: 14 }}>{error}</p>}
      {loading && <p className="muted-text">Loading portfolio…</p>}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 4, width: "fit-content", marginBottom: 20 }}>
        {[["summary","Summary"],["investments","Investments"],["transactions","Transactions"],["add","Add New"]].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            style={{
              background: activeTab === key ? "var(--bg)" : "none",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              padding: "7px 16px",
              fontFamily: "inherit",
              fontSize: "0.83rem",
              fontWeight: 500,
              color: activeTab === key ? "var(--text)" : "var(--text-muted)",
              boxShadow: activeTab === key ? "0 1px 4px rgba(0,0,0,.07)" : "none",
              transition: "all .18s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* SUMMARY TAB */}
      {activeTab === "summary" && (
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-subtitle" style={{ margin: 0 }}>Portfolio Summary</h2>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Symbol</th><th>Qty</th><th>Avg Cost</th>
                  <th>Current Value</th><th>P&amp;L</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((row) => (
                  <tr key={row.symbol}>
                    <td style={{ fontWeight: 600 }}>{row.symbol}</td>
                    <td>{row.total_quantity}</td>
                    <td>₹{Number(row.avg_cost_basis).toLocaleString()}</td>
                    <td>₹{Number(row.current_value).toLocaleString()}</td>
                    <td className={Number(row.profit_loss) >= 0 ? "profit-text" : "loss-text"}>
                      {Number(row.profit_loss) >= 0 ? "+" : ""}₹{Number(row.profit_loss).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {summary.length === 0 && (
                  <tr><td colSpan="5" className="muted-cell" style={{ textAlign: "center", padding: 32 }}>No portfolio data yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVESTMENTS TAB */}
      {activeTab === "investments" && (
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-subtitle" style={{ margin: 0 }}>Investments</h2>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Symbol</th><th>Asset Type</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {investments.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.symbol}</td>
                    <td><span className="chip">{item.asset_type}</span></td>
                    <td>
                      <div className="button-row">
                        <button type="button" className="secondary-button" onClick={() => { onSelectInvestment(item.id); setActiveTab("transactions"); }}>
                          View Txns
                        </button>
                        <button type="button" className="danger-button" onClick={() => onDeleteInvestment(item.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {investments.length === 0 && (
                  <tr><td colSpan="3" className="muted-cell" style={{ textAlign: "center", padding: 32 }}>No investments yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TRANSACTIONS TAB */}
      {activeTab === "transactions" && (
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-subtitle" style={{ margin: 0 }}>
              Transactions {selectedInvestment ? `· ${selectedInvestment.symbol}` : "· All"}
            </h2>
          </div>

          {/* Filters */}
          <div className="grid-four" style={{ marginBottom: 14 }}>
            <div className="form-field">
              <label className="form-label" htmlFor="start_date">From</label>
              <input id="start_date" name="start_date" type="date" value={filters.start_date} onChange={handleFilterChange} className="form-input" />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="end_date">To</label>
              <input id="end_date" name="end_date" type="date" value={filters.end_date} onChange={handleFilterChange} className="form-input" />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="asset_filter">Asset Type</label>
              <select id="asset_filter" name="asset_type" value={filters.asset_type} onChange={handleFilterChange} className="form-select">
                <option value="">All</option>
                {[...new Set(investments.map((i) => i.asset_type))].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="profit_loss">P&amp;L Filter</label>
              <select id="profit_loss" name="profit_loss" value={filters.profit_loss} onChange={handleFilterChange} className="form-select">
                <option value="all">All</option>
                <option value="profit">Profit Only</option>
                <option value="loss">Loss / Break-even</option>
              </select>
            </div>
          </div>
          <div className="button-row" style={{ marginBottom: 18 }}>
            <button type="button" className="primary-button" onClick={applyFilters}>Apply Filters</button>
            <button type="button" className="secondary-button" onClick={clearFilters}>Reset</button>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Symbol</th><th>Type</th><th>Asset</th><th>Date</th><th>Qty</th><th>Price</th><th>P&amp;L</th></tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td style={{ fontWeight: 600 }}>{txn.symbol || selectedInvestment?.symbol || "—"}</td>
                    <td>
                      <span className={`badge badge-${txn.type}`}>{txn.type}</span>
                    </td>
                    <td>{txn.asset_type || selectedInvestment?.asset_type || "—"}</td>
                    <td className="muted-cell">{txn.date}</td>
                    <td>{txn.quantity}</td>
                    <td>₹{Number(txn.price).toLocaleString()}</td>
                    <td className={Number(txn.profit_loss || 0) >= 0 ? "profit-text" : "loss-text"}>
                      {Number(txn.profit_loss || 0) >= 0 ? "+" : ""}₹{Math.abs(Number(txn.profit_loss || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr><td colSpan="7" className="muted-cell" style={{ textAlign: "center", padding: 32 }}>No transactions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD NEW TAB */}
      {activeTab === "add" && (
        <div className="grid-two">
          <div className="panel">
            <h2 className="panel-subtitle" style={{ marginBottom: 16 }}>Add Investment</h2>
            <form className="form-stack" onSubmit={submitInvestment}>
              <div className="form-field">
                <label className="form-label" htmlFor="symbol">Symbol</label>
                <input id="symbol" name="symbol" value={investmentForm.symbol} onChange={handleInvestmentChange} required className="form-input" placeholder="e.g. NIFTY50, BTC" />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="asset_type">Asset Type</label>
                <select id="asset_type" name="asset_type" value={investmentForm.asset_type} onChange={handleInvestmentChange} className="form-select">
                  {ASSET_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button type="submit" className="primary-button">Add Investment</button>
            </form>
          </div>

          <div className="panel">
            <h2 className="panel-subtitle" style={{ marginBottom: 16 }}>Add Transaction</h2>
            <form className="form-stack" onSubmit={submitTransaction}>
              <div className="form-field">
                <label className="form-label" htmlFor="investment_id">Investment</label>
                <select id="investment_id" name="investment_id" value={transactionForm.investment_id} onChange={handleTransactionChange} required className="form-select">
                  <option value="">Select investment</option>
                  {investments.map((item) => (
                    <option key={item.id} value={item.id}>{item.symbol} ({item.asset_type})</option>
                  ))}
                </select>
              </div>
              <div className="grid-two">
                <div className="form-field">
                  <label className="form-label" htmlFor="txn_type">Type</label>
                  <select id="txn_type" name="type" value={transactionForm.type} onChange={handleTransactionChange} className="form-select">
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="date">Date</label>
                  <input id="date" name="date" type="date" value={transactionForm.date} onChange={handleTransactionChange} required className="form-input" />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="quantity">Quantity</label>
                  <input id="quantity" name="quantity" type="number" min="0.000001" step="0.000001" value={transactionForm.quantity} onChange={handleTransactionChange} required className="form-input" placeholder="0.00" />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="price">Price (₹)</label>
                  <input id="price" name="price" type="number" min="0" step="0.000001" value={transactionForm.price} onChange={handleTransactionChange} required className="form-input" placeholder="0.00" />
                </div>
              </div>
              <button type="submit" className="primary-button">Add Transaction</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
