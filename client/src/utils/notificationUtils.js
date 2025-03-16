// src/utils/notificationUtils.js

/**
 * Get default title based on notification type
 * @param {string} type Notification type
 * @returns {string} Default title
 */
export const getDefaultTitle = (type) => {
  switch (type) {
    case "success":
      return "Success";
    case "error":
      return "Error";
    case "warning":
      return "Warning";
    case "achievement":
      return "Achievement Unlocked";
    case "system":
      return "System Message";
    case "info":
    default:
      return "Information";
  }
};

/**
 * Filter a list of notifications based on criteria
 * @param {Array} notifications Array of notification objects
 * @param {Object} filterOptions Filter options
 * @param {Object} filterOptions.typeFilters Which types to include (e.g. {info: true, error: false})
 * @param {boolean} filterOptions.unreadOnly Whether to show only unread notifications
 * @param {Object} readState Object mapping notification IDs to read status
 * @returns {Array} Filtered notifications
 */
export const filterNotifications = (
  notifications,
  filterOptions,
  readState = {}
) => {
  if (!notifications || !Array.isArray(notifications)) {
    return [];
  }

  return notifications.filter((notification) => {
    // Filter by type if typeFilters is specified
    if (
      filterOptions.typeFilters &&
      notification.type &&
      filterOptions.typeFilters[notification.type] === false
    ) {
      return false;
    }

    // Filter by read status if unreadOnly is true
    if (filterOptions.unreadOnly && readState[notification.id]) {
      return false;
    }

    return true;
  });
};

/**
 * Get the count of unread notifications
 * @param {Array} notifications Array of notification objects
 * @param {Object} readState Object mapping notification IDs to read status
 * @returns {number} Count of unread notifications
 */
export const getUnreadCount = (notifications, readState = {}) => {
  if (!notifications || !Array.isArray(notifications)) {
    return 0;
  }

  return notifications.filter((notification) => !readState[notification.id])
    .length;
};

/**
 * Mark a batch of notifications as read
 * @param {Array} notificationIds Array of notification IDs to mark as read
 * @param {Object} currentReadState Current read state object
 * @returns {Object} Updated read state
 */
export const markAsRead = (notificationIds, currentReadState = {}) => {
  const newReadState = { ...currentReadState };

  notificationIds.forEach((id) => {
    newReadState[id] = true;
  });

  return newReadState;
};

/**
 * Mark all notifications as read
 * @param {Array} notifications Array of notification objects
 * @param {Object} currentReadState Current read state object
 * @returns {Object} Updated read state with all notifications marked as read
 */
export const markAllAsRead = (notifications, currentReadState = {}) => {
  const newReadState = { ...currentReadState };

  notifications.forEach((notification) => {
    newReadState[notification.id] = true;
  });

  return newReadState;
};

/**
 * Sort notifications by criteria
 * @param {Array} notifications Array of notification objects
 * @param {string} sortBy Sort criteria ('time', 'type', 'priority')
 * @param {boolean} ascending Sort direction
 * @returns {Array} Sorted notifications
 */
export const sortNotifications = (
  notifications,
  sortBy = "time",
  ascending = false
) => {
  if (!notifications || !Array.isArray(notifications)) {
    return [];
  }

  const sortedNotifications = [...notifications];

  sortedNotifications.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "time":
        const timeA = new Date(a.timestamp || a.receivedAt).getTime();
        const timeB = new Date(b.timestamp || b.receivedAt).getTime();
        comparison = timeA - timeB;
        break;
      case "type":
        comparison = (a.type || "").localeCompare(b.type || "");
        break;
      case "priority":
        // Define priority order for types
        const priorityOrder = {
          error: 1,
          warning: 2,
          achievement: 3,
          success: 4,
          system: 5,
          info: 6,
        };
        const priorityA = priorityOrder[a.type] || 999;
        const priorityB = priorityOrder[b.type] || 999;
        comparison = priorityA - priorityB;
        break;
    }

    return ascending ? comparison : -comparison;
  });

  return sortedNotifications;
};
