// src/features/game-engine/components/GameStateManager.jsx
import React, { useState, useEffect } from "react";
import useGameState from "../hooks/useGameState";
import GamePlayer from "./GamePlayer";
import GameInitializer from "./GameInitializer";
import GameCreationSuccess from "./GameCreationSuccess";
import GameCompletion from "./GameCompletion";
import EmptyGameState from "./EmptyGameState";

/**
 * Game State Manager - Orchestrates the flow between different game states
 * This component decides which sub-component to render based on the current game state
 */
const GameStateManager = (props) => {
  const {
    status,
    error,
    currentGame,
    segments,
    options,
    startLoadedGame,
    setStatus,
    returnToLauncher,
    startNewGame,
    clearError,
  } = useGameState();

  // Local component state to track the stage within the "playing" status
  const [gameStage, setGameStage] = useState("loading"); // loading, initializing, playing, completed, error

  // Track if this is the first time we're showing the game
  const [isNewGame, setIsNewGame] = useState(false);

  // Determine the game stage based on context state when status changes or game changes
  useEffect(() => {
    if (status !== "playing") {
      return;
    }

    if (!currentGame) {
      setGameStage("error");
      return;
    }

    if (currentGame.status === "COMPLETED") {
      setGameStage("completed");
      return;
    }

    // Check if we need to initialize the game
    if (!segments || segments.length === 0) {
      setGameStage("initializing");
      return;
    }

    // Check if this is a newly created game (no segments yet)
    if (segments.length === 0 && !currentGame.turnCount) {
      setIsNewGame(true);
      setGameStage("initializing");
      return;
    }

    // If we have a game with segments, we're ready to play
    setGameStage("playing");
  }, [status, currentGame, segments]);

  /**
   * Handle completion of game initialization
   */
  const handleInitializationComplete = (result) => {
    // If this is a brand new game, show the creation success screen
    if (isNewGame) {
      setGameStage("new-game-success");
    } else {
      // Otherwise go straight to playing
      setGameStage("playing");
    }
  };

  /**
   * Handle initialization error
   */
  const handleInitializationError = (error) => {
    console.error("Game initialization error:", error);
    setGameStage("error");
  };

  /**
   * Handle cancellation of initialization
   */
  const handleInitializationCancel = () => {
    returnToLauncher();
  };

  /**
   * Handle start adventure from creation success screen
   */
  const handleStartAdventure = () => {
    setGameStage("playing");
    setIsNewGame(false);
  };

  /**
   * Handle create another from creation success screen
   */
  const handleCreateAnother = () => {
    startNewGame();
  };

  /**
   * Render the appropriate component based on game stage
   */
  const renderGameStage = () => {
    switch (gameStage) {
      case "initializing":
        return (
          <GameInitializer
            gameId={currentGame?.id}
            onComplete={handleInitializationComplete}
            onError={handleInitializationError}
            onCancel={handleInitializationCancel}
          />
        );

      case "new-game-success":
        return (
          <GameCreationSuccess
            onStartAdventure={handleStartAdventure}
            onCreateAnother={handleCreateAnother}
          />
        );

      case "completed":
        return (
          <GameCompletion
            onNewAdventure={startNewGame}
            onReturnToMenu={returnToLauncher}
          />
        );

      case "error":
        return (
          <EmptyGameState
            message={`Error: ${error || "Failed to load game"}`}
            onCreateNew={startNewGame}
            onRefresh={() => {
              clearError();
              if (currentGame?.id) {
                setGameStage("initializing");
              } else {
                returnToLauncher();
              }
            }}
          />
        );

      case "playing":
        return <GamePlayer {...props} />;

      case "loading":
      default:
        // This will be briefly shown before we determine the proper stage
        return <GamePlayer {...props} />;
    }
  };

  return renderGameStage();
};

export default GameStateManager;
