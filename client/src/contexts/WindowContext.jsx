// src/contexts/WindowContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAudio } from "./AudioContext";

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

  // Get audio functions
  const { playUISound } = useAudio();

  // Register a new window
  const registerWindow = useCallback(
    (windowConfig) => {
      const windowId =
        windowConfig.id ||
        `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Play sound for new window
      playUISound("click");

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
          icon: windowConfig.icon,
          ...windowConfig,
        };

        // Set this as the active window
        setActiveWindowId(windowId);
        setNextZIndex((prev) => prev + 1);

        return [...prevWindows, newWindow];
      });

      return windowId;
    },
    [nextZIndex, playUISound]
  );

  // Focus window (bring to front)
  const focusWindow = useCallback(
    (windowId) => {
      if (!windowId) return;

      // Play focus sound
      playUISound("click");

      setWindows((prevWindows) => {
        // Check if window exists and is not already focused
        const windowIndex = prevWindows.findIndex((w) => w.id === windowId);
        if (windowIndex === -1) {
          return prevWindows;
        }

        // If window is minimized, we need to restore it first
        const windowToFocus = prevWindows[windowIndex];
        if (windowToFocus.isMinimized) {
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
    [nextZIndex, playUISound]
  );

  // Close window
  const closeWindow = useCallback(
    (windowId) => {
      // Play close sound
      playUISound("click");

      setWindows((prevWindows) => {
        const windowToClose = prevWindows.find((w) => w.id === windowId);
        if (!windowToClose) return prevWindows;

        const remainingWindows = prevWindows.filter((w) => w.id !== windowId);

        // If we're closing the active window, set the next active window
        if (windowId === activeWindowId && remainingWindows.length > 0) {
          // Find the highest visible window to focus next
          const visibleWindows = remainingWindows.filter((w) => !w.isMinimized);

          if (visibleWindows.length > 0) {
            // Find the window with the highest z-index
            const nextActiveWindow = visibleWindows.reduce(
              (highest, current) =>
                current.zIndex > highest.zIndex ? current : highest,
              visibleWindows[0]
            );
            setActiveWindowId(nextActiveWindow.id);
          } else {
            // No visible windows left
            setActiveWindowId(null);
          }
        } else if (remainingWindows.length === 0) {
          setActiveWindowId(null);
        }

        return remainingWindows;
      });
    },
    [activeWindowId, playUISound]
  );

  // Minimize window
  const minimizeWindow = useCallback(
    (windowId) => {
      // Play minimize sound
      playUISound("minimize");

      setWindows((prevWindows) => {
        const windowToMinimize = prevWindows.find((w) => w.id === windowId);
        if (!windowToMinimize || windowToMinimize.isMinimized) {
          return prevWindows;
        }

        return prevWindows.map((window) => {
          if (window.id === windowId) {
            return { ...window, isMinimized: true, isActive: false };
          }
          return window;
        });
      });

      // Find next window to activate if we're minimizing the active window
      if (windowId === activeWindowId) {
        setWindows((prevWindows) => {
          // Find visible windows
          const visibleWindows = prevWindows.filter(
            (w) => !w.isMinimized && w.id !== windowId
          );

          if (visibleWindows.length > 0) {
            // Find the window with the highest z-index
            const nextActiveWindow = visibleWindows.reduce(
              (highest, current) =>
                current.zIndex > highest.zIndex ? current : highest,
              visibleWindows[0]
            );
            setActiveWindowId(nextActiveWindow.id);
          } else {
            // No visible windows left
            setActiveWindowId(null);
          }

          return prevWindows;
        });
      }
    },
    [activeWindowId, playUISound]
  );

  // Restore window from minimized state
  const restoreWindow = useCallback(
    (windowId) => {
      // Play maximize sound
      playUISound("maximize");

      setWindows((prevWindows) => {
        const windowToRestore = prevWindows.find((w) => w.id === windowId);
        if (!windowToRestore || !windowToRestore.isMinimized) {
          return prevWindows;
        }

        // Update all windows - set this one as active and visible
        return prevWindows.map((window) => {
          if (window.id === windowId) {
            return {
              ...window,
              isMinimized: false,
              isActive: true,
              zIndex: nextZIndex,
            };
          }
          // Set other windows as inactive
          return { ...window, isActive: false };
        });
      });

      // Set this as the active window
      setActiveWindowId(windowId);
      setNextZIndex((prev) => prev + 1);
    },
    [nextZIndex, playUISound]
  );

  // Maximize or restore window
  const maximizeWindow = useCallback(
    (windowId, isMaximized) => {
      // Play maximize/restore sound
      playUISound(isMaximized ? "maximize" : "click");

      setWindows((prevWindows) => {
        // Find the window
        const windowToToggle = prevWindows.find((w) => w.id === windowId);
        if (!windowToToggle) return prevWindows;

        // Update all windows
        return prevWindows.map((window) => {
          if (window.id === windowId) {
            return {
              ...window,
              isMaximized,
              // Store previous size and position if maximizing
              prevSize:
                isMaximized && !window.prevSize
                  ? { width: window.width, height: window.height }
                  : window.prevSize,
              prevPosition:
                isMaximized && !window.prevPosition
                  ? { x: window.x, y: window.y }
                  : window.prevPosition,
            };
          }
          return window;
        });
      });
    },
    [playUISound]
  );

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

  // Handle window focus changes when windows are added or removed
  useEffect(() => {
    // If we have no active window but there are visible windows, focus the top one
    if (!activeWindowId && visibleWindows.length > 0) {
      const topWindow = visibleWindows.reduce(
        (top, window) => (window.zIndex > top.zIndex ? window : top),
        visibleWindows[0]
      );
      setActiveWindowId(topWindow.id);
    }
  }, [activeWindowId, visibleWindows]);

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
