// src/contexts/GameContext.jsx
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
} from "react";
import { useThemeContext } from "./ThemeContext";
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
  const fetchingGamesRef = useRef(false);

  // Action dispatchers
  const setStatus = useCallback((status) => {
    dispatch({ type: ACTIONS.SET_STATUS, payload: status });
  }, []);

  const setLoadingProgress = useCallback((progress) => {
    dispatch({ type: ACTIONS.SET_LOADING_PROGRESS, payload: progress });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: error });
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
        return [];
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
        const response = await gameService.getAllGames();
        console.log("Games response received:", response);

        clearInterval(progressInterval);
        setLoadingProgress(100);

        // Parse the response correctly based on your API structure
        let gamesData = [];

        // Handle your specific API response format
        if (
          response &&
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          gamesData = response.data.data;
        }
        // Fallback checks
        else if (response && Array.isArray(response.data)) {
          gamesData = response.data;
        } else if (Array.isArray(response)) {
          gamesData = response;
        }

        console.log(`Found ${gamesData.length} games to display`);

        // Short delay before completing to ensure progress bar is visible
        setTimeout(() => {
          // Update state
          setGameList(gamesData);
          setGamesInitialized(true);

          // Only restore status if we changed it (were browsing)
          if (wasAlreadyBrowsing) {
            setStatus("browsing");
          }
          setLoadingProgress(0);

          // Clear fetching flag
          fetchingGamesRef.current = false;
        }, 300);

        return gamesData;
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
        const response = await gameService.createGame(gameData, state.apiKey);

        clearInterval(progressInterval);
        setLoadingProgress(100);

        // Short delay before completing to ensure progress bar is visible
        setTimeout(() => {
          setCurrentGame(response);
          setStatus("playing");
          resetGameState();

          // Apply theme based on game genre
          applyGenreTheme(response.genre);

          // Add initial log entry
          addLog({
            text: "New adventure started",
            type: "system",
          });
        }, 300);

        return response;
      } catch (error) {
        setError(error.message || "Failed to create game");
        return null;
      }
    },
    [
      state.apiKey,
      setStatus,
      setLoadingProgress,
      setError,
      setCurrentGame,
      resetGameState,
      applyGenreTheme,
      addLog,
    ]
  );

  const loadGame = useCallback(
    async (gameId) => {
      try {
        setStatus("loading");
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

        // Call the API to get a specific game
        const response = await gameService.getGame(gameId);

        if (!response) {
          throw new Error("Game not found");
        }

        clearInterval(progressInterval);
        setLoadingProgress(100);

        // Short delay before completing to ensure progress bar is visible
        setTimeout(() => {
          setCurrentGame(response);

          // If the game has segments, load them
          if (response.segments && response.segments.length > 0) {
            setSegments(response.segments);
            setCurrentSegment(response.segments[response.segments.length - 1]);
          }

          // If the game has options, load them
          if (response.options && response.options.length > 0) {
            setOptions(response.options);
          }

          setStatus("playing");

          // Apply theme based on game genre
          applyGenreTheme(response.genre);

          // Add log entry
          addLog({
            text: "Adventure loaded",
            type: "system",
          });
        }, 300);

        return response;
      } catch (error) {
        setError(error.message || "Failed to load game");
        return null;
      }
    },
    [
      setStatus,
      setLoadingProgress,
      setError,
      setCurrentGame,
      setSegments,
      setCurrentSegment,
      setOptions,
      applyGenreTheme,
      addLog,
    ]
  );

  // Function to start a game (generate initial story segment)
  const startGame = useCallback(
    async (gameId) => {
      try {
        if (!state.apiKey) {
          throw new Error("LLM API key is required for game start");
        }

        setStatus("loading");
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

        // Call the API to start the game
        const response = await gameService.startGame(gameId, state.apiKey);

        clearInterval(progressInterval);
        setLoadingProgress(100);

        // Process and set the initial segment and options
        if (response && response.currentSegment) {
          setCurrentSegment(response.currentSegment);
          setSegments([response.currentSegment]);

          // Add log entry for the initial segment
          addLog({
            text: "Story begins",
            type: "story",
          });
        }

        if (response && response.options) {
          setOptions(response.options);
        }

        setStatus("playing");

        return response;
      } catch (error) {
        setError(error.message || "Failed to start game");
        return null;
      }
    },
    [
      state.apiKey,
      setStatus,
      setLoadingProgress,
      setError,
      setCurrentSegment,
      setSegments,
      setOptions,
      addLog,
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

        // Call the API to create a new story segment
        const response = await gameService.createStorySegment(
          gameId,
          choiceData,
          state.apiKey
        );

        clearInterval(progressInterval);
        setLoadingProgress(100);

        // Update the current game's turn count
        if (state.currentGame) {
          setCurrentGame({
            ...state.currentGame,
            turnCount: (state.currentGame.turnCount || 0) + 1,
          });
        }

        // Process and set the new segment and options
        if (response && response.segment) {
          addSegment(response.segment);

          // Add log entry for the new segment
          addLog({
            text: response.segment.content.substring(0, 50) + "...",
            type: "story",
          });
        }

        if (response && response.options) {
          setOptions(response.options);
        }

        // Auto-save game state (the API might handle this already)
        // But we could add an explicit save call here if needed

        setStatus("playing");

        return response;
      } catch (error) {
        setError(error.message || "Failed to generate story segment");
        return null;
      }
    },
    [
      state.apiKey,
      state.options,
      state.currentGame,
      setStatus,
      setLoadingProgress,
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

        // Log the save action
        addLog({
          text: "Game saved",
          type: "system",
        });

        return true;
      } catch (error) {
        setError(error.message || "Failed to save game");
        return false;
      }
    },
    [state.currentGame, setError, addLog]
  );

  // Context value
  const value = {
    // State
    ...state,

    // Status setters
    setStatus,
    setError,
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
