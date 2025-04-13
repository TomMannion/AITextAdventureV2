// src/utils/notificationManager.js

/**
 * Utility to manage notifications and prevent duplicates
 */
const notificationManager = (() => {
  // Registry to track recently shown notifications
  const notificationRegistry = {};
  
  // Configuration for different notification types
  const NOTIFICATION_CONFIG = {
    info: { timeout: 3000 },
    success: { timeout: 3000 },
    warning: { timeout: 5000 },
    error: { timeout: 5000 },
    achievement: { timeout: 8000 },
    system: { timeout: 5000 },
    default: { timeout: 3000 }
  };
  
  // Clean up registry periodically
  setInterval(() => {
    const now = Date.now();
    Object.keys(notificationRegistry).forEach(key => {
      if (now - notificationRegistry[key].timestamp > notificationRegistry[key].timeout) {
        delete notificationRegistry[key];
      }
    });
  }, 10000);
  
  return {
    /**
     * Show a notification if it hasn't been shown recently
     * 
     * @param {Function} showFn - Function to show notification (from useNotification)
     * @param {string} message - Notification message
     * @param {Object} options - Notification options
     * @param {string} key - Optional key for deduplication (defaults to message)
     * @returns {string|null} - Notification ID or null if not shown
     */
    showOnce: (showFn, message, options = {}, key = null) => {
      if (!showFn) return null;
      
      // Get notification type for timeout config
      const type = options.type || 'default';
      const config = NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.default;
      
      // Create unique key for this notification
      const notificationKey = key || message;
      const now = Date.now();
      
      // Check if we've shown this notification recently
      if (notificationRegistry[notificationKey] && 
          now - notificationRegistry[notificationKey].timestamp < notificationRegistry[notificationKey].timeout) {
        console.log(`Skipping duplicate notification: ${notificationKey}`);
        return null;
      }
      
      // Show the notification
      const id = showFn(message, options);
      
      // Record this notification
      notificationRegistry[notificationKey] = {
        timestamp: now,
        timeout: options.timeout || config.timeout,
      };
      
      return id;
    },
    
    /**
     * Helper for common notification types
     */
    showInfoOnce: (notificationContext, message, options = {}, key = null) => {
      if (!notificationContext?.showInfo) return null;
      return notificationManager.showOnce(
        notificationContext.showInfo, 
        message, 
        { ...options, type: 'info' }, 
        key
      );
    },
    
    showSuccessOnce: (notificationContext, message, options = {}, key = null) => {
      if (!notificationContext?.showSuccess) return null;
      return notificationManager.showOnce(
        notificationContext.showSuccess, 
        message, 
        { ...options, type: 'success' }, 
        key
      );
    },
    
    showErrorOnce: (notificationContext, message, options = {}, key = null) => {
      if (!notificationContext?.showError) return null;
      return notificationManager.showOnce(
        notificationContext.showError, 
        message, 
        { ...options, type: 'error' }, 
        key
      );
    },
    
    /**
     * Clear all tracked notifications
     */
    reset: () => {
      Object.keys(notificationRegistry).forEach(key => {
        delete notificationRegistry[key];
      });
    }
  };
})();

export default notificationManager;