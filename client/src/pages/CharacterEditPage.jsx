// src/pages/CharacterEditPage.jsx
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { characterAPI } from "../services/api";
import CharacterForm from "../components/CharacterForm";

const CharacterEditPage = () => {
  const { id } = useParams();

  // Fetch character for editing
  const {
    data: character,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["character", id],
    queryFn: () => characterAPI.getById(id).then((res) => res.data),
  });

  if (isLoading) {
    return <div className="loading">Loading character...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          Error loading character: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="character-edit-container">
      <CharacterForm existingCharacter={character} />
    </div>
  );
};

export default CharacterEditPage;
