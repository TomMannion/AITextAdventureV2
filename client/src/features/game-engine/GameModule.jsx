// src/features/game-engine/GameModule.jsx
import React, { useEffect } from "react";
import { useGameContext } from "../../contexts/GameContext";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useNotification } from "../../contexts/NotificationContext";
import GameLauncher from "./components/GameLauncher";
import GameCreator from "./components/GameCreator";
import GameBrowser from "./components/GameBrowser";
import GameStateManager from "./components/GameStateManager";
import EmptyGameState from "./components/EmptyGameState";

/**
 * GameModule - Main component that renders the appropriate game interface
 * based on the current game status - with theme handling
 */
const GameModule = (props) => {
  const {
    status,
    error,
    currentGame,
    gamesInitialized,
    gameList,
    fetchGames,
    segments,
    startNewGame,
    clearError,
  } = useGameContext();

  const { applyGenreTheme, restoreDefaultTheme } = useThemeContext();
  const { showError } = useNotification();

  // Initialize games once when component mounts - this ensures games are loaded
  // even if we navigate directly to a specific view
  useEffect(() => {
    // Initialize game list exactly once at the module level
    if (!gamesInitialized) {
      console.log("GameModule: Initializing game list data (one-time)");
      fetchGames().catch((err) => {
        console.error("Failed to fetch games:", err);
        showError("Failed to load your adventures. Please try again later.");
      });
    }
  }, [gamesInitialized, fetchGames, showError]);

  // Clean up errors when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        clearError();
      }
    };
  }, [error, clearError]);

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

  // Handle game state based on context status
  const renderGameState = () => {
    switch (status) {
      case "creating":
        return <GameCreator {...props} />;

      case "browsing":
        // Show different state if no games exist
        if (gamesInitialized && (!gameList || gameList.length === 0)) {
          return (
            <EmptyGameState
              onCreateNew={startNewGame}
              onRefresh={() => fetchGames(true)}
            />
          );
        }
        return <GameBrowser {...props} />;

      case "loading":
        // If we're loading but have a current game, go to state manager
        if (currentGame) {
          return <GameStateManager {...props} />;
        }
        // Otherwise show the browser with loading state
        return <GameBrowser {...props} />;

      case "playing":
        // Use the state manager to handle different game stages
        return <GameStateManager {...props} />;

      case "error":
        // Show error with different handling based on context
        if (currentGame) {
          return <GameStateManager {...props} />;
        } else {
          return (
            <EmptyGameState
              message={`Error: ${error}`}
              onCreateNew={startNewGame}
              onRefresh={() => {
                clearError();
                fetchGames(true);
              }}
            />
          );
        }

      case "idle":
      default:
        return <GameLauncher {...props} />;
    }
  };

  return renderGameState();
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(GameModule);
