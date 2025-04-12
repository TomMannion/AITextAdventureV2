// src/features/game-engine/components/GamePlayer.jsx
import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useGameState, useGameActions } from '../context/GameFlowContext'
import Button from '../../../components/common/Button';
import Text from '../../../components/common/Text';
import { useNotification } from '../../../contexts/NotificationContext';

// Styled components
const PlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--win95-window-bg);
  overflow: hidden;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 5px;
  padding: 5px;
  border-bottom: 1px solid var(--win95-border-darker);
  background-color: var(--win95-window-bg);
`;

const MainSection = styled.div`
  display: flex;
  flex-grow: 1;
  overflow: hidden;
`;

const StoryPanel = styled.div`
  flex: 3;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--win95-border-darker);
  overflow: hidden;
`;

const StoryTitle = styled.div`
  padding: 5px 10px;
  background-color: var(--win95-window-header);
  color: white;
  font-weight: bold;
  border-bottom: 1px solid var(--win95-border-darker);
`;

const StoryContent = styled.div`
  flex-grow: 1;
  padding: 15px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-line;
  background-color: white;
`;

const StorySegment = styled.div`
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: ${(props) => (props.$isLatest ? "none" : "1px dashed #ccc")};
`;

const ChoicesPanel = styled.div`
  padding: 10px;
  border-top: 1px solid var(--win95-border-darker);
  background-color: var(--win95-window-bg);
