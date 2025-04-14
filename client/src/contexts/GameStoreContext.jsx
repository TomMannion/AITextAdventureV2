// client/src/contexts/GameStoreContext.jsx
import React, { createContext, useContext, useReducer, useCallback, useRef } from "react";
import { useNotification } from "./NotificationContext";
import { useSettings } from "./SettingsContext";
import { gameService } from "../services/api.service";

// Game flow states
export const FLOW_STATES = {
  LAUNCHER: "launcher", // Main menu
  CREATOR: "creator",   // Create new game
  BROWSER: "browser",   // Browse saved games
  PLAYER: "player",     // Play a game
  COMPLETED: "completed", // Game completion screen
  ERROR: "error",       // Error state
};

// Initial state for game context - merging both contexts
const initialState = {
  // Game data
  currentGame: null,
  gameList: [],
  initialized: false,
  
  // UI states
  flowState: FLOW_STATES.LAUNCHER,
  isLoading: false,
  loadingMessage: "",
  progress: 0,
  error: null,
  
  // Story data
  currentSegment: null,
  segments: [],
  options: [],
  selectedOption: null,
  customOption: "",
  
  // User preferences
  apiKey: localStorage.getItem("game_api_key") || "",
  saveApiKey: localStorage.getItem("game_save_api_key") === "true",
  
  // Game creation state
  defaultSettings: {
    genre: "fantasy",
    totalTurns: 16,
    title: "", // Optional - will be auto-generated if empty
  },

  // Game logs
  logs: [], // Game action logs
};

// Action types
const ACTIONS = {
  // Flow actions
  SET_FLOW_STATE: "set_flow_state",
  
  // Status actions
  SET_LOADING: "set_loading",
  SET_PROGRESS: "set_progress",
  SET_ERROR: "set_error",
  CLEAR_ERROR: "clear_error",
  
  // Game data actions
  SET_CURRENT_GAME: "set_current_game",
  SET_GAME_LIST: "set_game_list",
  SET_INITIALIZED: "set_initialized",
  
  // API settings
  SET_API_KEY: "set_api_key",
  SET_SAVE_API_KEY: "set_save_api_key",
  
  // Game state actions
  SET_CURRENT_SEGMENT: "set_current_segment",
  SET_SEGMENTS: "set_segments",
  ADD_SEGMENT: "add_segment",
  SET_OPTIONS: "set_options",
  SET_SELECTED_OPTION: "set_selected_option",
  SET_CUSTOM_OPTION: "set_custom_option",
  ADD_LOG: "add_log",
  
  // Game settings
  SET_GAME_SETTINGS: "set_game_settings",
  
  // System actions
  RESET_GAME_STATE: "reset_game_state",
};

// Reducer function
const gameReducer = (state, action) => {
  switch (action.type) {
    // Flow state actions
    case ACTIONS.SET_FLOW_STATE:
      return { ...state, flowState: action.payload };
    
    // Status actions
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading,
        loadingMessage: action.payload.message || "",
      };
    
    case ACTIONS.SET_PROGRESS:
      return { ...state, progress: action.payload };
    
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        // If we have a serious error, update flow state
        flowState: action.payload ? FLOW_STATES.ERROR : state.flowState,
      };
    
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    // Game data actions
    case ACTIONS.SET_CURRENT_GAME:
      return { ...state, currentGame: action.payload };
    
    case ACTIONS.SET_GAME_LIST:
      return { ...state, gameList: action.payload };
    
    case ACTIONS.SET_INITIALIZED:
      return { ...state, initialized: action.payload };
    
    // API settings
    case ACTIONS.SET_API_KEY:
      // Save API key to localStorage if saveApiKey is true
      if (state.saveApiKey) {
        localStorage.setItem("game_api_key", action.payload);
      }
      return { ...state, apiKey: action.payload };
    
    case ACTIONS.SET_SAVE_API_KEY:
      // Update localStorage setting
      localStorage.setItem("game_save_api_key", action.payload);
      // If turning off, remove saved key
      if (!action.payload) {
        localStorage.removeItem("game_api_key");
      } else if (state.apiKey) {
        // If turning on and we have a key, save it
        localStorage.setItem("game_api_key", state.apiKey);
      }
      return { ...state, saveApiKey: action.payload };
    
    // Game state actions
    case ACTIONS.SET_CURRENT_SEGMENT:
      return { ...state, currentSegment: action.payload };
    
    case ACTIONS.SET_SEGMENTS:
      return { ...state, segments: action.payload };
    
    case ACTIONS.ADD_SEGMENT:
      return {
        ...state,
        segments: [...state.segments, action.payload],
        currentSegment: action.payload,
      };
    
    case ACTIONS.SET_OPTIONS:
      return { ...state, options: action.payload };
    
    case ACTIONS.SET_SELECTED_OPTION:
      return {
        ...state,
        selectedOption: action.payload,
        // Clear custom option when selecting a predefined one
        customOption: action.payload ? "" : state.customOption,
      };
    
    case ACTIONS.SET_CUSTOM_OPTION:
      return {
        ...state,
        customOption: action.payload,
        // Clear selected option when typing a custom one
        selectedOption: action.payload ? null : state.selectedOption,
      };
    
    case ACTIONS.ADD_LOG:
      return {
        ...state,
        logs: [...state.logs, {
          ...action.payload, 
          timestamp: action.payload.timestamp || new Date()
        }],
      };
    
    case ACTIONS.SET_GAME_SETTINGS:
      return {
        ...state,
        defaultSettings: {
          ...state.defaultSettings,
          ...action.payload,
        },
      };
    
    case ACTIONS.RESET_GAME_STATE:
      return {
        ...state,
        currentSegment: null,
        segments: [],
        options: [],
        selectedOption: null,
        customOption: "",
        logs: [],
        loadingProgress: 0,
        error: null,
        // Don't reset gameList or initialized
      };
    
    default:
      console.warn(`Unhandled action type: ${action.type}`);
      return state;
  }
};

