import React from 'react';
import styled from 'styled-components';
import { useGameStore } from '../../../../contexts/GameStoreContext';
import GameMenuCard from './GameMenuCard';
import { placeholderIcons } from '../../../../utils/iconUtils';

const LauncherContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--win95-window-bg);
  padding: 20px;
  overflow: auto;
`;

const Title = styled.h2`
  font-size: 18px;
  margin-bottom: 20px;
  text-align: center;
  border-bottom: 2px solid var(--win95-border-dark);
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TitleIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 10px;
`;

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 500px;
  margin: 20px auto;
`;

const Footer = styled.div`
  margin-top: auto;
  text-align: center;
  font-size: 11px;
  color: #808080;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid var(--win95-border-dark);
`;

/**
 * Game launcher component - main menu for the game engine
 */
const GameLauncher = () => {
  const { goToCreator, goToBrowser, gameList, fetchGames } = useGameStore();
  
  const handleNewGame = () => {
    goToCreator();
  };
  
  const handleContinueGame = () => {
    fetchGames().then(() => {
      goToBrowser();
    });
  };
  
  // Get count of active games
  const activeGameCount = gameList.filter(game => 
    game.status !== 'COMPLETED'
  ).length;
  
  return (
    <LauncherContainer>
      <Title>
        <TitleIcon src={placeholderIcons.adventure} alt="Adventure" />
        Windows 95 Text Adventure
      </Title>
      
      <MenuContainer>
        <GameMenuCard
          title="Start New Adventure"
          description="Begin a new text adventure in your chosen genre"
          icon={placeholderIcons.adventure}
          onClick={handleNewGame}
        />
        
        <GameMenuCard
          title="Continue Saved Adventure"
          description={
            activeGameCount > 0
              ? `You have ${activeGameCount} active adventure${
                  activeGameCount !== 1 ? 's' : ''
                }`
              : 'Load a previously saved adventure'
          }
          icon={placeholderIcons.folder}
          onClick={handleContinueGame}
          badge={activeGameCount > 0 ? activeGameCount : null}
        />
      </MenuContainer>
      
      <Footer>
        Select an option to begin
      </Footer>
    </LauncherContainer>
  );
};

export default GameLauncher;