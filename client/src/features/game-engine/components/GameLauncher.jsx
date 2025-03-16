// src/features/game-engine/components/GameLauncher.jsx
import React from "react";
import styled from "styled-components";
import useGameState from "../hooks/useGameState";

// Styled components
const LauncherContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 15px;
  background-color: var(--win95-window-bg);
  overflow: auto;
`;

const Title = styled.h2`
  font-size: 18px;
  margin-bottom: 20px;
  text-align: center;
  border-bottom: 2px solid var(--win95-border-dark);
  padding-bottom: 10px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 300px;
  margin: 20px auto;
`;

const ActionButton = styled.button`
  background-color: var(--win95-window-bg);
  border: 2px solid var(--win95-border-darker);
  border-top-color: var(--win95-border-light);
  border-left-color: var(--win95-border-light);
  padding: 10px 15px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:active {
    border-top-color: var(--win95-border-darker);
    border-left-color: var(--win95-border-darker);
    border-bottom-color: var(--win95-border-light);
    border-right-color: var(--win95-border-light);
    padding: 11px 14px 9px 16px;
  }
`;

const Icon = styled.span`
  margin-right: 10px;
  font-size: 16px;
`;

const GameLauncher = () => {
  const { setStatus, startNewGame, refreshGames } = useGameState();

  // Handle starting a new adventure
  const handleNewGame = () => {
    startNewGame();
  };

  // Handle loading saved adventures
  const handleLoadGames = () => {
    // First set status to browsing to trigger the component change
    setStatus("browsing");

    // Then explicitly call refreshGames to ensure data is loaded
    refreshGames();

    console.log("Load games button clicked, status set to browsing");
  };

  return (
    <LauncherContainer>
      <Title>Text Adventure Game Launcher</Title>

      <ButtonContainer>
        <ActionButton onClick={handleNewGame}>
          <Icon>🧙</Icon> Start New Adventure
        </ActionButton>

        <ActionButton onClick={handleLoadGames}>
          <Icon>📂</Icon> Continue Saved Adventure
        </ActionButton>
      </ButtonContainer>
    </LauncherContainer>
  );
};

export default GameLauncher;
