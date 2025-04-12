// src/features/game-engine/state/gameStateMachine.js

/**
 * Defines all possible states for the game engine
 */
export const GameStates = {
  IDLE: 'idle',         // Initial state, launcher screen
  BROWSING: 'browsing', // Browsing saved games
  CREATING: 'creating', // Creating a new game
  INITIALIZING: 'initializing', // Loading or generating initial content
  PLAYING: 'playing',   // Playing a game
  COMPLETED: 'completed', // Completed a game
  ERROR: 'error'        // Error state
};

/**
 * Defines which state transitions are allowed
 */
const allowedTransitions = {
  [GameStates.IDLE]: [GameStates.BROWSING, GameStates.CREATING],
  [GameStates.BROWSING]: [GameStates.IDLE, GameStates.CREATING, GameStates.INITIALIZING],
  [GameStates.CREATING]: [GameStates.IDLE, GameStates.INITIALIZING],
  [GameStates.INITIALIZING]: [GameStates.PLAYING, GameStates.ERROR, GameStates.IDLE],
  [GameStates.PLAYING]: [GameStates.IDLE, GameStates.COMPLETED, GameStates.ERROR],
  [GameStates.COMPLETED]: [GameStates.IDLE, GameStates.CREATING],
  [GameStates.ERROR]: [GameStates.IDLE, GameStates.BROWSING, GameStates.CREATING, GameStates.PLAYING]
};

/**
 * Creates a game state machine that enforces valid state transitions
 * 
 * @param {string} initialState - Starting state
 * @returns {Object} State machine interface
 */
export function createGameStateMachine(initialState = GameStates.IDLE) {
  // Internal state
  let currentState = initialState;
  const listeners = new Set();
  
  return {
    /**
     * Get current state
     * @returns {string} Current state
     */
    getState: () => currentState,
    
    /**
     * Attempt to transition to a new state
     * @param {string} newState - Target state
     * @returns {boolean} Whether transition was successful
     */
    transition: (newState) => {
      // Check if transition is allowed
      if (!allowedTransitions[currentState].includes(newState)) {
        console.error(`Invalid state transition: ${currentState} -> ${newState}`);
        return false;
      }
      
      // Update state
      const oldState = currentState;
      currentState = newState;
      
      // Notify listeners
      listeners.forEach(listener => listener(currentState, oldState));
      return true;
    },
    
    /**
     * Subscribe to state changes
     * @param {Function} listener - Callback function(newState, oldState)
     * @returns {Function} Unsubscribe function
     */
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}