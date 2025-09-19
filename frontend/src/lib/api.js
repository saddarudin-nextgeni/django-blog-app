import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (err) => Promise.reject(err));

api.interceptors.response.use((response) => response, async (error) => {
  const originalRequest = error.config;
  if (!originalRequest) return Promise.reject(error);

  // avoid infinite loop
  if (error.response && error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    if (isRefreshing) {
      // queue the request until token is refreshed
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      }).catch(err => Promise.reject(err));
    }

    isRefreshing = true;
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) {
      // no refresh token: force logout by rejecting
      isRefreshing = false;
      return Promise.reject(error);
    }
    try {
      const resp = await axios.post(`${process.env.REACT_APP_API_BASE}/auth/token/refresh/`, { refresh });
      const newAccess = resp.data.access;
      localStorage.setItem("access_token", newAccess);
      api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
      processQueue(null, newAccess);
      isRefreshing = false;
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      isRefreshing = false;
      // refresh failed: clear tokens
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return Promise.reject(err);
    }
  }
  return Promise.reject(error);
});

export default api;
