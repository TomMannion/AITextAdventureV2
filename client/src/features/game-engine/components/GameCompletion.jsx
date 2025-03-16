// src/features/game-engine/components/GameCompletion.jsx
import React, { useEffect } from "react";
import styled from "styled-components";
import { win95Border } from "../../../utils/styleUtils";
import useGameState from "../hooks/useGameState";
import useGameNotifications from "../../../hooks/useGameNotifications";
import Text from "../../../components/common/Text";
import Button from "../../../components/common/Button";

const CompletionContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 15px;
  background-color: var(--win95-window-bg);
  overflow: auto;
`;

const CompletionBox = styled.div`
  ${win95Border("outset")}
  padding: 20px;
  margin: 20px auto;
  max-width: 600px;
  background-color: white;
  text-align: center;
`;

const CompletionTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 20px;
  text-align: center;
  border-bottom: 2px solid var(--win95-border-dark);
  padding-bottom: 10px;
`;

const CompletionHeader = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0 20px 0;
  color: var(--win95-window-header);
`;

const IconContainer = styled.div`
  font-size: 48px;
  margin: 20px 0;
`;

const StoryContent = styled.div`
  ${win95Border("inset")}
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
  ${win95Border("outset")}
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
 * Game Completion component - Shown after completing an adventure
 */
const GameCompletion = ({ onNewAdventure, onReturnToMenu }) => {
  const { currentGame, startNewGame, returnToLauncher } = useGameState();
  const { showGameCompletionNotification } = useGameNotifications();

  // Show completion notification when component mounts
  useEffect(() => {
    if (currentGame) {
      // Create adventure stats for the notification
      const stats = {
        turnCount: currentGame.turnCount || 0,
        totalTurns: currentGame.totalTurns || 16,
        customChoices: 0, // This would need to be tracked in your game state
        timeSpent: "Unknown", // You could track this in your game state
      };

      showGameCompletionNotification({
        gameTitle: currentGame.title || "Adventure",
        stats,
        newGameCallback: onNewAdventure || startNewGame,
        viewStatsCallback: null, // Could implement a detailed stats view
      });
    }
  }, [
    currentGame,
    showGameCompletionNotification,
    onNewAdventure,
    startNewGame,
  ]);

  // Format genre name for display
  const formatGenre = (genre) => {
    if (!genre) return "Unknown";
    return genre.charAt(0).toUpperCase() + genre.slice(1);
  };

  // Get genre-specific icon
  const getGenreIcon = (genre) => {
    switch (genre) {
      case "fantasy":
        return "🏆";
      case "scifi":
        return "🏆";
      case "horror":
        return "🏆";
      case "mystery":
        return "🏆";
      case "western":
        return "🏆";
      default:
        return "🏆";
    }
  };

  // Handle new adventure button click
  const handleNewAdventure = () => {
    if (onNewAdventure) {
      onNewAdventure();
    } else {
      startNewGame();
    }
  };

  // Handle return to menu button click
  const handleReturnToMenu = () => {
    if (onReturnToMenu) {
      onReturnToMenu();
    } else {
      returnToLauncher();
    }
  };

  // Get completion summary from the game or generate a default one
  const getSummary = () => {
    if (currentGame?.summary) {
      return currentGame.summary;
    }

    if (currentGame?.endingSummary) {
      // Handle structured summary object if your API returns that
      return typeof currentGame.endingSummary === "string"
        ? currentGame.endingSummary
        : JSON.stringify(currentGame.endingSummary);
    }

    return "You have completed your adventure! Your choices shaped the story and led to this conclusion.";
  };

  return (
    <CompletionContainer>
      <CompletionTitle>Adventure Complete!</CompletionTitle>

      <CompletionBox>
        <CompletionHeader>
          {currentGame?.title || "Your Adventure"}
        </CompletionHeader>

        <IconContainer>{getGenreIcon(currentGame?.genre)}</IconContainer>

        <Text size="14px" margin="0 0 20px 0">
          Congratulations! You have completed your{" "}
          {formatGenre(currentGame?.genre)} adventure.
        </Text>

        <Text size="16px" bold margin="20px 0 10px 0">
          Adventure Summary
        </Text>

        <StoryContent>{getSummary()}</StoryContent>

        <StatsContainer>
          <StatBox>
            <StatValue>{currentGame?.turnCount || 0}</StatValue>
            <StatLabel>Turns Completed</StatLabel>
          </StatBox>

          <StatBox>
            <StatValue>{formatGenre(currentGame?.genre)}</StatValue>
            <StatLabel>Genre</StatLabel>
          </StatBox>

          <StatBox>
            <StatValue>
              {Math.round(
                ((currentGame?.turnCount || 0) /
                  (currentGame?.totalTurns || 16)) *
                  100
              )}
              %
            </StatValue>
            <StatLabel>Completion</StatLabel>
          </StatBox>
        </StatsContainer>

        <Text size="14px">
          Thank you for playing! Would you like to start a new adventure?
        </Text>

        <ButtonContainer>
          <Button primary onClick={handleNewAdventure}>
            New Adventure
          </Button>

          <Button onClick={handleReturnToMenu}>Return to Menu</Button>
        </ButtonContainer>
      </CompletionBox>
    </CompletionContainer>
  );
};

export default GameCompletion;
