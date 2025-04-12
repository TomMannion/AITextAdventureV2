import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { useSettings } from '../../../contexts/SettingsContext';
import gameApi from '../services/gameApi';
import { useGameFlow } from './GameFlowContext';

// Initial state
const initialState = {
  // Game data
  currentGame: null,
  gameList: [],
  initialized: false,
  
  // Story data
  currentSegment: null,
  segments: [],
  options: [],
  selectedOption: null,
  customOption: '',
  
  // Loading states
  isLoading: false,
  loadingMessage: '',
  progress: 0,
  
  // API settings
  apiKey: localStorage.getItem('game_api_key') || '',
  saveApiKey: localStorage.getItem('game_save_api_key') === 'true',
  
  // Default game settings
  defaultSettings: {
    genre: 'fantasy',
    totalTurns: 16,
  },
};

// Action types
const ACTIONS = {
  SET_LOADING: 'set_loading',
  SET_PROGRESS: 'set_progress',
  SET_CURRENT_GAME: 'set_current_game',
  SET_GAME_LIST: 'set_game_list',
  SET_INITIALIZED: 'set_initialized',
  SET_CURRENT_SEGMENT: 'set_current_segment',
  SET_SEGMENTS: 'set_segments',
  ADD_SEGMENT: 'add_segment',
  SET_OPTIONS: 'set_options',
  SET_SELECTED_OPTION: 'set_selected_option',
  SET_CUSTOM_OPTION: 'set_custom_option',
  SET_API_KEY: 'set_api_key',
  SET_SAVE_API_KEY: 'set_save_api_key',
  RESET_GAME_STATE: 'reset_game_state',
};

// Reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading,
        loadingMessage: action.payload.message || '',
      };
    
    case ACTIONS.SET_PROGRESS:
      return {
        ...state,
        progress: action.payload,
      };
    
    case ACTIONS.SET_CURRENT_GAME:
      return {
        ...state,
        currentGame: action.payload,
      };
    
    case ACTIONS.SET_GAME_LIST:
      return {
        ...state,
        gameList: action.payload,
      };
    
    case ACTIONS.SET_INITIALIZED:
      return {
        ...state,
        initialized: action.payload,
      };
    
    case ACTIONS.SET_CURRENT_SEGMENT:
      return {
        ...state,
        currentSegment: action.payload,
      };
    
    case ACTIONS.SET_SEGMENTS:
      return {
        ...state,
        segments: action.payload,
      };
    
    case ACTIONS.ADD_SEGMENT:
      return {
        ...state,
        segments: [...state.segments, action.payload],
        currentSegment: action.payload,
      };
    
    case ACTIONS.SET_OPTIONS:
      return {
        ...state,
        options: action.payload,
      };
    
    case ACTIONS.SET_SELECTED_OPTION:
      return {
        ...state,
        selectedOption: action.payload,
        // Clear custom option when selecting a predefined one
        customOption: action.payload ? '' : state.customOption,
      };
    
    case ACTIONS.SET_CUSTOM_OPTION:
      return {
        ...state,
        customOption: action.payload,
        // Clear selected option when typing a custom one
        selectedOption: action.payload ? null : state.selectedOption,
      };
    
    case ACTIONS.SET_API_KEY:
      return {
        ...state,
        apiKey: action.payload,
      };
    
    case ACTIONS.SET_SAVE_API_KEY:
      return {
        ...state,
        saveApiKey: action.payload,
      };
    
    case ACTIONS.RESET_GAME_STATE:
      return {
        ...state,
        currentSegment: null,
        segments: [],
        options: [],
        selectedOption: null,
        customOption: '',
      };
    
    default:
      console.warn(`Unhandled action type: ${action.type}`);
      return state;
  }
};

// Create context
const GameDataContext = createContext(null);

/**
 * Provider component for game data management
 */
