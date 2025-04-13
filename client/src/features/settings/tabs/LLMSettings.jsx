// src/features/settings/tabs/LLMSettings.jsx
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { win95Border } from "../../../utils/styleUtils";
import Text from "../../../components/common/Text";
import Button from "../../../components/common/Button";
import { useSettings } from "../../../contexts/SettingsContext";
import modelService from "../../../services/modelService";
import { authService } from "../../../services/auth.service";

// Styled components
const SettingsSection = styled.div`
  ${win95Border("outset")}
  padding: 15px;
  margin-bottom: 20px;
  background-color: #f0f0f0;
`;

const SectionTitle = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--win95-border-dark);
  padding-bottom: 5px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Select = styled.select`
  width: 100%;
  padding: 5px;
  ${win95Border("inset")}
  font-family: "ms_sans_serif", sans-serif;
  font-size: 12px;
  background-color: white;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 5px;
  ${win95Border("inset")}
  font-family: "ms_sans_serif", sans-serif;
  font-size: 12px;
  background-color: white;
  margin-bottom: 5px;
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;

  input {
    margin-right: 8px;
  }
`;

const HelperText = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 3px;
`;

const ModelDescription = styled.div`
  margin-top: 10px;
  padding: 8px;
  background-color: white;
  ${win95Border("inset")}
  font-size: 11px;
  height: 80px;
  overflow-y: auto;
`;

const TestResultContainer = styled.div`
  margin-top: 10px;
  padding: 8px;
  ${win95Border("inset")}
  background-color: ${(props) =>
    props.$success ? "#e0ffe0" : props.$error ? "#ffe0e0" : "#f0f0f0"};
  font-size: 12px;
`;

const InfoBanner = styled.div`
  margin-top: 15px;
  padding: 8px;
  ${win95Border("outset")}
  background-color: #ffffd0; 
  font-size: 12px;
  display: flex;
  align-items: center;

  &:before {
    content: "i";
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    width: 16px;
    height: 16px;
    background-color: #0000aa;
    color: white;
    font-weight: bold;
    border-radius: 50%;
  }
