// src/contexts/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

// Create a separate storage key for API settings to avoid exposing the API key in token
const API_SETTINGS_KEY = "ai_text_adventure_api_settings";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiSettings, setApiSettings] = useState({
    apiKey: "",
    preferredProvider: "openai", // default provider
    preferredModel: null,
  });

  // Load API settings on initial render
  useEffect(() => {
    loadApiSettings();
  }, []);

  // Check authentication on initial render
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const { data } = await authAPI.getCurrentUser();
          setUser(data);
        } catch (err) {
          // Invalid token
          console.error("Auth error:", err);
          localStorage.removeItem("token");
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  // Explicit function to load API settings from localStorage
  const loadApiSettings = () => {
    try {
      const savedSettings = localStorage.getItem(API_SETTINGS_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        console.log("Loaded API settings:", parsedSettings); // Add debug logging
        setApiSettings(parsedSettings);
      }
    } catch (err) {
      console.error("Error loading API settings:", err);
      // If settings are corrupted, reset to defaults
      setApiSettings({
        apiKey: "",
        preferredProvider: "openai",
        preferredModel: null,
      });
    }
  };

  // Explicit function to save API settings to localStorage
  const saveApiSettings = (settings) => {
    try {
      const updatedSettings = { ...apiSettings, ...settings };
      console.log("Saving API settings:", updatedSettings); // Add debug logging
      localStorage.setItem(API_SETTINGS_KEY, JSON.stringify(updatedSettings));
      setApiSettings(updatedSettings);
      return true;
    } catch (err) {
      console.error("Error saving API settings:", err);
      return false;
    }
  };

  const login = async (credentials) => {
    setError(null);

    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem("token", data.token);

      // Update user state with response data
      setUser(data);

      // If user has preferred provider/model in their profile, update apiSettings
      if (data.preferredProvider || data.preferredModel) {
        saveApiSettings({
          preferredProvider:
            data.preferredProvider || apiSettings.preferredProvider,
          preferredModel: data.preferredModel || apiSettings.preferredModel,
        });
      }

      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);

    try {
      const { data } = await authAPI.register(userData);
      localStorage.setItem("token", data.token);
      setUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    // Note: We intentionally DON'T clear API settings on logout
    // to preserve a better user experience across sessions
    setUser(null);
  };

  const updateApiKey = (apiKey) => {
    return saveApiSettings({ apiKey });
  };

  const updatePreferredProvider = async (provider) => {
    try {
      // First save locally to ensure it's stored even if server update fails
      saveApiSettings({ preferredProvider: provider });

      // Update user object if authenticated
      if (user) {
        setUser((prev) => ({ ...prev, preferredProvider: provider }));

        // Then update on server
        await authAPI.updateProfile({ preferredProvider: provider });
      }

      return true;
    } catch (err) {
      console.error("Failed to update preferred provider:", err);
      // We don't revert the local setting since it's still valuable to the user
      setError(
        "Failed to update provider preference on server, but saved locally"
      );
      return false;
    }
  };

  const updatePreferredModel = async (model) => {
    try {
      // First save locally
      saveApiSettings({ preferredModel: model });

      // Update user object if authenticated
      if (user) {
        setUser((prev) => ({ ...prev, preferredModel: model }));

        // Then update on server
        await authAPI.updateProfile({ preferredModel: model });
      }

      return true;
    } catch (err) {
      console.error("Failed to update preferred model:", err);
      // We don't revert the local setting since it's still valuable to the user
      setError(
        "Failed to update model preference on server, but saved locally"
      );
      return false;
    }
  };

  // Helper to get API headers for requests
  const getApiRequestHeaders = () => {
    const headers = {};
    if (apiSettings.apiKey) {
      headers["x-llm-api-key"] = apiSettings.apiKey;
    }
    return headers;
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,

    // API settings
    apiSettings,
    updateApiKey,
    updatePreferredProvider,
    updatePreferredModel,
    getApiRequestHeaders,

    // For debugging
    loadApiSettings,
    saveApiSettings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
