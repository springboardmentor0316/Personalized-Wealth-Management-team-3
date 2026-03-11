import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Request interceptor (token attach karega)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (401 handle karega)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        const res = await axios.post(
          "http://127.0.0.1:8000/auth/refresh",
          { refresh_token: refreshToken }
        );

        localStorage.setItem("token", res.data.access_token);

        originalRequest.headers.Authorization =
          `Bearer ${res.data.access_token}`;

        return api(originalRequest);

      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        window.location.replace("/");
      }
    }

    return Promise.reject(error);
  }
);

export default api;