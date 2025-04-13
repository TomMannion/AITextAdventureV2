// src/utils/iconUtils.js

/**
 * Placeholder icons for the Windows 95 UI
 * These are used throughout the application to ensure consistent icon usage
 */
export const placeholderIcons = {
  // System icons
  windows: "/icons/startmenu.png",
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

  // Application icons
  adventure: "/icons/adventure.ico",
  notepad: "/icons/notepad.ico",
  calculator: "/icons/calculator.ico",
  paint: "/icons/paint.ico",
  minesweeper: "/icons/minesweeper.ico",

  // Folder and document icons
  myDocuments: "/icons/my-documents.ico",
  myComputer: "/icons/my-computer.ico",
  networkNeighborhood: "/icons/network-neighborhood.ico",
  recycle: "/icons/recycle-bin.ico",
  recycleEmpty: "/icons/recycle-bin-empty.ico",
  recycleFull: "/icons/recycle-bin-full.ico",
  folderOpen: "/icons/folder-open.ico",
  folderClosed: "/icons/folder.ico",
  textFile: "/icons/text-file.ico",

  // Media and status icons
  sound: "/icons/sound.ico",
  noSound: "/icons/no-sound.ico",
  mail: "/icons/mail.ico",
  network: "/icons/network.ico",
  lock: "/icons/lock.ico",

  // Notification types
  info: "/icons/info.ico",
  success: "/icons/success.ico",
  warning: "/icons/warning.ico",
  error: "/icons/error.ico",
  achievement: "/icons/achievement.ico",
  system: "/icons/system.ico",
  notification: "/icons/notification.ico",

  // Additional icons
  clock: "/icons/clock.ico",
  calendar: "/icons/calendar.ico",
  save: "/icons/save.ico",
  print: "/icons/print.ico",
  explorer: "/icons/explorer.ico",
  controlPanel: "/icons/control-panel.ico",

  // Game related icons
  fantasy: "/icons/genreIcons/fantasyIcon.png",
  scifi: "/icons/genreIcons/scifiIcon.png",
  horror: "/icons/genreIcons/horrorIcon.png",
  mystery: "/icons/genreIcons/mysteryIcon.png",
  weird_west: "/icons/genreIcons/weirdwestIcon.png",
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
      return placeholderIcons.textFile;
    case "doc":
    case "docx":
      return placeholderIcons.document;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
      return placeholderIcons.paint;
    case "mp3":
    case "wav":
      return placeholderIcons.sound;
    case "exe":
      return placeholderIcons.computer;
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
 * Get an icon for a genre
 * @param {string} genre Game genre
 * @returns {string} Icon URL
 */
export const getGenreIcon = (genre) => {
  if (placeholderIcons[genre]) {
    return placeholderIcons[genre];
  }

  // Default to adventure icon if genre-specific icon not found
  return placeholderIcons.adventure;
};

/**
 * Get an icon for a start menu item
 * @param {string} id Menu item ID
 * @returns {string} Icon URL
 */
export const getMenuItemIcon = (id) => {
  const menuIconMap = {
    programs: placeholderIcons.folder,
    documents: placeholderIcons.myDocuments,
    settings: placeholderIcons.settings,
    find: placeholderIcons.search,
    help: placeholderIcons.help,
    run: placeholderIcons.explorer,
    "user-profile": placeholderIcons.user,
    shutdown: placeholderIcons.shutdown,
    "text-adventure": placeholderIcons.adventure,
    notepad: placeholderIcons.notepad,
    calculator: placeholderIcons.calculator,
    paint: placeholderIcons.paint,
    minesweeper: placeholderIcons.minesweeper,
    "my-documents": placeholderIcons.myDocuments,
    "my-computer": placeholderIcons.myComputer,
    "control-panel": placeholderIcons.controlPanel,
    "network-neighborhood": placeholderIcons.networkNeighborhood,
  };

  return menuIconMap[id] || placeholderIcons.document;
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
