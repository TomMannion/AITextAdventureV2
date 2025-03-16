import React, { createContext, useContext, useState, useCallback } from "react";

// Create the context
const WindowContext = createContext(null);

/**
 * WindowProvider component that manages window state
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const WindowProvider = ({ children }) => {
  // State for tracking open windows
  const [windows, setWindows] = useState([]);
  // State for tracking active window
  const [activeWindowId, setActiveWindowId] = useState(null);
  // State for tracking next z-index
  const [nextZIndex, setNextZIndex] = useState(100);

  // Register a new window
  const registerWindow = useCallback(
    (windowConfig) => {
      const windowId =
        windowConfig.id ||
        `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      setWindows((prevWindows) => {
        // Check if window with this ID already exists
        const existingWindow = prevWindows.find((w) => w.id === windowId);
        if (existingWindow) {
          return prevWindows;
        }

        // Create new window
        const newWindow = {
          id: windowId,
          title: windowConfig.title || "Window",
          isActive: true,
          isMinimized: false,
          isMaximized: !!windowConfig.isMaximized,
          zIndex: nextZIndex,
          x: windowConfig.x || 50 + ((prevWindows.length * 20) % 150),
          y: windowConfig.y || 50 + ((prevWindows.length * 20) % 150),
          width: windowConfig.width || 400,
          height: windowConfig.height || 300,
          component: windowConfig.component,
          componentProps: windowConfig.componentProps || {},
          ...windowConfig,
        };

        // Set this as the active window
        setActiveWindowId(windowId);
        setNextZIndex((prev) => prev + 1);

        return [...prevWindows, newWindow];
      });

      return windowId;
    },
    [nextZIndex]
  );

  // Focus window (bring to front)
  const focusWindow = useCallback(
    (windowId) => {
      if (!windowId) return;

      setWindows((prevWindows) => {
        // Check if window exists and is not already focused
        const windowIndex = prevWindows.findIndex((w) => w.id === windowId);
        if (windowIndex === -1 || prevWindows[windowIndex].isActive) {
          return prevWindows;
        }

        // Update windows to set active state and z-index
        return prevWindows.map((window) => ({
          ...window,
          isActive: window.id === windowId,
          zIndex: window.id === windowId ? nextZIndex : window.zIndex,
        }));
      });

      setActiveWindowId(windowId);
      setNextZIndex((prev) => prev + 1);
    },
    [nextZIndex]
  );

  // Close window
  const closeWindow = useCallback(
    (windowId) => {
      setWindows((prevWindows) => {
        const remainingWindows = prevWindows.filter((w) => w.id !== windowId);

        // If we're closing the active window, set the next active window
        if (windowId === activeWindowId && remainingWindows.length > 0) {
          // Find the window with the highest z-index
          const nextActiveWindow = remainingWindows.reduce(
            (highest, current) =>
              current.zIndex > highest.zIndex ? current : highest,
            remainingWindows[0]
          );
          setActiveWindowId(nextActiveWindow.id);
        } else if (remainingWindows.length === 0) {
          setActiveWindowId(null);
        }

        return remainingWindows;
      });
    },
    [activeWindowId]
  );

  // Minimize window
  const minimizeWindow = useCallback(
    (windowId) => {
      setWindows((prevWindows) =>
        prevWindows.map((window) => {
          if (window.id === windowId) {
            return { ...window, isMinimized: true };
          }
          return window;
        })
      );

      // If we're minimizing the active window, remove active state
      if (windowId === activeWindowId) {
        setActiveWindowId(null);
      }
    },
    [activeWindowId]
  );

  // Restore window from minimized state
  const restoreWindow = useCallback(
    (windowId) => {
      setWindows((prevWindows) =>
        prevWindows.map((window) => {
          if (window.id === windowId) {
            return { ...window, isMinimized: false };
          }
          return window;
        })
      );

      // Focus the restored window
      focusWindow(windowId);
    },
    [focusWindow]
  );

  // Maximize or restore window
  const maximizeWindow = useCallback((windowId, isMaximized) => {
    setWindows((prevWindows) =>
      prevWindows.map((window) => {
        if (window.id === windowId) {
          return { ...window, isMaximized };
        }
        return window;
      })
    );
  }, []);

  // Move window
  const moveWindow = useCallback((windowId, x, y) => {
    setWindows((prevWindows) =>
      prevWindows.map((window) => {
        if (window.id === windowId) {
          return { ...window, x, y };
        }
        return window;
      })
    );
  }, []);

  // Resize window
  const resizeWindow = useCallback((windowId, width, height) => {
    setWindows((prevWindows) =>
      prevWindows.map((window) => {
        if (window.id === windowId) {
          return { ...window, width, height };
        }
        return window;
      })
    );
  }, []);

  // Update window properties
  const updateWindow = useCallback((windowId, updates) => {
    setWindows((prevWindows) =>
      prevWindows.map((window) => {
        if (window.id === windowId) {
          return { ...window, ...updates };
        }
        return window;
      })
    );
  }, []);

  // Get visible (non-minimized) windows
  const visibleWindows = windows.filter((window) => !window.isMinimized);

  // Get minimized windows
  const minimizedWindows = windows.filter((window) => window.isMinimized);

  // Context value
  const value = {
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
    updateWindow,
  };

  return (
    <WindowContext.Provider value={value}>{children}</WindowContext.Provider>
  );
};

/**
 * Hook for accessing the window context
 * @returns {Object} Window context
 */
export const useWindowContext = () => {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error("useWindowContext must be used within a WindowProvider");
  }
  return context;
};

export default WindowContext;
