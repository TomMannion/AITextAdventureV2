// src/components/CharacterForm.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { characterAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const GENRES = [
  "fantasy",
  "mystery",
  "scifi",
  "horror",
  "adventure",
  "western",
];

const GENDERS = ["male", "female", "non-binary", "other"];

const CharacterForm = ({ existingCharacter = null }) => {
  const navigate = useNavigate();
  const { apiSettings } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Character state
  const [genre, setGenre] = useState(existingCharacter?.genre || "fantasy");
  const [gender, setGender] = useState(existingCharacter?.gender || "");
  const [name, setName] = useState(existingCharacter?.name || "");
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [traits, setTraits] = useState(existingCharacter?.traits || []);
  const [traitSuggestions, setTraitSuggestions] = useState([]);
  const [selectedTraitSet, setSelectedTraitSet] = useState(null);
  const [bio, setBio] = useState(existingCharacter?.bio || "");
  const [bioSuggestions, setBioSuggestions] = useState([]);

  const hasApiKey = !!apiSettings.apiKey;
  const isEditing = !!existingCharacter;

  // Name generation mutation
  const generateNamesMutation = useMutation({
    mutationFn: () => {
      if (!hasApiKey) {
        throw new Error("API key required");
      }
      return characterAPI.generateNames({ genre, gender });
    },
    onSuccess: (response) => {
      setNameSuggestions(response.data.names || []);
      setApiError(null);
    },
    onError: (error) => {
      setApiError(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate names"
      );
    },
  });

  // Traits generation mutation
  const generateTraitsMutation = useMutation({
    mutationFn: () => {
      if (!hasApiKey || !name) {
        throw new Error("API key and name required");
      }
      return characterAPI.generateTraits({ genre, name, gender });
    },
    onSuccess: (response) => {
      setTraitSuggestions(response.data.traitSuggestions || []);
      setApiError(null);
    },
    onError: (error) => {
      setApiError(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate traits"
      );
    },
  });

  // Bio generation mutation
  const generateBiosMutation = useMutation({
    mutationFn: () => {
      if (!hasApiKey || !name || !traits.length) {
        throw new Error("API key, name, and traits required");
      }
      return characterAPI.generateBios({ genre, name, traits, gender });
    },
    onSuccess: (response) => {
      setBioSuggestions(response.data.bioSuggestions || []);
      setApiError(null);
    },
    onError: (error) => {
      setApiError(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate bios"
      );
    },
  });

  // Create/update character mutation
  const characterMutation = useMutation({
    mutationFn: (characterData) => {
      if (isEditing) {
        return characterAPI.update(existingCharacter.id, characterData);
      } else {
        return characterAPI.create(characterData);
      }
    },
    onSuccess: () => {
      navigate("/characters");
    },
    onError: (error) => {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to save character"
      );
    },
  });

  // Random character generation
  const generateRandomCharacterMutation = useMutation({
    mutationFn: () => {
      if (!hasApiKey) {
        throw new Error("API key required");
      }
      return characterAPI.generateRandom({ genre, gender });
    },
    onSuccess: (response) => {
      const character = response.data.character;
      setName(character.name);
      setTraits(character.traits);
      setBio(character.bio);
      if (character.gender) {
        setGender(character.gender);
      }
      setApiError(null);
      // Skip to the final review step
      setStep(4);
    },
    onError: (error) => {
      setApiError(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate random character"
      );
    },
  });

  // Generate names when genre or gender changes in step 1
  useEffect(() => {
    if (step === 2 && hasApiKey && !isEditing && !nameSuggestions.length) {
      generateNamesMutation.mutate();
    }
  }, [
    step,
    genre,
    gender,
    hasApiKey,
    generateNamesMutation,
    isEditing,
    nameSuggestions.length,
  ]);

  // Generate traits when name is selected in step 2
  useEffect(() => {
    if (
      step === 3 &&
      hasApiKey &&
      name &&
      !isEditing &&
      !traitSuggestions.length
    ) {
      generateTraitsMutation.mutate();
    }
  }, [
    step,
    name,
    hasApiKey,
    generateTraitsMutation,
    isEditing,
    traitSuggestions.length,
  ]);

  // Generate bios when traits are selected in step 3
  useEffect(() => {
    if (
      step === 4 &&
      hasApiKey &&
      name &&
      traits.length &&
      !isEditing &&
      !bioSuggestions.length
    ) {
      generateBiosMutation.mutate();
    }
  }, [
    step,
    traits,
    hasApiKey,
    name,
    generateBiosMutation,
    isEditing,
    bioSuggestions.length,
  ]);

  const handleNameSelect = (selectedName) => {
    setName(selectedName);
  };

  const handleTraitSetSelect = (traitSet, index) => {
    setTraits(traitSet.traits);
    setSelectedTraitSet(index);
  };

  const handleBioSelect = (selectedBio) => {
    setBio(selectedBio.bio);
  };

  const handleCreateRandom = () => {
    generateRandomCharacterMutation.mutate();
  };

  const handleSubmit = () => {
    if (!name || !bio || !traits.length) {
      setError("Name, traits, and bio are required");
      return;
    }

    const characterData = {
      name,
      traits,
      bio,
      gender,
      genre,
    };

    characterMutation.mutate(characterData);
  };

  // Step 1: Genre and Gender Selection
  const renderStep1 = () => (
    <div className="character-form-step">
      <h2>Step 1: Choose Genre & Gender</h2>

      <div className="form-group">
        <label htmlFor="genre">Character Genre</label>
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
      </div>

      <div className="form-group">
        <label htmlFor="gender">Character Gender (Optional)</label>
        <div className="gender-options">
          {GENDERS.map((g) => (
            <button
              key={g}
              type="button"
              className={`gender-button ${g === gender ? "selected" : ""}`}
              onClick={() => setGender(g)}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
          <button
            type="button"
            className={`gender-button ${!gender ? "selected" : ""}`}
            onClick={() => setGender("")}
          >
            Not Specified
          </button>
        </div>
      </div>

      {!hasApiKey && (
        <div className="warning-message">
          <strong>Note:</strong> You don't have an API key set. You can still
          create a character manually, but you won't get AI-generated
          suggestions.
        </div>
      )}

      <div className="form-actions">
        <button
          type="button"
          className="secondary"
          onClick={() => navigate("/characters")}
        >
          Cancel
        </button>

        <div className="action-group">
          {hasApiKey && (
            <button
              type="button"
              className="random-button"
              onClick={handleCreateRandom}
              disabled={generateRandomCharacterMutation.isPending}
            >
              {generateRandomCharacterMutation.isPending
                ? "Generating..."
                : "Create Random Character"}
            </button>
          )}
          <button type="button" className="primary" onClick={() => setStep(2)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );

  // Step 2: Name Selection
  const renderStep2 = () => (
    <div className="character-form-step">
      <h2>Step 2: Choose a Name</h2>

      {apiError && step === 2 && (
        <div className="error-message">{apiError}</div>
      )}

      <div className="form-group">
        <label htmlFor="name">Character Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter character name"
          className="name-input"
        />
      </div>

      {hasApiKey && (
        <>
          <div className="form-group">
            <label>Suggested Names</label>
            {generateNamesMutation.isPending ? (
              <div className="loading">Generating name suggestions...</div>
            ) : nameSuggestions.length > 0 ? (
              <div className="name-suggestions">
                {nameSuggestions.map((suggestedName, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`name-suggestion ${
                      suggestedName === name ? "selected" : ""
                    }`}
                    onClick={() => handleNameSelect(suggestedName)}
                  >
                    {suggestedName}
                  </button>
                ))}
              </div>
            ) : (
              <div className="no-suggestions">
                <p>No name suggestions available.</p>
                <button
                  type="button"
                  className="regenerate-button"
                  onClick={() => generateNamesMutation.mutate()}
                  disabled={generateNamesMutation.isPending}
                >
                  Generate Names
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <div className="form-actions">
        <button type="button" className="secondary" onClick={() => setStep(1)}>
          Back
        </button>
        <button
          type="button"
          className="primary"
          onClick={() => setStep(3)}
          disabled={!name}
        >
          Next
        </button>
      </div>
    </div>
  );

  // Step 3: Traits Selection
  const renderStep3 = () => (
    <div className="character-form-step">
      <h2>Step 3: Choose Character Traits</h2>

      {apiError && step === 3 && (
        <div className="error-message">{apiError}</div>
      )}

      <div className="form-group">
        <label htmlFor="traits">Character Traits</label>
        <div className="traits-input-container">
          <div className="traits-pills">
            {traits.map((trait, index) => (
              <span key={index} className="trait-pill">
                {trait}
                <button
                  type="button"
                  className="remove-trait"
                  onClick={() =>
                    setTraits(traits.filter((_, i) => i !== index))
                  }
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="add-trait-container">
            <input
              type="text"
              placeholder="Add a trait"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  setTraits([...traits, e.target.value.trim()]);
                  e.target.value = "";
                }
              }}
            />
          </div>
        </div>
      </div>

      {hasApiKey && (
        <>
          <div className="form-group">
            <label>Suggested Trait Sets</label>
            {generateTraitsMutation.isPending ? (
              <div className="loading">Generating trait suggestions...</div>
            ) : traitSuggestions.length > 0 ? (
              <div className="trait-suggestions">
                {traitSuggestions.map((traitSet, index) => (
                  <div
                    key={index}
                    className={`trait-set ${
                      selectedTraitSet === index ? "selected" : ""
                    }`}
                    onClick={() => handleTraitSetSelect(traitSet, index)}
                  >
                    <div className="trait-set-traits">
                      {traitSet.traits.map((trait, i) => (
                        <span key={i} className="trait-badge">
                          {trait}
                        </span>
                      ))}
                    </div>
                    <p className="trait-set-description">
                      {traitSet.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-suggestions">
                <p>No trait suggestions available.</p>
                <button
                  type="button"
                  className="regenerate-button"
                  onClick={() => generateTraitsMutation.mutate()}
                  disabled={generateTraitsMutation.isPending || !name}
                >
                  Generate Traits
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <div className="form-actions">
        <button type="button" className="secondary" onClick={() => setStep(2)}>
          Back
        </button>
        <button
          type="button"
          className="primary"
          onClick={() => setStep(4)}
          disabled={traits.length === 0}
        >
          Next
        </button>
      </div>
    </div>
  );

  // Step 4: Biography
  const renderStep4 = () => (
    <div className="character-form-step">
      <h2>Step 4: Character Biography</h2>

      {apiError && step === 4 && (
        <div className="error-message">{apiError}</div>
      )}

      <div className="form-group">
        <label htmlFor="bio">Character Biography</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Enter character biography"
          rows={8}
          className="bio-textarea"
        ></textarea>
      </div>

      {hasApiKey && (
        <>
          <div className="form-group">
            <label>Suggested Biographies</label>
            {generateBiosMutation.isPending ? (
              <div className="loading">Generating biography suggestions...</div>
            ) : bioSuggestions.length > 0 ? (
              <div className="bio-suggestions">
                {bioSuggestions.map((bioSuggestion, index) => (
                  <div key={index} className="bio-suggestion">
                    <p className="bio-text">{bioSuggestion.bio}</p>
                    <button
                      type="button"
                      className="use-bio-button"
                      onClick={() => handleBioSelect(bioSuggestion)}
                    >
                      Use This Bio
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-suggestions">
                <p>No biography suggestions available.</p>
                <button
                  type="button"
                  className="regenerate-button"
                  onClick={() => generateBiosMutation.mutate()}
                  disabled={
                    generateBiosMutation.isPending ||
                    !name ||
                    traits.length === 0
                  }
                >
                  Generate Biographies
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="form-actions">
        <button type="button" className="secondary" onClick={() => setStep(3)}>
          Back
        </button>
        <button
          type="button"
          className="primary submit-button"
          onClick={handleSubmit}
          disabled={
            characterMutation.isPending || !name || !bio || traits.length === 0
          }
        >
          {characterMutation.isPending
            ? "Saving..."
            : isEditing
            ? "Update Character"
            : "Create Character"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="character-form-container">
      <h1>{isEditing ? "Edit Character" : "Create New Character"}</h1>

      <div className="step-indicator">
        <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
        <div className="step-line"></div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
        <div className="step-line"></div>
        <div className={`step ${step >= 3 ? "active" : ""}`}>3</div>
        <div className="step-line"></div>
        <div className={`step ${step >= 4 ? "active" : ""}`}>4</div>
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
};

export default CharacterForm;
