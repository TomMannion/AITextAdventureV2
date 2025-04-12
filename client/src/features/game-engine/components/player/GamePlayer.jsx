import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useGameFlow } from '../../contexts/GameFlowContext';
import { useGameData } from '../../contexts/GameDataContext';
import GameControls from './GameControls';
import StoryPane from './StoryPane';
import ChoiceSelector from './ChoiceSelector';
import GameMetadata from './GameMetadata';

const PlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--win95-window-bg);
  overflow: hidden;
`;

const MainContent = styled.div`
  display: flex;
  flex-grow: 1;
  overflow: hidden;
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 75%;
  border-right: 1px solid var(--win95-border-darker);
  overflow: hidden;
`;

const RightPanel = styled.div`
  width: 25%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const StatusBar = styled.div`
  border-top: 1px solid var(--win95-border-darker);
  padding: 5px 10px;
  font-size: 12px;
  background-color: var(--win95-window-bg);
  color: #666;
`;

/**
 * Game player component - main gameplay interface
 */
const GamePlayer = () => {
  const { goToLauncher, goToCompleted } = useGameFlow();
  const { 
    currentGame, 
    currentSegment, 
    segments, 
    options, 
    selectedOption, 
    customOption,
    submitChoice,
    saveGame,
    setSelectedOption,
    setCustomOption
  } = useGameData();
  
  // Status message
  const [statusMessage, setStatusMessage] = useState('Ready for your next action');
  
  // Handle game exit
  const handleExit = () => {
    goToLauncher();
  };
  
  // Handle save
  const handleSave = async () => {
    setStatusMessage('Saving game...');
    const success = await saveGame();
    setStatusMessage(success ? 'Game saved successfully' : 'Failed to save game');
  };
  
  // Handle choice submission
  const handleSubmitChoice = async () => {
    if (!selectedOption && !customOption.trim()) {
      setStatusMessage('Please select an option or enter your own action');
      return;
    }
    
    setStatusMessage('Processing your choice...');
    const result = await submitChoice(selectedOption, customOption);
    
    if (result) {
      setStatusMessage('What will you do next?');
      
      // Check if game is completed
      if (
        currentGame?.status === 'COMPLETED' ||
        (currentGame?.turnCount >= currentGame?.totalTurns)
      ) {
        goToCompleted();
      }
    } else {
      setStatusMessage('Failed to process your choice. Try again.');
    }
  };
  
  // Keep scroll at bottom when new content arrives
  const scrollRef = useRef(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentSegment]);
  
  return (
    <PlayerContainer>
      <GameControls 
        onExit={handleExit}
        onSave={handleSave}
        title={currentGame?.title || 'Text Adventure'}
      />
      
      <MainContent>
        <LeftPanel>
          <StoryPane 
            segments={segments} 
            scrollRef={scrollRef}
          />
          
          <ChoiceSelector
            options={options}
            selectedOption={selectedOption}
            customOption={customOption}
            onSelectOption={setSelectedOption}
            onCustomOptionChange={setCustomOption}
            onSubmit={handleSubmitChoice}
          />
        </LeftPanel>
        
        <RightPanel>
          <GameMetadata game={currentGame} />
        </RightPanel>
      </MainContent>
      
      <StatusBar>{statusMessage}</StatusBar>
    </PlayerContainer>
  );
};

export default GamePlayer;