// src/components/ApiSettingsPanel.jsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { modelAPI } from "../services/api";

const ApiSettingsPanel = ({ onClose }) => {
  const {
    apiSettings,
    updateApiKey,
    updatePreferredProvider,
    updatePreferredModel,
    saveApiSettings, // Direct access to save all settings at once
  } = useAuth();

  // Initialize state from existing settings
  const [apiKey, setApiKey] = useState(apiSettings.apiKey || "");
  const [provider, setProvider] = useState(
    apiSettings.preferredProvider || "openai"
  );
  const [selectedModel, setSelectedModel] = useState(
    apiSettings.preferredModel || ""
  );
  const [customModel, setCustomModel] = useState("");
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // List of available providers
  const providers = [
    { id: "openai", name: "OpenAI" },
    { id: "groq", name: "Groq" },
  ];

  // Fetch models for the selected provider
  const {
    data: models = [],
    isLoading: modelsLoading,
    error: modelsError,
    refetch: refetchModels,
  } = useQuery({
    queryKey: ["models", provider, apiKey],
    queryFn: async () => {
      if (!provider || !apiKey) return [];

      try {
        const response = await modelAPI.getModels(provider);
        return response.data;
      } catch (error) {
        console.error("Error fetching models:", error);
        return [];
      }
    },
    enabled: false, // Don't run automatically, we'll trigger manually
  });

  // Effect to initialize state
  useEffect(() => {
    console.log("Current API settings:", apiSettings);

    // Initialize values from apiSettings
    setApiKey(apiSettings.apiKey || "");
    setProvider(apiSettings.preferredProvider || "openai");

    // Handle model selection mode
    if (apiSettings.preferredModel) {
      // Initial API call to check available models
      if (apiSettings.apiKey) {
        refetchModels();
      }

      setSelectedModel(apiSettings.preferredModel);
      setCustomModel(apiSettings.preferredModel);
      setUseCustomModel(true); // Default to custom until we confirm it's in the list
    }
  }, [apiSettings, refetchModels]);

  // Effect to handle models fetch results
  useEffect(() => {
    if (models.length > 0 && apiSettings.preferredModel) {
      // Check if the preferred model is in the list
      const modelExists = models.some(
        (model) => model.id === apiSettings.preferredModel
      );

      if (modelExists) {
        setUseCustomModel(false);
        setSelectedModel(apiSettings.preferredModel);
      } else {
        setUseCustomModel(true);
        setCustomModel(apiSettings.preferredModel);
      }
    }
  }, [models, apiSettings.preferredModel]);

  const toggleApiKeyVisibility = () => {
    setIsApiKeyVisible(!isApiKeyVisible);
  };

  const handleFetchModels = () => {
    if (apiKey) {
      refetchModels();
    }
  };

  const toggleCustomModel = () => {
    setUseCustomModel(!useCustomModel);
    if (!useCustomModel) {
      setSelectedModel("");
    } else {
      setCustomModel("");
    }
  };

  const handleSave = async () => {
    setSaveError("");

    // Determine which model to save
    const modelToSave = useCustomModel ? customModel : selectedModel;

    // Save all settings at once to ensure consistency
    const success = saveApiSettings({
      apiKey: apiKey,
      preferredProvider: provider,
      preferredModel: modelToSave,
    });

    if (success) {
      // Update server preferences if needed
      if (provider !== apiSettings.preferredProvider) {
        await updatePreferredProvider(provider);
      }

      if (modelToSave !== apiSettings.preferredModel) {
        await updatePreferredModel(modelToSave);
      }

      // Show success message
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError("Failed to save settings. Please try again.");
    }
  };

  return (
    <div className="settings-panel">
      <div className="settings-panel-header">
        <h2>API Settings</h2>
        <button type="button" className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="settings-panel-content">
        <div className="form-group">
          <label htmlFor="apiKey">API Key</label>
          <div className="api-key-input">
            <input
              id="apiKey"
              type={isApiKeyVisible ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={toggleApiKeyVisibility}
            >
              {isApiKeyVisible ? "Hide" : "Show"}
            </button>
          </div>
          <div className="api-key-actions">
            <small>
              Your API key is stored locally and never sent to our servers
            </small>
            <button
              type="button"
              className="fetch-models-btn"
              onClick={handleFetchModels}
              disabled={!apiKey}
            >
              Fetch Available Models
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="provider">Preferred Provider</label>
          <select
            id="provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group model-selection">
          <div className="model-toggle">
            <label>Model Selection Method</label>
            <div className="toggle-buttons">
              <button
                type="button"
                className={!useCustomModel ? "active" : ""}
                onClick={() => setUseCustomModel(false)}
                disabled={modelsLoading || (!models.length && !modelsError)}
              >
                Choose from List
              </button>
              <button
                type="button"
                className={useCustomModel ? "active" : ""}
                onClick={() => setUseCustomModel(true)}
              >
                Enter Manually
              </button>
            </div>
          </div>

          {!useCustomModel ? (
            <div className="dropdown-model-selection">
              <label htmlFor="model">Preferred Model</label>
              <select
                id="model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={modelsLoading || !models.length}
              >
                <option value="">Select a model</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name || model.id}
                  </option>
                ))}
              </select>

              {modelsLoading && (
                <div className="loading-indicator">Loading models...</div>
              )}

              {!modelsLoading && models.length === 0 && (
                <div className="no-models">
                  {modelsError ? (
                    <p className="error-text">
                      Failed to load models. Try entering your model manually.
                    </p>
                  ) : !apiKey ? (
                    <p>Enter an API key to load available models</p>
                  ) : (
                    <p>No models found. Try entering your model manually.</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="custom-model-selection">
              <label htmlFor="customModel">Enter Model Name/ID</label>
              <input
                id="customModel"
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="Example: gpt-4-turbo, llama3-8b-8192"
              />
              <small>
                Enter the exact model identifier for your selected provider
              </small>
            </div>
          )}
        </div>

        {saveSuccess && (
          <div className="success-message">Settings saved successfully!</div>
        )}
        {saveError && <div className="error-message">{saveError}</div>}

        <div className="settings-panel-debug">
          <details>
            <summary>Debug Information</summary>
            <div className="debug-info">
              <p>Current API Key: {apiSettings.apiKey ? "••••••••" : "None"}</p>
              <p>Current Provider: {apiSettings.preferredProvider}</p>
              <p>Current Model: {apiSettings.preferredModel || "None"}</p>
              <p>New API Key: {apiKey ? "••••••••" : "None"}</p>
              <p>New Provider: {provider}</p>
              <p>New Model: {useCustomModel ? customModel : selectedModel}</p>
            </div>
          </details>
        </div>

        <div className="settings-panel-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="primary"
            onClick={handleSave}
            disabled={(!selectedModel && !customModel) || !apiKey}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiSettingsPanel;
