import { useState, useCallback, useRef } from "react";

/**
 * Custom hook to manage window state
 *
 * @param {Object} initialState - Initial window state
 * @param {Object} callbacks - Callback functions for window state changes
 * @returns {Object} Window state and operations
 */
const useWindowState = (initialState = {}, callbacks = {}) => {
  // Initialize window state with defaults merged with provided values
  const [windowState, setWindowState] = useState({
    isActive: false,
    isMaximized: false,
    isMinimized: false,
    prevSize: null, // To store size before maximizing
    prevPosition: null, // To store position before maximizing
    ...initialState,
  });

  // Previous state reference for comparison in callbacks
  const prevStateRef = useRef(windowState);

  // Update window state
  const updateWindowState = useCallback((updates) => {
    setWindowState((prev) => {
      const newState = { ...prev, ...updates };

      // Store previous size and position for callbacks
      prevStateRef.current = prev;

      return newState;
    });
  }, []);

  // Focus window (make active)
  const focusWindow = useCallback(() => {
    updateWindowState({ isActive: true });

    // Call onFocus callback
    if (callbacks.onFocus) {
      callbacks.onFocus();
    }
  }, [callbacks, updateWindowState]);

  // Blur window (make inactive)
  const blurWindow = useCallback(() => {
    updateWindowState({ isActive: false });

    // Call onBlur callback
    if (callbacks.onBlur) {
      callbacks.onBlur();
    }
  }, [callbacks, updateWindowState]);

  // Maximize window
  const maximizeWindow = useCallback(() => {
    // Store current size and position before maximizing
    const { width, height, x, y, isMaximized } = windowState;

    // Only save prev state if we're not already maximized
    const prevSize = isMaximized ? windowState.prevSize : { width, height };
    const prevPosition = isMaximized ? windowState.prevPosition : { x, y };

    updateWindowState({
      isMaximized: true,
      prevSize,
      prevPosition,
    });

    // Call onMaximize callback
    if (callbacks.onMaximize) {
      callbacks.onMaximize(true);
    }
  }, [callbacks, updateWindowState, windowState]);

  // Restore window from maximized state
  const restoreWindow = useCallback(() => {
    // Only restore if we have previous size and position
    if (windowState.prevSize && windowState.prevPosition) {
      updateWindowState({
        isMaximized: false,
        width: windowState.prevSize.width,
        height: windowState.prevSize.height,
        x: windowState.prevPosition.x,
        y: windowState.prevPosition.y,
      });

      // Call onMaximize callback with false (not maximized)
      if (callbacks.onMaximize) {
        callbacks.onMaximize(false);
      }
    }
  }, [callbacks, updateWindowState, windowState]);

  // Toggle maximize/restore
  const toggleMaximize = useCallback(() => {
    if (windowState.isMaximized) {
      restoreWindow();
    } else {
      maximizeWindow();
    }
  }, [windowState.isMaximized, maximizeWindow, restoreWindow]);

  // Minimize window
  const minimizeWindow = useCallback(() => {
    updateWindowState({ isMinimized: true, isActive: false });

    // Call onMinimize callback
    if (callbacks.onMinimize) {
      callbacks.onMinimize(true);
    }
  }, [callbacks, updateWindowState]);

  // Restore window from minimized state
  const restoreFromMinimized = useCallback(() => {
    updateWindowState({ isMinimized: false, isActive: true });

    // Call onMinimize callback with false (not minimized)
    if (callbacks.onMinimize) {
      callbacks.onMinimize(false);
    }

    // Also call onFocus
    if (callbacks.onFocus) {
      callbacks.onFocus();
    }
  }, [callbacks, updateWindowState]);

  // Close window
  const closeWindow = useCallback(() => {
    // Call onClose callback
    if (callbacks.onClose) {
      callbacks.onClose();
    }
  }, [callbacks]);

  // Resize window
  const resizeWindow = useCallback(
    (width, height) => {
      updateWindowState({ width, height });

      // Call onResize callback
      if (callbacks.onResize) {
        callbacks.onResize(width, height);
      }
    },
    [callbacks, updateWindowState]
  );

  // Move window
  const moveWindow = useCallback(
    (x, y) => {
      updateWindowState({ x, y });

      // Call onMove callback
      if (callbacks.onMove) {
        callbacks.onMove(x, y);
      }
    },
    [callbacks, updateWindowState]
  );

  return {
    ...windowState,
    updateWindowState,
    focusWindow,
    blurWindow,
    maximizeWindow,
    restoreWindow,
    toggleMaximize,
    minimizeWindow,
    restoreFromMinimized,
    closeWindow,
    resizeWindow,
    moveWindow,
  };
};

export default useWindowState;
