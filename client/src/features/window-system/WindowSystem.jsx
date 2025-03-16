import React, { useCallback } from "react";
import { useWindowContext } from "../../contexts/WindowContext";
import {
  getWindowDefinition,
  calculateWindowPosition,
} from "./registry/windowRegistry";
import WindowManager from "./components/WindowManager"; // Import our updated WindowManager

/**
 * WindowSystem Component
 * Provides the overall window management system
 */
const WindowSystem = () => {
  const { windows, registerWindow } = useWindowContext();

  /**
   * Open a window of the specified type
   * @param {string} windowType Type of window to open
   * @param {Object} props Additional props for the window
   * @returns {string|null} ID of the opened window, or null if failed
   */
  const openWindow = useCallback(
    (windowType, props = {}) => {
      // Get window definition from registry
      const definition = getWindowDefinition(windowType);
      if (!definition) {
        console.error(
          `Cannot open window: Type '${windowType}' not registered`
        );
        return null;
      }

      // Merge props with default props from definition
      const mergedProps = {
        ...(definition.defaultProps || {}),
        ...props,
      };

      // Calculate position based on placement strategy
      const position = calculateWindowPosition(
        definition.placement,
        definition.width,
        definition.height,
        windows
      );

      // Create window config
      const windowConfig = {
        id: `${windowType}-${Date.now()}`,
        title: props.title || definition.title,
        component: definition.component,
        componentProps: mergedProps,
        width: props.width || definition.width,
        height: props.height || definition.height,
        x: props.x || position.x,
        y: props.y || position.y,
        icon: props.icon || definition.icon,
        isMaximized: !!props.isMaximized,
      };

      // Register window with WindowContext
      const windowId = registerWindow(windowConfig);
      return windowId;
    },
    [windows, registerWindow]
  );

  return (
    <>
      <WindowManager />
    </>
  );
};

// Export WindowSystem component
export default WindowSystem;

// Also export a context hook for accessing window system functions
export const useWindowSystem = () => {
  const {
    windows,
    visibleWindows,
    minimizedWindows,
    activeWindowId,
    registerWindow,
    focusWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    maximizeWindow,
    moveWindow,
    resizeWindow,
  } = useWindowContext();

  /**
   * Open a window of the specified type
   * @param {string} windowType Type of window to open
   * @param {Object} props Additional props for the window
   * @returns {string|null} ID of the opened window, or null if failed
   */
  const openWindow = useCallback(
    (windowType, props = {}) => {
      // Get window definition from registry
      const definition = getWindowDefinition(windowType);
      if (!definition) {
        console.error(
          `Cannot open window: Type '${windowType}' not registered`
        );
        return null;
      }

      // Merge props with default props from definition
      const mergedProps = {
        ...(definition.defaultProps || {}),
        ...props,
      };

      // Calculate position based on placement strategy
      const position = calculateWindowPosition(
        definition.placement,
        definition.width,
        definition.height,
        windows
      );

      // Create window config
      const windowConfig = {
        id: `${windowType}-${Date.now()}`,
        title: props.title || definition.title,
        component: definition.component,
        componentProps: mergedProps,
        width: props.width || definition.width,
        height: props.height || definition.height,
        x: props.x || position.x,
        y: props.y || position.y,
        icon: props.icon || definition.icon,
        isMaximized: !!props.isMaximized,
      };

      // Register window with WindowContext
      const windowId = registerWindow(windowConfig);
      return windowId;
    },
    [windows, registerWindow]
  );

  return {
    windows,
    visibleWindows,
    minimizedWindows,
    activeWindowId,
    openWindow,
    focusWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    maximizeWindow,
    moveWindow,
    resizeWindow,
  };
};
