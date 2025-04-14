import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { Groq } from "groq-sdk";
import config from "../config/index.js";
import logger, { promptLogger } from "../utils/logger.js";
import { ApiError } from "../middleware/errorMiddleware.js";

/**
 * AI Service for handling interactions with different LLM providers
 */
class AiService {
  /**
   * Get available models from a provider
   * @param {Object} options - Configuration options
   * @param {string} options.provider - LLM provider name (openai, anthropic, groq, gemini)
   * @param {string} options.apiKey - API key for the provider
   * @returns {Promise<Array>} List of available models
   */
  async getAvailableModels(options) {
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
   */
  async getOpenAIModels(apiKey) {
    try {
      const openai = new OpenAI({ apiKey });
      const response = await openai.models.list();
      
      return response.data.map(model => ({
        id: model.id,
        name: model.id,
        created: model.created,
        owned_by: model.owned_by,
        // Add estimated context window
        context_window: this.getContextWindowForModel(model.id, "openai")
      }));
    } catch (error) {
      this.handleSdkError(error, "OpenAI");
    }
  }

  /**
   * Get available models from Anthropic
   */
  async getAnthropicModels(apiKey) {
    try {
      const anthropic = new Anthropic({ apiKey });
      const response = await anthropic.models.list();
      
      return response.data.map(model => ({
        id: model.id,
        name: model.display_name || model.id,
        created: new Date(model.created_at).getTime() / 1000, // Convert to Unix timestamp
        owned_by: "Anthropic",
        // Add estimated context window
        context_window: this.getContextWindowForModel(model.id, "anthropic")
      }));
    } catch (error) {
      this.handleSdkError(error, "Anthropic");
    }
  }

  /**
   * Get available models from Groq
   */
  async getGroqModels(apiKey) {
    try {
      // Create a fresh Groq instance for each request
      const groq = new Groq({ apiKey });
      const response = await groq.models.list();
      
      return response.data.map(model => ({
        id: model.id,
        name: model.id,
        created: model.created,
        owned_by: model.owned_by,
        context_window: model.context_window || this.getContextWindowForModel(model.id, "groq")
      }));
    } catch (error) {
      this.handleSdkError(error, "Groq");
    }
  }

  /**
   * Get available models from Google Gemini
   */
  async getGeminiModels(apiKey) {
    try {
      // Import the Google Generative AI SDK
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      
      // We need to use fetch directly as the SDK doesn't have a list models function
      const fetch = await import("node-fetch");
      const response = await fetch.default(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Gemini API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return data.models.map(model => ({
        id: model.name.replace("models/", ""),
        name: model.displayName || model.name,
        created: null, // Gemini doesn't provide creation date
        owned_by: "Google",
        context_window: model.inputTokenLimit || this.getContextWindowForModel(model.name, "gemini")
      }));
    } catch (error) {
      this.handleSdkError(error, "Gemini");
    }
  }

  /**
   * Get context window size for a model
   * @param {string} modelId - Model identifier
   * @param {string} provider - Provider name
   * @returns {number} Context window size
   */
  getContextWindowForModel(modelId, provider) {
    // Common context windows for popular models
    const contextWindows = {
      // OpenAI models
      "gpt-3.5-turbo": 16385,
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
    
    // Check for exact match
    if (contextWindows[modelId]) {
      return contextWindows[modelId];
    }
    
    // Check for partial match by prefix
    for (const [key, size] of Object.entries(contextWindows)) {
      if (modelId.startsWith(key)) {
        return size;
      }
    }
    
    // Default values by provider
    const defaults = {
      "openai": 4096,
      "anthropic": 100000,
      "groq": 8192,
      "gemini": 32000
    };
    
    return defaults[provider] || 4096;
  }

  /**
   * Generate JSON response using an LLM provider
   * @param {Object} options - Configuration options
   * @param {string} options.provider - LLM provider name (openai, anthropic, groq)
   * @param {string} options.modelId - Model ID to use
   * @param {string} options.apiKey - API key for the provider
   * @param {Object} promptData - Data for the prompt
   * @returns {Promise<object>} Generated JSON response
   */
  async generateJSON(options, promptData) {
    // Validate required options
    if (!options.provider || !options.modelId || !options.apiKey) {
      throw new ApiError(400, "Missing required AI provider options");
    }

    // Convert provider to lowercase
    const provider = options.provider.toLowerCase();

    // Get provider config
    const providerConfig = config.ai.providers[provider];
    if (!providerConfig) {
      throw new ApiError(400, `Unsupported AI provider: ${provider}`);
    }

    // Log the complete prompt data with context
    promptLogger.info("LLM Prompt", {
      provider,
      modelId: options.modelId,
      temperature: promptData.temperature,
      maxTokens: promptData.maxTokens,
      messages: promptData.messages,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(), // Generate a unique ID for each request
    });

    // Choose method based on provider
    switch (provider) {
      case "openai":
        return this.generateJSONWithOpenAI(options, promptData);
      case "anthropic":
        return this.generateJSONWithAnthropic(options, promptData);
      case "groq":
        return this.generateJSONWithGroq(options, promptData);
      case "gemini":
        return this.generateJSONWithGemini(options, promptData);
      default:
        throw new ApiError(400, `Unsupported AI provider: ${provider}`);
    }
  }

  /**
   * Generate JSON using OpenAI SDK
   */
  async generateJSONWithOpenAI(options, promptData) {
    const { apiKey, modelId } = options;
    const { messages, temperature, maxTokens } = promptData;
    const providerConfig = config.ai.providers.openai;

    try {
      const openai = new OpenAI({ apiKey });

      const response = await openai.chat.completions.create({
        model: modelId || providerConfig.defaultModel,
        messages,
        temperature: temperature || config.ai.prompts.temperature,
        max_tokens: maxTokens || config.ai.prompts.maxTokens,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      if (error instanceof SyntaxError) {
        // Handle JSON parsing error
        logger.error("OpenAI returned invalid JSON:", error);
        throw new ApiError(500, "Provider returned invalid JSON response");
      }
      this.handleSdkError(error, "OpenAI");
    }
  }

  /**
   * Generate JSON using Anthropic SDK
   */
  async generateJSONWithAnthropic(options, promptData) {
    const { apiKey, modelId } = options;
    const { messages, temperature, maxTokens } = promptData;
    const providerConfig = config.ai.providers.anthropic;

    try {
      const anthropic = new Anthropic({ apiKey });

      // Add system prompt if not already included
      let systemPrompt = "Always respond with valid JSON objects.";
      let hasSystemMessage = messages.some((msg) => msg.role === "system");

      const response = await anthropic.messages.create({
        model: modelId || providerConfig.defaultModel,
        messages,
        temperature: temperature || config.ai.prompts.temperature,
        max_tokens: maxTokens || config.ai.prompts.maxTokens,
        system: hasSystemMessage ? undefined : systemPrompt,
        response_format: { type: "json_object" },
      });

      const content = response.content[0].text;
      return JSON.parse(content);
    } catch (error) {
      if (error instanceof SyntaxError) {
        logger.error("Anthropic returned invalid JSON:", error);
        throw new ApiError(500, "Provider returned invalid JSON response");
      }
      this.handleSdkError(error, "Anthropic");
    }
  }

  /**
   * Attempt to fix and parse malformed JSON from the LLM
   * @param {string} text - Potentially malformed JSON string
   * @returns {Object|null} Parsed JSON object or null if parsing fails
   */
  fixAndParseJSON(text) {
    try {
      // First try standard JSON parse
      return JSON.parse(text);
    } catch (error) {
      logger.warn(
        "Standard JSON parsing failed, attempting to fix malformed JSON"
      );

      try {
        // Common JSON fixes:

        // 1. Replace single quotes with double quotes
        let fixedText = text.replace(/'/g, '"');

        // 2. Add quotes around unquoted keys
        fixedText = fixedText.replace(
          /([{,])\s*([a-zA-Z0-9_]+)\s*:/g,
          '$1"$2":'
        );

        // 3. Fix "Options" to "options" and other key formatting issues
        fixedText = fixedText.replace(/"Options"\s*:/g, '"options":');
        fixedText = fixedText.replace(/"Status"\s*:/g, '"status":');

        // 4. Remove extra quotes around json keys
        fixedText = fixedText.replace(/"([^"]+)""\s*:/g, '"$1":');

        // 5. Handle trailing commas
        fixedText = fixedText.replace(/,\s*}/g, "}");
        fixedText = fixedText.replace(/,\s*]/g, "]");

        // Try to parse the fixed text
        try {
          return JSON.parse(fixedText);
        } catch (innerError) {
          logger.warn(
            "Initial JSON fixes failed, attempting more aggressive parsing"
          );

          // More aggressive parsing - extract JSON-like structure
          const segmentTitleMatch = text.match(
            /"segmentTitle"\s*:\s*"([^"]*)"/
          );
          const contentMatch = text.match(/"content"\s*:\s*"([^"]*)"/);

          // Extract options array, handling multi-line options
          let optionsMatch = text.match(/"options"\s*:\s*\[([\s\S]*?)\]/i);
          if (!optionsMatch) {
            optionsMatch = text.match(/options:\s*\[([\s\S]*?)\]/i);
          }

          const statusMatch = text.match(/"status"\s*:\s*"([^"]*)"/i);

          // Construct a valid JSON object from the extracted parts
          const reconstructedObject = {};

          if (segmentTitleMatch && segmentTitleMatch[1]) {
            reconstructedObject.segmentTitle = segmentTitleMatch[1];
          } else {
            // Create a default title if none found
            reconstructedObject.segmentTitle = "Adventure Continues";
          }

          if (contentMatch && contentMatch[1]) {
            reconstructedObject.content = contentMatch[1].replace(/\\n/g, "\n");
          } else {
            // Extract content more aggressively if traditional match fails
            const contentRegex = /"content"\s*:\s*"([\s\S]*?)(?:",|\"\n)/;
            const aggressiveMatch = text.match(contentRegex);
            if (aggressiveMatch && aggressiveMatch[1]) {
              reconstructedObject.content = aggressiveMatch[1].replace(
                /\\n/g,
                "\n"
              );
            } else {
              reconstructedObject.content = "The adventure continues...";
            }
          }

          // Process options
          reconstructedObject.options = [];
          if (optionsMatch && optionsMatch[1]) {
            // Extract quoted strings from options array
            const optionStrings = optionsMatch[1].match(/"([^"]*)"/g);
            if (optionStrings && optionStrings.length > 0) {
              reconstructedObject.options = optionStrings.map((opt) =>
                opt.replace(/^"|"$/g, "")
              );
            }
          }

          // Ensure we have at least some default options
          if (reconstructedObject.options.length === 0) {
            reconstructedObject.options = [
              "Continue exploring",
              "Take a different approach",
            ];
          }

          // Set status
          if (statusMatch && statusMatch[1]) {
            reconstructedObject.status = statusMatch[1];
          } else {
            reconstructedObject.status = "ACTIVE";
          }

          logger.info(
            "Successfully reconstructed JSON from malformed response"
          );
          return reconstructedObject;
        }
      } catch (outerError) {
        logger.error("Failed to fix malformed JSON:", outerError);
        return null;
      }
    }
  }

  /**
   * Generate JSON using Groq SDK, explicitly adding a unique random seed per request.
   */
  async generateJSONWithGroq(options, promptData) {
    const { apiKey, modelId } = options;
    const { messages, temperature, maxTokens } = promptData; // Assuming temperature is still passed, though seed has strong effect
    const providerConfig = config.ai.providers.groq;

    try {
      // Create a fresh Groq instance with cache control headers
      const groq = new Groq({
        apiKey,
        baseOptions: {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      });

      logger.debug(`Creating new Groq instance for request`);

      // --- *** NEW: Generate a unique random seed for this specific request *** ---
      // Using a large integer range.
      const randomSeed = Math.floor(Math.random() * 2147483647); // Max safe integer is large enough
      logger.debug(`Using generated random seed for Groq request: ${randomSeed}`);
      // --- *** END NEW *** ---

      // Determine effective temperature (might have less impact when seed is set, but good to keep)
      const effectiveTemperature = Math.max(temperature || 0.8, 0.1); // Allow lower temp if specified, default 0.8
      // Add penalties if desired (can be used with seed)
      const presencePenalty = 0.1;
      const frequencyPenalty = 0.1;


      // Construct the API payload, now including the seed
      const apiPayload = {
        model: modelId || providerConfig.defaultModel,
        messages, // CRITICAL: Ensure this array is correct and fresh for each NEW story request!
        temperature: effectiveTemperature,
        max_tokens: maxTokens || config.ai.prompts.maxTokens,
        response_format: { type: "json_object" },
        user: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, // Unique user ID is good
        presence_penalty: presencePenalty,
        frequency_penalty: frequencyPenalty,
        // --- *** NEW: Add the seed parameter to the payload *** ---
        seed: randomSeed,
        // --- *** END NEW *** ---
      };

      // Log the payload being sent, *including the seed*
      promptLogger.info("Sending request to Groq with explicit seed", {
         model: apiPayload.model,
         temperature: apiPayload.temperature,
         seed: apiPayload.seed, // Log the seed value
         presence_penalty: apiPayload.presence_penalty,
         frequency_penalty: apiPayload.frequency_penalty,
         user: apiPayload.user,
         messageCount: apiPayload.messages.length
      });

      const response = await groq.chat.completions.create(apiPayload);

      const content = response.choices[0].message.content;

      // Attempt to parse the JSON, with fallback fixing logic
      try {
        return JSON.parse(content);
      } catch (error) {
        logger.warn("Groq returned potentially invalid JSON with seed, attempting to fix", { rawContent: content, seedUsed: randomSeed });
        const fixedJson = this.fixAndParseJSON(content); // Use your existing fixer

        if (fixedJson) {
          logger.info("Successfully parsed JSON after applying fixes (seed used).");
          return fixedJson;
        } else {
           logger.error("Unable to parse JSON response from Groq even after attempting fixes (seed used).", { rawContent: content, seedUsed: randomSeed });
          throw new Error("Unable to parse JSON response from Groq after attempting fixes (seed used).");
        }
      }
    } catch (error) {
      // Handle specific Groq JSON validation failure where content might be salvaged
      if (
        error.response &&
        error.response.data &&
        error.response.data.error &&
        error.response.data.error.failed_generation // Check for Groq's specific error structure
      ) {
        logger.warn(
          "Groq API indicated JSON generation failure with seed, attempting to parse 'failed_generation' content",
          { errorDetails: error.response.data.error, seedUsed: randomSeed } // Log seed here too if possible
        );
        const failedGenerationContent = error.response.data.error.failed_generation;
        const fixedJson = this.fixAndParseJSON(failedGenerationContent);

        if (fixedJson) {
           logger.info("Successfully parsed JSON from 'failed_generation' content after applying fixes (seed used).");
          return fixedJson;
        } else {
           logger.error("Failed to parse even the 'failed_generation' content (seed used).", { rawFailedContent: failedGenerationContent, seedUsed: randomSeed });
           error.message = `Groq JSON generation failed (seed used) and fallback parsing failed: ${error.message}`;
        }
      }

      // Use your existing general SDK error handler
      this.handleSdkError(error, "Groq");
      throw error; // Re-throw the error after handling/logging if handleSdkError doesn't throw
    }
  }

  /**
   * Generate JSON using Google Gemini API
   */
  async generateJSONWithGemini(options, promptData) {
    const { apiKey, modelId } = options;
    const { messages, temperature, maxTokens } = promptData;
    const providerConfig = config.ai.providers.gemini || {
      defaultModel: "gemini-1.5-flash",
    };

    try {
      // Import the Google Generative AI SDK
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);

      logger.debug(`Creating new Gemini instance for request`);

      // Create a model instance with JSON output configuration
      const model = genAI.getGenerativeModel({
        model: modelId || providerConfig.defaultModel,
        generationConfig: {
          temperature: temperature || config.ai.prompts.temperature,
          maxOutputTokens: maxTokens || config.ai.prompts.maxTokens,
        },
      });
      console.log("message for gemini!!!!!!: ", messages);
      // Format the messages for Gemini
      const formattedPrompt = this.formatMessagesForGemini(messages);

      // Add instruction to return JSON
      if (messages.length > 0 && messages[0].role === "system") {
        messages[0].content += "\n\nPlease respond with valid JSON.";
      } else {
        messages.unshift({
          role: "system",
          content: "Please respond with valid JSON.",
        });
      }
      console.log("gemini message LOOK AT ME!: *******", formattedPrompt);
      // Generate content
      const result = await model.generateContent(formattedPrompt);
      const content = result.response.text();
      console.log("This is the gemini results: ******", content);

      try {
        // Check if the response is wrapped in a markdown code block
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);

        // If it's in a code block, extract just the JSON part
        const jsonContent = jsonMatch ? jsonMatch[1] : content;

        // Try standard JSON parse with the extracted or original content
        return JSON.parse(jsonContent);
      } catch (error) {
        // If that fails, use our fallback parser
        logger.warn("Gemini returned invalid JSON, attempting to fix");
        const fixedJson = this.fixAndParseJSON(content);

        if (fixedJson) {
          return fixedJson;
        } else {
          throw new Error("Unable to parse JSON response from Gemini");
        }
      }
    } catch (error) {
      this.handleSdkError(error, "Gemini");
    }
  }

  /**
   * Format chat messages for Gemini's expected structure
   * @param {Array} messages - Array of {role, content} objects
   * @returns {Object} - Formatted prompt for Gemini
   */
  formatMessagesForGemini(messages) {
    // Extract system message if present
    const systemMessages = messages.filter((msg) => msg.role === "system");
    let systemInstruction = null;

    if (systemMessages.length > 0) {
      systemInstruction = {
        text: systemMessages.map((msg) => msg.content).join("\n"),
      };
    }

    // Format user and assistant messages
    const contents = messages
      .filter((msg) => msg.role !== "system")
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

    // If we only have a user message with no history, we can simplify
    if (
      contents.length === 1 &&
      contents[0].role === "user" &&
      !systemInstruction
    ) {
      return contents[0].parts[0].text;
    }

    // Return the full formatted prompt
    return {
      contents,
      systemInstruction,
    };
  }

  /**
   * Handle SDK errors from LLM providers with better error classification
   */
  handleSdkError(error, providerName) {
    logger.error(`${providerName} SDK Error:`, {
      message: error.message,
      type: error.type,
      code: error.code,
    });

    // Most SDKs have standardized error types
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
    } else if (error.code === "timeout" || error.type === "request_timeout") {
      throw new ApiError(504, `${providerName} request timeout`);
    } else {
      throw new ApiError(
        500,
        `${providerName} request failed: ${error.message}`
      );
    }
  }
}

export default new AiService();