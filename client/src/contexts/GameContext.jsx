// src/contexts/GameContext.jsx
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
} from "react";
import { useThemeContext } from "./ThemeContext";
import { useNotification } from "./NotificationContext";
import { useSettings } from "../contexts/SettingsContext";
import { gameService } from "../services/api.service";

// Initial state for game context
const initialState = {
  // Game data
  currentGame: null,
  gameList: [],
  gamesInitialized: false, // Track if games have been loaded

  // UI states
  status: "idle", // idle, loading, creating, browsing, playing, error
  loadingProgress: 0,
  error: null,

  // User preferences
  apiKey: localStorage.getItem("game_api_key") || "",
  saveApiKey: localStorage.getItem("game_save_api_key") === "true",

  // Game creation state
  newGameSettings: {
    genre: "fantasy",
    totalTurns: 16,
    title: "", // Optional - will be auto-generated if empty
  },

  // Game state
  currentSegment: null,
  segments: [],
  options: [],
  selectedOption: null,
  customOption: "",
  logs: [], // Game action logs
};

// Action types
const ACTIONS = {
  SET_STATUS: "set_status",
  SET_LOADING_PROGRESS: "set_loading_progress",
  SET_ERROR: "set_error",
  CLEAR_ERROR: "clear_error",
  SET_CURRENT_GAME: "set_current_game",
  SET_GAME_LIST: "set_game_list",
  SET_GAMES_INITIALIZED: "set_games_initialized",
  SET_API_KEY: "set_api_key",
  SET_SAVE_API_KEY: "set_save_api_key",
  SET_NEW_GAME_SETTINGS: "set_new_game_settings",
  SET_CURRENT_SEGMENT: "set_current_segment",
  SET_SEGMENTS: "set_segments",
  ADD_SEGMENT: "add_segment",
  SET_OPTIONS: "set_options",
  SET_SELECTED_OPTION: "set_selected_option",
  SET_CUSTOM_OPTION: "set_custom_option",
  ADD_LOG: "add_log",
  RESET_GAME_STATE: "reset_game_state",
};

// Reducer function
const gameReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_STATUS:
      return { ...state, status: action.payload };
    case ACTIONS.SET_LOADING_PROGRESS:
      return { ...state, loadingProgress: action.payload };
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        status: action.payload ? "error" : state.status,
      };
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case ACTIONS.SET_CURRENT_GAME:
      return { ...state, currentGame: action.payload };
    case ACTIONS.SET_GAME_LIST:
      return { ...state, gameList: action.payload };
    case ACTIONS.SET_GAMES_INITIALIZED:
      return { ...state, gamesInitialized: action.payload };
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
      }
      return { ...state, saveApiKey: action.payload };
    case ACTIONS.SET_NEW_GAME_SETTINGS:
      return {
        ...state,
        newGameSettings: {
          ...state.newGameSettings,
          ...action.payload,
        },
      };
    case ACTIONS.SET_CURRENT_SEGMENT:
      return { ...state, currentSegment: action.payload };
    case ACTIONS.SET_SEGMENTS:
      return { ...state, segments: action.payload };
    case ACTIONS.ADD_SEGMENT:
      const updatedSegments = [...state.segments, action.payload];
      return {
        ...state,
        segments: updatedSegments,
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
        logs: [...state.logs, action.payload],
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
        // Don't reset gameList or gamesInitialized
      };
    default:
      console.warn(`Unhandled action type: ${action.type}`);
      return state;
  }
};

// Create context
const GameContext = createContext(null);

