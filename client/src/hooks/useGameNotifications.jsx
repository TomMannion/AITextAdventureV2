// src/hooks/useGameNotifications.js
import { useCallback } from "react";
import { useNotification } from "../contexts/NotificationContext";
import { useAudio } from "../contexts/AudioContext";
import NotificationService from "../services/notification.service";

/**
 * Enhanced notification deduplication system with session-based tracking
 * Prevents duplicate notifications both within configured timeouts and for specific once-per-session notifications
 */
const notificationManager = (() => {
  // Configuration for different notification types
  const NOTIFICATION_CONFIG = {
    welcome: {
      timeout: 10000, // 10 seconds for welcome messages
      oncePerSession: true, // Only show welcome notification once per browser session
    },
    autoSave: {
      timeout: 5000, // 5 seconds for auto-save
      throttleCount: 3, // Only show every N occurrences
      throttleWindow: 60000, // Within 1 minute window
    },
    manualSave: {
      timeout: 2000, // 2 seconds for manual save
    },
    error: {
      timeout: 3000, // 3 seconds for errors
      maxPerType: 3, // Maximum 3 errors of same type in a session
    },
    achievement: {
      timeout: 3000, // 3 seconds for achievements
      oncePerSession: true, // Only show each achievement once per session
    },
    gameCompletion: {
      timeout: 10000, // 10 seconds for game completion
      oncePerSession: true, // Only show once per session per game
    },
    default: {
      timeout: 2000, // Default timeout
    },
  };

  // Registry to track recently shown notifications
  const registry = {};

  // Session registry to track notifications that should only show once per session
  const sessionRegistry = new Set();

  // Throttle counters for notifications that should be rate-limited
  const throttleCounters = {};

  let cleanupTimer = null;

  // Schedule cleanup to run periodically and remove expired notifications
  const scheduleCleanup = () => {
    if (cleanupTimer === null) {
      cleanupTimer = setInterval(() => {
        const now = Date.now();
        let hasEntries = false;

        // Remove expired entries
        Object.keys(registry).forEach((key) => {
          if (now - registry[key].timestamp > registry[key].timeout) {
            delete registry[key];
          } else {
            hasEntries = true;
          }
        });

        // Also clean up throttle counters
        Object.keys(throttleCounters).forEach((key) => {
          const counter = throttleCounters[key];
          if (now - counter.startTime > counter.window) {
            delete throttleCounters[key];
          } else {
            hasEntries = true;
          }
        });

        // If no entries left, clear the interval to save resources
        if (!hasEntries) {
          clearInterval(cleanupTimer);
          cleanupTimer = null;
        }
      }, 5000); // Check every 5 seconds
    }
  };

  return {
    // Check if a notification should be shown based on type and key
    shouldShow: (type, key = "", data = {}) => {
      const config = NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.default;

      // Create a unique key that includes relevant data but isn't too long
      const relevantData =
        typeof data === "object"
          ? Object.entries(data)
              .filter(([k]) => ["id", "gameId", "title"].includes(k))
              .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {})
          : {};

      const notificationKey = `${type}_${key}_${JSON.stringify(
        relevantData
      )}`.substring(0, 100);
      const sessionKey = `session_${notificationKey}`;
      const now = Date.now();

      // Check if this is a once-per-session notification
      if (config.oncePerSession && sessionRegistry.has(sessionKey)) {
        console.log(`Skipping once-per-session notification: ${type}`);
        return false;
      }

      // Check throttling for notifications that should be rate-limited
      if (config.throttleCount && config.throttleWindow) {
        const throttleKey = `throttle_${type}_${key}`;
        const counter = throttleCounters[throttleKey] || {
          count: 0,
          startTime: now,
          window: config.throttleWindow,
        };

        // Increment counter
        counter.count++;
        throttleCounters[throttleKey] = counter;

        // Only show every Nth occurrence
        if (counter.count % config.throttleCount !== 0) {
          console.log(
            `Throttling notification: ${type} (${counter.count}/${config.throttleCount})`
          );
          return false;
        }
      }

      // Check maximum per type limit
      if (config.maxPerType) {
        const typeCount = Object.keys(registry).filter((k) =>
          k.startsWith(`${type}_`)
        ).length;

        if (typeCount >= config.maxPerType) {
          console.log(
            `Maximum notifications of type ${type} reached (${typeCount}/${config.maxPerType})`
          );
          return false;
        }
      }

      // Check if notification is in registry and not expired (time-based deduplication)
      if (
        registry[notificationKey] &&
        now - registry[notificationKey].timestamp <
          registry[notificationKey].timeout
      ) {
        console.log(`Skipping duplicate notification: ${type} (time-based)`);
        return false;
      }

      // Record this notification
      registry[notificationKey] = {
        timestamp: now,
        timeout: config.timeout,
      };

      // Record session-based notifications
      if (config.oncePerSession) {
        sessionRegistry.add(sessionKey);
      }

      // Ensure cleanup is scheduled
      scheduleCleanup();

      return true;
    },

    // Reset all tracked notifications (useful for testing)
    reset: (sessionToo = false) => {
      Object.keys(registry).forEach((key) => delete registry[key]);
      Object.keys(throttleCounters).forEach(
        (key) => delete throttleCounters[key]
      );

      if (sessionToo) {
        sessionRegistry.clear();
      }

      if (cleanupTimer) {
        clearInterval(cleanupTimer);
        cleanupTimer = null;
      }
    },
  };
})();

