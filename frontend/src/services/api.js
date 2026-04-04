import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081/api",
  withCredentials: true, // Include cookies for session management
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the stored user's email on every request so the backend
// can identify the caller even when the Spring session has expired.
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.email) {
        config.headers["X-User-Email"] = user.email;
      }
    }
  } catch (err) {
    void err; 
    // ignore JSON parse errors
  }
  return config;
});

export default api;
