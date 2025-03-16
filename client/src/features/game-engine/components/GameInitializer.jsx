// src/features/game-engine/components/GameInitializer.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { win95Border } from "../../../utils/styleUtils";
import useGameState from "../hooks/useGameState";
import useGameNotifications from "../../../hooks/useGameNotifications";
import Text from "../../../components/common/Text";
import Button from "../../../components/common/Button";

const InitializerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  background-color: var(--win95-window-bg);
`;

const InitializerBox = styled.div`
  ${win95Border("outset")}
  background-color: var(--win95-window-bg);
  padding: 20px;
  max-width: 500px;
  width: 100%;
`;

const InitializerTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 20px;
  text-align: center;
  border-bottom: 2px solid var(--win95-border-dark);
  padding-bottom: 10px;
`;

const ProgressContainer = styled.div`
  margin: 20px 0;
  text-align: center;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: this.20px;
  position: relative;
  border: 1px solid var(--win95-border-darker);
  background-color: white;
  margin: 15px 0;

  &::after {
    content: "";
    position: absolute;
    height: 100%;
    width: ${(props) => props.$progress || "0%"};
    background-color: var(--win95-window-header);
    transition: width 0.3s;
  }
`;

const StatusMessage = styled.div`
  margin: 15px 0;
  text-align: center;
  min-height: 60px;
`;

const ErrorBox = styled.div`
  margin: 15px 0;
  padding: 10px;
  border: 1px solid #ff0000;
  background-color: #fff0f0;
  color: #ff0000;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
`;

/**
 * Game Initializer component - Handles the initialization of a new or existing game
 * Used as a transition screen when generating initial story content
 */
const GameInitializer = ({ gameId, onComplete, onError, onCancel }) => {
  const {
    startLoadedGame,
    status,
    error,
    loadingProgress,
    currentGame,
    apiKey,
    validateApiKey,
  } = useGameState();

  const { showAchievementNotification, showErrorWithRetry } =
    useGameNotifications();

  const [initPhase, setInitPhase] = useState("preparing"); // preparing, initializing, complete, error
  const [statusText, setStatusText] = useState("Preparing your adventure...");
  const [localProgress, setLocalProgress] = useState(0);
  const [initAttempts, setInitAttempts] = useState(0);

  // Effect to handle game initialization
  useEffect(() => {
    // Skip if no gameId, still preparing, or already completed/errored
    if (!gameId || initPhase === "complete" || initPhase === "error") {
      return;
    }

    // Check API key before proceeding
    if (!validateApiKey()) {
      setInitPhase("error");
      setStatusText("API key is required to create your adventure");
      if (onError) onError("API key is required");
      return;
    }

    // Only proceed if we're preparing or explicitly initializing
    if (initPhase === "preparing") {
      setInitPhase("initializing");
      setStatusText("Generating your adventure...");

      // Start progress simulation
      const progressInterval = setInterval(() => {
        setLocalProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      // Attempt to initialize the game
      const initGame = async () => {
        try {
          setInitAttempts((prev) => prev + 1);
          setStatusText("Creating your adventure world...");

          // Call the API to generate the initial story
          const result = await startLoadedGame(gameId);

          clearInterval(progressInterval);

          if (result) {
            setLocalProgress(100);
            setStatusText("Adventure ready! Entering the story...");
            setInitPhase("complete");

            // Show achievement notification
            showAchievementNotification({
              title: "Adventure Begins",
              message: `Your ${
                currentGame?.genre || ""
              } adventure awaits! What path will you choose?`,
              gameId: gameId,
            });

            // Notify parent component that initialization is complete
            if (onComplete) setTimeout(() => onComplete(result), 500);
          } else {
            throw new Error("Failed to initialize game - no result returned");
          }
        } catch (err) {
          clearInterval(progressInterval);
          console.error("Failed to initialize game:", err);
          setStatusText(`Error: ${err.message || "Failed to initialize game"}`);
          setInitPhase("error");

          if (onError) onError(err);
        }
      };

      // Start the initialization process
      initGame();

      // Cleanup function
      return () => {
        clearInterval(progressInterval);
      };
    }
  }, [
    gameId,
    initPhase,
    startLoadedGame,
    currentGame,
    onComplete,
    onError,
    validateApiKey,
    apiKey,
    showAchievementNotification,
  ]);

  // Handle retry button click
  const handleRetry = () => {
    // Reset state and try again
    setInitPhase("preparing");
    setLocalProgress(0);
    setStatusText("Preparing your adventure...");
  };

  // Handle cancel button click
  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  // Show appropriate progress - use context progress if available, otherwise local
  const displayProgress =
    status === "loading" ? loadingProgress : localProgress;

  // Show appropriate error message
  const errorMessage = error || (initPhase === "error" ? statusText : "");

  return (
    <InitializerContainer>
      <InitializerBox>
        <InitializerTitle>
          {initPhase === "error"
            ? "Adventure Creation Failed"
            : initPhase === "complete"
            ? "Adventure Ready!"
            : "Creating Your Adventure"}
        </InitializerTitle>

        <ProgressContainer>
          <Text size="14px" margin="0 0 10px 0">
            {statusText}
          </Text>

          <ProgressBar $progress={`${Math.round(displayProgress)}%`} />

          <Text size="12px" color="#666">
            {initPhase === "initializing"
              ? "Please wait while we craft your unique adventure..."
              : initPhase === "complete"
              ? "Your journey awaits!"
              : initPhase === "error"
              ? "We encountered an issue creating your adventure."
              : "Preparing your adventure..."}
          </Text>
        </ProgressContainer>

        <StatusMessage>
          {initPhase === "initializing" && initAttempts > 1 && (
            <Text size="12px" color="#666">
              Attempt {initAttempts}: Generating story content...
            </Text>
          )}

          {initPhase === "complete" && (
            <Text size="14px" color="#008000">
              Success! Your adventure is ready to begin.
            </Text>
          )}

          {initPhase === "error" && (
            <ErrorBox>
              {errorMessage ||
                "An error occurred while creating your adventure."}
            </ErrorBox>
          )}
        </StatusMessage>

        {(initPhase === "error" || initPhase === "complete") && (
          <ButtonContainer>
            {initPhase === "error" && (
              <>
                <Button onClick={handleRetry}>Retry</Button>
                <Button onClick={handleCancel}>Cancel</Button>
              </>
            )}

            {initPhase === "complete" && !onComplete && (
              <Button primary onClick={handleCancel}>
                Continue
              </Button>
            )}
          </ButtonContainer>
        )}
      </InitializerBox>
    </InitializerContainer>
  );
};

export default GameInitializer;
