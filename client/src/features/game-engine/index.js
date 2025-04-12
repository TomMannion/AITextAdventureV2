// Entry point for the game engine feature
import GameModule from './GameModule';
import { GameFlowProvider, useGameFlow, FLOW_STATES } from './contexts/GameFlowContext';
import { GameDataProvider, useGameData } from './contexts/GameDataContext';

// Window registration
import registerGameWindows from './registerGameWindows';

// Export all game engine components and hooks
export {
  // Main module
  GameModule,
  
  // Providers
  GameFlowProvider,
  GameDataProvider,
  
  // Hooks
  useGameFlow,
  useGameData,
  
  // Constants
  FLOW_STATES,
  
  // Window registration
  registerGameWindows,
};

// Default export for convenient importing
export default GameModule;