/**
 * Window Registry
 * Provides a central registry for all application windows
 * Handles window registration, focus, and layout
 */

// Map of registered window definitions
const windowDefinitions = new Map();

// Map of window default placement strategies
const placementStrategies = {
  DEFAULT: "default",
  CENTER: "center",
  CASCADE: "cascade",
  TILE: "tile",
};

/**
 * Register a window type with the registry
 *
 * @param {string} windowType - Unique identifier for the window type
 * @param {Object} config - Window configuration
 * @param {Function} config.component - Component to render in the window
 * @param {Object} config.defaultProps - Default props for the window
 * @param {string} config.title - Default window title
 * @param {number} config.width - Default window width
 * @param {number} config.height - Default window height
 * @param {string} config.icon - Icon URL for the window
 * @param {string} config.placement - Placement strategy ('default', 'center', 'cascade', 'tile')
 */
const registerWindowType = (windowType, config) => {
  if (windowDefinitions.has(windowType)) {
    console.warn(`Window type '${windowType}' already registered, overwriting`);
  }

  // Store window definition
  windowDefinitions.set(windowType, {
    ...config,
    placement: config.placement || placementStrategies.DEFAULT,
  });

  console.log(`Registered window type: ${windowType}`);
  return true;
};

/**
 * Get a registered window definition
 *
 * @param {string} windowType - Window type to retrieve
 * @returns {Object|null} Window definition or null if not found
 */
const getWindowDefinition = (windowType) => {
  if (!windowDefinitions.has(windowType)) {
    console.warn(`Window type '${windowType}' not found in registry`);
    return null;
  }

  return { ...windowDefinitions.get(windowType) };
};

/**
 * Calculate window position based on placement strategy
 *
 * @param {string} strategy - Placement strategy
 * @param {number} width - Window width
 * @param {number} height - Window height
 * @param {Array} existingWindows - Currently open windows
 * @returns {Object} Position { x, y }
 */
const calculateWindowPosition = (
  strategy,
  width,
  height,
  existingWindows = []
) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight - 28; // Subtract taskbar height

  switch (strategy) {
    case placementStrategies.CENTER:
      return {
        x: Math.max(0, Math.floor((viewportWidth - width) / 2)),
        y: Math.max(0, Math.floor((viewportHeight - height) / 2)),
      };

    case placementStrategies.CASCADE:
      // Calculate position with cascading offset
      const offset = existingWindows.length * 20;
      return {
        x: Math.min(40 + offset, viewportWidth - width - 20),
        y: Math.min(40 + offset, viewportHeight - height - 20),
      };

    case placementStrategies.TILE:
      // Calculate position in a grid
      const columns = Math.max(1, Math.floor(viewportWidth / width));
      const index = existingWindows.length;
      const column = index % columns;
      const row = Math.floor(index / columns);

      return {
        x: column * (width + 10),
        y: row * (height + 10),
      };

    case placementStrategies.DEFAULT:
    default:
      // Default strategy - offset from top left
      return {
        x: 50 + ((existingWindows.length * 20) % 150),
        y: 50 + ((existingWindows.length * 20) % 100),
      };
  }
};

// Export registry functions and constants
export {
  registerWindowType,
  getWindowDefinition,
  calculateWindowPosition,
  placementStrategies,
};
