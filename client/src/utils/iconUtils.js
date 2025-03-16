// src/utils/iconUtils.js

/**
 * Placeholder icons for the Windows 95 UI
 * These are used as fallbacks when no icon is provided
 */
export const placeholderIcons = {
  // System icons
  windows: "/icons/windows-logo.ico",
  computer: "/icons/computer.ico",
  desktop: "/icons/desktop.ico",
  folder: "/icons/folder.ico",
  document: "/icons/document.ico",
  settings: "/icons/settings.ico",
  help: "/icons/help.ico",
  search: "/icons/search.ico",
  user: "/icons/user.ico",
  shutdown: "/icons/shutdown.ico",
  restart: "/icons/restart.ico",

  // Notification types
  info: "/icons/info.ico",
  success: "/icons/success.ico",
  warning: "/icons/warning.ico",
  error: "/icons/error.ico",
  achievement: "/icons/achievement.ico",
  system: "/icons/system.ico",
  notification: "/icons/notification.ico",

  // Media icons
  sound: "/icons/sound.ico",
  noSound: "/icons/no-sound.ico",
  mail: "/icons/mail.ico",

  // Application icons
  text: "/icons/text.ico",
  notepad: "/icons/notepad.ico",
  adventure: "/icons/adventure.ico",

  // Additional icons
  clock: "/icons/clock.ico",
  calendar: "/icons/calendar.ico",
  network: "/icons/network.ico",
  lock: "/icons/lock.ico",
  save: "/icons/save.ico",
  print: "/icons/print.ico",
  explorer: "/icons/explorer.ico",
  recycle: "/icons/recycle-bin.ico",
};

/**
 * Get an icon based on file extension
 * @param {string} filename Filename with extension
 * @returns {string} Icon URL
 */
export const getFileIcon = (filename) => {
  if (!filename) return placeholderIcons.document;

  const extension = filename.split(".").pop().toLowerCase();

  switch (extension) {
    case "txt":
      return placeholderIcons.text;
    case "doc":
    case "docx":
      return placeholderIcons.document;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
      return placeholderIcons.image;
    case "mp3":
    case "wav":
      return placeholderIcons.sound;
    case "exe":
      return placeholderIcons.application;
    default:
      return placeholderIcons.document;
  }
};

/**
 * Get an icon based on notification type
 * @param {string} type Notification type
 * @returns {string} Icon URL
 */
export const getNotificationIcon = (type) => {
  return placeholderIcons[type] || placeholderIcons.info;
};

/**
 * Get file type description based on extension
 * @param {string} filename Filename with extension
 * @returns {string} File type description
 */
export const getFileTypeDescription = (filename) => {
  if (!filename) return "Unknown File";

  const extension = filename.split(".").pop().toLowerCase();

  switch (extension) {
    case "txt":
      return "Text Document";
    case "doc":
    case "docx":
      return "Word Document";
    case "jpg":
    case "jpeg":
      return "JPEG Image";
    case "png":
      return "PNG Image";
    case "gif":
      return "GIF Image";
    case "bmp":
      return "Bitmap Image";
    case "mp3":
      return "MP3 Audio";
    case "wav":
      return "WAV Audio";
    case "exe":
      return "Application";
    default:
      return `${extension.toUpperCase()} File`;
  }
};