`;

const LoadingIndicator = styled.div`
  margin-top: 5px;
  font-size: 12px;
  display: flex;
  align-items: center;
  color: #666;

  &:before {
    content: "";
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-right: 8px;
    border: 2px solid #ccc;
    border-top-color: #666;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

/**
 * LLM Provider Settings Component
 */
const LLMSettings = () => {
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings.llm);
  const [testStatus, setTestStatus] = useState(null);
  const [testMessage, setTestMessage] = useState("");
  const [models, setModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelError, setModelError] = useState(null);
  
  // Track if we've already saved these settings to prevent duplicates
  const [lastSavedSettings, setLastSavedSettings] = useState({
    provider: settings.llm.provider,
    model: settings.llm.model
  });

  // Update local state when settings change
  useEffect(() => {
    setLocalSettings(settings.llm);
  }, [settings.llm]);

  // Save settings to database - utility function
  const saveSettingsToDatabase = useCallback(async (provider, model) => {
    try {
      // Prepare the data to send to the server
      const preferencesData = {
        preferredProvider: provider,
        preferredModel: model
      };

      // Call the API to update user preferences
      await authService.updatePreferences(preferencesData);
      console.log("Settings saved to database");
      
      // Update our saved reference
      setLastSavedSettings({
        provider,
        model
      });
      
      return true;
    } catch (error) {
      console.error("Error saving preferences to database:", error);
      return false;
    }
  }, []);

  // Fetch models from provider
  const fetchModels = useCallback(async (provider, apiKey) => {
    if (!apiKey) {
      setModelError("API key is required to fetch available models");
      return;
    }

    setIsLoadingModels(true);
    setModelError(null);

    try {
      const modelsList = await modelService.getProviderModels(provider, apiKey);
      setModels(modelsList);
      
      // If there are models and current model is empty, select the first model
      if (modelsList.length > 0 && (!localSettings.model || !modelsList.some(m => m.id === localSettings.model))) {
        setLocalSettings(prev => ({
          ...prev,
          model: modelsList[0].id
        }));
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      setModelError(error.message || "Failed to fetch models from provider");
      // Keep static model list as fallback
      setModels(getStaticModelsForProvider(provider));
    } finally {
      setIsLoadingModels(false);
    }
  }, [localSettings.model]);

  // Fetch models when provider or API key changes
  useEffect(() => {
    if (localSettings.apiKey) {
      fetchModels(localSettings.provider, localSettings.apiKey);
    }
  }, [localSettings.provider, localSettings.apiKey, fetchModels]);

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setLocalSettings(prev => {
      // If provider changed, reset model
      if (name === "provider") {
        return {
          ...prev,
          [name]: newValue,
          model: "" // Reset model until we fetch new ones
        };
      }

      return {
        ...prev,
        [name]: newValue
      };
    });
  }, []);

  // Use debounced effect for saving changes to local context
  useEffect(() => {
    const timer = setTimeout(() => {
      // Update local settings context
      updateSettings("llm", localSettings);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [localSettings, updateSettings]);

  // Separate effect for database updates with longer debounce
  useEffect(() => {
    // Only proceed if we have valid settings and they've actually changed
    if (!localSettings.provider || !localSettings.model) return;
    
    // Check if these exact settings are already saved
    if (localSettings.provider === lastSavedSettings.provider && 
        localSettings.model === lastSavedSettings.model) {
      return; // Skip if nothing changed
    }
    
    // Use a longer debounce for API calls
    const saveTimer = setTimeout(async () => {
      await saveSettingsToDatabase(localSettings.provider, localSettings.model);
    }, 2000); // Longer 2-second debounce for API calls
    
    return () => clearTimeout(saveTimer);
  }, [localSettings.provider, localSettings.model, lastSavedSettings, saveSettingsToDatabase]);

  // Test API key
  const handleTestApiKey = useCallback(async () => {
    if (!localSettings.apiKey?.trim()) {
      setTestStatus("error");
      setTestMessage("API key cannot be empty");
      return;
    }

    setTestStatus("loading");
    setTestMessage("Testing connection to provider...");

    try {
      // Actually test the API key by trying to fetch models
      await modelService.getProviderModels(localSettings.provider, localSettings.apiKey);
      setTestStatus("success");
      setTestMessage("Connection successful! API key is valid.");
      
      // If API key test is successful and we have a model selected, save settings to database
      if (localSettings.model) {
        await saveSettingsToDatabase(localSettings.provider, localSettings.model);
      }
    } catch (error) {
      setTestStatus("error");
      setTestMessage(error.message || "Failed to connect with this API key");
    }
  }, [localSettings.provider, localSettings.apiKey, localSettings.model, saveSettingsToDatabase]);

  // Refresh models
  const handleRefreshModels = useCallback(() => {
    fetchModels(localSettings.provider, localSettings.apiKey);
  }, [localSettings.provider, localSettings.apiKey, fetchModels]);

  // Get static models as fallback for a provider
  const getStaticModelsForProvider = (provider) => {
    switch (provider) {
      case "groq":
        return [
          { id: "llama-3.1-8b-instant", name: "LLaMA 3.1 8B Instant" },
          { id: "llama-3.1-70b-instant", name: "LLaMA 3.1 70B Instant" },
          { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B-32768" },
        ];
      case "anthropic":
        return [
          { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
          { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet" },
          { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku" },
          { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
        ];
      case "openai":
        return [
          { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
          { id: "gpt-4", name: "GPT-4" },
          { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
          { id: "gpt-4o", name: "GPT-4o" },
        ];
      case "gemini":
        return [
          { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
          { id: "gemini-2.0-pro", name: "Gemini 2.0 Pro" },
          { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
        ];
      default:
        return [];
    }
  };

  // Get description for the selected model
  const getModelDescription = (provider, modelId) => {
    // Try to find model in fetched models first
    const selectedModel = models.find(m => m.id === modelId);
    if (selectedModel) {
      const contextWindow = selectedModel.context_window 
        ? `Context window: ${Number(selectedModel.context_window).toLocaleString()} tokens. ` 
        : '';
      
      return `${selectedModel.name || selectedModel.id}. ${contextWindow}${selectedModel.description || ''}`;
    }

    // Fallback to static descriptions
    const descriptions = {
      groq: {
        "llama-3.1-8b-instant":
          "Meta's LLaMA 3.1 8B model, optimized for speed and efficiency. Good for most tasks with fast response times.",
        "llama-3.1-70b-instant":
          "Meta's LLaMA 3.1 70B model, offering high-quality responses with more depth and nuance than the 8B version.",
        "mixtral-8x7b-32768":
          "Mixtral's 8x7B model with 32K context window, delivering strong performance across various tasks.",
      },
      anthropic: {
        "claude-3-opus-20240229":
          "Anthropic's most capable model, excellent for complex reasoning, analysis, and creative tasks.",
        "claude-3-sonnet-20240229":
          "Balanced model offering strong capabilities at a reasonable cost and speed.",
        "claude-3-haiku-20240307":
          "Fast and cost-effective model, ideal for lighter tasks and quick responses.",
        "claude-3.5-sonnet":
          "Latest generation sonnet model with improved performance and capabilities.",
      },
      openai: {
        "gpt-4-turbo":
          "Enhanced version of GPT-4 with faster response times and improved capabilities.",
        "gpt-4":
          "OpenAI's standard GPT-4 model, excellent for a wide range of tasks.",
        "gpt-3.5-turbo":
          "Cost-effective model with good performance for most everyday tasks.",
        "gpt-4o":
          "Latest multimodal version of GPT-4 with enhanced reasoning capabilities.",
      },
      gemini: {
        "gemini-2.0-flash":
          "Google's fast and efficient model for quick responses.",
        "gemini-2.0-pro":
          "Advanced model with stronger reasoning and knowledge capabilities.",
        "gemini-1.5-pro":
          "Previous generation model with excellent performance.",
      },
    };

    return (
      descriptions[provider]?.[modelId] ||
      "No description available for this model."
    );
  };

  return (
    <div>
      <Text size="16px" bold margin="0 0 15px 0">
        LLM Provider Settings
      </Text>

      <SettingsSection>
        <SectionTitle>Provider Configuration</SectionTitle>

        <FormGroup>
          <Label htmlFor="provider">LLM Provider:</Label>
          <Select
            id="provider"
            name="provider"
            value={localSettings.provider}
            onChange={handleChange}
          >
            <option value="groq">Groq</option>
            <option value="anthropic">Anthropic</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Google (Gemini)</option>
          </Select>
          <HelperText>
            Select the AI provider you want to use for text generation
          </HelperText>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="model">Model:</Label>
          {isLoadingModels ? (
            <LoadingIndicator>Loading available models...</LoadingIndicator>
          ) : modelError && !models.length ? (
            <InfoBanner>{modelError}</InfoBanner>
          ) : null}
          
          <Select
            id="model"
            name="model"
            value={localSettings.model}
            onChange={handleChange}
            disabled={isLoadingModels || models.length === 0}
          >
            {models.length === 0 && <option value="">Select a model</option>}
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name || model.id}
              </option>
            ))}
          </Select>

          {models.length > 0 && (
            <Button 
              onClick={handleRefreshModels} 
              disabled={isLoadingModels || !localSettings.apiKey}
              style={{ marginTop: '5px', marginBottom: '10px' }}
            >
              Refresh Models
            </Button>
          )}

          <ModelDescription>
            {localSettings.model
              ? getModelDescription(localSettings.provider, localSettings.model)
              : "Select a model to see its description."}
          </ModelDescription>
        </FormGroup>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>API Configuration</SectionTitle>

        <FormGroup>
          <Label htmlFor="apiKey">API Key:</Label>
          <Input
            id="apiKey"
            name="apiKey"
            type="password"
            value={localSettings.apiKey || ""}
            onChange={handleChange}
            placeholder="Enter your API key"
          />

          <Checkbox>
            <input
              type="checkbox"
              id="saveApiKey"
              name="saveApiKey"
              checked={localSettings.saveApiKey}
              onChange={handleChange}
            />
            <label htmlFor="saveApiKey">Save API key on this device</label>
          </Checkbox>

          <HelperText>
            Your API key will be stored locally and only used to make calls to
            the selected provider.
            {!localSettings.saveApiKey &&
              " The key will be forgotten when you close the application."}
          </HelperText>

          <div style={{ marginTop: "10px" }}>
            <Button
              onClick={handleTestApiKey}
              disabled={!localSettings.apiKey?.trim()}
            >
              Test API Key
            </Button>
          </div>

          {testStatus && (
            <TestResultContainer
              $success={testStatus === "success"}
              $error={testStatus === "error"}
            >
              {testMessage}
            </TestResultContainer>
          )}
        </FormGroup>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>Usage Information</SectionTitle>
        <Text size="12px">
          Different providers may have different pricing models and
          capabilities. Make sure to check their documentation for details about
          token limits, pricing, and features.
        </Text>

        <Text size="12px" margin="10px 0 0 0">
          To obtain an API key, visit:
        </Text>

        <ul style={{ fontSize: "12px", margin: "5px 0 0 20px" }}>
          {localSettings.provider === "groq" && (
            <li>
              Groq:{" "}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://console.groq.com/keys
              </a>
            </li>
          )}
          {localSettings.provider === "anthropic" && (
            <li>
              Anthropic:{" "}
              <a
                href="https://console.anthropic.com/keys"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://console.anthropic.com/keys
              </a>
            </li>
          )}
          {localSettings.provider === "openai" && (
            <li>
              OpenAI:{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://platform.openai.com/api-keys
              </a>
            </li>
          )}
          {localSettings.provider === "gemini" && (
            <li>
              Google AI Studio:{" "}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://makersuite.google.com/app/apikey
              </a>
            </li>
          )}
        </ul>
      </SettingsSection>
    </div>
  );
};

export default LLMSettings;