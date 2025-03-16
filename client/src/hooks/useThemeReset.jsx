// src/hooks/useThemeReset.js
import { useEffect } from "react";
import { useThemeContext } from "../contexts/ThemeContext";
import { useWindowContext } from "../contexts/WindowContext";

/**
 * Custom hook to reset theme when text adventure window closes
 *
 * This hook watches for window close events and resets the theme
 * to default Windows 95 when the text adventure application is closed
 */
const useThemeReset = () => {
  const { restoreDefaultTheme } = useThemeContext();
  const { windows } = useWindowContext();

  useEffect(() => {
    // Keep track of whether text adventure window was open in the previous render
    let wasTextAdventureOpen = false;

    // Function to check if text adventure is open
    const checkTextAdventureOpen = () => {
      return windows.some(
        (window) =>
          window.id.includes("text-adventure") ||
          (window.component &&
            (window.component.name === "GameModule" ||
              window.component.displayName === "GameModule" ||
              window.component.name === "TextAdventure" ||
              window.component.displayName === "TextAdventure"))
      );
    };

    // Check if text adventure was open but now is closed
    const isTextAdventureOpen = checkTextAdventureOpen();

    if (wasTextAdventureOpen && !isTextAdventureOpen) {
      console.log("Text adventure window was closed, resetting theme");
      restoreDefaultTheme();
    }

    // Update state for next render
    wasTextAdventureOpen = isTextAdventureOpen;

    // Cleanup function
    return () => {
      // If component is unmounting and text adventure was open, reset theme
      if (wasTextAdventureOpen) {
        restoreDefaultTheme();
      }
    };
  }, [windows, restoreDefaultTheme]);
};

export default useThemeReset;
