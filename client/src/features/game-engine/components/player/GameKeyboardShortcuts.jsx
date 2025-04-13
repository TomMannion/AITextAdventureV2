import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { win95Border } from '../../../../utils/styleUtils';
import { useGameStore } from '../../../../contexts/GameStoreContext';

const ShortcutsContainer = styled.div`
  position: absolute;
  right: 20px;
  bottom: 40px;
  width: 320px;
  background-color: var(--win95-window-bg);
  ${win95Border('outset')}
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: ${props => props.$visible ? 'block' : 'none'};
`;

const ShortcutsHeader = styled.div`
  background-color: var(--win95-window-header);
  color: white;
  font-weight: bold;
  font-size: 12px;
  padding: 5px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  width: 16px;
  height: 16px;
  background-color: var(--win95-button-face);
  ${win95Border('outset')}
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
  
  &:active {
    ${win95Border('inset')}
  }
`;

const ShortcutsContent = styled.div`
  padding: 10px;
`;

const ShortcutsList = styled.div`
  ${win95Border('inset')}
  background-color: white;
  padding: 8px;
  font-size: 12px;
`;

const ShortcutItem = styled.div`
  display: flex;
  margin-bottom: 6px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ShortcutKey = styled.div`
  ${win95Border('outset')}
  padding: 2px 6px;
  background-color: #f0f0f0;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  margin-right: 10px;
  flex-shrink: 0;
  width: 100px;
  text-align: center;
`;

const ShortcutDescription = styled.div`
  flex-grow: 1;
`;

/**
 * Game keyboard shortcuts component
 * Displays available keyboard shortcuts and handles shortcut functionality
 */
const GameKeyboardShortcuts = ({ 
  onSave,
  onSubmit,
  isSubmitEnabled
}) => {
  const [visible, setVisible] = useState(false);
  
  // Toggle visibility
  const toggleVisible = () => {
    setVisible(!visible);
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Show/hide shortcuts dialog with F1
      if (e.key === 'F1') {
        toggleVisible();
      }
      
      // Save with Ctrl+S
      if (e.ctrlKey && e.key === 's') {
        if (onSave) {
          onSave();
        }
        e.preventDefault();
      }
      
      // Submit with Ctrl+Enter when enabled
      if (e.ctrlKey && e.key === 'Enter') {
        if (isSubmitEnabled && onSubmit) {
          onSubmit();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSave, onSubmit, isSubmitEnabled]);
  
  return (
    <ShortcutsContainer $visible={visible}>
      <ShortcutsHeader>
        <span>Keyboard Shortcuts</span>
        <CloseButton onClick={toggleVisible}>×</CloseButton>
      </ShortcutsHeader>
      
      <ShortcutsContent>
        <ShortcutsList>
          <ShortcutItem>
            <ShortcutKey>F1</ShortcutKey>
            <ShortcutDescription>Show/hide this help</ShortcutDescription>
          </ShortcutItem>
          
          <ShortcutItem>
            <ShortcutKey>Ctrl+S</ShortcutKey>
            <ShortcutDescription>Save game</ShortcutDescription>
          </ShortcutItem>
          
          <ShortcutItem>
            <ShortcutKey>Ctrl+Enter</ShortcutKey>
            <ShortcutDescription>Submit your choice</ShortcutDescription>
          </ShortcutItem>
          
          <ShortcutItem>
            <ShortcutKey>Tab</ShortcutKey>
            <ShortcutDescription>Switch between options and custom input</ShortcutDescription>
          </ShortcutItem>
          
          <ShortcutItem>
            <ShortcutKey>Alt+1..9</ShortcutKey>
            <ShortcutDescription>Select option by number</ShortcutDescription>
          </ShortcutItem>
          
          <ShortcutItem>
            <ShortcutKey>Home</ShortcutKey>
            <ShortcutDescription>Jump to first segment</ShortcutDescription>
          </ShortcutItem>
          
          <ShortcutItem>
            <ShortcutKey>End</ShortcutKey>
            <ShortcutDescription>Jump to latest segment</ShortcutDescription>
          </ShortcutItem>
        </ShortcutsList>
        
        <div style={{ 
          fontSize: '10px', 
          marginTop: '5px',
          textAlign: 'center',
          color: '#808080'
        }}>
          Press F1 any time to show or hide this window
        </div>
      </ShortcutsContent>
    </ShortcutsContainer>
  );
};

export default GameKeyboardShortcuts;