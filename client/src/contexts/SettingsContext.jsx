// src/contexts/SettingsContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// Define default settings values
const defaultSettings = {
  // LLM Provider settings
  llm: {
    provider: "groq", // Default provider
    model: "llama-3.1-8b-instant", // Default model
    apiKey: "", // Empty by default for security
    saveApiKey: false, // Don't save API key by default
  },

  // Accessibility settings
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    disableCrtEffect: true,
  },

  // Notification settings
  notifications: {
    enabled: true,
    sound: true,
    achievementNotifications: true,
    saveNotifications: true,
    errorNotifications: true,
    systemMessages: true,
    duration: 5000, // milliseconds
  },

  // Display settings
  display: {
    theme: "win95", // Default theme
    crtEffectLevel: 0.5, // CRT effect intensity (0-1)
    showStatusBar: true,
  },

  // Game settings
  game: {
    autoSave: true,
    autoSaveInterval: 5, // minutes
    defaultGenre: "fantasy",
    defaultLength: 16, // turns
  },
};

// Create the settings context
const SettingsContext = createContext(null);

/**
 * Settings provider component
 */
export const SettingsProvider = ({ children }) => {
  // Initialize settings from localStorage if available, otherwise use defaults
  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem("app_settings");
      if (savedSettings) {
        // Deep merge with defaults to handle new settings properties
        const parsed = JSON.parse(savedSettings);
        return deepMerge(defaultSettings, parsed);
      }
    } catch (error) {
      console.error("Error loading settings from localStorage:", error);
    }
    return defaultSettings;
  });

  // Update localStorage when settings change
  useEffect(() => {
    try {
      localStorage.setItem("app_settings", JSON.stringify(settings));

      // Apply any immediate effects of settings
      applySettingsEffects(settings);
    } catch (error) {
      console.error("Error saving settings to localStorage:", error);
    }
  }, [settings]);

  // Function to apply immediate effects of settings changes
  const applySettingsEffects = (currentSettings) => {
    // Apply CRT effect level
    const root = document.documentElement;
    if (currentSettings.accessibility.disableCrtEffect) {
      root.classList.add("crt-effect-disabled");
    } else {
      root.classList.remove("crt-effect-disabled");
      root.style.setProperty(
        "--crt-effect-level",
        currentSettings.display.crtEffectLevel
      );
    }

    // Apply high contrast mode
    if (currentSettings.accessibility.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Apply reduced motion
    if (currentSettings.accessibility.reducedMotion) {
      root.classList.add("reduced-motion");
    } else {
      root.classList.remove("reduced-motion");
    }

    // Apply large text
    if (currentSettings.accessibility.largeText) {
      root.classList.add("large-text");
    } else {
      root.classList.remove("large-text");
    }
  };

  // Update a specific setting category
  const updateSettings = useCallback((category, updates) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...updates,
      },
    }));
  }, []);

  // Update a specific setting
  const updateSetting = useCallback((category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  }, []);

  // Reset all settings to defaults
  const resetAllSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  // Reset a specific category to defaults
  const resetCategorySettings = useCallback((category) => {
    setSettings((prev) => ({
      ...prev,
      [category]: { ...defaultSettings[category] },
    }));
  }, []);

  // Provide the settings context value
  const value = {
    settings,
    updateSettings,
    updateSetting,
    resetAllSettings,
    resetCategorySettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

/**
 * Hook for accessing the settings context
 */
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

/**
 * Utility function for deep merging objects
 */
function deepMerge(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (isObject(source[key]) && isObject(target[key])) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}

/**
 * Utility function to check if a value is an object
 */
function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

export default SettingsContext;
