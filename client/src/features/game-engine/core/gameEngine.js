// src/features/game-engine/core/gameEngine.js
import { createGameStateMachine, GameStates } from "../state/gameStateMachine";

/**
 * Creates a game engine instance that manages game state and operations
 *
 * @param {Object} api - API service interface
 * @returns {Object} Game engine interface
 */
export function createGameEngine(api) {
  // Game data state
  const state = {
    currentGame: null,
    gameList: [],
    segments: [],
    currentSegment: null,
    options: [],
    selectedOption: null,
    customOption: "",
    error: null,
    loadingProgress: 0,
  };

  // Create state machine
  const stateMachine = createGameStateMachine();

  // Event listeners
  const listeners = new Set();
  const progressListeners = new Set();

  // Notify listeners of state change
  const notifyListeners = () => {
    listeners.forEach((listener) => listener({ ...state }));
  };

  // Update loading progress
  const updateProgress = (progress) => {
    state.loadingProgress = progress;
    progressListeners.forEach((listener) => listener(progress));
    notifyListeners();
  };

  // Set error and transition to error state
  const setError = (error) => {
    state.error = error;
    stateMachine.transition(GameStates.ERROR);
    notifyListeners();
  };

  // Clear error
  const clearError = () => {
    state.error = null;
    notifyListeners();
  };

  return {
    // State access
    getState: () => ({ ...state }),
    getGameState: () => stateMachine.getGameState(),

    // State subscriptions
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    subscribeToGameState: (listener) => {
      return stateMachine.subscribe(listener);
    },

    subscribeToProgress: (listener) => {
      progressListeners.add(listener);
      return () => progressListeners.delete(listener);
    },

    // Core actions
    actions: {
      /**
       * Navigate to game browser and load games
       */
      browseGames: async (forceRefresh = false) => {
        try {
          // Skip if games already loaded and not forcing refresh
          if (state.gameList.length > 0 && !forceRefresh) {
            stateMachine.transition(GameStates.BROWSING);
            notifyListeners();
            return state.gameList;
          }

          // Start loading
          stateMachine.transition(GameStates.BROWSING);
          updateProgress(10);
          notifyListeners();

          // Simulate progressive loading
          const progressInterval = setInterval(() => {
            if (state.loadingProgress < 90) {
              updateProgress(state.loadingProgress + 10);
            }
          }, 200);

          // Load games from API
          const games = await api.getAllGames();

          // Clean up and update state
          clearInterval(progressInterval);
          updateProgress(100);

          state.gameList = games || [];

          // Reset progress after a short delay
          setTimeout(() => {
            updateProgress(0);
          }, 300);

          notifyListeners();
          return state.gameList;
        } catch (error) {
          setError(error.message || "Failed to load games");
          return [];
        }
      },

      /**
       * Start game creation flow
       */
      startCreatingGame: () => {
        stateMachine.transition(GameStates.CREATING);
        notifyListeners();
      },

      /**
       * Create a new game
       */
      createGame: async (gameSettings, apiKey) => {
        try {
          stateMachine.transition(GameStates.INITIALIZING);
          updateProgress(10);
          notifyListeners();

          // Simulate progressive loading
          const progressInterval = setInterval(() => {
            if (state.loadingProgress < 90) {
              updateProgress(state.loadingProgress + 10);
            }
          }, 200);

          // Create game via API
          const newGame = await api.createGame(gameSettings, apiKey);

          // Update state
          clearInterval(progressInterval);
          updateProgress(100);

          state.currentGame = newGame;

          // Reset progress after a short delay
          setTimeout(() => {
            updateProgress(0);

            // Start the game
            this.actions.startGame(newGame.id, apiKey);
          }, 300);

          notifyListeners();
          return newGame;
        } catch (error) {
          setError(error.message || "Failed to create game");
          return null;
        }
      },

      /**
       * Load an existing game
       */
      loadGame: async (gameId, apiKey) => {
        try {
          stateMachine.transition(GameStates.INITIALIZING);
          updateProgress(10);
          notifyListeners();

          // Simulate progressive loading
          const progressInterval = setInterval(() => {
            if (state.loadingProgress < 90) {
              updateProgress(state.loadingProgress + 5);
            }
          }, 100);

          // Load game from API
          const game = await api.getGame(gameId);

          // Update state
          clearInterval(progressInterval);
          updateProgress(100);

          state.currentGame = game;

          // Reset progress after a short delay
          setTimeout(() => {
            updateProgress(0);

            // If the game has segments, load them
            if (game.storySegments && game.storySegments.length > 0) {
              // Sort segments by sequence number
              const sortedSegments = [...game.storySegments].sort(
                (a, b) => a.sequenceNumber - b.sequenceNumber
              );

              state.segments = sortedSegments;
              state.currentSegment = sortedSegments[sortedSegments.length - 1];
              state.options = state.currentSegment.options || [];

              // Transition to playing state
              stateMachine.transition(GameStates.PLAYING);
            } else {
              // Generate initial story
              this.actions.startGame(gameId, apiKey);
            }

            notifyListeners();
          }, 300);

          return game;
        } catch (error) {
          setError(error.message || "Failed to load game");
          return null;
        }
      },

      /**
       * Start a game by generating initial story content
       */
      startGame: async (gameId, apiKey, preferences = {}) => {
        try {
          updateProgress(10);
          notifyListeners();

          // Simulate progressive loading
          const progressInterval = setInterval(() => {
            if (state.loadingProgress < 90) {
              updateProgress(state.loadingProgress + 10);
            }
          }, 200);

          // Generate initial story via API
          const response = await api.startGame(gameId, apiKey, preferences);

          // Update state
          clearInterval(progressInterval);
          updateProgress(100);

          // Extract relevant data
          const gameData = response.game || response;
          const firstSegment = response.firstSegment || null;

          // Update game data if available
          if (gameData) {
            state.currentGame = {
              ...state.currentGame,
              ...gameData,
            };
          }

          // Update segment data if available
          if (firstSegment) {
            state.segments = [firstSegment];
            state.currentSegment = firstSegment;
            state.options = firstSegment.options || [];
          }

          // Reset progress after a short delay
          setTimeout(() => {
            updateProgress(0);

            // Transition to playing state
            stateMachine.transition(GameStates.PLAYING);
            notifyListeners();
          }, 300);

          return response;
        } catch (error) {
          setError(error.message || "Failed to start game");
          return null;
        }
      },

      /**
       * Submit a choice and get next story segment
       */
      submitChoice: async (gameId, choiceData, apiKey) => {
        try {
          updateProgress(10);
          notifyListeners();

          // Simulate progressive loading
          const progressInterval = setInterval(() => {
            if (state.loadingProgress < 90) {
              updateProgress(state.loadingProgress + 15);
            }
          }, 200);

          // Generate next segment via API
          const response = await api.createStorySegment(
            gameId,
            choiceData,
            apiKey
          );

          // Update state
          clearInterval(progressInterval);
          updateProgress(100);

          // Extract relevant data
          const newSegment = response.segment || response;
          const newOptions = response.options || newSegment.options || [];

          // Update game data
          if (state.currentGame) {
            // Increment turn count
            const newTurnCount = (state.currentGame.turnCount || 0) + 1;
            state.currentGame = {
              ...state.currentGame,
              turnCount: newTurnCount,
            };

            // Check if game is completed
            if (
              state.currentGame.status === "COMPLETED" ||
              (state.currentGame.totalTurns &&
                newTurnCount >= state.currentGame.totalTurns)
            ) {
              stateMachine.transition(GameStates.COMPLETED);
            }
          }

          // Add new segment
          if (newSegment) {
            state.segments.push(newSegment);
            state.currentSegment = newSegment;
          }

          // Update options
          state.options = newOptions;

          // Reset input state
          state.selectedOption = null;
          state.customOption = "";

          // Reset progress after a short delay
          setTimeout(() => {
            updateProgress(0);
            notifyListeners();
          }, 300);

          return {
            segment: newSegment,
            options: newOptions,
          };
        } catch (error) {
          setError(error.message || "Failed to generate story");
          return null;
        }
      },

      /**
       * Select a predefined option
       */
      selectOption: (optionId) => {
        state.selectedOption = optionId;
        state.customOption = ""; // Clear custom option when selecting predefined
        notifyListeners();
      },

      /**
       * Set custom option text
       */
      setCustomOption: (text) => {
        state.customOption = text;
        state.selectedOption = null; // Clear selected option when typing custom
        notifyListeners();
      },

      /**
       * Save game progress
       */
      saveGame: async (gameId) => {
        try {
          // Call API to save game
          await api.saveGame(gameId);
          return true;
        } catch (error) {
          // Don't transition to error state for save failures
          state.error = error.message || "Failed to save game";
          notifyListeners();
          return false;
        }
      },

      /**
       * Reset to idle state
       */
      resetGame: () => {
        stateMachine.transition(GameStates.IDLE);
        state.currentGame = null;
        state.currentSegment = null;
        state.segments = [];
        state.options = [];
        state.selectedOption = null;
        state.customOption = "";
        clearError();
        notifyListeners();
      },

      /**
       * Clear error state
       */
      clearError,
    },
  };
}
