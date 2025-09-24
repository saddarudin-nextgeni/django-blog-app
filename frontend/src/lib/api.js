import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (err) => Promise.reject(err));

api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response && 
      error.response.status === 401 && 
      !originalRequest._retry &&
      localStorage.getItem("refresh_token")
    ) {
      originalRequest._retry = true;
      try {
        // Call refresh endpoint
        const resp = await axios.post(
          `${process.env.REACT_APP_API_BASE}/auth/token/refresh/`,
          { refresh: localStorage.getItem("refresh_token") }
        );
        // Update both tokens
        localStorage.setItem("access_token", resp.data.access);
        if (resp.data.refresh) {
          localStorage.setItem("refresh_token", resp.data.refresh);
        }
        originalRequest.headers.Authorization = `Bearer ${resp.data.access}`;
        return api(originalRequest);
      } catch (err) {
        // Refresh failed, logout user
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_email");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
