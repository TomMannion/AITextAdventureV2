import React, { createContext, useContext, useState, useCallback } from 'react';

// Game flow states
export const FLOW_STATES = {
  LAUNCHER: 'launcher',   // Main menu
  CREATOR: 'creator',     // Create new game
  BROWSER: 'browser',     // Browse saved games
  PLAYER: 'player',       // Play a game
  COMPLETED: 'completed', // Game completion screen
  ERROR: 'error',         // Error state
};

// Create context
const GameFlowContext = createContext(null);

/**
 * Provider component for game flow state management
 */
export const GameFlowProvider = ({ children }) => {
  // Current flow state
  const [flowState, setFlowState] = useState(FLOW_STATES.LAUNCHER);
  
  // Error state management
  const [error, setError] = useState(null);
  
  // Navigation methods
  const goToLauncher = useCallback(() => {
    setFlowState(FLOW_STATES.LAUNCHER);
    setError(null);
  }, []);
  
  const goToCreator = useCallback(() => {
    setFlowState(FLOW_STATES.CREATOR);
    setError(null);
  }, []);
  
  const goToBrowser = useCallback(() => {
    setFlowState(FLOW_STATES.BROWSER);
    setError(null);
  }, []);
  
  const goToPlayer = useCallback(() => {
    setFlowState(FLOW_STATES.PLAYER);
    setError(null);
  }, []);
  
  const goToCompleted = useCallback(() => {
    setFlowState(FLOW_STATES.COMPLETED);
    setError(null);
  }, []);
  
  const goToError = useCallback((errorMessage) => {
    setError(errorMessage);
    setFlowState(FLOW_STATES.ERROR);
  }, []);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Context value
  const value = {
    flowState,
    error,
    goToLauncher,
    goToCreator,
    goToBrowser,
    goToPlayer,
    goToCompleted,
    goToError,
    clearError,
  };
  
  return (
    <GameFlowContext.Provider value={value}>
      {children}
    </GameFlowContext.Provider>
  );
};

/**
 * Hook for accessing game flow context
 */
export const useGameFlow = () => {
  const context = useContext(GameFlowContext);
  if (!context) {
    throw new Error('useGameFlow must be used within a GameFlowProvider');
  }
  return context;
};

export default GameFlowContext;