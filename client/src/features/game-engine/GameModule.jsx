// src/features/game-engine/GameModule.jsx - Updated with GameStoreContext
import React, { useEffect } from 'react';
import { useGameStore, FLOW_STATES } from '../../contexts/GameStoreContext';
import { useThemeContext } from '../../contexts/ThemeContext';

// Import components
import GameLauncher from './components/launcher/GameLauncher';
import GameCreator from './components/creation/GameCreator';
import GameBrowser from './components/browser/GameBrowser';
import GamePlayer from './components/player/GamePlayer';
import GameCompletion from './components/player/GameCompletion';
import ErrorDisplay from './components/shared/ErrorDisplay';
import LoadingScreen from './components/shared/LoadingScreen';

/**
 * Game content renderer - displays the appropriate screen based on flow state
 */
const GameContent = () => {
  // Use the consolidated GameStoreContext
  const { 
    flowState, 
    error, 
    isLoading, 
    loadingMessage, 
    progress, 
    currentGame,
    fetchGames, 
    initialized 
  } = useGameStore();
  
  // Initialize games when component mounts
  useEffect(() => {
    if (!initialized) {
      fetchGames().catch(console.error);
    }
  }, [fetchGames, initialized]);
  
  // Show loading screen if loading
  if (isLoading) {
    return <LoadingScreen message={loadingMessage} progress={progress} />;
  }
  
  // Show error screen if error
  if (flowState === FLOW_STATES.ERROR && error) {
    return <ErrorDisplay message={error} />;
  }
  
  // Render appropriate component based on flow state
  switch (flowState) {
    case FLOW_STATES.CREATOR:
      return <GameCreator />;
      
    case FLOW_STATES.BROWSER:
      return <GameBrowser />;
      
    case FLOW_STATES.PLAYER:
      return <GamePlayer />;
      
    case FLOW_STATES.COMPLETED:
      return <GameCompletion game={currentGame} />;
      
    case FLOW_STATES.LAUNCHER:
    default:
      return <GameLauncher />;
  }
};

/**
 * Main Game Module component
 * The wrapping providers have been moved to App.jsx
 */
const GameModule = () => {
  return <GameContent />;
};

export default GameModule;