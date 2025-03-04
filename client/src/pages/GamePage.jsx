// src/pages/GamePage.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gameAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import DebugPanel from "../components/DebugPanel";
import StoryViewer from "../components/StoryViewer";

const GamePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { apiSettings } = useAuth();
  const [showDebug, setShowDebug] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);

  // Fetch game details
  const {
    data: game,
    isLoading: gameLoading,
    error: gameError,
  } = useQuery({
    queryKey: ["game", id],
    queryFn: () => gameAPI.getById(id).then((res) => res.data),
  });

  // Fetch story state
  const {
    data: storyState,
    isLoading: storyLoading,
    error: storyError,
    refetch: refetchStory,
  } = useQuery({
    queryKey: ["storyState", id],
    queryFn: () => gameAPI.getStoryState(id).then((res) => res.data),
    enabled: !!game, // Only run if game data is loaded
  });

  // Check if API key is available
  const hasApiKey = !!apiSettings.apiKey;

  // Start story mutation
  const startStoryMutation = useMutation({
    mutationFn: () => {
      if (!hasApiKey) {
        throw new Error("API key is required");
      }
      return gameAPI.startStory(id, {
        provider: apiSettings.preferredProvider,
        modelId: apiSettings.preferredModel,
      });
    },
    onSuccess: () => {
      setApiError(null);
      queryClient.invalidateQueries({ queryKey: ["storyState", id] });
      queryClient.invalidateQueries({ queryKey: ["game", id] });
    },
    onError: (error) => {
      setApiError(
        error.response?.data?.message ||
          error.message ||
          "Failed to start story"
      );
    },
  });

  // Make choice mutation
  const makeChoiceMutation = useMutation({
    mutationFn: (optionId) => {
      if (!hasApiKey) {
        throw new Error("API key is required");
      }
      return gameAPI.makeChoice(
        id,
        { optionId },
        {
          provider: apiSettings.preferredProvider,
          modelId: apiSettings.preferredModel,
        }
      );
    },
    onSuccess: () => {
      setApiError(null);
      queryClient.invalidateQueries({ queryKey: ["storyState", id] });
      queryClient.invalidateQueries({ queryKey: ["game", id] });
    },
    onError: (error) => {
      setApiError(
        error.response?.data?.message ||
          error.message ||
          "Failed to process choice"
      );
    },
  });

  const handleStartStory = () => {
    if (!hasApiKey) {
      setApiError(
        "API key is required. Please set your API key in the settings."
      );
      return;
    }
    startStoryMutation.mutate();
  };

  const handleChoiceSelected = (optionId) => {
    if (!hasApiKey) {
      setApiError(
        "API key is required. Please set your API key in the settings."
      );
      return;
    }
    makeChoiceMutation.mutate(optionId);
  };

  // Function to handle segment selection for StoryViewer
  const handleSegmentSelect = (segment) => {
    setSelectedSegment(segment);
  };

  // Function to close the StoryViewer
  const handleCloseViewer = () => {
    setSelectedSegment(null);
  };

  if (gameLoading || storyLoading) {
    return <div className="loading">Loading adventure...</div>;
  }

  if (gameError) {
    return (
      <div className="error-container">
        <div className="error-message">
          Error loading game: {gameError.message}
        </div>
        <button type="button" onClick={() => navigate("/")}>
          Back to Games
        </button>
      </div>
    );
  }

  const currentSegment = storyState?.currentSegment;
  const items = storyState?.items || [];
  const characters = storyState?.characters || [];

  // Get previous segments, excluding the current one
  const previousSegments =
    game?.storySegments?.filter(
      (segment) => segment.id !== currentSegment?.id
    ) || [];

  // Sort them by sequence number
  previousSegments.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>{game?.title}</h1>
        <div className="game-meta">
          <span>Genre: {game?.genre}</span>
          <span>Turn: {game?.turnCount}</span>
          <span>Stage: {game?.narrativeStage}</span>
          <span>Provider: {apiSettings.preferredProvider}</span>
          {apiSettings.preferredModel && (
            <span>Model: {apiSettings.preferredModel.split("/").pop()}</span>
          )}
          <button
            type="button"
            className="debug-toggle"
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? "Hide Debug" : "Show Debug"}
          </button>
        </div>
      </div>

      {apiError && (
        <div className="error-message api-error">
          <strong>API Error:</strong> {apiError}
        </div>
      )}

      {!hasApiKey && (
        <div className="warning-message">
          <strong>Warning:</strong> You need to set an API key in the settings
          to use the text generation features.
        </div>
      )}

      {showDebug && <DebugPanel data={storyState} title="Story State" />}

      <div className="game-main-content">
        <div className="game-story-column">
          {/* Show previous segments in a scrollable container */}
          {previousSegments.length > 0 && (
            <div className="story-history-container">
              <h3 className="history-heading">Previous Story</h3>
              <div className="story-history-scrollable">
                {previousSegments.map((segment) => (
                  <div
                    key={segment.id}
                    className="history-segment"
                    onClick={() => handleSegmentSelect(segment)}
                  >
                    <div className="history-segment-header">
                      <div className="segment-number">
                        {segment.sequenceNumber || "?"}
                      </div>
                      <div className="segment-location">
                        {segment.locationContext || "Unknown location"}
                      </div>
                    </div>
                    <div className="segment-content">
                      <p className="segment-text">
                        {segment.content.length > 120
                          ? segment.content.substring(0, 120) + "..."
                          : segment.content}
                      </p>
                      {segment.userChoice && (
                        <div className="segment-choice">
                          <span className="choice-label">Choice:</span>{" "}
                          {segment.userChoice}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current story segment or start screen */}
          <div className="current-story-container">
            {!currentSegment ? (
              <div className="start-screen">
                <p>Ready to start your adventure?</p>
                <button
                  type="button"
                  onClick={handleStartStory}
                  disabled={
                    startStoryMutation.isPending ||
                    startStoryMutation.isLoading ||
                    !hasApiKey
                  }
                  className={!hasApiKey ? "disabled" : ""}
                >
                  {startStoryMutation.isPending || startStoryMutation.isLoading
                    ? "Starting..."
                    : "Begin Adventure"}
                </button>
                {!hasApiKey && (
                  <p className="api-key-note">
                    Please set your API key in the settings to begin.
                  </p>
                )}
              </div>
            ) : (
              <div className="current-story-segment">
                <div className="current-segment-header">
                  <div className="segment-number">
                    Chapter {currentSegment.sequenceNumber || "?"}
                  </div>
                  <div className="current-location">
                    {currentSegment.locationContext || "Unknown location"}
                  </div>
                </div>

                <div className="current-segment-content">
                  {currentSegment.content
                    .split("\n")
                    .map((paragraph, index) =>
                      paragraph ? <p key={index}>{paragraph}</p> : null
                    )}
                </div>

                {currentSegment.options && currentSegment.options.length > 0 ? (
                  <div className="options-container">
                    <h3>What will you do?</h3>
                    <div className="options">
                      {currentSegment.options.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className={`option-button ${option.risk.toLowerCase()} ${
                            !hasApiKey ? "disabled" : ""
                          }`}
                          onClick={() => handleChoiceSelected(option.id)}
                          disabled={
                            makeChoiceMutation.isPending ||
                            makeChoiceMutation.isLoading ||
                            !hasApiKey
                          }
                        >
                          {option.text}
                          <span className="risk-badge">{option.risk}</span>
                        </button>
                      ))}
                    </div>
                    {!hasApiKey && (
                      <p className="api-key-note">
                        Please set your API key in the settings to continue.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="story-end">
                    <p>The End</p>
                    <button type="button" onClick={() => navigate("/")}>
                      Return to Games
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="game-sidebar">
          <div className="sidebar-section">
            <h3>Inventory</h3>
            {items.length > 0 ? (
              <ul className="items-list">
                {items.map((item) => (
                  <li key={item.id} className="item">
                    <span className="item-name">{item.name}</span>
                    {item.description && (
                      <span className="item-description">
                        {item.description}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No items in inventory</p>
            )}
          </div>

          <div className="sidebar-section">
            <h3>Characters</h3>
            {characters.length > 0 ? (
              <ul className="characters-list">
                {characters.map((character) => (
                  <li key={character.id} className="character">
                    <span className="character-name">{character.name}</span>
                    <span
                      className={`relationship-badge ${character.relationship.toLowerCase()}`}
                    >
                      {character.relationship}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No characters encountered</p>
            )}
          </div>
        </div>
      </div>

      {/* Story Viewer modal when a past segment is clicked */}
      {selectedSegment && (
        <StoryViewer segment={selectedSegment} onClose={handleCloseViewer} />
      )}
    </div>
  );
};

export default GamePage;