export const GameDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { showInfo, showError, showSuccess } = useNotification();
  const { settings } = useSettings();
  const { goToError, goToPlayer, goToCompleted } = useGameFlow();
  
  // Helper functions
  const setLoading = useCallback((isLoading, message = '') => {
    dispatch({
      type: ACTIONS.SET_LOADING,
      payload: { isLoading, message },
    });
  }, []);
  
  const setProgress = useCallback((progress) => {
    dispatch({ type: ACTIONS.SET_PROGRESS, payload: progress });
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
    
    if (state.saveApiKey) {
      localStorage.setItem('game_api_key', key);
    }
  }, [state.saveApiKey]);
  
  const toggleSaveApiKey = useCallback((saveFlag) => {
    dispatch({ type: ACTIONS.SET_SAVE_API_KEY, payload: saveFlag });
    
    localStorage.setItem('game_save_api_key', saveFlag);
    
    if (saveFlag) {
      localStorage.setItem('game_api_key', state.apiKey);
    } else {
      localStorage.removeItem('game_api_key');
    }
  }, [state.apiKey]);
  
  // Game list management
  const fetchGames = useCallback(async (force = false) => {
    // Skip if already initialized and not forced
    if (state.initialized && !force) {
      return state.gameList;
    }
    
    try {
      setLoading(true, 'Loading your adventures...');
      
      let cleanupProgress;
      const fetchComplete = () => {
        cleanupProgress && cleanupProgress();
      };
      
      cleanupProgress = simulateProgress(fetchComplete);
      
      // Get games from API
      const games = await gameApi.getAllGames();
      
      // Update state
      dispatch({ type: ACTIONS.SET_GAME_LIST, payload: games });
      dispatch({ type: ACTIONS.SET_INITIALIZED, payload: true });
      
      // Show notification if we have games
      if (games.length > 0) {
        showInfo(`Found ${games.length} adventure${games.length !== 1 ? 's' : ''}`, {
          title: 'Games Loaded',
          timeout: 3000,
        });
      }
      
      return games;
    } catch (error) {
      console.error('Error fetching games:', error);
      goToError(error.message || 'Failed to load games');
      return [];
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, [
    state.initialized,
    state.gameList,
    setLoading,
    simulateProgress,
    showInfo,
    goToError,
  ]);
  
  // Game creation
  const createGame = useCallback(async (gameData) => {
    if (!state.apiKey) {
      goToError('API key is required for game creation');
      return null;
    }
    
    try {
      setLoading(true, 'Creating your adventure...');
      
      let cleanupProgress;
      const createComplete = () => {
        cleanupProgress && cleanupProgress();
      };
      
      cleanupProgress = simulateProgress(createComplete);
      
      // Get LLM preferences from settings
      const preferences = {
        preferredProvider: settings?.llm?.provider || 'groq',
        preferredModel: settings?.llm?.model || 'llama-3.1-8b-instant',
      };
      
      // Create game
      const newGame = await gameApi.createGame({
        ...gameData,
        ...preferences,
      }, state.apiKey);
      
      // Update state
      dispatch({ type: ACTIONS.SET_CURRENT_GAME, payload: newGame });
      dispatch({ type: ACTIONS.RESET_GAME_STATE });
      
      // Show notification
      showInfo(`Your ${newGame.genre} adventure awaits!`, {
        title: 'Adventure Created',
        timeout: 3000,
      });
      
      return newGame;
    } catch (error) {
      console.error('Error creating game:', error);
      goToError(error.message || 'Failed to create game');
      return null;
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, [
    state.apiKey,
    setLoading,
    simulateProgress,
    settings,
    showInfo,
    goToError,
  ]);
  
  // Load game
  const loadGame = useCallback(async (gameId) => {
    try {
      setLoading(true, 'Loading your adventure...');
      
      let cleanupProgress;
      const loadComplete = () => {
        cleanupProgress && cleanupProgress();
      };
      
      cleanupProgress = simulateProgress(loadComplete);
      
      // Get game from API
      const game = await gameApi.getGame(gameId);
      
      if (!game) {
        throw new Error('Game not found');
      }
      
      // Process segments
      let segments = [];
      let currentSegmentData = null;
      let options = [];
      
      if (game.storySegments && game.storySegments.length > 0) {
        // Sort segments by sequence number
        segments = [...game.storySegments].sort(
          (a, b) => a.sequenceNumber - b.sequenceNumber
        );
        
        // Set latest segment as current
        currentSegmentData = segments[segments.length - 1];
        
        // Get options
        if (currentSegmentData && currentSegmentData.options) {
          options = currentSegmentData.options;
        }
      }
      
      // Update state
      dispatch({ type: ACTIONS.SET_CURRENT_GAME, payload: game });
      dispatch({ type: ACTIONS.SET_SEGMENTS, payload: segments });
      dispatch({ type: ACTIONS.SET_CURRENT_SEGMENT, payload: currentSegmentData });
      dispatch({ type: ACTIONS.SET_OPTIONS, payload: options });
      
      // Show notification
      showInfo(`Continuing your ${game.genre} adventure!`, {
        title: 'Adventure Loaded',
        timeout: 3000,
      });
      
      return game;
    } catch (error) {
      console.error('Error loading game:', error);
      goToError(error.message || 'Failed to load game');
      return null;
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, [
    setLoading,
    simulateProgress,
    showInfo,
    goToError,
  ]);
  
  // Start game
  const startGame = useCallback(async (gameId) => {
    if (!state.apiKey) {
      goToError('API key is required for story generation');
      return null;
    }
    
    try {
      setLoading(true, 'Generating your adventure...');
      
      let cleanupProgress;
      const startComplete = () => {
        cleanupProgress && cleanupProgress();
      };
      
      cleanupProgress = simulateProgress(startComplete);
      
      // Get LLM preferences from settings
      const preferences = {
        preferredProvider: settings?.llm?.provider || 'groq',
        preferredModel: settings?.llm?.model || 'llama-3.1-8b-instant',
      };
      
      // Start game
      const response = await gameApi.startGame(gameId, state.apiKey, preferences);
      
      // Process response
      const gameData = response.game || response;
      const firstSegment = response.firstSegment;
      const initialOptions = firstSegment?.options || [];
      
      // Update state
      if (gameData && state.currentGame) {
        dispatch({
          type: ACTIONS.SET_CURRENT_GAME,
          payload: {
            ...state.currentGame,
            ...gameData,
          },
        });
      }
      
      if (firstSegment) {
        dispatch({ type: ACTIONS.SET_CURRENT_SEGMENT, payload: firstSegment });
        dispatch({ type: ACTIONS.SET_SEGMENTS, payload: [firstSegment] });
      }
      
      if (initialOptions.length > 0) {
        dispatch({ type: ACTIONS.SET_OPTIONS, payload: initialOptions });
      }
      
      // Show notification
      showInfo('Your adventure begins!', {
        title: 'Story Started',
        timeout: 3000,
      });
      
      // Navigate to player
      goToPlayer();
      
      return response;
    } catch (error) {
      console.error('Error starting game:', error);
      goToError(error.message || 'Failed to start game');
      return null;
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, [
    state.apiKey,
    state.currentGame,
    setLoading,
    simulateProgress,
    settings,
    showInfo,
    goToError,
    goToPlayer,
  ]);
  
  // Create story segment (submit choice)
  const submitChoice = useCallback(async (optionId = null, customText = null) => {
    if (!state.currentGame) {
      goToError('No active game found');
      return null;
    }
    
    if (!state.apiKey) {
      goToError('API key is required for story progression');
      return null;
    }
    
    if (!optionId && (!customText || !customText.trim())) {
      showError('Please select an option or enter your own action');
      return null;
    }
    
    try {
      setLoading(true, 'Processing your choice...');
      
      // Prepare choice data
      const choiceData = optionId
        ? { optionId }
        : { customText: customText.trim() };
      
      // Call API
      const response = await gameApi.createStorySegment(
        state.currentGame.id,
        choiceData,
        state.apiKey
      );
      
      // Process response
      const gameUpdate = response.game || {};
      const newSegment = response.segment || response;
      const newOptions = response.options || newSegment?.options || [];
      
      // Update game with new turn count
      if (state.currentGame) {
        const newTurnCount = (state.currentGame.turnCount || 0) + 1;
        const updatedGame = {
          ...state.currentGame,
          ...gameUpdate,
          turnCount: newTurnCount,
        };
        
        dispatch({ type: ACTIONS.SET_CURRENT_GAME, payload: updatedGame });
        
        // Check if game is completed
        if (updatedGame.status === 'COMPLETED' || 
            newTurnCount >= updatedGame.totalTurns) {
          goToCompleted();
        }
      }
      
      // Add new segment
      if (newSegment) {
        dispatch({ type: ACTIONS.ADD_SEGMENT, payload: newSegment });
      }
      
      // Update options
      if (newOptions.length > 0) {
        dispatch({ type: ACTIONS.SET_OPTIONS, payload: newOptions });
      }
      
      // Reset selected option
      dispatch({ type: ACTIONS.SET_SELECTED_OPTION, payload: null });
      dispatch({ type: ACTIONS.SET_CUSTOM_OPTION, payload: '' });
      
      return response;
    } catch (error) {
      console.error('Error submitting choice:', error);
      showError(error.message || 'Failed to process your choice');
      return null;
    } finally {
      setLoading(false);
    }
  }, [
    state.currentGame,
    state.apiKey,
    setLoading,
    showError,
    goToError,
    goToCompleted,
  ]);
  
  // Save game
  const saveGame = useCallback(async () => {
    if (!state.currentGame) {
      showError('No game to save');
      return false;
    }
    
    try {
      // Call API
      const success = await gameApi.saveGame(state.currentGame.id);
      
      // Show notification
      showSuccess('Game progress saved', {
        title: 'Save Complete',
        timeout: 2000,
      });
      
      return success;
    } catch (error) {
      console.error('Error saving game:', error);
      showError(error.message || 'Failed to save game');
      return false;
    }
  }, [state.currentGame, showSuccess, showError]);
  
  // Player actions
  const setSelectedOption = useCallback((optionId) => {
    dispatch({ type: ACTIONS.SET_SELECTED_OPTION, payload: optionId });
  }, []);
  
  const setCustomOption = useCallback((text) => {
    dispatch({ type: ACTIONS.SET_CUSTOM_OPTION, payload: text });
  }, []);
  
  // Reset game state
  const resetGameState = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_GAME_STATE });
  }, []);
  
  // Context value
  const value = {
    ...state,
    fetchGames,
    createGame,
    loadGame,
    startGame,
    submitChoice,
    saveGame,
    updateApiKey,
    toggleSaveApiKey,
    setSelectedOption,
    setCustomOption,
    resetGameState,
  };
  
  return (
    <GameDataContext.Provider value={value}>
      {children}
    </GameDataContext.Provider>
  );
};

/**
 * Hook for accessing game data context
 */
export const useGameData = () => {
  const context = useContext(GameDataContext);
  if (!context) {
    throw new Error('useGameData must be used within a GameDataProvider');
  }
  return context;
};

export default GameDataContext;