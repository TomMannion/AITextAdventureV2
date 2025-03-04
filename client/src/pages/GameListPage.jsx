// src/pages/GameListPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { gameAPI } from "../services/api";
import CreateGameModal from "../components/CreateGameModal";

const GameListPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch games using TanStack Query
  const {
    data: games,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["games"],
    queryFn: () => gameAPI.getAll().then((res) => res.data),
  });

  const handleGameCreated = () => {
    setShowCreateModal(false);
    refetch(); // Refresh the games list
  };

  if (isLoading) {
    return <div className="loading">Loading games...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          Error loading games: {error.message}
        </div>
        <button onClick={() => refetch()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="game-list-container">
      <div className="game-list-header">
        <h1>Your Adventures</h1>
        <button
          className="create-game-btn"
          onClick={() => setShowCreateModal(true)}
        >
          Create New Adventure
        </button>
      </div>

      {games?.length === 0 ? (
        <div className="no-games">
          <p>You don't have any adventures yet. Create your first one!</p>
        </div>
      ) : (
        <div className="game-grid">
          {games?.map((game) => (
            <div key={game.id} className="game-card">
              <h3>{game.title}</h3>
              <p>Genre: {game.genre}</p>
              <p>Status: {game.status}</p>
              <p>
                Last played: {new Date(game.lastPlayedAt).toLocaleDateString()}
              </p>
              <div className="game-actions">
                <Link to={`/games/${game.id}`}>
                  <button>Play</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateGameModal
          onClose={() => setShowCreateModal(false)}
          onGameCreated={handleGameCreated}
        />
      )}
    </div>
  );
};

export default GameListPage;
