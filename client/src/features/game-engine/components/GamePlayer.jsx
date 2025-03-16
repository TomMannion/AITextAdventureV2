// src/features/game-engine/components/GamePlayer.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import useGameState from "../hooks/useGameState";
import { win95Border } from "../../../utils/styleUtils";

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
`;

const ToolbarButton = styled.button`
  background-color: var(--win95-window-bg);
  border: 2px solid var(--win95-border-darker);
  border-top-color: var(--win95-border-light);
  border-left-color: var(--win95-border-light);
  padding: 2px 8px;
  font-size: 12px;
  cursor: pointer;

  &:active {
    border-top-color: var(--win95-border-darker);
    border-left-color: var(--win95-border-darker);
    border-bottom-color: var(--win95-border-light);
    border-right-color: var(--win95-border-light);
    padding: 3px 7px 1px 9px;
  }
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
  white-space: pre-line; /* Preserve line breaks in story content */
`;

const ChoicesPanel = styled.div`
  padding: 10px;
  border-top: 1px solid var(--win95-border-darker);
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

const SubmitButton = styled.button`
  background-color: var(--win95-window-bg);
  border: 2px solid var(--win95-border-darker);
  border-top-color: var(--win95-border-light);
  border-left-color: var(--win95-border-light);
  padding: 5px 10px;
  font-weight: bold;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    border-top-color: var(--win95-border-darker);
    border-left-color: var(--win95-border-darker);
    border-bottom-color: var(--win95-border-light);
    border-right-color: var(--win95-border-light);
    padding: 6px 9px 4px 11px;
  }
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

const Placeholder = styled.div`
  padding: 20px;
  text-align: center;
  color: #666;
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
  ${win95Border("outset")}
  background-color: var(--win95-window-bg);
  padding: 20px;
  text-align: center;
  min-width: 200px;
`;

const ErrorBox = styled.div`
  margin: 20px;
  padding: 15px;
  border: 1px solid #ff0000;
  background-color: #fff0f0;
  color: #ff0000;
  text-align: center;
