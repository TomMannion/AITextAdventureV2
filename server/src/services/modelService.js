import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { Groq } from "groq-sdk";
import logger from "../utils/logger.js";
import { ApiError } from "../middleware/errorMiddleware.js";

/**
 * Model Service for fetching available models from different LLM providers
 */
class ModelService {
  /**
   * Get available models from a specific LLM provider
   * @param {Object} options - Configuration options
   * @param {string} options.provider - LLM provider name (openai, anthropic, groq, gemini)
   * @param {string} options.apiKey - API key for the provider
   * @returns {Promise<Array>} List of available models
   */
  async getModels(options) {
    // Validate required options
    if (!options.provider || !options.apiKey) {
      throw new ApiError(400, "Missing required provider or API key");
    }

    // Convert provider to lowercase
    const provider = options.provider.toLowerCase();

    // Choose method based on provider
    switch (provider) {
      case "openai":
        return this.getOpenAIModels(options.apiKey);
      case "anthropic":
        return this.getAnthropicModels(options.apiKey);
      case "groq":
        return this.getGroqModels(options.apiKey);
      case "gemini":
        return this.getGeminiModels(options.apiKey);
      default:
        throw new ApiError(400, `Unsupported AI provider: ${provider}`);
    }
  }

  /**
   * Get available models from OpenAI
   * @param {string} apiKey - OpenAI API key
   * @returns {Promise<Array>} List of OpenAI models
   */
  async getOpenAIModels(apiKey) {
    try {
      const openai = new OpenAI({ apiKey });
      const response = await openai.models.list();
      
      return response.data.map(model => ({
        id: model.id,
        provider: "openai",
        name: model.id,
        created: model.created,
        owned_by: model.owned_by,
        context_window: this.getContextWindow(model.id, "openai"),
        capabilities: this.getModelCapabilities(model.id, "openai")
      }));
    } catch (error) {
      this.handleApiError(error, "OpenAI");
    }
  }

  /**
   * Get available models from Anthropic
   * @param {string} apiKey - Anthropic API key
   * @returns {Promise<Array>} List of Anthropic models
   */
  async getAnthropicModels(apiKey) {
    try {
      const anthropic = new Anthropic({ apiKey });
      const response = await anthropic.models.list();
      
      return response.data.map(model => ({
        id: model.id,
        provider: "anthropic",
        name: model.display_name || model.id,
        created: model.created_at,
        owned_by: "Anthropic",
        context_window: this.getContextWindow(model.id, "anthropic"),
        capabilities: this.getModelCapabilities(model.id, "anthropic")
      }));
    } catch (error) {
      this.handleApiError(error, "Anthropic");
    }
  }

  /**
   * Get available models from Groq
   * @param {string} apiKey - Groq API key
   * @returns {Promise<Array>} List of Groq models
   */
  async getGroqModels(apiKey) {
    try {
      const groq = new Groq({ apiKey });
      const response = await groq.models.list();
      
      return response.data.map(model => ({
        id: model.id,
        provider: "groq",
        name: model.id,
        created: model.created,
        owned_by: model.owned_by,
        context_window: model.context_window || this.getContextWindow(model.id, "groq"),
        capabilities: this.getModelCapabilities(model.id, "groq")
      }));
    } catch (error) {
      this.handleApiError(error, "Groq");
    }
  }

