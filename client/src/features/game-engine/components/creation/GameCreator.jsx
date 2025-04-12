import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useGameFlow } from '../../contexts/GameFlowContext';
import { useGameData } from '../../contexts/GameDataContext';
import { useSettings } from '../../../../contexts/SettingsContext';
import Button from '../../../../components/common/Button';
import { win95Border } from '../../../../utils/styleUtils';
import GenreSelection from './GenreSelection';
import APIKeyConfig from './APIKeyConfig';
import { placeholderIcons } from '../../../../utils/iconUtils';

const CreatorContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--win95-window-bg);
  padding: 20px;
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
  margin: 0 auto;
  max-width: 600px;
  width: 100%;
`;

const Section = styled.div`
  ${win95Border('outset')}
  padding: 15px;
  margin-bottom: 20px;
  background-color: #f0f0f0;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  margin-bottom: 15px;
  border-bottom: 1px solid var(--win95-border-dark);
  padding-bottom: 5px;
  color: var(--win95-window-header);
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 12px;
`;

const Select = styled.select`
  width: 100%;
  padding: 5px;
  ${win95Border('inset')}
  background-color: white;
  font-family: 'ms_sans_serif', sans-serif;
  font-size: 12px;
`;

const ModelDisplay = styled.div`
  padding: 8px;
  ${win95Border('inset')}
  background-color: white;
  font-size: 12px;
`;

const HelperText = styled.div`
  font-size: 11px;
  margin-top: 5px;
  color: #666;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const ErrorMessage = styled.div`
  color: #ff0000;
  padding: 8px;
  margin-top: 10px;
  border: 1px solid #ff0000;
  background-color: #fff0f0;
  font-size: 12px;
`;

/**
 * Game creator component - for creating new adventures
 */
const GameCreator = () => {
  const { goToLauncher, goToPlayer } = useGameFlow();
  const { createGame, updateApiKey, apiKey, toggleSaveApiKey, saveApiKey, startGame } = useGameData();
  const { settings } = useSettings();
  
  // Form state
  const [gameData, setGameData] = useState({
    genre: settings?.game?.defaultGenre || 'fantasy',
    totalTurns: settings?.game?.defaultLength || 16,
    apiKey: apiKey || settings?.llm?.apiKey || '',
    saveApiKey: saveApiKey || settings?.llm?.saveApiKey || false,
  });
  
  const [error, setError] = useState('');
  
  // Update API key when it changes
  useEffect(() => {
    if (gameData.apiKey !== apiKey) {
      setGameData(prev => ({
        ...prev,
        apiKey: apiKey || settings?.llm?.apiKey || '',
      }));
    }
  }, [apiKey, settings?.llm?.apiKey]);
  
  // Handle genre change
  const handleGenreChange = (genre) => {
    setGameData({
      ...gameData,
      genre,
    });
  };
  
  // Handle length change
  const handleLengthChange = (e) => {
    setGameData({
      ...gameData,
      totalTurns: parseInt(e.target.value, 10),
    });
  };
  
  // Handle API key change
  const handleApiKeyChange = (key) => {
    setGameData({
      ...gameData,
      apiKey: key,
    });
  };
  
  // Handle save API key change
  const handleSaveApiKeyChange = (save) => {
    setGameData({
      ...gameData,
      saveApiKey: save,
    });
    toggleSaveApiKey(save);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!gameData.apiKey) {
      setError('API key is required');
      return;
    }
    
    // Save API key to context
    updateApiKey(gameData.apiKey);
    
    try {
      // Create game with provider and model preferences from settings
      const newGame = await createGame({
        genre: gameData.genre,
        totalTurns: gameData.totalTurns,
        preferredProvider: settings?.llm?.provider || 'groq',
        preferredModel: settings?.llm?.model || 'llama-3.1-8b-instant',
      });
      
      if (newGame) {
        // Start the game to generate initial content
        await startGame(newGame.id);
        
        // Navigate to player
        goToPlayer();
      }
    } catch (err) {
      setError(err.message || 'Failed to create game');
    }
  };
  
  // Get provider icon
  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'groq': return '🚀';
      case 'anthropic': return '🧠';
      case 'openai': return '💬';
      case 'gemini': return '🔍';
      default: return '🤖';
    }
  };
  
  return (
    <CreatorContainer>
      <Title>Create New Adventure</Title>
      
      <FormContainer>
        <Section>
          <SectionTitle>Adventure Settings</SectionTitle>
          
          <GenreSelection 
            selectedGenre={gameData.genre} 
            onSelectGenre={handleGenreChange}
          />
          
          <FormGroup>
            <Label htmlFor="totalTurns">Story Length:</Label>
            <Select
              id="totalTurns"
              value={gameData.totalTurns}
              onChange={handleLengthChange}
            >
              <option value="8">Short (8 turns)</option>
              <option value="16">Medium (16 turns)</option>
              <option value="24">Long (24 turns)</option>
              <option value="32">Epic (32 turns)</option>
            </Select>
          </FormGroup>
        </Section>
        
        <Section>
          <SectionTitle>AI Provider Settings</SectionTitle>
          
          <FormGroup>
            <Label>Current AI Model:</Label>
            <ModelDisplay>
              {getProviderIcon(settings?.llm?.provider)} <strong>{settings?.llm?.provider || 'groq'}</strong>: {settings?.llm?.model || 'llama-3.1-8b-instant'}
            </ModelDisplay>
            <HelperText>
              To change the AI model, use the Settings app → LLM Provider tab
            </HelperText>
          </FormGroup>
          
          <APIKeyConfig
            apiKey={gameData.apiKey}
            saveApiKey={gameData.saveApiKey}
            onApiKeyChange={handleApiKeyChange}
            onSaveApiKeyChange={handleSaveApiKeyChange}
          />
        </Section>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <ButtonContainer>
          <Button onClick={goToLauncher}>
            <img
              src={placeholderIcons.windows}
              alt=""
              style={{ width: '16px', height: '16px', marginRight: '4px' }}
            />
            Cancel
          </Button>
          <Button primary onClick={handleSubmit}>
            <img
              src={placeholderIcons.adventure}
              alt=""
              style={{ width: '16px', height: '16px', marginRight: '4px' }}
            />
            Create Adventure
          </Button>
        </ButtonContainer>
      </FormContainer>
    </CreatorContainer>
  );
};

export default GameCreator;