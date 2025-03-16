// src/utils/dateUtils.js

/**
 * Format a date string into a readable relative time
 * @param {string|Date} dateString Date to format
 * @returns {string} Formatted relative time
 */
export const formatRelativeTime = (dateString) => {
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

/**
 * Format a date string into a readable time
 * @param {string|Date} dateString Date to format
 * @returns {string} Formatted time
 */
export const formatTime = (dateString) => {
  const date = dateString instanceof Date ? dateString : new Date(dateString);

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  const strMinutes = minutes < 10 ? "0" + minutes : minutes;

  return `${hours}:${strMinutes} ${ampm}`;
};

/**
 * Format a date string into a readable date
 * @param {string|Date} dateString Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return "Unknown date";

  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString();
  } catch (err) {
    console.error("Date formatting error:", err);
    return "Invalid date";
  }
};

/**
 * Format a date string into a readable date and time
 * @param {string|Date} dateString Date to format
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "Unknown date/time";

  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return `${date.toLocaleDateString()} ${formatTime(date)}`;
  } catch (err) {
    console.error("Date formatting error:", err);
    return "Invalid date/time";
  }
};
