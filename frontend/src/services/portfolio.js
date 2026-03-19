import api from "./api";

export const getInvestments = async () => {
  const res = await api.get("/portfolio/investments");
  return res.data;
};

export const createInvestment = async (payload) => {
  const res = await api.post("/portfolio/investments", payload);
  return res.data;
};

export const deleteInvestment = async (investmentId) => {
  await api.delete(`/portfolio/investments/${investmentId}`);
};

export const getTransactions = async (investmentId) => {
  const res = await api.get(`/portfolio/investments/${investmentId}/transactions`);
  return res.data;
};

export const getFilteredTransactions = async (filters = {}) => {
  const params = {};
  if (filters.start_date) params.start_date = filters.start_date;
  if (filters.end_date) params.end_date = filters.end_date;
  if (filters.asset_type) params.asset_type = filters.asset_type;
  if (typeof filters.profit_loss === "boolean") params.profit_loss = filters.profit_loss;
  const res = await api.get("/portfolio/transactions", { params });
  return res.data;
};

export const createTransaction = async (investmentId, payload) => {
  const res = await api.post(`/portfolio/investments/${investmentId}/transactions`, payload);
  return res.data;
};

export const getPortfolioSummary = async () => {
  const res = await api.get("/portfolio/summary");
  return res.data;
};

export const downloadPortfolioCsv = async () => {
  const res = await api.get("/portfolio/export", { responseType: "blob" });
  return res.data;
};

export const getSavingsStreak = async () => {
  const res = await api.get("/portfolio/streak");
  return res.data;
};
