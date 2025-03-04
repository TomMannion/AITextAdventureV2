// src/pages/CharacterDetailPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { characterAPI } from "../services/api";

const CharacterDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch character details
  const {
    data: character,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["character", id],
    queryFn: () => characterAPI.getById(id).then((res) => res.data),
  });

  const handleEdit = () => {
    navigate(`/characters/${id}/edit`);
  };

  const handleBack = () => {
    navigate("/characters");
  };

  if (isLoading) {
    return <div className="loading">Loading character...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          Error loading character: {error.message}
        </div>
        <button onClick={handleBack}>Back to Characters</button>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="not-found-container">
        <div className="error-message">Character not found</div>
        <button onClick={handleBack}>Back to Characters</button>
      </div>
    );
  }

  return (
    <div className="character-detail-container">
      <div className="character-detail-header">
        <button className="back-button" onClick={handleBack}>
          ← Back to Characters
        </button>
        <button className="edit-button" onClick={handleEdit}>
          Edit Character
        </button>
      </div>

      <div className="character-detail-card">
        <div className="character-detail-primary">
          <h1>{character.name}</h1>
          {character.gender && (
            <div className="character-gender-badge">
              {character.gender.charAt(0).toUpperCase() +
                character.gender.slice(1)}
            </div>
          )}
        </div>

        <div className="character-traits-section">
          <h2>Traits</h2>
          <div className="character-traits-list">
            {character.traits.map((trait, index) => (
              <span key={index} className="character-trait-badge">
                {trait}
              </span>
            ))}
          </div>
        </div>

        <div className="character-bio-section">
          <h2>Biography</h2>
          <div className="character-bio-content">
            {character.bio.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="character-meta-section">
          <div className="character-meta-item">
            <span className="meta-label">Created</span>
            <span className="meta-value">
              {new Date(character.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="character-meta-item">
            <span className="meta-label">Last Updated</span>
            <span className="meta-value">
              {new Date(character.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetailPage;
