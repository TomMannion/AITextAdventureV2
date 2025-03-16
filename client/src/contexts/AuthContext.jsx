// src/contexts/AuthContext.jsx - Updated for Router
import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";

// Create the context
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect to restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          console.log("Restored user session:", userData);

          // Normalize response structure - handle both data.data and data formats
          const userObject = userData.data || userData;
          setCurrentUser(userObject);
        } catch (err) {
          console.error("Failed to restore session:", err);
          localStorage.removeItem("token");
          setToken(null);
          setCurrentUser(null);
          setError("Session expired. Please login again.");
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    };

    restoreSession();
  }, [token]);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Login with credentials:", credentials);
      const response = await authService.login(credentials);
      console.log("Login response:", response);

      // Handle API response
      const userData = response.data || response;
      const tokenValue =
        response.token || userData.token || response.data?.token;

      // Update state with user data
      setCurrentUser(userData);

      // Save token if available
      if (tokenValue) {
        localStorage.setItem("token", tokenValue);
        setToken(tokenValue);
      }

      // Navigate to desktop - caller should handle this with useNavigate hook
      return userData;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Register with data:", userData);
      const response = await authService.register(userData);
      console.log("Register response:", response);

      // Handle API response
      const newUser = response.data || response;
      const tokenValue =
        response.token || newUser.token || response.data?.token;

      // Update state with user data
      setCurrentUser(newUser);

      // Save token if available
      if (tokenValue) {
        localStorage.setItem("token", tokenValue);
        setToken(tokenValue);
      }

      // Navigate to desktop - caller should handle this with useNavigate hook
      return newUser;
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);

    try {
      if (token) {
        await authService.logout();
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setCurrentUser(null);
      setLoading(false);

      // Navigate to login - caller should handle this with useNavigate hook
    }
  };

  // Update profile function
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.updateProfile(userData);
      const updatedUser = response.data || response;
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message || "Profile update failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    currentUser,
    token,
    loading,
    error,
    setError,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!currentUser && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