`;

/**
 * GamePlayer component - Handles the main game interaction screen
 */
const GamePlayer = () => {
  const {
    currentGame,
    currentSegment,
    options,
    segments,
    selectedOption,
    customOption,
    error,
    status,
    setSelectedOption,
    setCustomOption,
    submitChoice,
    saveGame,
    returnToLauncher,
  } = useGameState();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameLog, setGameLog] = useState([]);
  const [statusMessage, setStatusMessage] = useState(
    "Ready for your next action"
  );

  // Initialize game log with segments when component mounts or segments change
  useEffect(() => {
    if (segments && segments.length > 0) {
      const logEntries = segments.map((segment) => ({
        text: segment.content.substring(0, 50) + "...", // Just show a preview
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
      // Submit the choice
      const result = await submitChoice(selectedOption, customOption);

      if (result) {
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

        // Show notification for significant story events if needed
        if (result.isSignificantEvent) {
          try {
            import("../../../hooks/useGameNotifications").then((module) => {
              const useGameNotifications = module.default;
              const { showAchievementNotification } = useGameNotifications();
              showAchievementNotification({
                title: "Story Progress",
                message:
                  "You've reached a significant point in your adventure!",
                gameId: currentGame?.id,
              });
            });
          } catch (err) {
            console.error("Failed to import notification hook:", err);
          }
        }

        setStatusMessage("What will you do next?");
      } else {
        setStatusMessage("Failed to process your choice. Try again.");
      }
    } catch (err) {
      console.error("Error submitting choice:", err);
      setStatusMessage("An error occurred. Please try again.");

      // Show error notification
      try {
        import("../../../hooks/useGameNotifications").then((module) => {
          const useGameNotifications = module.default;
          const { showErrorWithRetry } = useGameNotifications();
          showErrorWithRetry({
            title: "Action Failed",
            message: "Failed to process your action. Please try again.",
            operation: "submit_choice",
            retryCallback: () => handleSubmitChoice(),
          });
        });
      } catch (err) {
        console.error("Failed to import notification hook:", err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle save game
   */
  const handleSaveGame = async () => {
    setStatusMessage("Saving game...");
    const success = await saveGame();
    setStatusMessage(
      success ? "Game saved successfully" : "Failed to save game"
    );

    if (success) {
      // Use notification service to show save notification
      try {
        import("../../../hooks/useGameNotifications").then((module) => {
          const useGameNotifications = module.default;
          const { showManualSaveNotification } = useGameNotifications();
          showManualSaveNotification({
            gameId: currentGame?.id,
            timestamp: new Date(),
          });
        });
      } catch (err) {
        console.error("Failed to import notification hook:", err);
      }

      setGameLog((prev) => [
        ...prev,
        {
          text: "Game saved",
          type: "system",
          timestamp: new Date(),
        },
      ]);
    }
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

  // Show loading overlay if status is loading
  if (status === "loading") {
    return (
      <PlayerContainer>
        <LoadingOverlay>
          <LoadingBox>
            <p>Processing your adventure...</p>
            <ProgressBar $progress={`100%`} />
          </LoadingBox>
        </LoadingOverlay>
        <MainSection>
          {/* Keep the layout while loading */}
          <Placeholder>Loading your adventure...</Placeholder>
        </MainSection>
      </PlayerContainer>
    );
  }

  // Show error if game could not be loaded
  if (error && !currentSegment) {
    return (
      <PlayerContainer>
        <Toolbar>
          <ToolbarButton onClick={returnToLauncher}>Back</ToolbarButton>
        </Toolbar>
        <ErrorBox>
          <p>Error: {error}</p>
          <ToolbarButton onClick={returnToLauncher}>
            Return to Main Menu
          </ToolbarButton>
        </ErrorBox>
      </PlayerContainer>
    );
  }

  return (
    <PlayerContainer>
      {isSubmitting && (
        <LoadingOverlay>
          <LoadingBox>
            <p>Processing your choice...</p>
            <ProgressBar $progress={`100%`} />
          </LoadingBox>
        </LoadingOverlay>
      )}

      <Toolbar>
        <ToolbarButton onClick={returnToLauncher}>Back</ToolbarButton>
        <ToolbarButton onClick={handleSaveGame}>Save</ToolbarButton>
        <ToolbarButton>Help</ToolbarButton>
      </Toolbar>

      <MainSection>
        <StoryPanel>
          <StoryTitle>{currentGame?.title || "Text Adventure"}</StoryTitle>

          <StoryContent>
            {currentSegment ? (
              <div>
                <p>{currentSegment.content}</p>
              </div>
            ) : (
              <Placeholder>Loading story content...</Placeholder>
            )}
          </StoryContent>

          <ChoicesPanel>
            <ChoicesList>
              {options && options.length > 0 ? (
                options.map((option) => (
                  <ChoiceButton
                    key={option.id}
                    $selected={selectedOption === option.id}
                    onClick={() => setSelectedOption(option.id)}
                  >
                    {option.text}
                  </ChoiceButton>
                ))
              ) : (
                <Placeholder>No options available</Placeholder>
              )}
            </ChoicesList>

            <CustomChoiceSection>
              <CustomChoiceInput
                placeholder="Or write your own action..."
                value={customOption}
                onChange={(e) => setCustomOption(e.target.value)}
                disabled={isSubmitting}
              />
              <SubmitButton
                onClick={handleSubmitChoice}
                disabled={
                  isSubmitting || (!selectedOption && !customOption.trim())
                }
              >
                Continue
              </SubmitButton>
            </CustomChoiceSection>
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
            {gameLog.length > 0 ? (
              gameLog.map((log, index) => (
                <LogEntry key={index} $type={log.type}>
                  [{formatDate(log.timestamp)}] {log.text}
                </LogEntry>
              ))
            ) : (
              <Placeholder>Your adventure log is empty</Placeholder>
            )}
          </GameLog>

          <StatusBar>{statusMessage}</StatusBar>
        </SidePanel>
      </MainSection>
    </PlayerContainer>
  );
};

export default GamePlayer;
