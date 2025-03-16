import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import { useWindowContext } from "../../../contexts/WindowContext";
import { useThemeContext } from "../../../contexts/ThemeContext";
import Window from "../../../components/layout/Window";

const ManagerContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 28px; /* Account for taskbar height */
  overflow: hidden;
  pointer-events: none; /* Allow clicks to pass through to desktop */

  /* Windows will have pointer-events turned back on */
`;

/**
 * Window Manager Component
 * Renders and manages all open windows in the system
 * Handles theme reset when text adventure windows are closed
 */
const WindowManager = () => {
  const {
    visibleWindows,
    activeWindowId,
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    moveWindow,
    resizeWindow,
  } = useWindowContext();

  // Get theme context to handle theme resets
  const { restoreDefaultTheme } = useThemeContext();

  // Track if a window is currently being interacted with
  const [isInteracting, setIsInteracting] = useState(false);

  // Handle window focus (bring to front)
  const handleWindowFocus = useCallback(
    (windowId) => {
      console.log(`Focusing window: ${windowId}`);
      focusWindow(windowId);
    },
    [focusWindow]
  );

  /**
   * Enhanced window close handler that also resets theme when needed
   */
  const handleWindowClose = useCallback(
    (windowId) => {
      console.log(`Closing window: ${windowId}`);

      // Find the window that's being closed
      const window = visibleWindows.find((w) => w.id === windowId);

      // Check if it's a text adventure window by examining several properties
      const isTextAdventureWindow =
        window &&
        // Check window ID for text adventure identification
        (windowId.includes("text-adventure") ||
          windowId.includes("game-") ||
          // Check if component name matches any of our game components
          (window.component &&
            (window.component.name === "GameModule" ||
              window.component.displayName === "GameModule" ||
              window.component.name === "TextAdventure" ||
              window.component.displayName === "TextAdventure")) ||
          // Check window title for game-related keywords
          (window.title &&
            (window.title.includes("Adventure") ||
              window.title.includes("Game") ||
              window.title.includes("Story"))));

      // If it's a text adventure window, reset theme
      if (isTextAdventureWindow) {
        console.log(
          "Closing text adventure window, resetting theme to Windows 95 default"
        );
        restoreDefaultTheme();
      }

      // Close the window
      closeWindow(windowId);
    },
    [closeWindow, visibleWindows, restoreDefaultTheme]
  );

  // Handle window minimize
  const handleWindowMinimize = useCallback(
    (windowId) => {
      console.log(`Minimizing window: ${windowId}`);
      minimizeWindow(windowId);
    },
    [minimizeWindow]
  );

  // Handle window maximize/restore
  const handleWindowMaximize = useCallback(
    (windowId, isMaximized) => {
      console.log(
        `WindowManager: Toggling maximize for window ${windowId}, isMaximized=${isMaximized}`
      );

      // Make sure we're passing a boolean value to maximizeWindow
      maximizeWindow(windowId, Boolean(isMaximized));
    },
    [maximizeWindow]
  );

  // Handle window move
  const handleWindowMove = useCallback(
    (windowId, x, y) => {
      console.log(`Moving window ${windowId} to x=${x}, y=${y}`);
      moveWindow(windowId, x, y);
      setIsInteracting(true);
    },
    [moveWindow]
  );

  // Handle window resize
  const handleWindowResize = useCallback(
    (windowId, width, height) => {
      console.log(
        `Resizing window ${windowId} to width=${width}, height=${height}`
      );
      resizeWindow(windowId, width, height);
      setIsInteracting(true);
    },
    [resizeWindow]
  );

  // Handle end of interaction
  const handleInteractionEnd = useCallback(() => {
    setIsInteracting(false);
  }, []);

  // Set up global mouseup listener to detect end of interaction
  useEffect(() => {
    const handleMouseUp = () => {
      if (isInteracting) {
        handleInteractionEnd();
      }
    };

    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isInteracting, handleInteractionEnd]);

  return (
    <ManagerContainer>
      {visibleWindows.map((window) => {
        const isActive = window.id === activeWindowId;

        // Prepare component props for rendering
        const componentProps = window.componentProps || {};

        return (
          <Window
            key={window.id}
            id={window.id}
            title={window.title}
            width={window.width}
            height={window.height}
            x={window.x}
            y={window.y}
            zIndex={window.zIndex}
            isActive={isActive}
            isMaximized={window.isMaximized}
            onFocus={handleWindowFocus}
            onClose={handleWindowClose} // Use our enhanced window close handler
            onMinimize={handleWindowMinimize}
            onMaximize={handleWindowMaximize}
            onMove={handleWindowMove}
            onResize={handleWindowResize}
            style={{ pointerEvents: "auto" }} // Ensure the window can receive clicks
          >
            {window.component && <window.component {...componentProps} />}
          </Window>
        );
      })}
    </ManagerContainer>
  );
};

export default WindowManager;
