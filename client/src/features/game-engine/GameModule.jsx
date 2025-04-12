import React, { useEffect } from 'react';
import { GameFlowProvider, useGameFlow, FLOW_STATES } from './contexts/GameFlowContext';
import { GameDataProvider, useGameData } from './contexts/GameDataContext';
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
  const { flowState, error } = useGameFlow();
  const { isLoading, loadingMessage, progress, currentGame } = useGameData();
  
  // Initialize games when component mounts
  const { fetchGames, initialized } = useGameData();
  
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
 * Main Game Module component with providers
 */
const GameModule = () => {
  return (
    <GameFlowProvider>
      <GameDataProvider>
        <GameContent />
      </GameDataProvider>
    </GameFlowProvider>
  );
};

export default GameModule;