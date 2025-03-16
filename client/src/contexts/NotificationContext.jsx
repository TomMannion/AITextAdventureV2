// src/contexts/NotificationContext.jsx
import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
} from "react";
import { useAudio } from "./AudioContext";
import { placeholderIcons } from "../utils/iconUtils";
import { getDefaultTitle } from "../utils/notificationUtils";

// Create notification context
const NotificationContext = createContext();

// Types of notifications with their default sounds
export const NOTIFICATION_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
  ACHIEVEMENT: "achievement",
  SYSTEM: "system",
};

// Default timeout for notifications in milliseconds
const DEFAULT_TIMEOUT = 5000; // 5 seconds

// Default notification configuration
const defaultConfig = {
  position: "bottom-right", // Position of notification stack
  maxVisible: 5, // Maximum number of visible notifications at once
  defaultTimeout: DEFAULT_TIMEOUT, // Default timeout in milliseconds
  sound: true, // Whether to play sounds with notifications
  animations: true, // Whether to animate notifications
  notifyTypes: {
    // Which notification types to display
    [NOTIFICATION_TYPES.INFO]: true,
    [NOTIFICATION_TYPES.SUCCESS]: true,
    [NOTIFICATION_TYPES.WARNING]: true,
    [NOTIFICATION_TYPES.ERROR]: true,
    [NOTIFICATION_TYPES.ACHIEVEMENT]: true,
    [NOTIFICATION_TYPES.SYSTEM]: true,
  },
};

// Load configuration from localStorage
const loadConfig = () => {
  try {
    const saved = localStorage.getItem("notification_config");
    return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
  } catch (e) {
    console.error("Error loading notification config:", e);
    return defaultConfig;
  }
};

// Notification provider component
export const NotificationProvider = ({ children, value }) => {
  // State to track all active notifications
  const [notifications, setNotifications] = useState([]);
  // Configuration state with localStorage persistence
  const [config, setConfig] = useState(loadConfig);
  // Counter for generating unique IDs
  const idCounter = useRef(0);
  // Reference to keep track of timeouts for auto-dismissal
  const timeouts = useRef({});
  // Get audio playback functions from AudioContext
  const { playUISound } = useAudio();

  // Apply custom configuration if provided
  useEffect(() => {
    if (value?.config) {
      setConfig((prev) => ({ ...prev, ...value.config }));
    }
  }, [value]);

  // Save config when it changes
  useEffect(() => {
    localStorage.setItem("notification_config", JSON.stringify(config));
  }, [config]);

  // Cleanup timeouts when the component unmounts
  useEffect(() => {
    return () => {
      // Clear all timeouts when component unmounts
      Object.values(timeouts.current).forEach(clearTimeout);
    };
  }, []);

  // Helper to update configuration
  const updateConfig = (newConfig) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  // Add a notification
  const addNotification = (message, options = {}) => {
    // Generate unique ID for the notification
    const id = `notification-${Date.now()}-${idCounter.current++}`;

    // Set notification type with default as INFO
    const type = options.type || NOTIFICATION_TYPES.INFO;

    // Don't add notification if this type is disabled in config
    if (config.notifyTypes[type] === false) {
      console.log(`Notification of type ${type} is disabled in config`);
      return null;
    }

    // Set timeout duration with default
    const timeout =
      options.timeout !== undefined ? options.timeout : config.defaultTimeout;

    // Create the notification object
    const notification = {
      id,
      message,
      type,
      title: options.title || getDefaultTitle(type),
      icon:
        options.icon ||
        (type && placeholderIcons[type]) ||
        placeholderIcons.info,
      actions: options.actions || [],
      timestamp: new Date(),
      animate: config.animations && options.animate !== false,
      style: options.style || {},
      ...options,
    };

    // Add notification to state
    setNotifications((prev) => [...prev, notification]);

    // Play appropriate sound for the notification type if sounds are enabled
    if (config.sound && options.sound !== false) {
      playSound(type);
    }

    // Set up auto-dismissal if timeout > 0
    if (timeout > 0) {
      timeouts.current[id] = setTimeout(() => {
        removeNotification(id);
      }, timeout);
    }

    // Return the ID so it can be used to remove the notification programmatically
    return id;
  };

  // Play appropriate sound based on notification type
  const playSound = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        playUISound("notification");
        break;
      case NOTIFICATION_TYPES.ERROR:
        playUISound("error");
        break;
      case NOTIFICATION_TYPES.WARNING:
        playUISound("error");
        break;
      case NOTIFICATION_TYPES.ACHIEVEMENT:
        playUISound("notification");
        break;
      case NOTIFICATION_TYPES.SYSTEM:
        playUISound("notification");
        break;
      case NOTIFICATION_TYPES.INFO:
      default:
        playUISound("click");
        break;
    }
  };

  // Remove a notification by ID
  const removeNotification = (id) => {
    // Clear the timeout for this notification
    if (timeouts.current[id]) {
      clearTimeout(timeouts.current[id]);
      delete timeouts.current[id];
    }

    // Remove notification from state
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  // Remove all notifications
  const clearNotifications = () => {
    // Clear all timeouts
    Object.values(timeouts.current).forEach(clearTimeout);
    timeouts.current = {};

    // Clear all notifications
    setNotifications([]);
  };

  // Convenience method for success notifications
  const showSuccess = (message, options = {}) => {
    return addNotification(message, {
      ...options,
      type: NOTIFICATION_TYPES.SUCCESS,
    });
  };

  // Convenience method for error notifications
  const showError = (message, options = {}) => {
    return addNotification(message, {
      ...options,
      type: NOTIFICATION_TYPES.ERROR,
    });
  };

  // Convenience method for warning notifications
  const showWarning = (message, options = {}) => {
    return addNotification(message, {
      ...options,
      type: NOTIFICATION_TYPES.WARNING,
    });
  };

  // Convenience method for info notifications
  const showInfo = (message, options = {}) => {
    return addNotification(message, {
      ...options,
      type: NOTIFICATION_TYPES.INFO,
    });
  };

  // Convenience method for achievement notifications
  const showAchievement = (message, options = {}) => {
    return addNotification(message, {
      ...options,
      type: NOTIFICATION_TYPES.ACHIEVEMENT,
      timeout: options.timeout || 8000, // Achievements stay longer by default
    });
  };

  // Convenience method for system notifications
  const showSystemMessage = (message, options = {}) => {
    return addNotification(message, {
      ...options,
      type: NOTIFICATION_TYPES.SYSTEM,
    });
  };

  // Context value to be provided
  const contextValue = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showAchievement,
    showSystemMessage,
    NOTIFICATION_TYPES,
    config,
    updateConfig,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

// Export types for use elsewhere
export { NOTIFICATION_TYPES as NotificationTypes };
