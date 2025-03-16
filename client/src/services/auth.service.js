// src/services/auth.service.js
import { apiClient } from "./api.service";

// Auth Service
const authService = {
  register: async (userData) => {
    try {
      console.log("Registering with data:", userData);
      const response = await apiClient.post("/users/register", userData);
      console.log("Registration response:", response);
      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },
  login: async (credentials) => {
    try {
      const response = await apiClient.post("/users/login", credentials);
      // For debugging
      console.log("Login response:", response);
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  logout: () => {
    return apiClient.post("/users/logout");
  },
  getCurrentUser: () => {
    return apiClient.get("/users/me");
  },
  updateProfile: (userData) => {
    return apiClient.put("/users/me", userData);
  },
  updatePreferences: (preferences) => {
    return apiClient.put("/users/preferences", preferences);
  },
  deleteAccount: () => {
    return apiClient.delete("/users/me");
  },
};

export { authService };
export default authService;