/**
 * Custom hook to handle game notifications and achievements
 * This hook combines notification and achievement services with audio hooks
 * and includes deduplication to prevent notification spam
 */
const useGameNotifications = () => {
  const notification = useNotification();
  const { playUISound, playGameSound } = useAudio();

  /**
   * Show welcome notification after login
   */
  const showWelcomeNotification = useCallback(
    ({
      username,
      unfinishedGames = [],
      isFirstLoginOfDay = false,
      lastLoginTime = null,
      openGameCallback,
      openDocumentsCallback,
    }) => {
      // Check for duplicate notifications
      if (!notificationManager.shouldShow("welcome", username)) {
        return null;
      }

      // Play appropriate sound
      if (isFirstLoginOfDay) {
        playUISound("startup");
      } else {
        playUISound("notification");
      }

      // Show notification
      return NotificationService.showWelcomeNotification(
        {
          username,
          unfinishedGames,
          isFirstLoginOfDay,
          lastLoginTime,
          openGameCallback,
          openDocumentsCallback,
        },
        notification
      );
    },
    [notification, playUISound]
  );

  /**
   * Show auto-save notification
   */
  const showAutoSaveNotification = useCallback(
    ({ gameId = null, timestamp = new Date() }) => {
      // Check for duplicate notifications
      if (!notificationManager.shouldShow("autoSave", gameId?.toString())) {
        return null;
      }

      // Play subtle click sound
      playUISound("click");

      // Show notification
      return NotificationService.showAutoSaveNotification(
        {
          gameId,
          timestamp,
        },
        notification
      );
    },
    [notification, playUISound]
  );

  /**
   * Show manual save notification
   */
  const showManualSaveNotification = useCallback(
    ({ gameId = null, timestamp = new Date() }) => {
      // Check for duplicate notifications
      if (!notificationManager.shouldShow("manualSave", gameId?.toString())) {
        return null;
      }

      // Play save sound
      playUISound("notification");

      // Show notification
      return NotificationService.showManualSaveNotification(
        {
          gameId,
          timestamp,
        },
        notification
      );
    },
    [notification, playUISound]
  );

  /**
   * Show error notification with retry option
   */
  const showErrorWithRetry = useCallback(
    ({
      title = "Error",
      message = "An error occurred",
      operation = "operation",
      retryCallback = null,
      cancelCallback = null,
    }) => {
      // Create a somewhat unique key for this error
      const errorKey = `${operation}_${message.substring(0, 20)}`;

      // Check for duplicate notifications
      if (!notificationManager.shouldShow("error", errorKey)) {
        return null;
      }

      // Play error sound
      playUISound("error");

      // Show notification
      return NotificationService.showErrorWithRetryNotification(
        {
          title,
          message,
          operation,
          retryCallback,
          cancelCallback,
        },
        notification
      );
    },
    [notification, playUISound]
  );

  /**
   * Show achievement notification
   */
  const showAchievementNotification = useCallback(
    ({
      title = "Achievement Unlocked",
      message = "You've unlocked a new achievement!",
      gameId = null,
      achievementId = null,
    }) => {
      // Create a key for this achievement
      const achievementKey = achievementId || `achievement_${title}`;

      // Check for duplicate notifications
      if (!notificationManager.shouldShow("achievement", achievementKey)) {
        return null;
      }

      // Play achievement sound
      playUISound("notification");

      // Show notification
      return NotificationService.showAchievementNotification(
        {
          title,
          message,
          gameId,
          achievementId,
        },
        notification
      );
    },
    [notification, playUISound]
  );

  /**
   * Show game completion notification
   */
  const showGameCompletionNotification = useCallback(
    ({
      gameTitle = "adventure",
      stats = {},
      newGameCallback = null,
      viewStatsCallback = null,
    }) => {
      // Create a key for this game completion
      const completionKey = `${gameTitle}`;

      // Check for duplicate notifications
      if (
        !notificationManager.shouldShow("gameCompletion", completionKey, stats)
      ) {
        return null;
      }

      // Play completion sound
      playUISound("notification");

      // Show notification
      return NotificationService.showGameCompletionNotification(
        {
          gameTitle,
          stats,
          newGameCallback,
          viewStatsCallback,
        },
        notification
      );
    },
    [notification, playUISound]
  );

  // Return all functions as a hook API
  return {
    showWelcomeNotification,
    showAutoSaveNotification,
    showManualSaveNotification,
    showErrorWithRetry,
    showAchievementNotification,
    showGameCompletionNotification,
    // For testing - reset notification tracking
    resetNotifications: notificationManager.reset,
  };
};

export default useGameNotifications;
