// src/services/api/groqService.js
import axios from "axios";
import { DEFAULT_REQUEST_PARAMS, formatErrorMessage } from "./apiHelpers.js";

const API_BASE_URL = "https://api.groq.com/openai/v1";

/**
 * Fetch available models from Groq
 * @param {string} apiKey - Groq API key
 * @returns {Promise<Array>} - List of available models
 */
export async function getModels(apiKey) {
  try {
    if (!apiKey) {
      return [];
    }

    const response = await axios.get(`${API_BASE_URL}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return response.data.data
      .filter((model) => model.id && model.object === "model")
      .map((model) => ({
        id: model.id,
        name: model.id,
        provider: "groq",
        created: model.created
          ? new Date(model.created * 1000).toISOString()
          : null,
      }));
  } catch (error) {
    console.error(formatErrorMessage("Groq models fetch", error));
    return [];
  }
}

/**
 * Call Groq API for chat completions
 * @param {string} prompt - User prompt
 * @param {string} systemPrompt - System prompt
 * @param {string} modelId - Model ID to use
 * @param {string} apiKey - Groq API key
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Parsed JSON response
 */
export async function callChatCompletion(
  prompt,
  systemPrompt,
  modelId,
  apiKey,
  options = {}
) {
  try {
    const requestParams = { ...DEFAULT_REQUEST_PARAMS, ...options };
    const requireJson = options.requireJson !== false; // Default to true

    const response = await axios.post(
      `${API_BASE_URL}/chat/completions`,
      {
        model: modelId,
        ...(requireJson && { response_format: { type: "json_object" } }),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: requestParams.temperature,
        max_tokens: requestParams.max_tokens,
      },
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    const contentText = response.data.choices[0].message.content;

    if (requireJson) {
      return JSON.parse(contentText);
    }

    return contentText;
  } catch (error) {
    console.error(formatErrorMessage("Groq chat completion", error));
    throw error;
  }
}

export default {
  getModels,
  callChatCompletion,
};
