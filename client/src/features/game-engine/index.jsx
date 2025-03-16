// src/features/game-engine/index.js
// Main components
import GameModule from "./GameModule";
import GameLauncher from "./components/GameLauncher";
import GameCreator from "./components/GameCreator";
import GameBrowser from "./components/GameBrowser";
import GamePlayer from "./components/GamePlayer";

// Hooks
import useGameState from "./hooks/useGameState";

// Window registration
import registerGameWindows from "./registerGameWindows";

// Export all game engine components and hooks
export {
  // Components
  GameModule,
  GameLauncher,
  GameCreator,
  GameBrowser,
  GamePlayer,

  // Hooks
  useGameState,

  // Utilities
  registerGameWindows,
};

// Default export for convenient importing
export default GameModule;
