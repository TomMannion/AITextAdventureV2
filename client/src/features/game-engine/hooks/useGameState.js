// src/features/game-engine/hooks/useGameState.js
import { useCallback } from "react";
import { useGameContext } from "../../../contexts/GameContext";

/**
 * Custom hook for managing game state and operations
 * Provides a simplified interface for game-related operations
 */
const useGameState = () => {
  const gameContext = useGameContext();

  // Destructure needed values from context
  const {
    status,
    currentGame,
    gameList,
    gamesInitialized,
    error,
    loadingProgress,
    newGameSettings,
    apiKey,
    currentSegment,
    segments,
    options,
    selectedOption,
    customOption,

    // Actions
    setStatus,
    setError,
    setGamesInitialized,
    updateNewGameSettings,
    fetchGames,
    createGame,
    loadGame,
    startGame,
    resetGameState,
    setApiKey,
    setSaveApiKey,
    setSelectedOption,
    setCustomOption,
    createStorySegment,
    saveGame: contextSaveGame,
  } = gameContext;

  /**
   * Start creating a new game
   */
  const startNewGame = useCallback(() => {
    resetGameState();
    setStatus("creating");
  }, [resetGameState, setStatus]);

  /**
   * Refresh the games list
   * @param {boolean} forceRefresh - Whether to force refresh even if initialized
   */
  const refreshGames = useCallback(
    async (forceRefresh = false) => {
      console.log("refreshGames called in useGameState");
      try {
        // Set status to browsing first
        setStatus("browsing");

        // Fetch games (may set loading state internally)
        const games = await fetchGames(forceRefresh);
        console.log(
          `Retrieved ${games ? games.length : 0} games in useGameState`
        );
        return games;
      } catch (error) {
        console.error("Error in refreshGames:", error);
        throw error;
      }
    },
    [setStatus, fetchGames]
  );

  /**
   * Handle genre change in game creation
   */
  const setGameGenre = useCallback(
    (genre) => {
      updateNewGameSettings({ genre });
    },
    [updateNewGameSettings]
  );

  /**
   * Handle game length change in game creation
   */
  const setGameLength = useCallback(
    (totalTurns) => {
      updateNewGameSettings({ totalTurns: parseInt(totalTurns, 10) });
    },
    [updateNewGameSettings]
  );

  /**
   * Handle API key change
   */
  const updateApiKey = useCallback(
    (key) => {
      setApiKey(key);
    },
    [setApiKey]
  );

  /**
   * Handle save API key preference change
   */
  const toggleSaveApiKey = useCallback(
    (save) => {
      setSaveApiKey(save);
    },
    [setSaveApiKey]
  );

  /**
   * Validate API key
   */
  const validateApiKey = useCallback(() => {
    // Just check if it exists for now - we could add more validation later
    // We could also make a test API call here to verify the key works
    return !!apiKey && apiKey.trim().length > 0;
  }, [apiKey]);

  /**
   * Submit new game creation
   */
  const submitNewGame = useCallback(async () => {
    // Validate API key
    if (!validateApiKey()) {
      setError("API key is required for game creation");
      return null;
    }

    // Create game with current settings
    return await createGame(newGameSettings);
  }, [validateApiKey, setError, createGame, newGameSettings]);

  /**
   * Load an existing game
   */
  const loadExistingGame = useCallback(
    async (gameId) => {
      console.log(`Loading game: ${gameId}`);
      try {
        return await loadGame(gameId);
      } catch (error) {
        console.error(`Error loading game ${gameId}:`, error);
        setError(`Failed to load game: ${error.message || "Unknown error"}`);
        return null;
      }
    },
    [loadGame, setError]
  );

  /**
   * Start a loaded game (generate initial content)
   */
  const startLoadedGame = useCallback(
    async (gameId) => {
      if (!validateApiKey()) {
        setError("API key is required to start the game");
        return null;
      }

      try {
        console.log(`Starting game ${gameId} with initial story generation`);
        const result = await startGame(gameId);

        if (!result) {
          throw new Error("Failed to start game - no result returned");
        }

        return result;
      } catch (error) {
        console.error(`Error starting game ${gameId}:`, error);
        setError(`Failed to start game: ${error.message || "Unknown error"}`);
        return null;
      }
    },
    [validateApiKey, setError, startGame]
  );

  /**
   * Submit a player choice and generate the next story segment
   *
   * @param {number|null} optionId - ID of the selected predefined option, or null for custom
   * @param {string|null} customText - Custom option text, if optionId is null
   * @returns {Promise<Object|null>} - The new story segment, or null if there was an error
   */
  const submitChoice = useCallback(
    async (optionId = null, customText = null) => {
      if (!currentGame) {
        setError("No active game found");
        return null;
      }

      if (!validateApiKey()) {
        setError("API key is required for story progression");
        return null;
      }

      // Validate that we have either an option ID or custom text
      if (!optionId && (!customText || !customText.trim())) {
        setError("Please select an option or enter your own action");
        return null;
      }

      try {
        console.log(
          `Submitting choice for game ${currentGame.id}:`,
          optionId ? `Option ID: ${optionId}` : `Custom Text: ${customText}`
        );

        // Prepare the choice data
        const choiceData = optionId
          ? { optionId }
          : { customText: customText.trim() };

        // Call the API to create the next story segment
        const response = await createStorySegment(currentGame.id, choiceData);
        console.log("Story progression response:", response);

        if (!response) {
          throw new Error("No response received from server");
        }

        // Reset the selected options after submission
        setSelectedOption(null);
        setCustomOption("");

        return response;
      } catch (error) {
        const errorMessage = error.message || "Failed to progress the story";
        console.error("Error submitting choice:", errorMessage);
        setError(errorMessage);
        return null;
      }
    },
    [
      currentGame,
      validateApiKey,
      setError,
      createStorySegment,
      setSelectedOption,
      setCustomOption,
    ]
  );

  /**
   * Save the current game state
   */
  const saveGame = useCallback(async () => {
    if (!currentGame) {
      setError("No active game to save");
      return false;
    }

    try {
      console.log(`Saving game ${currentGame.id}`);
      return await contextSaveGame(currentGame.id);
    } catch (error) {
      console.error(`Error saving game ${currentGame.id}:`, error);
      setError(error.message || "Failed to save game");
      return false;
    }
  }, [currentGame, setError, contextSaveGame]);

  /**
   * Return to launcher screen
   */
  const returnToLauncher = useCallback(() => {
    resetGameState();
    setStatus("idle");
  }, [resetGameState, setStatus]);

  return {
    // State
    status,
    currentGame,
    gameList,
    gamesInitialized,
    error,
    loadingProgress,
    newGameSettings,
    apiKey,
    currentSegment,
    segments,
    options,
    selectedOption,
    customOption,
    setStatus,

    // API key management
    updateApiKey,
    toggleSaveApiKey,
    validateApiKey,

    // Game state actions
    setSelectedOption,
    setCustomOption,
    submitChoice,
    saveGame,

    // Navigation actions
    startNewGame,
    refreshGames, // Renamed from browseGames for clarity
    setGameGenre,
    setGameLength,
    submitNewGame,
    loadExistingGame,
    startLoadedGame,
    returnToLauncher,
  };
};

export default useGameState;
