import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useGameFlow } from '../../contexts/GameFlowContext';
import { useGameStore } from '../../../../contexts/GameStoreContext';
import GameControls from './GameControls';
import StoryPane from './StoryPane';
import ChoiceSelector from './ChoiceSelector';
import GameKeyboardShortcuts from './GameKeyboardShortcuts';
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
  display: flex;
  justify-content: space-between;
`;

/**
 * Improved game player component - main gameplay interface with better readability and navigation
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
  } = useGameStore();
  
  // Status message
  const [statusMessage, setStatusMessage] = useState('Ready for your next action');
  
  // Keep track of player choices to display alongside story segments
  const [playerChoices, setPlayerChoices] = useState([]);
  
  // Reference to story pane for scrolling
  const scrollRef = useRef(null);
  
  // Last save time for status bar
  const [lastSaveTime, setLastSaveTime] = useState(null);
  
  // Track current segment/turn for navigation
  const [currentTurn, setCurrentTurn] = useState(0);
  
  // Handle game exit
  const handleExit = () => {
    goToLauncher();
  };
  
  // Handle save
  const handleSave = async () => {
    setStatusMessage('Saving game...');
    const success = await saveGame();
    
    if (success) {
      const now = new Date();
      setLastSaveTime(now);
      setStatusMessage('Game saved successfully');
    } else {
      setStatusMessage('Failed to save game');
    }
  };
  
  // Handle jumping to a specific turn
  const handleJumpToTurn = (turnIndex) => {
    // Convert from 1-based (UI) to 0-based (actual index)
    const index = turnIndex - 1;
    
    // Validate index
    if (index >= 0 && index < segments.length) {
      setCurrentTurn(index);
      
      // Scroll to the segment
      if (scrollRef.current) {
        const segmentElements = scrollRef.current.querySelectorAll('[data-segment-id]');
        if (segmentElements[index]) {
          segmentElements[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };
  
  // Format save time for display
  const formatSaveTime = (date) => {
    if (!date) return '';
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  // Handle choice submission
  const handleSubmitChoice = async () => {
    if (!selectedOption) {
      setStatusMessage('Please select an option to continue');
      return;
    }
    
    setStatusMessage('Processing your choice...');
    
    // Determine the choice text to display
    let choiceText = '';
    
    // Find the selected option text
    const selectedOptionObj = options.find(opt => opt.id === selectedOption);
    choiceText = selectedOptionObj?.text || 'Selected option';
    
    // Save the choice for display purposes
    setPlayerChoices(prev => [...prev, choiceText]);
    
    // Submit the choice to the backend
    const result = await submitChoice(selectedOption, null);
    
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
  
  // When segments change, ensure we have matching player choices
  useEffect(() => {
    // If we have more segments than player choices, pad with empty choices
    // This might happen when loading a saved game
    if (segments.length > playerChoices.length + 1) {
      const newChoices = [...playerChoices];
      
      // Add placeholder choices (minus 1 for the first segment which has no choice)
      while (newChoices.length < segments.length - 1) {
        newChoices.push('...');
      }
      
      setPlayerChoices(newChoices);
    }
    
    // Update current turn to the latest when segments change
    if (segments.length > 0) {
      setCurrentTurn(segments.length - 1);
    }
  }, [segments, playerChoices]);
  
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
            playerChoices={playerChoices}
            scrollRef={scrollRef}
            currentTurn={currentTurn}
          />
          
          <ChoiceSelector
            options={options}
            selectedOption={selectedOption}
            onSelectOption={setSelectedOption}
            onSubmit={handleSubmitChoice}
          />
        </LeftPanel>
        
        <RightPanel>
          <GameMetadata 
            game={currentGame}
            currentTurn={currentTurn}
            onJumpToTurn={handleJumpToTurn}
          />
        </RightPanel>
      </MainContent>
      
      <StatusBar>
        <div>{statusMessage}</div>
        {lastSaveTime && (
          <div>Last saved: {formatSaveTime(lastSaveTime)}</div>
        )}
      </StatusBar>
      
      {/* Keyboard shortcuts component */}
      <GameKeyboardShortcuts
        onSave={handleSave}
        onSubmit={handleSubmitChoice}
        isSubmitEnabled={!!selectedOption}
      />
    </PlayerContainer>
  );
};

export default GamePlayer;