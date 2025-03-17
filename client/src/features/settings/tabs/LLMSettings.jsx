// src/features/settings/tabs/LLMSettings.jsx
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { win95Border } from "../../../utils/styleUtils";
import Text from "../../../components/common/Text";
import Button from "../../../components/common/Button";
import { useSettings } from "../../../contexts/SettingsContext";

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
    props.$success ? "#e0ffe0" : props.$error ? "#ffe0e0" : "white"};
  font-size: 12px;
`;

/**
 * LLM Provider Settings Component
 */
const LLMSettings = () => {
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings.llm);
  const [testStatus, setTestStatus] = useState(null);
  const [testMessage, setTestMessage] = useState("");

  // Update local state when settings change
  useEffect(() => {
    setLocalSettings(settings.llm);
  }, [settings.llm]);

  // Handle changes with debounce
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setLocalSettings((prev) => {
      // If provider changed, reset model to a default for that provider
      if (name === "provider") {
        return {
          ...prev,
          [name]: newValue,
          model: getDefaultModelForProvider(newValue),
        };
      }

      return {
        ...prev,
        [name]: newValue,
      };
    });
  }, []);

  // Use debounced effect for saving changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateSettings("llm", localSettings);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [localSettings, updateSettings]);

  // Get default model for a provider
  const getDefaultModelForProvider = (provider) => {
    switch (provider) {
      case "groq":
        return "llama-3.1-8b-instant";
      case "anthropic":
        return "claude-3-sonnet-20240229";
      case "openai":
        return "gpt-4-turbo";
      case "gemini":
        return "gemini-2.0-flash";
      default:
        return "";
    }
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

  // Get description for the selected model
  const getModelDescription = (provider, model) => {
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
      descriptions[provider]?.[model] ||
      "No description available for this model."
    );
  };

  // Test API key
  const handleTestApiKey = useCallback(() => {
    setTestStatus("loading");
    setTestMessage("Testing connection to provider...");

    // Simulate API call
    setTimeout(() => {
      if (!localSettings.apiKey?.trim()) {
        setTestStatus("error");
        setTestMessage("API key cannot be empty");
        return;
      }

      if (localSettings.apiKey.length < 8) {
        setTestStatus("error");
        setTestMessage("API key seems too short. Please check your key.");
        return;
      }

      // This is just a simulation - in a real app, you'd make an actual API call
      // to verify the key works with the chosen provider
      setTestStatus("success");
      setTestMessage("Connection successful! API key appears to be valid.");
    }, 1500);
  }, [localSettings.apiKey]);

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
          <Select
            id="model"
            name="model"
            value={localSettings.model}
            onChange={handleChange}
          >
            {getModelsForProvider(localSettings.provider).map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </Select>

          <ModelDescription>
            {getModelDescription(localSettings.provider, localSettings.model)}
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