  /**
   * Get available models from Google Gemini
   * @param {string} apiKey - Google API key
   * @returns {Promise<Array>} List of Gemini models
   */
  async getGeminiModels(apiKey) {
    try {
      // Import the Google Generative AI SDK
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Use the listModels method if available, or fetch from API directly
      const fetch = await import("node-fetch");
      const response = await fetch.default(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return data.models.map(model => ({
        id: model.name.replace("models/", ""),
        provider: "gemini",
        name: model.displayName || model.name,
        created: null, // Gemini doesn't provide creation date
        owned_by: "Google",
        context_window: model.inputTokenLimit || this.getContextWindow(model.name, "gemini"),
        capabilities: {
          chat: model.supportedGenerationMethods.includes("generateContent"),
          text: model.supportedGenerationMethods.includes("generateText"),
          embedding: model.supportedGenerationMethods.includes("embedText"),
          json: model.supportedGenerationMethods.includes("generateContent")
        }
      }));
    } catch (error) {
      this.handleApiError(error, "Gemini");
    }
  }

  /**
   * Get estimated context window for model if not provided by API
   * @param {string} modelId - Model identifier
   * @param {string} provider - Provider name
   * @returns {number} Estimated context window size
   */
  getContextWindow(modelId, provider) {
    // These are rough estimates for common models
    // For production, maintain an updated mapping of model capabilities
    const contextSizes = {
      // OpenAI models
      "gpt-3.5-turbo": 16385,
      "gpt-3.5-turbo-16k": 16385,
      "gpt-4": 8192,
      "gpt-4-32k": 32768,
      "gpt-4-turbo": 128000,
      "gpt-4o": 128000,
      
      // Anthropic models
      "claude-3-opus": 200000,
      "claude-3-sonnet": 200000,
      "claude-3-haiku": 200000,
      "claude-2": 100000,
      "claude-2.1": 200000,
      "claude-3.5-sonnet": 200000,
      
      // Groq models
      "llama3-8b-8192": 8192,
      "llama3-70b-8192": 8192,
      "mixtral-8x7b-32768": 32768,
      
      // Gemini models
      "gemini-1.0-pro": 32000,
      "gemini-1.5-flash": 1000000,
      "gemini-1.5-pro": 1000000,
    };
    
    // Try to match model ID exactly
    if (contextSizes[modelId]) {
      return contextSizes[modelId];
    }
    
    // Try to match by prefix
    for (const [key, size] of Object.entries(contextSizes)) {
      if (modelId.startsWith(key)) {
        return size;
      }
    }
    
    // Default sizes by provider
    const defaultSizes = {
      "openai": 4096,
      "anthropic": 100000,
      "groq": 8192,
      "gemini": 32000
    };
    
    return defaultSizes[provider] || 4096;
  }

  /**
   * Get model capabilities based on model ID and provider
   * @param {string} modelId - Model identifier
   * @param {string} provider - Provider name
   * @returns {Object} Capabilities object
   */
  getModelCapabilities(modelId, provider) {
    // Default capabilities
    const capabilities = {
      chat: true,
      text: true,
      embedding: false,
      json: true
    };
    
    // Adjust based on model and provider
    if (provider === "openai") {
      capabilities.embedding = modelId.includes("embedding");
      capabilities.json = !modelId.includes("embedding");
    } else if (provider === "anthropic") {
      capabilities.embedding = false;
    } else if (provider === "groq") {
      capabilities.embedding = false;
    } else if (provider === "gemini") {
      capabilities.embedding = modelId.includes("embedding");
    }
    
    return capabilities;
  }

  /**
   * Handle API errors from LLM providers
   */
  handleApiError(error, providerName) {
    logger.error(`${providerName} API Error:`, {
      message: error.message,
      type: error.type,
      code: error.code,
    });

    if (error.code === "authentication_error" || error.status === 401) {
      throw new ApiError(
        401,
        `Invalid ${providerName} API key or unauthorized access`
      );
    } else if (error.code === "rate_limit_exceeded" || error.status === 429) {
      throw new ApiError(429, `${providerName} rate limit exceeded`);
    } else if (
      error.code === "server_error" ||
      (error.status && error.status >= 500)
    ) {
      throw new ApiError(
        502,
        `${providerName} service error: ${error.message}`
      );
    } else {
      throw new ApiError(
        500,
        `${providerName} request failed: ${error.message}`
      );
    }
  }
}

export default new ModelService();