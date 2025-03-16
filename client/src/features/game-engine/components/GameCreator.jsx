// src/features/game-engine/components/GameCreator.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import useGameState from "../hooks/useGameState";
import Button from "../../../components/common/Button";
import Text from "../../../components/common/Text";
import { win95Border } from "../../../utils/styleUtils";

// Styled components
const CreatorContainer = styled.div`
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

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormSection = styled.div`
  ${win95Border("inset")}
  padding: 15px;
  background-color: #f0f0f0;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--win95-border-dark);
  padding-bottom: 5px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Select = styled.select`
  width: 100%;
  padding: 5px;
  border: 1px solid var(--win95-border-darker);
  background-color: #fff;
`;

const Input = styled.input`
  width: 100%;
  padding: 5px;
  border: 1px solid var(--win95-border-darker);
  background-color: #fff;
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;

  input {
    margin-right: 8px;
  }
`;

const GenrePreview = styled.div`
  margin-top: 10px;
  padding: 15px;
  border: 1px solid var(--win95-border-darker);
  background-color: ${(props) => props.$bgColor || "#f0f0f0"};
`;

const GenreTitle = styled.h3`
  margin-bottom: 10px;
  color: var(--win95-window-header);
`;

const GenreDescription = styled.p`
  margin-bottom: 10px;
`;

const Example = styled.p`
  font-style: italic;
  margin-bottom: 10px;
`;

const ErrorMessage = styled.div`
  color: #ff0000;
  padding: 8px;
  margin-top: 10px;
  border: 1px solid #ff0000;
  background-color: #fff0f0;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const ProgressContainer = styled.div`
  margin-top: 20px;
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

// Genre information
const genreInfo = {
  fantasy: {
    name: "Fantasy",
    description:
      "A magical world of dragons, wizards, and epic quests. Perfect for heroic adventures and magical exploration.",
    bgColor: "#e6f7ff",
    example:
      "You stand at the gates of the ancient elven city of Eladrin, your sword glimmering in the moonlight...",
  },
  scifi: {
    name: "Science Fiction",
    description:
      "Explore distant galaxies, encounter alien species, and discover advanced technology.",
    bgColor: "#e6fff7",
    example:
      "The space station's emergency sirens blare as you rush to your assigned escape pod...",
  },
  horror: {
    name: "Horror",
    description:
      "Face your deepest fears in a world filled with supernatural threats and psychological terror.",
    bgColor: "#ffe6e6",
    example:
      "The old mansion creaks and groans as you cautiously step inside, your flashlight flickering...",
  },
  mystery: {
    name: "Mystery",
    description:
      "Solve intricate puzzles and uncover hidden secrets in a world of intrigue and suspense.",
    bgColor: "#f7e6ff",
    example:
      "The detective's office is dimly lit as you examine the cryptic note left at the crime scene...",
  },
  western: {
    name: "Western",
    description:
      "Experience the rugged frontier of the Wild West with gunslinging, gold mining, and outlaw chasing.",
    bgColor: "#fff7e6",
    example:
      "The dusty saloon falls silent as you push through the swinging doors, spurs jingling...",
  },
};

const GameCreator = () => {
  const {
    newGameSettings,
    error,
    apiKey,
    loadingProgress,
    returnToLauncher,
    setGameGenre,
    setGameLength,
    submitNewGame,
    updateApiKey,
    toggleSaveApiKey,
    validateApiKey,
  } = useGameState();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localKey, setLocalKey] = useState(apiKey || "");
  const [saveKey, setSaveKey] = useState(
    localStorage.getItem("game_save_api_key") === "true"
  );
  const [validationError, setValidationError] = useState("");

  // Get current genre info
  const currentGenre = genreInfo[newGameSettings.genre] || genreInfo.fantasy;

  // Update local state when context changes
  useEffect(() => {
    setLocalKey(apiKey || "");
  }, [apiKey]);

  // Handle API key change
  const handleApiKeyChange = (e) => {
    setLocalKey(e.target.value);
    setValidationError("");
  };

  // Handle save API key change
  const handleSaveKeyChange = (e) => {
    const checked = e.target.checked;
    setSaveKey(checked);
    toggleSaveApiKey(checked);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validate inputs
    if (!localKey.trim()) {
      setValidationError("API key is required");
      return;
    }

    // Save API key if it has changed
    if (localKey !== apiKey) {
      updateApiKey(localKey);
    }

    // Validate again
    if (!validateApiKey()) {
      setValidationError("Please enter a valid API key");
      return;
    }

    setValidationError("");
    setIsSubmitting(true);

    // Attempt to create game
    const result = await submitNewGame();

    // The status will be handled by the context if successful
    // Only need to handle the case where we return here due to an error
    if (!result) {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <CreatorContainer>
        <Title>Creating Your Adventure</Title>
        <ProgressContainer>
          <Text size="14px">
            Generating your {currentGenre.name} adventure...
          </Text>
          <ProgressBar $progress={`${loadingProgress}%`} />
          <Text size="12px">
            This may take a moment as we craft a unique story for you.
          </Text>
        </ProgressContainer>
      </CreatorContainer>
    );
  }

  return (
    <CreatorContainer>
      <Title>Create New Adventure</Title>

      <FormContainer>
        <FormSection>
          <SectionTitle>Adventure Settings</SectionTitle>

          <FormGroup>
            <Label htmlFor="genre">Genre:</Label>
            <Select
              id="genre"
              value={newGameSettings.genre}
              onChange={(e) => setGameGenre(e.target.value)}
            >
              <option value="fantasy">Fantasy</option>
              <option value="scifi">Science Fiction</option>
              <option value="horror">Horror</option>
              <option value="mystery">Mystery</option>
              <option value="western">Western</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="totalTurns">Story Length:</Label>
            <Select
              id="totalTurns"
              value={newGameSettings.totalTurns}
              onChange={(e) => setGameLength(e.target.value)}
            >
              <option value="8">Short (8 turns)</option>
              <option value="16">Medium (16 turns)</option>
              <option value="24">Long (24 turns)</option>
              <option value="32">Epic (32 turns)</option>
            </Select>
          </FormGroup>

          <GenrePreview $bgColor={currentGenre.bgColor}>
            <GenreTitle>{currentGenre.name}</GenreTitle>
            <GenreDescription>{currentGenre.description}</GenreDescription>
            <Example>
              <em>Example:</em> "{currentGenre.example}"
            </Example>
          </GenrePreview>
        </FormSection>

        <FormSection>
          <SectionTitle>API Settings</SectionTitle>

          <FormGroup>
            <Label htmlFor="apiKey">LLM API Key:</Label>
            <Input
              id="apiKey"
              type="password"
              value={localKey}
              onChange={handleApiKeyChange}
              placeholder="Enter your API key"
            />
            <Checkbox>
              <input
                type="checkbox"
                id="saveApiKey"
                checked={saveKey}
                onChange={handleSaveKeyChange}
              />
              <label htmlFor="saveApiKey">Remember my API key</label>
            </Checkbox>
            <Text size="11px" margin="5px 0 0 0" color="#666666">
              Your API key is used to generate the story content with an LLM
              provider.
            </Text>
          </FormGroup>
        </FormSection>
      </FormContainer>

      {(error || validationError) && (
        <ErrorMessage>{validationError || error}</ErrorMessage>
      )}

      <ButtonContainer>
        <Button onClick={returnToLauncher}>Cancel</Button>
        <Button primary onClick={handleSubmit}>
          Create Adventure
        </Button>
      </ButtonContainer>
    </CreatorContainer>
  );
};

export default GameCreator;
