// src/features/game-engine/components/GameBrowser.jsx
import React, { useState } from "react";
import styled from "styled-components";
import useGameState from "../hooks/useGameState";

// Styled components
const BrowserContainer = styled.div`
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

const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const FilterLabel = styled.label`
  margin-right: 5px;
  font-size: 12px;
`;

const FilterSelect = styled.select`
  font-size: 12px;
  padding: 2px 5px;
  border: 1px solid var(--win95-border-darker);
`;

const RefreshButton = styled.button`
  padding: 3px 8px;
  font-size: 12px;
  background-color: var(--win95-window-bg);
  border: 2px solid var(--win95-border-darker);
  border-top-color: var(--win95-border-light);
  border-left-color: var(--win95-border-light);
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
    padding: 4px 7px 2px 9px;
  }
`;

const GameList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  border: 1px solid var(--win95-border-darker);
  background-color: white;
`;

const GameItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background-color: var(--win95-window-header);
    color: white;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const GameIcon = styled.div`
  width: 32px;
  height: 32px;
  margin-right: 10px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
`;

const GameInfo = styled.div`
  flex: 1;
`;

const GameTitle = styled.div`
  font-weight: bold;
`;

const GameDetails = styled.div`
  font-size: 12px;
  color: ${(props) => (props.$hovering ? "inherit" : "#666")};
`;

const EmptyState = styled.div`
  padding: 30px;
  text-align: center;
  color: #666;
`;

const LoadingState = styled.div`
  padding: 30px;
  text-align: center;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  border: 1px solid var(--win95-border-darker);
  margin: 15px 0;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    height: 100%;
    width: ${(props) => props.$progress || "0%"};
    background-color: var(--win95-window-header);
    transition: width 0.3s;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
`;

const Button = styled.button`
  background-color: var(--win95-window-bg);
  border: 2px solid var(--win95-border-darker);
  border-top-color: var(--win95-border-light);
  border-left-color: var(--win95-border-light);
  padding: 6px 12px;
  cursor: pointer;

  &:active {
    border-top-color: var(--win95-border-darker);
    border-left-color: var(--win95-border-darker);
    border-bottom-color: var(--win95-border-light);
    border-right-color: var(--win95-border-light);
    padding: 7px 11px 5px 13px;
  }

  ${(props) =>
    props.$primary &&
    `
    font-weight: bold;
  `}
`;

const ErrorMessage = styled.div`
  padding: 20px;
  margin: 20px 0;
  background-color: #ffe0e0;
  border: 1px solid #ff0000;
  color: #ff0000;
  text-align: center;
`;

const formatDate = (dateString) => {
  if (!dateString) return "Unknown date";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (error) {
    return "Invalid date";
  }
};

const GameBrowser = () => {
  const {
    gameList,
    status,
    loadingProgress,
    error,
    gamesInitialized,
    returnToLauncher,
    refreshGames, // Renamed from browseGames for clarity
    loadExistingGame,
    startNewGame,
  } = useGameState();

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [genreFilter, setGenreFilter] = useState("ALL");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [localError, setLocalError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if gameList is valid
  const isValidGameList = Array.isArray(gameList) && gameList.length > 0;
  const isLoading = status === "loading";

  const filteredGames = isValidGameList
    ? gameList.filter((game) => {
        if (statusFilter !== "ALL" && game.status !== statusFilter) {
          return false;
        }
        if (genreFilter !== "ALL" && game.genre !== genreFilter) {
          return false;
        }
        return true;
      })
    : [];

  // Handle refreshing the game list (explicit user action)
  const handleRefresh = async () => {
    if (isRefreshing || isLoading) return;

    setIsRefreshing(true);
    setLocalError("");

    try {
      await refreshGames(true); // Pass true to force refresh
    } catch (err) {
      console.error("Error refreshing games:", err);
      setLocalError("Failed to refresh your games. Please try again.");
    } finally {
      // Add a small delay to prevent rapid re-clicks
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  // Handle loading a game
  const handleLoadGame = (gameId) => {
    try {
      loadExistingGame(gameId);
    } catch (err) {
      console.error("Error loading game:", err);
      setLocalError("Failed to load the selected game. Please try again.");
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <BrowserContainer>
        <Title>Loading Your Adventures</Title>
        <LoadingState>
          <p>Fetching your saved adventures...</p>
          <ProgressBar $progress={`${loadingProgress}%`} />
        </LoadingState>
      </BrowserContainer>
    );
  }

  return (
    <BrowserContainer>
      <Title>Your Adventures</Title>

      {(error || localError) && (
        <ErrorMessage>{error || localError}</ErrorMessage>
      )}

      <ControlBar>
        <FilterContainer>
          <div>
            <FilterLabel htmlFor="statusFilter">Status:</FilterLabel>
            <FilterSelect
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </FilterSelect>
          </div>

          <div>
            <FilterLabel htmlFor="genreFilter">Genre:</FilterLabel>
            <FilterSelect
              id="genreFilter"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="fantasy">Fantasy</option>
              <option value="scifi">Science Fiction</option>
              <option value="horror">Horror</option>
              <option value="mystery">Mystery</option>
              <option value="western">Western</option>
            </FilterSelect>
          </div>
        </FilterContainer>

        <RefreshButton
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </RefreshButton>
      </ControlBar>

      <GameList>
        {!isValidGameList ? (
          <EmptyState>
            {isLoading
              ? "Loading your adventures..."
              : !gamesInitialized
              ? "Initializing games..."
              : "No adventures found. Start a new one!"}
          </EmptyState>
        ) : (
          filteredGames.map((game) => (
            <GameItem
              key={game.id}
              onClick={() => handleLoadGame(game.id)}
              onMouseEnter={() => setHoveredItem(game.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <GameIcon>
                {game.genre === "fantasy"
                  ? "🧙"
                  : game.genre === "scifi"
                  ? "🚀"
                  : game.genre === "horror"
                  ? "👻"
                  : game.genre === "mystery"
                  ? "🔍"
                  : game.genre === "western"
                  ? "🤠"
                  : "📖"}
              </GameIcon>
              <GameInfo>
                <GameTitle>{game.title || "Untitled Adventure"}</GameTitle>
                <GameDetails $hovering={hoveredItem === game.id}>
                  {game.genre
                    ? game.genre.charAt(0).toUpperCase() + game.genre.slice(1)
                    : "Unknown"}{" "}
                  •{game.status === "COMPLETED" ? " Completed" : " In Progress"}{" "}
                  • Last played: {formatDate(game.lastPlayedAt)} • Turn{" "}
                  {game.turnCount || 0}/{game.totalTurns || 16}
                </GameDetails>
              </GameInfo>
            </GameItem>
          ))
        )}
      </GameList>

      <ButtonContainer>
        <Button onClick={returnToLauncher}>Back</Button>
        <Button $primary onClick={startNewGame}>
          New Adventure
        </Button>
      </ButtonContainer>
    </BrowserContainer>
  );
};

export default GameBrowser;
