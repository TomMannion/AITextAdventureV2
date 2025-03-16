// src/features/game-engine/components/GameCreationSuccess.jsx
import React, { useEffect } from "react";
import styled from "styled-components";
import { win95Border } from "../../../utils/styleUtils";
import useGameState from "../hooks/useGameState";
import Text from "../../../components/common/Text";
import Button from "../../../components/common/Button";

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 15px;
  background-color: var(--win95-window-bg);
  overflow: auto;
`;

const SuccessBox = styled.div`
  ${win95Border("outset")}
  padding: 20px;
  margin: 20px auto;
  max-width: 600px;
  background-color: white;
  text-align: center;
`;

const SuccessTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 20px;
  text-align: center;
  border-bottom: 2px solid var(--win95-border-dark);
  padding-bottom: 10px;
`;

const IconContainer = styled.div`
  font-size: 48px;
  margin: 20px 0;
`;

const GameDetails = styled.div`
  ${win95Border("inset")}
  padding: 15px;
  margin: 20px 0;
  background-color: #f0f0f0;
  text-align: left;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  font-weight: bold;
`;

const DetailValue = styled.span`
  text-align: right;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
`;

/**
 * Game Creation Success component - Shown after successfully creating a game
 */
const GameCreationSuccess = ({ onStartAdventure, onCreateAnother }) => {
  const { currentGame, setStatus } = useGameState();

  // Route the user to the game player if they attempt to navigate back
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      if (onStartAdventure) onStartAdventure();
      return false;
    };

    // Listen for navigation attempts
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [onStartAdventure]);

  // Format genre name for display
  const formatGenre = (genre) => {
    if (!genre) return "Unknown";
    return genre.charAt(0).toUpperCase() + genre.slice(1);
  };

  // Get genre-specific icon
  const getGenreIcon = (genre) => {
    switch (genre) {
      case "fantasy":
        return "🧙";
      case "scifi":
        return "🚀";
      case "horror":
        return "👻";
      case "mystery":
        return "🔍";
      case "western":
        return "🤠";
      default:
        return "📖";
    }
  };

  // Handle start adventure button click
  const handleStartAdventure = () => {
    if (onStartAdventure) {
      onStartAdventure();
    } else {
      setStatus("playing");
    }
  };

  // Handle create another button click
  const handleCreateAnother = () => {
    if (onCreateAnother) {
      onCreateAnother();
    } else {
      setStatus("creating");
    }
  };

  return (
    <SuccessContainer>
      <SuccessTitle>Adventure Created Successfully</SuccessTitle>

      <SuccessBox>
        <Text size="18px" bold>
          {currentGame?.title || "Your New Adventure"}
        </Text>

        <IconContainer>{getGenreIcon(currentGame?.genre)}</IconContainer>

        <Text size="14px" margin="0 0 20px 0">
          Your {formatGenre(currentGame?.genre)} adventure has been created and
          is ready to begin!
        </Text>

        <GameDetails>
          <DetailRow>
            <DetailLabel>Genre:</DetailLabel>
            <DetailValue>{formatGenre(currentGame?.genre)}</DetailValue>
          </DetailRow>

          <DetailRow>
            <DetailLabel>Length:</DetailLabel>
            <DetailValue>{currentGame?.totalTurns || 16} turns</DetailValue>
          </DetailRow>

          <DetailRow>
            <DetailLabel>Status:</DetailLabel>
            <DetailValue>Ready to start</DetailValue>
          </DetailRow>

          <DetailRow>
            <DetailLabel>Created:</DetailLabel>
            <DetailValue>
              {currentGame?.createdAt
                ? new Date(currentGame.createdAt).toLocaleString()
                : new Date().toLocaleString()}
            </DetailValue>
          </DetailRow>
        </GameDetails>

        <Text size="14px">
          Are you ready to embark on this adventure? Your choices will shape the
          story!
        </Text>

        <ButtonContainer>
          <Button primary onClick={handleStartAdventure}>
            Start Adventure
          </Button>

          <Button onClick={handleCreateAnother}>Create Another</Button>
        </ButtonContainer>
      </SuccessBox>
    </SuccessContainer>
  );
};

export default GameCreationSuccess;