`;

const ChoicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ChoiceButton = styled.button`
  text-align: left;
  padding: 8px 10px;
  border: 1px solid var(--win95-border-darker);
  background-color: ${(props) =>
    props.$selected ? "var(--win95-window-header)" : "white"};
  color: ${(props) => (props.$selected ? "white" : "black")};
  cursor: pointer;

  &:hover {
    background-color: ${(props) =>
      props.$selected ? "var(--win95-window-header)" : "#f0f0f0"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CustomChoiceSection = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed var(--win95-border-darker);
`;

const CustomChoiceInput = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid var(--win95-border-darker);
`;

const SidePanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #e0e0e0;
  overflow: hidden;
`;

const CharacterInfo = styled.div`
  padding: 10px;
  border-bottom: 1px solid var(--win95-border-darker);
`;

const InfoTitle = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--win95-border-darker);
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;
`;

const ProgressBar = styled.div`
  height: 10px;
  width: 100%;
  background-color: #d4d0c8;
  border: 1px solid var(--win95-border-darker);
  margin-top: 5px;
  position: relative;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${(props) => props.$progress || "0%"};
    background-color: var(--win95-window-header);
  }
`;

const GameLog = styled.div`
  flex-grow: 1;
  padding: 10px;
  border-bottom: 1px solid var(--win95-border-darker);
  overflow-y: auto;
`;

const LogEntry = styled.div`
  margin-bottom: 5px;
  font-size: 12px;
  color: ${(props) =>
    props.$type === "system"
      ? "#800000"
      : props.$type === "choice"
      ? "#000080"
      : "#000000"};
`;

const StatusBar = styled.div`
  padding: 5px 10px;
  font-size: 12px;
  border-top: 1px solid var(--win95-border-light);
  background-color: #d4d0c8;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const LoadingBox = styled.div`
  background-color: var(--win95-window-bg);
  padding: 20px;
  text-align: center;
  min-width: 200px;
  border: 2px solid var(--win95-border-darker);
`;

/**
 * Game Player component - Handles the main game interaction screen
 */
function GamePlayer() {
  // Get game state and actions
  const { 
    currentGame, 
    currentSegment,
    segments, 
    options, 
    selectedOption,
    customOption,
    loadingProgress
  } = useGameState();
  
  const { 
    submitChoice, 
    selectOption,
    setCustomOption,
    saveGame,
    returnToLauncher
  } = useGameActions();
  
  const { showInfo } = useNotification();
  
  // State for UI components
  const [showAllSegments, setShowAllSegments] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState("Ready for your next action");
  const [gameLog, setGameLog] = React.useState([]);
  
  // Ref for scrolling
  const contentRef = useRef(null);
  
  // Scroll to bottom when new segments are added
  useEffect(() => {
    if (contentRef.current && currentSegment) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [currentSegment]);
  
  // Initialize game log with segments
  useEffect(() => {
    if (segments.length > 0) {
      const logEntries = segments.map((segment) => ({
        text: segment.content.substring(0, 50) + "...",
        type: "story",
        timestamp: new Date(segment.createdAt || Date.now()),
      }));
      
      setGameLog(logEntries);
    }
  }, [segments]);
  
  // Handle submission of choice
  const handleSubmitChoice = async () => {
    if (isSubmitting) return;
    
    if (!selectedOption && !customOption.trim()) {
      setStatusMessage("Please select an option or enter your own action");
      return;
    }
    
    setIsSubmitting(true);
    setStatusMessage("Processing your choice...");
    
    try {
      // Prepare choice data
      const choiceData = selectedOption 
        ? { optionId: selectedOption }
        : { customText: customOption.trim() };
      
      // Add the choice to the log
      const choiceText = selectedOption
        ? options.find((opt) => opt.id === selectedOption)?.text
        : customOption;
      
      setGameLog((prev) => [
        ...prev,
        {
          text: `You chose: ${choiceText}`,
          type: "choice",
          timestamp: new Date(),
        },
      ]);
      
      // Submit the choice
      await submitChoice(currentGame.id, choiceData);
      setStatusMessage("What will you do next?");
    } catch (error) {
      console.error("Error submitting choice:", error);
      setStatusMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle save game
  const handleSaveGame = async () => {
    setStatusMessage("Saving game...");
    const success = await saveGame(currentGame.id);
    
    if (success) {
      setStatusMessage("Game saved successfully");
      showInfo("Game progress saved", {
        title: "Save Complete",
        timeout: 2000,
      });
      
      setGameLog((prev) => [
        ...prev,
        {
          text: "Game saved",
          type: "system",
          timestamp: new Date(),
        },
      ]);
    } else {
      setStatusMessage("Failed to save game");
    }
  };
  
  // Toggle between showing only the current segment or all segments
  const toggleSegmentView = () => {
    setShowAllSegments((prev) => !prev);
  };
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    if (typeof date === "string") date = new Date(date);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  
  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!currentGame) return 0;
    const { turnCount = 0, totalTurns = 16 } = currentGame;
    return Math.min(100, Math.max(0, (turnCount / totalTurns) * 100));
  };
  
  // Determine what segments to show
  const segmentsToShow = showAllSegments
    ? segments
    : currentSegment
    ? [currentSegment]
    : [];
  
  return (
    <PlayerContainer>
      {isSubmitting && (
        <LoadingOverlay>
          <LoadingBox>
            <p>Processing your choice...</p>
            <ProgressBar $progress={`${loadingProgress}%`} />
          </LoadingBox>
        </LoadingOverlay>
      )}

      <Toolbar>
        <Button onClick={returnToLauncher}>Back</Button>
        <Button
          onClick={handleSaveGame}
          disabled={!currentSegment || isSubmitting}
        >
          Save
        </Button>
        <Button
          onClick={toggleSegmentView}
          disabled={!segments || segments.length <= 1}
        >
          {showAllSegments ? "Show Current Only" : "Show All Segments"}
        </Button>
      </Toolbar>

      <MainSection>
        <StoryPanel>
          <StoryTitle>{currentGame?.title || "Text Adventure"}</StoryTitle>

          <StoryContent ref={contentRef}>
            {segmentsToShow.map((segment, index) => (
              <StorySegment
                key={segment.id || index}
                $isLatest={index === segmentsToShow.length - 1}
              >
                {segment.content}
              </StorySegment>
            ))}
          </StoryContent>

          <ChoicesPanel>
            {currentSegment ? (
              <>
                <ChoicesList>
                  {options && options.length > 0 ? (
                    options.map((option) => (
                      <ChoiceButton
                        key={option.id}
                        $selected={selectedOption === option.id}
                        onClick={() => selectOption(option.id)}
                        disabled={isSubmitting}
                      >
                        {option.text}
                      </ChoiceButton>
                    ))
                  ) : (
                    <Text size="12px" align="center">Loading options...</Text>
                  )}
                </ChoicesList>

                <CustomChoiceSection>
                  <CustomChoiceInput
                    placeholder="Or write your own action..."
                    value={customOption}
                    onChange={(e) => setCustomOption(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <Button
                    onClick={handleSubmitChoice}
                    disabled={isSubmitting || (!selectedOption && !customOption.trim())}
                  >
                    Continue
                  </Button>
                </CustomChoiceSection>
              </>
            ) : (
              <Text size="12px" align="center">Waiting for story to begin...</Text>
            )}
          </ChoicesPanel>
        </StoryPanel>

        <SidePanel>
          <CharacterInfo>
            <InfoTitle>Adventure Stats</InfoTitle>
            <InfoRow>
              <span>Genre:</span>
              <span>
                {currentGame?.genre
                  ? currentGame.genre.charAt(0).toUpperCase() +
                    currentGame.genre.slice(1)
                  : "Unknown"}
              </span>
            </InfoRow>
            <InfoRow>
              <span>Progress:</span>
              <span>
                {currentGame?.turnCount || 0} / {currentGame?.totalTurns || 16}
              </span>
            </InfoRow>
            <ProgressBar $progress={`${getProgressPercentage()}%`} />
          </CharacterInfo>

          <GameLog>
            <InfoTitle>Adventure Log</InfoTitle>
            {gameLog.map((log, index) => (
              <LogEntry key={index} $type={log.type}>
                [{formatDate(log.timestamp)}] {log.text}
              </LogEntry>
            ))}
          </GameLog>

          <StatusBar>{statusMessage}</StatusBar>
        </SidePanel>
      </MainSection>
    </PlayerContainer>
  );
}

export default GamePlayer;