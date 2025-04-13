import React, { useState } from 'react';
import styled from 'styled-components';
import { win95Border } from '../../../../utils/styleUtils';
import { placeholderIcons } from '../../../../utils/iconUtils';
import { useGameStore } from '../../../../contexts/GameStoreContext';

// Container for navigation controls
const NavigatorContainer = styled.div`
  ${win95Border('outset')}
  background-color: var(--win95-window-bg);
  margin: 10px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// Section header
const SectionHeader = styled.div`
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
  color: var(--win95-window-header);
  display: flex;
  align-items: center;
`;

// Header icon
const HeaderIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 5px;
`;

// Navigation buttons row
const ButtonsRow = styled.div`
  display: flex;
  gap: 5px;
  justify-content: space-between;
`;

// Navigation button
const NavButton = styled.button`
  ${win95Border('outset')}
  padding: 3px 6px;
  background-color: var(--win95-window-bg);
  font-size: 11px;
  display: flex;
  align-items: center;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.6 : 1};
  
  &:active:not(:disabled) {
    ${win95Border('inset')}
    padding: 4px 5px 2px 7px;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

// Navigation icon
const NavIcon = styled.span`
  display: inline-block;
  margin-right: 3px;
  font-size: 10px;
`;

// Turn selection
const TurnSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

// Turn label
const TurnLabel = styled.div`
  font-size: 11px;
`;

// Turn display
const TurnDisplay = styled.div`
  ${win95Border('inset')}
  background-color: white;
  padding: 2px 6px;
  font-size: 11px;
  min-width: 40px;
  text-align: center;
`;

// Navigation dots container
const DotsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2px;
  margin-top: 3px;
  padding: 5px 0;
  overflow-x: auto;
  ${win95Border('inset')}
  background-color: white;
`;

// Individual navigation dot
const NavDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.$active ? 'var(--win95-window-header)' : '#c0c0c0'};
  border: 1px solid ${props => props.$active ? '#000080' : '#808080'};
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.$active ? 'var(--win95-window-header)' : '#a0a0a0'};
  }
`;

/**
 * Story navigator component - provides turn-based navigation
 * 
 * @param {Object} props Component props
 * @param {number} props.currentTurn Current turn/segment
 * @param {number} props.totalTurns Total number of turns/segments
 * @param {Function} props.onJumpToTurn Handler for jumping to a specific turn
 */
const StoryNavigator = ({
  currentTurn = 1,
  totalTurns = 1,
  onJumpToTurn
}) => {
  // Jump to first turn
  const handleFirst = () => {
    onJumpToTurn(1);
  };
  
  // Jump to previous turn
  const handlePrev = () => {
    if (currentTurn > 1) {
      onJumpToTurn(currentTurn - 1);
    }
  };
  
  // Jump to next turn
  const handleNext = () => {
    if (currentTurn < totalTurns) {
      onJumpToTurn(currentTurn + 1);
    }
  };
  
  // Jump to last turn
  const handleLast = () => {
    onJumpToTurn(totalTurns);
  };
  
  // Jump to a specific turn using dots
  const handleDotClick = (turn) => {
    onJumpToTurn(turn);
  };
  
  return (
    <NavigatorContainer>
      <SectionHeader>
        <HeaderIcon src={placeholderIcons.document} alt="" />
        Story Navigator
      </SectionHeader>
      
      <ButtonsRow>
        <NavButton 
          onClick={handleFirst}
          disabled={currentTurn === 1}
          title="Jump to first turn"
        >
          <NavIcon>⏮</NavIcon>
          First
        </NavButton>
        
        <NavButton 
          onClick={handlePrev}
          disabled={currentTurn === 1}
          title="Previous turn"
        >
          <NavIcon>◀</NavIcon>
          Prev
        </NavButton>
        
        <TurnSelector>
          <TurnLabel>Turn</TurnLabel>
          <TurnDisplay>{currentTurn}/{totalTurns}</TurnDisplay>
        </TurnSelector>
        
        <NavButton 
          onClick={handleNext}
          disabled={currentTurn === totalTurns}
          title="Next turn"
        >
          Next
          <NavIcon>▶</NavIcon>
        </NavButton>
        
        <NavButton 
          onClick={handleLast}
          disabled={currentTurn === totalTurns}
          title="Jump to latest turn"
        >
          Last
          <NavIcon>⏭</NavIcon>
        </NavButton>
      </ButtonsRow>
      
      <DotsContainer>
        {Array.from({ length: totalTurns }, (_, i) => (
          <NavDot 
            key={i + 1}
            $active={currentTurn === i + 1}
            onClick={() => handleDotClick(i + 1)}
            title={`Turn ${i + 1}`}
          />
        ))}
      </DotsContainer>
    </NavigatorContainer>
  );
};

export default StoryNavigator;