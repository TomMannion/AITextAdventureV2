// src/features/game-engine/GameModule.jsx
import React, { useEffect } from "react";
import { useGameContext } from "../../contexts/GameContext";
import { useThemeContext } from "../../contexts/ThemeContext";
import GameLauncher from "./components/GameLauncher";
import GameCreator from "./components/GameCreator";
import GameBrowser from "./components/GameBrowser";
import GamePlayer from "./components/GamePlayer";

/**
 * GameModule - Main component that renders the appropriate game interface
 * based on the current game status - with theme handling
 */
const GameModule = (props) => {
  const { status, error, currentGame, gamesInitialized, fetchGames, segments } =
    useGameContext();
  const { applyGenreTheme, restoreDefaultTheme } = useThemeContext();

  // Initialize games once when component mounts - this ensures games are loaded
  // even if we navigate directly to a specific view
  useEffect(() => {
    // Initialize game list exactly once at the module level
    if (!gamesInitialized) {
      console.log("GameModule: Initializing game list data (one-time)");
      fetchGames();
    }
  }, [gamesInitialized, fetchGames]);

  // Show auto-save notification when game state changes
  useEffect(() => {
    // Only show auto-save for playing games that have already been saved once
    if (
      status === "playing" &&
      currentGame?.id &&
      segments &&
      segments.length > 1
    ) {
      // Import dynamically to prevent circular dependencies
      import("../../hooks/useGameNotifications")
        .then((module) => {
          const useGameNotifications = module.default;
          const { showAutoSaveNotification } = useGameNotifications();

          // Throttle auto-save notifications to not spam the user
          // We use a debounce approach
          const timer = setTimeout(() => {
            showAutoSaveNotification({
              gameId: currentGame.id,
              timestamp: new Date(),
            });
          }, 5000); // Wait 5 seconds after state changes

          return () => clearTimeout(timer);
        })
        .catch((err) => {
          console.error("Failed to import notification hook:", err);
        });
    }
  }, [status, currentGame, segments]);

  // Set theme based on game genre when component mounts
  // and reset when component unmounts
  useEffect(() => {
    if (currentGame && currentGame.genre) {
      // Apply the genre theme
      applyGenreTheme(currentGame.genre);
    }

    // Cleanup function that runs when component unmounts
    return () => {
      // Restore the default theme when game module closes
      restoreDefaultTheme();
    };
  }, [currentGame, applyGenreTheme, restoreDefaultTheme]);

  // Show error state
  if (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  // Return the appropriate component based on status
  // Note: We don't switch components during loading, each component
  // is responsible for showing its own loading state
  switch (status) {
    case "creating":
      return <GameCreator {...props} />;
    case "browsing":
    case "loading": // Handle loading within the GameBrowser component
      return <GameBrowser {...props} />;
    case "playing":
      return <GamePlayer {...props} />;
    case "idle":
    default:
      return <GameLauncher {...props} />;
  }
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(GameModule);