// Create context
const GameStoreContext = createContext(null);

/**
 * GameStoreProvider component to wrap application with game context
 */
export const GameStoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { showInfo, showError, showSuccess } = useNotification();
  const { settings } = useSettings();
  const fetchingGamesRef = useRef(false);

  // Flow state actions
  const setFlowState = useCallback((state) => {
    dispatch({ type: ACTIONS.SET_FLOW_STATE, payload: state });
  }, []);

  const goToLauncher = useCallback(() => {
    setFlowState(FLOW_STATES.LAUNCHER);
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, [setFlowState]);

  const goToCreator = useCallback(() => {
    setFlowState(FLOW_STATES.CREATOR);
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, [setFlowState]);

  const goToBrowser = useCallback(() => {
    setFlowState(FLOW_STATES.BROWSER);
    dispatch({ type: ACTIONS.CLEAR_ERROR });
    fetchGames();
  }, [setFlowState]);

  const goToPlayer = useCallback(() => {
    setFlowState(FLOW_STATES.PLAYER);
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, [setFlowState]);

  const goToCompleted = useCallback(() => {
    setFlowState(FLOW_STATES.COMPLETED);
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, [setFlowState]);

  const goToError = useCallback((errorMessage) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
    setFlowState(FLOW_STATES.ERROR);
  }, [setFlowState]);

  // Loading state actions
  const setLoading = useCallback((isLoading, message = "") => {
    dispatch({
      type: ACTIONS.SET_LOADING,
      payload: { isLoading, message },
    });
  }, []);

  const setProgress = useCallback((progress) => {
    dispatch({ type: ACTIONS.SET_PROGRESS, payload: progress });
  }, []);

  // Error management
  const setError = useCallback((error) => {
    if (error) {
      console.error("Game error:", error);
      // Show error notification for user-friendly errors
      if (typeof error === "string" && !error.includes("API key")) {
        showError(error, { timeout: 5000 });
      }
    }
    dispatch({ type: ACTIONS.SET_ERROR, payload: error });
  }, [showError]);

  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, []);

  // Game data actions
  const setCurrentGame = useCallback((game) => {
    dispatch({ type: ACTIONS.SET_CURRENT_GAME, payload: game });

  }, []);

  // Simulate progressive loading
  const simulateProgress = useCallback((callback, duration = 2000) => {
    setProgress(0);
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(90, (elapsed / duration) * 100);
      
      setProgress(progress);
      
      if (progress >= 90) {
        clearInterval(interval);
        
        if (callback) {
          callback();
        }
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [setProgress]);

  // API key management
  const updateApiKey = useCallback((key) => {
    dispatch({ type: ACTIONS.SET_API_KEY, payload: key });
  }, []);

  const toggleSaveApiKey = useCallback((saveFlag) => {
    dispatch({ type: ACTIONS.SET_SAVE_API_KEY, payload: saveFlag });
  }, []);

  // Ensure we only fetch games once, even across status changes
  const fetchGames = useCallback(async (forceRefresh = false) => {
    // Skip if already fetching or initialized (unless forced)
    if (fetchingGamesRef.current) {
      console.log("Already fetching games, skipping duplicate request");
      return state.gameList;
    }

    if (state.initialized && !forceRefresh) {
      console.log("Games already initialized, skipping fetch");
      return state.gameList;
    }

    try {
      console.log("Fetching games from the API");
      fetchingGamesRef.current = true;

      // Set loading state
      setLoading(true, "Loading your adventures...");
      
      let cleanupProgress;
      const fetchComplete = () => {
        cleanupProgress && cleanupProgress();
      };
      
      cleanupProgress = simulateProgress(fetchComplete);

      // Call the API to get all games
      const games = await gameService.getAllGames();
      console.log("Games response received:", games);

      // Update state
      dispatch({ type: ACTIONS.SET_GAME_LIST, payload: games });
      dispatch({ type: ACTIONS.SET_INITIALIZED, payload: true });

      // Show info notification if we have games
      if (games && games.length > 0) {
        showInfo(
          `Found ${games.length} adventure${games.length !== 1 ? "s" : ""}`,
          {
            timeout: 3000,
            title: "Games Loaded",
          }
        );
      }
      
      return games;
    } catch (error) {
      console.error("Error fetching games:", error);
      setError(error.message || "Failed to load games");
      return [];
    } finally {
      setLoading(false);
      setProgress(0);
      fetchingGamesRef.current = false;
    }
  }, [
    state.initialized,
    state.gameList,
    setLoading,
    simulateProgress,
    setError,
    showInfo,
  ]);

  // Game creation
  const createGame = useCallback(
    async (gameData) => {
      if (!state.apiKey) {
        setError("API key is required for game creation");
        return null;
      }

      try {
        setLoading(true, "Creating your adventure...");

        let cleanupProgress;
        const createComplete = () => {
          cleanupProgress && cleanupProgress();
        };

        cleanupProgress = simulateProgress(createComplete);

        // Get LLM preferences from settings
        const preferences = {
          preferredProvider: settings?.llm?.provider || "groq",
          preferredModel: settings?.llm?.model || "llama-3.1-8b-instant",
        };

        // Create game with current settings
        const newGame = await gameService.createGame(
          {
            ...gameData,
            ...preferences,
          },
          state.apiKey
        );

        // Update state
        setCurrentGame(newGame);
        dispatch({ type: ACTIONS.RESET_GAME_STATE });

        // Add initial log entry
        dispatch({
          type: ACTIONS.ADD_LOG,
          payload: {
            text: "New adventure started",
            type: "system",
          },
        });

        // Show notification
        showInfo(`Your ${newGame.genre} adventure awaits!`, {
          title: "Adventure Created",
          timeout: 3000,
        });

        return newGame;
      } catch (error) {
        console.error("Error creating game:", error);
        setError(error.message || "Failed to create game");
        return null;
      } finally {
        setLoading(false);
        setProgress(0);
      }
    },
    [
      state.apiKey,
      setLoading,
      simulateProgress,
      setError,
      setCurrentGame,
      settings,
      showInfo,
    ]
  );

  // Load game
  const loadGame = useCallback(
    async (gameId) => {
      try {
        setLoading(true, "Loading your adventure...");

        let cleanupProgress;
        const loadComplete = () => {
          cleanupProgress && cleanupProgress();
        };

        cleanupProgress = simulateProgress(loadComplete);

        // Get game from API
        const game = await gameService.getGame(gameId);

        if (!game) {
          throw new Error("Game not found");
        }

        // Process game data
        let segments = [];
        let currentSegmentData = null;
        let options = [];

        // If the game has segments in the response, process them
        if (game.storySegments && game.storySegments.length > 0) {
          // Sort segments by sequence number
          segments = [...game.storySegments].sort(
            (a, b) => a.sequenceNumber - b.sequenceNumber
          );

          // Set the latest segment as current
          currentSegmentData = segments[segments.length - 1];

          // If the segment has options, set them
          if (currentSegmentData && currentSegmentData.options) {
            options = currentSegmentData.options;
          }
        }

        // Update state
        setCurrentGame(game);
        dispatch({ type: ACTIONS.SET_SEGMENTS, payload: segments });
        dispatch({ type: ACTIONS.SET_CURRENT_SEGMENT, payload: currentSegmentData });
        dispatch({ type: ACTIONS.SET_OPTIONS, payload: options });

        // Add log entry
        dispatch({
          type: ACTIONS.ADD_LOG,
          payload: {
            text: "Adventure loaded",
            type: "system",
          },
        });

        // Show notification
        showInfo(`Continuing your ${game.genre} adventure!`, {
          title: "Adventure Loaded",
          timeout: 3000,
        });

        return game;
      } catch (error) {
        console.error("Failed to load game:", error);
        setError(error.message || "Failed to load game");
        return null;
      } finally {
        setLoading(false);
        setProgress(0);
      }
    },
    [
      setLoading,
      simulateProgress,
      setError,
      setCurrentGame,
      showInfo,
    ]
  );

  // Start game
  const startGame = useCallback(
    async (gameId) => {
      if (!state.apiKey) {
        setError("API key is required for game start");
        return null;
      }

      try {
        setLoading(true, "Generating your adventure...");

        let cleanupProgress;
        const startComplete = () => {
          cleanupProgress && cleanupProgress();
        };

        cleanupProgress = simulateProgress(startComplete);

        // Get LLM preferences from settings
        const preferences = {
          preferredProvider: settings?.llm?.provider || "groq",
          preferredModel: settings?.llm?.model || "llama-3.1-8b-instant",
        };

        // Start game
        const response = await gameService.startGame(
          gameId,
          state.apiKey,
          preferences
        );

        // Process response
        const gameData = response.game || response;
        const firstSegment = response.firstSegment;
        const initialOptions = firstSegment?.options || [];

        // Update state
        if (gameData && state.currentGame) {
          setCurrentGame({
            ...state.currentGame,
            ...gameData,
          });
        }

        if (firstSegment) {
          dispatch({ type: ACTIONS.SET_CURRENT_SEGMENT, payload: firstSegment });
          dispatch({ type: ACTIONS.SET_SEGMENTS, payload: [firstSegment] });

          // Add log entry for the initial segment
          dispatch({
            type: ACTIONS.ADD_LOG,
            payload: {
              text: "Story begins",
              type: "story",
            },
          });
        }

        if (initialOptions.length > 0) {
          dispatch({ type: ACTIONS.SET_OPTIONS, payload: initialOptions });
        }

        // Change flow state
        goToPlayer();

        // Show notification
        showInfo("Your adventure begins!", {
          title: "Story Started",
          timeout: 3000,
        });

        return response;
      } catch (error) {
        console.error("Failed to start game:", error);
        setError(error.message || "Failed to start game");
        return null;
      } finally {
        setLoading(false);
        setProgress(0);
      }
    },
    [
      state.apiKey,
      state.currentGame,
      setLoading,
      simulateProgress,
      settings,
      setError,
      setCurrentGame,
      goToPlayer,
      showInfo,
    ]
  );

  const submitChoice = useCallback(
    async (optionId = null, customText = null) => {
      if (!state.currentGame) {
        setError("No active game found");
        return null;
      }
  
      if (!state.apiKey) {
        setError("API key is required for story progression");
        return null;
      }
  
      // Validate that we have either an option ID or custom text
      if (!optionId && (!customText || !customText.trim())) {
        showError("Please select an option or enter your own action");
        return null;
      }
  
      try {
        setLoading(true, "Processing your choice...");
  
        // Mark option as chosen FIRST, before generating the next segment
        if (optionId && state.currentSegment?.id) {
          console.log(`Attempting to mark option ${optionId} as chosen for segment ${state.currentSegment.id}`);
          try {
            // This is a separate try/catch to ensure we continue even if this fails
            const chooseResult = await gameService.chooseOption(state.currentSegment.id, optionId);
            console.log("Choose option result:", chooseResult);
          } catch (chooseError) {
            // Log but continue - this isn't critical
            console.warn("Failed to mark option as chosen:", chooseError);
          }
        }
  
        // Log the player's choice
        const choiceText = optionId
          ? state.options.find((opt) => opt.id === optionId)?.text
          : customText;
  
        if (choiceText) {
          dispatch({
            type: ACTIONS.ADD_LOG,
            payload: {
              text: `You chose: ${choiceText}`,
              type: "choice",
            },
          });
        }
  
        // Prepare the choice data for story generation
        const choiceData = optionId
          ? { optionId }
          : { customText: customText.trim() };
  
        // Call the API to create the next story segment
        const response = await gameService.createStorySegment(
          state.currentGame.id,
          choiceData,
          state.apiKey
        );
  
        // Rest of existing code...
        console.log("Story progression response:", response);
  
        // Extract data based on API response structure
        const gameUpdate = response.game || {};
        const newSegment = response.segment || response;
        const newOptions = response.options || newSegment?.options || [];
  
        // Update the current game with turn count
        if (state.currentGame) {
          const newTurnCount = (state.currentGame.turnCount || 0) + 1;
          const updatedGame = {
            ...state.currentGame,
            ...gameUpdate,
            turnCount: newTurnCount,
          };
  
          setCurrentGame(updatedGame);
  
          // Check if game is completed
          if (
            updatedGame.status === "COMPLETED" ||
            newTurnCount >= updatedGame.totalTurns
          ) {
            goToCompleted();
          }
        }
  
        // Process and set the new segment and options
        if (newSegment) {
          dispatch({ type: ACTIONS.ADD_SEGMENT, payload: newSegment });
  
          // Add log entry for the new segment
          dispatch({
            type: ACTIONS.ADD_LOG,
            payload: {
              text: newSegment.content?.substring(0, 50) + "...",
              type: "story",
            },
          });
        }
  
        if (newOptions.length > 0) {
          dispatch({ type: ACTIONS.SET_OPTIONS, payload: newOptions });
        }
  
        // Reset selected option
        dispatch({ type: ACTIONS.SET_SELECTED_OPTION, payload: null });
        dispatch({ type: ACTIONS.SET_CUSTOM_OPTION, payload: "" });
  
        return {
          segment: newSegment,
          options: newOptions,
        };
      } catch (error) {
        console.error("Error submitting choice:", error);
        showError(error.message || "Failed to process your choice");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      state.currentGame,
      state.apiKey,
      state.options,
      state.currentSegment,
      setLoading,
      setError,
      setCurrentGame,
      goToCompleted,
      showError,
    ]
  );

  // Save game
  const saveGame = useCallback(
    async () => {
      if (!state.currentGame) {
        showError("No game to save");
        return false;
      }

      try {
        // Call API to save game (mock implementation in gameService)
        const success = await gameService.saveGame(state.currentGame.id);

        // Add log entry
        dispatch({
          type: ACTIONS.ADD_LOG,
          payload: {
            text: "Game saved",
            type: "system",
          },
        });

        // Show notification
        showSuccess("Game progress saved", {
          title: "Save Complete",
          timeout: 2000,
        });

        return true;
      } catch (error) {
        console.error("Error saving game:", error);
        showError(error.message || "Failed to save game");
        return false;
      }
    },
    [state.currentGame, showError, showSuccess]
  );

  // Player state actions
  const setSelectedOption = useCallback((optionId) => {
    dispatch({ type: ACTIONS.SET_SELECTED_OPTION, payload: optionId });
  }, []);

  const setCustomOption = useCallback((text) => {
    dispatch({ type: ACTIONS.SET_CUSTOM_OPTION, payload: text });
  }, []);

  // Game settings
  const updateGameSettings = useCallback((settings) => {
    dispatch({ type: ACTIONS.SET_GAME_SETTINGS, payload: settings });
  }, []);

  // Reset game state
  const resetGameState = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_GAME_STATE });
  }, []);

  // Context value
  const value = {
    // State
    ...state,

    // Flow actions
    goToLauncher,
    goToCreator,
    goToBrowser,
    goToPlayer,
    goToCompleted,
    goToError,
    
    // Status actions
    setLoading,
    setProgress,
    setError,
    clearError,

    // Game data actions
    setCurrentGame,
    
    // API actions
    updateApiKey,
    toggleSaveApiKey,

    // Game operations
    fetchGames,
    createGame,
    loadGame,
    startGame,
    submitChoice,
    saveGame,
    
    // Player actions
    setSelectedOption,
    setCustomOption,
    
    // Game settings
    updateGameSettings,
    
    // System actions
    resetGameState,
  };

  return (
    <GameStoreContext.Provider value={value}>
      {children}
    </GameStoreContext.Provider>
  );
};

/**
 * Hook for accessing the game store context
 */
export const useGameStore = () => {
  const context = useContext(GameStoreContext);
  if (!context) {
    throw new Error("useGameStore must be used within a GameStoreProvider");
  }
  return context;
};

// Compatibility exports for backward compatibility
export const useGameContext = useGameStore;
export const useGameData = useGameStore;
export const GameContext = GameStoreContext;

/**
 * Legacy provider components for backward compatibility
 */
export const GameProvider = GameStoreProvider;
export const GameDataProvider = GameStoreProvider;

export default GameStoreContext;