/**
 * GameProvider component to wrap application with game context
 */
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { applyGenreTheme } = useThemeContext();
  const { showInfo, showError } = useNotification();
  const fetchingGamesRef = useRef(false);

  // Action dispatchers
  const setStatus = useCallback((status) => {
    dispatch({ type: ACTIONS.SET_STATUS, payload: status });
  }, []);

  const setLoadingProgress = useCallback((progress) => {
    dispatch({ type: ACTIONS.SET_LOADING_PROGRESS, payload: progress });
  }, []);

  const setError = useCallback(
    (error) => {
      if (error) {
        console.error("Game error:", error);
        // Show error notification for user-friendly errors
        if (typeof error === "string" && !error.includes("API key")) {
          showError(error, { timeout: 5000 });
        }
      }
      dispatch({ type: ACTIONS.SET_ERROR, payload: error });
    },
    [showError]
  );

  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, []);

  const setCurrentGame = useCallback(
    (game) => {
      dispatch({ type: ACTIONS.SET_CURRENT_GAME, payload: game });

      // Apply theme based on game genre
      if (game && game.genre) {
        applyGenreTheme(game.genre);
      }
    },
    [applyGenreTheme]
  );

  const setGameList = useCallback((games) => {
    dispatch({ type: ACTIONS.SET_GAME_LIST, payload: games });
  }, []);

  const setGamesInitialized = useCallback((initialized) => {
    dispatch({ type: ACTIONS.SET_GAMES_INITIALIZED, payload: initialized });
  }, []);

  const setApiKey = useCallback((apiKey) => {
    dispatch({ type: ACTIONS.SET_API_KEY, payload: apiKey });
  }, []);

  const setSaveApiKey = useCallback((save) => {
    dispatch({ type: ACTIONS.SET_SAVE_API_KEY, payload: save });
  }, []);

  const updateNewGameSettings = useCallback(
    (settings) => {
      dispatch({ type: ACTIONS.SET_NEW_GAME_SETTINGS, payload: settings });

      // If genre is changing, update theme
      if (settings.genre) {
        applyGenreTheme(settings.genre);
      }
    },
    [applyGenreTheme]
  );

  const setCurrentSegment = useCallback((segment) => {
    dispatch({ type: ACTIONS.SET_CURRENT_SEGMENT, payload: segment });
  }, []);

  const setSegments = useCallback((segments) => {
    dispatch({ type: ACTIONS.SET_SEGMENTS, payload: segments });
  }, []);

  const addSegment = useCallback((segment) => {
    dispatch({ type: ACTIONS.ADD_SEGMENT, payload: segment });
  }, []);

  const setOptions = useCallback((options) => {
    dispatch({ type: ACTIONS.SET_OPTIONS, payload: options });
  }, []);

  const setSelectedOption = useCallback((optionId) => {
    dispatch({ type: ACTIONS.SET_SELECTED_OPTION, payload: optionId });
  }, []);

  const setCustomOption = useCallback((text) => {
    dispatch({ type: ACTIONS.SET_CUSTOM_OPTION, payload: text });
  }, []);

  const addLog = useCallback((log) => {
    const logEntry = {
      ...log,
      timestamp: log.timestamp || new Date(),
    };
    dispatch({ type: ACTIONS.ADD_LOG, payload: logEntry });
  }, []);

  const resetGameState = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_GAME_STATE });
  }, []);

  // Ensure we only fetch games once, even across status changes
  const fetchGames = useCallback(
    async (forceRefresh = false) => {
      // Skip if already fetching or initialized (unless forced)
      if (fetchingGamesRef.current) {
        console.log("Already fetching games, skipping duplicate request");
        return state.gameList;
      }

      if (state.gamesInitialized && !forceRefresh) {
        console.log("Games already initialized, skipping fetch");
        return state.gameList;
      }

      try {
        console.log("Fetching games from the API (one-time initialization)");
        fetchingGamesRef.current = true;

        // Only set loading state if we're browsing
        const wasAlreadyBrowsing = state.status === "browsing";
        if (wasAlreadyBrowsing) {
          setStatus("loading");
        }
        setLoadingProgress(0);

        // Simulate progressive loading for better UX
        const progressInterval = setInterval(() => {
          setLoadingProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        // Call the API to get all games
        const games = await gameService.getAllGames();
        console.log("Games response received:", games);

        clearInterval(progressInterval);
        setLoadingProgress(100);

        // Short delay before completing to ensure progress bar is visible
        setTimeout(() => {
          // Update state
          setGameList(games);
          setGamesInitialized(true);

          // Only restore status if we changed it (were browsing)
          if (wasAlreadyBrowsing) {
            setStatus("browsing");
          }
          setLoadingProgress(0);

          // Clear fetching flag
          fetchingGamesRef.current = false;

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
        }, 300);

        return games;
      } catch (error) {
        console.error("Error fetching games:", error);
        setError(error.message || "Failed to load games");

        // Always go back to browsing even on error
        setTimeout(() => {
          if (state.status === "loading") {
            setStatus("browsing");
          }
          setLoadingProgress(0);
          fetchingGamesRef.current = false;
        }, 300);

        return [];
      }
    },
    [
      state.gamesInitialized,
      state.gameList,
      state.status,
      setStatus,
      setLoadingProgress,
      setError,
      setGameList,
      setGamesInitialized,
      showInfo,
    ]
  );

  // Other functions like browseGames should be simplified
  const browseGames = useCallback(() => {
    // Only set status if not already browsing
    if (state.status !== "browsing" && state.status !== "loading") {
      setStatus("browsing");
    }

    // Fetch games, but don't change status as part of this action
    return fetchGames();
  }, [state.status, setStatus, fetchGames]);

  const createGame = useCallback(
    async (gameData) => {
      try {
        if (!state.apiKey) {
          throw new Error("LLM API key is required for game creation");
        }

        setStatus("loading");
        setLoadingProgress(0);

        // Clear any previous errors
        clearError();

        // Simulate progressive loading for better UX
        const progressInterval = setInterval(() => {
          setLoadingProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        // Call the API to create a new game
        const newGame = await gameService.createGame(gameData, state.apiKey);

        clearInterval(progressInterval);
        setLoadingProgress(100);

        // Short delay before completing to ensure progress bar is visible
        setTimeout(() => {
          setCurrentGame(newGame);
          setStatus("playing");
          resetGameState();

          // Apply theme based on game genre
          applyGenreTheme(newGame.genre);

          // Add initial log entry
          addLog({
            text: "New adventure started",
            type: "system",
          });

          // Show notification
          showInfo(`Your ${newGame.genre} adventure awaits!`, {
            title: "Adventure Created",
            timeout: 3000,
          });
        }, 300);

        return newGame;
      } catch (error) {
        console.error("Error creating game:", error);
        setError(error.message || "Failed to create game");
        setStatus("creating"); // Go back to creation form
        return null;
      } finally {
        clearInterval(progressInterval);
      }
    },
    [
      state.apiKey,
      setStatus,
      setLoadingProgress,
      clearError,
      setError,
      setCurrentGame,
      resetGameState,
      applyGenreTheme,
      addLog,
      showInfo,
    ]
  );

  const loadGame = useCallback(
    async (gameId) => {
      // Declare progressInterval at the function scope level so it's available throughout
      let progressInterval;

      try {
        setStatus("loading");
        setLoadingProgress(0);
        clearError(); // Clear any previous errors

        // Simulate progressive loading for better UX
        progressInterval = setInterval(() => {
          setLoadingProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        // Call the API to get a specific game
        const game = await gameService.getGame(gameId);

        if (!game) {
          throw new Error("Game not found");
        }

        clearInterval(progressInterval);
        setLoadingProgress(100);

        console.log("Game loaded:", game);

        // Short delay before completing to ensure progress bar is visible
        setTimeout(() => {
          setCurrentGame(game);

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

          // Update state with game data
          setSegments(segments);
          setCurrentSegment(currentSegmentData);
          setOptions(options);
          setStatus("playing");

          // Apply theme based on game genre
          applyGenreTheme(game.genre);

          // Add log entry
          addLog({
            text: "Adventure loaded",
            type: "system",
          });

          // Show notification
          showInfo(`Continuing your ${game.genre} adventure!`, {
            title: "Adventure Loaded",
            timeout: 3000,
          });
        }, 300);

        return game;
      } catch (error) {
        console.error("Failed to load game:", error);
        setError(error.message || "Failed to load game");
        setStatus("browsing"); // Go back to game browser
        return null;
      } finally {
        // Ensure interval is cleared regardless of success or failure
        if (progressInterval) {
          clearInterval(progressInterval);
        }
      }
    },
    [
      setStatus,
      setLoadingProgress,
      clearError,
      setError,
      setCurrentGame,
      setSegments,
      setCurrentSegment,
      setOptions,
      applyGenreTheme,
      addLog,
      showInfo,
    ]
  );

  // Function to start a game (generate initial story segment)
  const startGame = useCallback(
    async (gameId) => {
      // Declare progressInterval at the function scope level so it's accessible in all blocks
      let progressInterval;

      try {
        if (!state.apiKey) {
          throw new Error("LLM API key is required for game start");
        }

        setStatus("loading");
        setLoadingProgress(0);
        clearError(); // Clear any previous errors

        // Simulate progressive loading for better UX
        progressInterval = setInterval(() => {
          setLoadingProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        // Get settings from localStorage directly as a fallback approach
        let llmSettings;
        try {
          const savedSettings = localStorage.getItem("app_settings");
          if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            llmSettings = parsedSettings.llm;
            console.log(
              "Retrieved LLM settings from localStorage:",
              llmSettings
            );
          }
        } catch (error) {
          console.error("Error getting settings from localStorage:", error);
        }

        // Create preferences with the settings from localStorage
        const preferences = {
          preferredProvider: llmSettings?.provider || "groq",
          preferredModel: llmSettings?.model || "llama-3.1-8b-instant",
        };

        console.log(
          `Starting game ${gameId} with API key and preferences:`,
          preferences
        );

        // Call the API with the preferences
        const response = await gameService.startGame(
          gameId,
          state.apiKey,
          preferences
        );
        console.log("Start game response:", response);

        // Clear the interval once we have a response
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        setLoadingProgress(100);

        // Extract the data based on the API response structure
        // Adjust this based on your actual API response structure
        const gameData = response.data?.game || response.game || response;
        const firstSegment =
          response.data?.firstSegment || response.firstSegment;
        const initialOptions = firstSegment?.options || [];

        // Update the current game with any additional data from the response
        if (gameData && state.currentGame) {
          setCurrentGame({
            ...state.currentGame,
            ...gameData,
          });
        }

        // Process and set the initial segment and options
        if (firstSegment) {
          console.log("Setting initial segment:", firstSegment);
          setCurrentSegment(firstSegment);
          setSegments([firstSegment]);

          // Add log entry for the initial segment
          addLog({
            text: "Story begins",
            type: "story",
          });
        }

        if (initialOptions.length > 0) {
          console.log("Setting initial options:", initialOptions);
          setOptions(initialOptions);
        }

        setStatus("playing");

        // Show notification
        showInfo("Your adventure begins!", {
          title: "Story Started",
          timeout: 3000,
        });

        return response;
      } catch (error) {
        console.error("Failed to start game:", error);

        // Clear the interval in case of error
        if (progressInterval) {
          clearInterval(progressInterval);
        }

        setError(error.message || "Failed to start game");
        return null;
      } finally {
        // Ensure interval is always cleared, regardless of success or failure
        if (progressInterval) {
          clearInterval(progressInterval);
        }
      }
    },
    [
      state.apiKey,
      state.currentGame,
      setStatus,
      setLoadingProgress,
      clearError,
      setError,
      setCurrentGame,
      setCurrentSegment,
      setSegments,
      setOptions,
      addLog,
      showInfo,
    ]
  );

  // Function to create a new story segment based on player choice
  const createStorySegment = useCallback(
    async (gameId, choiceData) => {
      try {
        if (!state.apiKey) {
          throw new Error("LLM API key is required for story generation");
        }

        setStatus("loading");
        setLoadingProgress(0);
        clearError(); // Clear any previous errors

        // Log the player's choice
        const choiceText = choiceData.optionId
          ? state.options.find((opt) => opt.id === choiceData.optionId)?.text
          : choiceData.customText;

        if (choiceText) {
          addLog({
            text: `You chose: ${choiceText}`,
            type: "choice",
          });
        }

        // Simulate progressive loading for better UX
        const progressInterval = setInterval(() => {
          setLoadingProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        console.log("Creating new story segment with choice:", choiceData);

        // Call the API to create a new story segment
        const response = await gameService.createStorySegment(
          gameId,
          choiceData,
          state.apiKey
        );

        console.log("Create story segment response:", response);

        clearInterval(progressInterval);
        setLoadingProgress(100);

        // Extract data based on API response structure
        // Adjust this based on your actual API response structure
        const gameUpdate = response.data?.game || {};
        const newSegment =
          response.data?.segment || response.segment || response;
        const newOptions = response.data?.options || newSegment?.options || [];

        // Update the current game with turn count
        if (state.currentGame) {
          const newTurnCount = (state.currentGame.turnCount || 0) + 1;
          setCurrentGame({
            ...state.currentGame,
            ...gameUpdate,
            turnCount: newTurnCount,
          });
        }

        // Process and set the new segment and options
        if (newSegment) {
          addSegment(newSegment);

          // Add log entry for the new segment
          addLog({
            text: newSegment.content.substring(0, 50) + "...",
            type: "story",
          });
        }

        if (newOptions.length > 0) {
          setOptions(newOptions);
        }

        setStatus("playing");

        return {
          segment: newSegment,
          options: newOptions,
          isSignificantEvent: false, // You could have logic to determine this
        };
      } catch (error) {
        console.error("Failed to generate story segment:", error);
        setError(error.message || "Failed to generate story segment");
        return null;
      } finally {
        clearInterval(progressInterval);
      }
    },
    [
      state.apiKey,
      state.options,
      state.currentGame,
      setStatus,
      setLoadingProgress,
      clearError,
      setError,
      setCurrentGame,
      addSegment,
      setOptions,
      addLog,
    ]
  );

  // Function to explicitly save the game
  const saveGame = useCallback(
    async (gameId) => {
      try {
        const id = gameId || state.currentGame?.id;

        if (!id) {
          throw new Error("No game ID to save");
        }

        // You could add an explicit save endpoint call here if needed
        // For now, we'll assume the server auto-saves on segment creation
        console.log(`Saving game ${id}`);

        try {
          // If you have a saveGame endpoint, call it here
          // await gameService.saveGame(id);

          // Log the save action
          addLog({
            text: "Game saved",
            type: "system",
          });

          showInfo("Game progress saved", {
            title: "Save Complete",
            timeout: 2000,
          });

          return true;
        } catch (saveError) {
          console.error("Error during game save:", saveError);
          throw new Error(saveError.message || "Failed to save game");
        }
      } catch (error) {
        console.error("Error saving game:", error);
        setError(error.message || "Failed to save game");
        return false;
      }
    },
    [state.currentGame, setError, addLog, showInfo]
  );

  // Context value
  const value = {
    // State
    ...state,

    // Status setters
    setStatus,
    setError,
    clearError,
    setGamesInitialized,

    // Game data actions
    setCurrentGame,
    setGameList,
    setApiKey,
    setSaveApiKey,

    // Game settings
    updateNewGameSettings,

    // Game state actions
    setCurrentSegment,
    setSegments,
    addSegment,
    setOptions,
    setSelectedOption,
    setCustomOption,
    addLog,
    resetGameState,

    // Core game operations
    fetchGames,
    browseGames,
    createGame,
    loadGame,
    startGame,
    createStorySegment,
    saveGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

/**
 * Hook for accessing the game context
 */
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};

export default GameContext;
