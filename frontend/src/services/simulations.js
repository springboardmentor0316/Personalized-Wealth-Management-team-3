import api from "./api";

// ── Simulations ────────────────────────────────────────────────────────────

export async function runSimulation(payload) {
  const { data } = await api.post("/simulations/run", payload);
  return data;
}

export async function saveSimulation(payload) {
  const { data } = await api.post("/simulations", payload);
  return data;
}

export async function getSimulations() {
  const { data } = await api.get("/simulations");
  return data;
}

export async function deleteSimulation(id) {
  await api.delete(`/simulations/${id}`);
}

// ── Recommendations ────────────────────────────────────────────────────────

export async function generateRecommendation() {
  const { data } = await api.post("/recommendations/generate");
  return data;
}

export async function getRecommendations() {
  const { data } = await api.get("/recommendations");
  return data;
}

export async function getRebalanceSuggestions() {
  const { data } = await api.get("/recommendations/rebalance");
  return data;
}

export async function refreshMarketPrices() {
  const { data } = await api.post("/recommendations/refresh-prices");
  return data;
}
