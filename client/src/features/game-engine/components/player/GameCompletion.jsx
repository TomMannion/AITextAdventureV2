import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useGameFlow } from '../../contexts/GameFlowContext';
import { useGameData } from '../../contexts/GameDataContext';
import { win95Border } from '../../../../utils/styleUtils';
import { getGenreIcon } from '../../../../utils/iconUtils';
import useGameNotifications from '../../../../hooks/useGameNotifications';
import Button from '../../../../components/common/Button';

const CompletionContainer = styled.div`
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

const CompletionBox = styled.div`
  ${win95Border('outset')}
  padding: 20px;
  margin: 20px auto;
  max-width: 600px;
  width: 100%;
  background-color: white;
  text-align: center;
`;

const CompletionHeader = styled.h3`
  font-size: 18px;
  margin-bottom: 20px;
  color: var(--win95-window-header);
`;

const IconContainer = styled.div`
  font-size: 48px;
  margin: 20px 0;
  
  img {
    width: 64px;
    height: 64px;
  }
`;

const StoryContent = styled.div`
  ${win95Border('inset')}
  padding: 15px;
  margin: 20px 0;
  background-color: #f0f0f0;
  text-align: left;
  max-height: 200px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-line;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin: 30px 0;
  flex-wrap: wrap;
`;

const StatBox = styled.div`
  ${win95Border('outset')}
  padding: 15px;
  margin: 10px;
  width: 150px;
  text-align: center;
  background-color: #f0f0f0;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: var(--win95-window-header);
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 12px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
`;

/**
 * Game completion screen component - shown after completing an adventure
 * 
 * @param {Object} props Component props
 * @param {Object} props.game Game data
 */
const GameCompletion = ({ game }) => {
  const { goToLauncher, goToCreator } = useGameFlow();
  const { showGameCompletionNotification } = useGameNotifications();
  
  // Show completion notification when component mounts
  useEffect(() => {
    if (game) {
      // Create adventure stats for the notification
      const stats = {
        turnCount: game.turnCount || 0,
        totalTurns: game.totalTurns || 16,
        customChoices: 0, // Not tracked in current implementation
        timeSpent: 'Unknown', // Not tracked in current implementation
      };
      
      showGameCompletionNotification({
        gameTitle: game.title || 'Adventure',
        stats,
        newGameCallback: goToCreator,
        viewStatsCallback: null,
      });
    }
  }, [game, showGameCompletionNotification, goToCreator]);
  
  // Format genre name for display
  const formatGenre = (genre) => {
    if (!genre) return 'Unknown';
    return genre.charAt(0).toUpperCase() + genre.slice(1);
  };
  
  // Handle new adventure button click
  const handleNewAdventure = () => {
    goToCreator();
  };
  
  // Handle return to menu button click
  const handleReturnToMenu = () => {
    goToLauncher();
  };
  
  // Get completion summary
  const getSummary = () => {
    if (!game) return '';
    
    if (game.summary) {
      return game.summary;
    }
    
    if (game.endingSummary) {
      return typeof game.endingSummary === 'string'
        ? game.endingSummary
        : JSON.stringify(game.endingSummary);
    }
    
    return 'You have completed your adventure! Your choices shaped the story and led to this conclusion.';
  };
  
  if (!game) {
    return (
      <CompletionContainer>
        <Title>Adventure Complete</Title>
        <CompletionBox>
          <CompletionHeader>No game data available</CompletionHeader>
          <ButtonContainer>
            <Button onClick={handleReturnToMenu}>Return to Menu</Button>
          </ButtonContainer>
        </CompletionBox>
      </CompletionContainer>
    );
  }
  
  return (
    <CompletionContainer>
      <Title>Adventure Complete!</Title>
      
      <CompletionBox>
        <CompletionHeader>
          {game.title || 'Your Adventure'}
        </CompletionHeader>
        
        <IconContainer>
          <img src={getGenreIcon(game.genre)} alt={formatGenre(game.genre)} />
        </IconContainer>
        
        <p>
          Congratulations! You have completed your {formatGenre(game.genre)} adventure.
        </p>
        
        <h4 style={{ margin: '20px 0 10px 0' }}>Adventure Summary</h4>
        
        <StoryContent>{getSummary()}</StoryContent>
        
        <StatsContainer>
          <StatBox>
            <StatValue>{game.turnCount || 0}</StatValue>
            <StatLabel>Turns Completed</StatLabel>
          </StatBox>
          
          <StatBox>
            <StatValue>{formatGenre(game.genre)}</StatValue>
            <StatLabel>Genre</StatLabel>
          </StatBox>
          
          <StatBox>
            <StatValue>
              {Math.round(
                ((game.turnCount || 0) / (game.totalTurns || 16)) * 100
              )}%
            </StatValue>
            <StatLabel>Completion</StatLabel>
          </StatBox>
        </StatsContainer>
        
        <p>
          Thank you for playing! Would you like to start a new adventure?
        </p>
        
        <ButtonContainer>
          <Button primary onClick={handleNewAdventure}>
            New Adventure
          </Button>
          
          <Button onClick={handleReturnToMenu}>
            Return to Menu
          </Button>
        </ButtonContainer>
      </CompletionBox>
    </CompletionContainer>
  );
};

export default GameCompletion;