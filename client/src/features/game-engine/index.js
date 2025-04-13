// src/features/game-engine/index.js - Updated to use GameStoreContext
import GameModule from './GameModule';
import { FLOW_STATES, useGameStore } from '../../contexts/GameStoreContext';

// Window registration
import registerGameWindows from './registerGameWindows';

// Export all game engine components and hooks
export {
  // Main module
  GameModule,
  
  // Hooks
  useGameStore,
  
  // Constants
  FLOW_STATES,
  
  // Window registration
  registerGameWindows,
};

// Legacy exports for backward compatibility
export { 
  useGameStore as useGameFlow,
  useGameStore as useGameData,
};

// Default export for convenient importing
export default GameModule;