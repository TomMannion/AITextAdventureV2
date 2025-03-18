// src/features/game-engine/components/GameCreator.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import useGameState from "../hooks/useGameState";
import { useSettings } from "../../../contexts/SettingsContext";
import Button from "../../../components/common/Button";
import Text from "../../../components/common/Text";
import { win95Border } from "../../../utils/styleUtils";
import { placeholderIcons, getGenreIcon } from "../../../utils/iconUtils";

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
  display: flex;
  align-items: center;
`;

const GenreIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 8px;
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

  // Get settings from context
  const { settings } = useSettings();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use LLM settings from context instead of separate state
  const [localKey, setLocalKey] = useState(apiKey || settings.llm.apiKey || "");
  const [saveKey, setSaveKey] = useState(
    settings.llm.saveApiKey ||
      localStorage.getItem("game_save_api_key") === "true"
  );

  const [validationError, setValidationError] = useState("");

  // Use LLM provider and model from settings
  const [provider, setProvider] = useState(settings.llm.provider);
  const [model, setModel] = useState(settings.llm.model);

  // Update state when settings change
  useEffect(() => {
    setLocalKey(apiKey || settings.llm.apiKey || "");
    setSaveKey(settings.llm.saveApiKey);
    setProvider(settings.llm.provider);
    setModel(settings.llm.model);
  }, [apiKey, settings.llm]);

  // Use default genre and length from settings
  useEffect(() => {
    if (settings.game.defaultGenre && newGameSettings.genre === "fantasy") {
      setGameGenre(settings.game.defaultGenre);
    }

    if (settings.game.defaultLength && newGameSettings.totalTurns === 16) {
      setGameLength(settings.game.defaultLength.toString());
    }
  }, [
    settings.game,
    newGameSettings.genre,
    newGameSettings.totalTurns,
    setGameGenre,
    setGameLength,
  ]);

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

  // Handle provider change
  const handleProviderChange = (e) => {
    setProvider(e.target.value);
  };

  // Handle model change
  const handleModelChange = (e) => {
    setModel(e.target.value);
  };

  // Get available models for the selected provider
  const getModelsForProvider = (provider) => {
    switch (provider) {
      case "groq":
        return [
          { value: "llama-3.1-8b-instant", label: "LLaMA 3.1 8B Instant" },
          { value: "llama-3.1-70b-instant", label: "LLaMA 3.1 70B Instant" },
          { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B-32768" },
        ];
      case "anthropic":
        return [
          { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
          { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
          { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
          { value: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
        ];
      case "openai":
        return [
          { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
          { value: "gpt-4", label: "GPT-4" },
          { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
          { value: "gpt-4o", label: "GPT-4o" },
        ];
      case "gemini":
        return [
          { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
          { value: "gemini-2.0-pro", label: "Gemini 2.0 Pro" },
          { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
        ];
      default:
        return [{ value: "", label: "Select a provider first" }];
    }
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

    // Attempt to create game with provider and model preferences
    const result = await submitNewGame({
      preferredProvider: provider,
      preferredModel: model,
    });

    // The status will be handled by the context if successful
    // Only need to handle the case where we return here due to an error
    if (!result) {
      setIsSubmitting(false);
    }
  };

  // Get the current genre from settings
  const currentGenre = genreInfo[newGameSettings.genre] || genreInfo.fantasy;

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
            <GenreTitle>
              <GenreIcon
                src={getGenreIcon(newGameSettings.genre)}
                alt={currentGenre.name}
              />
              {currentGenre.name}
            </GenreTitle>
            <GenreDescription>{currentGenre.description}</GenreDescription>
            <Example>
              <em>Example:</em> "{currentGenre.example}"
            </Example>
          </GenrePreview>
        </FormSection>

        <FormSection>
          <SectionTitle>API Settings</SectionTitle>

          <FormGroup>
            <Label htmlFor="provider">LLM Provider:</Label>
            <Select
              id="provider"
              value={provider}
              onChange={handleProviderChange}
            >
              <option value="groq">Groq</option>
              <option value="anthropic">Anthropic</option>
              <option value="openai">OpenAI</option>
              <option value="gemini">Google (Gemini)</option>
            </Select>
            <Text size="11px" margin="5px 0 0 0" color="#666666">
              Select which AI provider to use for story generation
            </Text>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="model">Model:</Label>
            <Select id="model" value={model} onChange={handleModelChange}>
              {getModelsForProvider(provider).map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </Select>
            <Text size="11px" margin="5px 0 0 0" color="#666666">
              Choose which AI model to use for your adventure
            </Text>
          </FormGroup>

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
        <Button onClick={returnToLauncher}>
          <img
            src={placeholderIcons.windows}
            alt=""
            style={{ width: "16px", height: "16px", marginRight: "4px" }}
          />
          Cancel
        </Button>
        <Button primary onClick={handleSubmit}>
          <img
            src={placeholderIcons.adventure}
            alt=""
            style={{ width: "16px", height: "16px", marginRight: "4px" }}
          />
          Create Adventure
        </Button>
      </ButtonContainer>
    </CreatorContainer>
  );
};

export default GameCreator;
