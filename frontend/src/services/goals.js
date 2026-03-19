import api from "./api";

export const getGoals = async () => {
  const res = await api.get("/goals");
  return res.data;
};

export const getGoal = async (goalId) => {
  const res = await api.get(`/goals/${goalId}`);
  return res.data;
};

export const createGoal = async (payload) => {
  const res = await api.post("/goals", payload);
  return res.data;
};

export const updateGoal = async (goalId, payload) => {
  const res = await api.put(`/goals/${goalId}`, payload);
  return res.data;
};

export const deleteGoal = async (goalId) => {
  await api.delete(`/goals/${goalId}`);
};

export const getGoalProgress = async (goalId) => {
  const res = await api.get(`/goals/${goalId}/progress`);
  return res.data;
};
