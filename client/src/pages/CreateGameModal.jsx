// src/components/CreateGameModal.jsx
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { gameAPI, characterAPI } from "../services/api";

// Available genres
const GENRES = [
  "fantasy",
  "mystery",
  "scifi",
  "horror",
  "adventure",
  "western",
];

const CreateGameModal = ({ onClose, onGameCreated }) => {
  const [step, setStep] = useState(1);
  const [genre, setGenre] = useState("fantasy");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [error, setError] = useState(null);

  // Fetch characters
  const { data: characters = [], isLoading: charactersLoading } = useQuery({
    queryKey: ["characters"],
    queryFn: () => characterAPI.getAll().then((res) => res.data),
  });

  // Fetch title suggestions when genre changes
  const {
    data: titleSuggestions = [],
    isLoading: titlesLoading,
    refetch: refetchTitles,
  } = useQuery({
    queryKey: ["titleSuggestions", genre],
    queryFn: () =>
      gameAPI
        .generateTitles({ genre })
        .then((res) => res.data.suggestions || []),
    enabled: !!genre, // Only run if genre is selected
  });

  // Create game mutation
  const createGameMutation = useMutation({
    mutationFn: (gameData) => gameAPI.create(gameData),
    onSuccess: () => {
      onGameCreated();
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Failed to create game");
    },
  });

  // Refetch titles when genre changes
  useEffect(() => {
    if (genre) {
      refetchTitles();
    }
  }, [genre, refetchTitles]);

  const handleTitleSelect = (title) => {
    setSelectedTitle(title);
    setCustomTitle("");
  };

  const handleCreateGame = () => {
    // Determine final title
    const finalTitle = customTitle || selectedTitle;

    if (!finalTitle || !genre) {
      setError("Please select a title and genre");
      return;
    }

    // Create the game
    const gameData = {
      title: finalTitle,
      genre,
      characterId: selectedCharacterId,
    };

    createGameMutation.mutate(gameData);
  };

  const renderStep1 = () => (
    <div className="genre-selection">
      <h2>Choose a Genre</h2>
      <div className="genre-options">
        {GENRES.map((g) => (
          <button
            key={g}
            type="button"
            className={`genre-button ${g === genre ? "selected" : ""}`}
            onClick={() => setGenre(g)}
          >
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </button>
        ))}
      </div>
      <div className="modal-actions">
        <button type="button" onClick={onClose}>
          Cancel
        </button>
        <button type="button" onClick={() => setStep(2)} disabled={!genre}>
          Next
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="title-selection">
      <h2>Choose a Title</h2>

      {titlesLoading ? (
        <div className="loading">Generating title suggestions...</div>
      ) : titleSuggestions.length > 0 ? (
        <div className="title-suggestions">
          {titleSuggestions.map((title, index) => (
            <button
              key={index}
              type="button"
              className={`title-option ${
                title === selectedTitle ? "selected" : ""
              }`}
              onClick={() => handleTitleSelect(title)}
            >
              {title}
            </button>
          ))}
        </div>
      ) : (
        <div className="no-titles">
          <p>No title suggestions available. Please enter a custom title.</p>
        </div>
      )}

      <div className="custom-title">
        <label>Or create your own:</label>
        <input
          type="text"
          value={customTitle}
          onChange={(e) => {
            setCustomTitle(e.target.value);
            setSelectedTitle("");
          }}
          placeholder="Enter a custom title"
        />
      </div>

      <div className="modal-actions">
        <button type="button" onClick={() => setStep(1)}>
          Back
        </button>
        <button
          type="button"
          onClick={() => setStep(3)}
          disabled={!selectedTitle && !customTitle}
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="character-selection">
      <h2>Choose a Character</h2>

      {charactersLoading ? (
        <div className="loading">Loading characters...</div>
      ) : characters.length > 0 ? (
        <div className="character-list">
          {characters.map((character) => (
            <div
              key={character.id}
              className={`character-option ${
                character.id === selectedCharacterId ? "selected" : ""
              }`}
              onClick={() => setSelectedCharacterId(character.id)}
            >
              <h3>{character.name}</h3>
              <p>{character.traits.join(", ")}</p>
            </div>
          ))}

          <div
            className={`character-option ${
              selectedCharacterId === null ? "selected" : ""
            }`}
            onClick={() => setSelectedCharacterId(null)}
          >
            <h3>No Character</h3>
            <p>Play as an anonymous adventurer</p>
          </div>
        </div>
      ) : (
        <p>No characters available. You can play without a character.</p>
      )}

      <div className="modal-actions">
        <button type="button" onClick={() => setStep(2)}>
          Back
        </button>
        <button
          type="button"
          onClick={handleCreateGame}
          disabled={createGameMutation.isPending}
        >
          {createGameMutation.isPending ? "Creating..." : "Create Adventure"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" className="close-button" onClick={onClose}>
          ×
        </button>

        {error && <div className="error-message">{error}</div>}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default CreateGameModal;
