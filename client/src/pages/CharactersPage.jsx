// src/pages/CharactersPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { characterAPI } from "../services/api";

const CharactersPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch characters
  const {
    data: characters = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["characters"],
    queryFn: () => characterAPI.getAll().then((res) => res.data),
  });

  // Delete character mutation
  const deleteMutation = useMutation({
    mutationFn: (characterId) => characterAPI.delete(characterId),
    onSuccess: () => {
      queryClient.invalidateQueries(["characters"]);
      setDeleteConfirm(null);
    },
  });

  const handleCreateCharacter = () => {
    navigate("/characters/new");
  };

  const handleEditCharacter = (id) => {
    navigate(`/characters/${id}/edit`);
  };

  const handleDeleteClick = (character) => {
    setDeleteConfirm(character);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm.id);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (isLoading) {
    return <div className="loading">Loading characters...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          Error loading characters: {error.message}
        </div>
        <button onClick={() => refetch()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="characters-container">
      <div className="characters-header">
        <h1>Your Characters</h1>
        <button
          className="create-character-btn"
          onClick={handleCreateCharacter}
        >
          Create New Character
        </button>
      </div>

      {characters.length === 0 ? (
        <div className="no-characters">
          <p>You don't have any characters yet. Create your first one!</p>
        </div>
      ) : (
        <div className="character-grid">
          {characters.map((character) => (
            <div key={character.id} className="character-card">
              <div className="character-card-header">
                <h3>{character.name}</h3>
                {character.gender && (
                  <span className="character-gender">{character.gender}</span>
                )}
              </div>

              <div className="character-traits">
                {character.traits.map((trait, index) => (
                  <span key={index} className="character-trait">
                    {trait}
                  </span>
                ))}
              </div>

              <div className="character-bio">
                <p>
                  {character.bio.length > 150
                    ? character.bio.substring(0, 150) + "..."
                    : character.bio}
                </p>
              </div>

              <div className="character-actions">
                <button
                  className="edit-character-btn"
                  onClick={() => handleEditCharacter(character.id)}
                >
                  Edit
                </button>
                <button
                  className="delete-character-btn"
                  onClick={() => handleDeleteClick(character)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirm-modal">
            <h2>Delete Character</h2>
            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteConfirm.name}</strong>? This action cannot be
              undone.
            </p>

            <div className="modal-actions">
              <button className="secondary" onClick={cancelDelete}>
                Cancel
              </button>
              <button
                className="delete-btn"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Character"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharactersPage;
