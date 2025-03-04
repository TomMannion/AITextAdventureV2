// src/services/llm/llmService.js (updates to handle the API keys correctly)
import axios from "axios";
import dotenv from "dotenv";
import {
  SYSTEM_PROMPT,
  TITLE_SYSTEM_PROMPT,
  generateInitialPrompt,
  generateContinuationPrompt,
} from "./promptTemplates.js";
import { parseResponse, parseTitleResponse } from "./responseParser.js";

dotenv.config();

// API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DEFAULT_PROVIDER = process.env.DEFAULT_LLM_PROVIDER || "openai";

// Get available models from OpenAI
export async function getOpenAIModels(apiKey = OPENAI_API_KEY) {
  try {
    if (!apiKey) {
      return [];
    }

    const response = await axios.get("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return chatModels.map((model) => ({
      id: model.id,
      name: model.id,
      provider: "openai",
      created: new Date(model.created * 1000).toISOString(),
    }));
  } catch (error) {
    console.error(
      "OpenAI models fetch error:",
      error.response?.data || error.message
    );
    return [];
  }
}

// Get available models from Groq
export async function getGroqModels(apiKey = GROQ_API_KEY) {
  try {
    if (!apiKey) {
      return [];
    }

    const response = await axios.get("https://api.groq.com/openai/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    // TO DO LOOK INTO IF IT RETURNS NESTED DATA
    return response.data.data
      .filter((model) => model.active)
      .map((model) => ({
        id: model.id,
        name: model.id,
        provider: "groq",
        created: model.created
          ? new Date(model.created * 1000).toISOString()
          : null,
      }));
  } catch (error) {
    console.error(
      "Groq models fetch error:",
      error.response?.data || error.message
    );
    return [];
  }
}

// Get all available models across providers
export async function getAllAvailableModels(provider, apiKey) {
  let resolvedKey;

  // Determine which API key to use based on provider
  switch (provider.toLowerCase()) {
    case "openai":
      resolvedKey = typeof apiKey !== "undefined" ? apiKey : OPENAI_API_KEY;
      break;
    case "groq":
      resolvedKey = typeof apiKey !== "undefined" ? apiKey : GROQ_API_KEY;
      break;
    default:
      console.error(`Unsupported provider: ${provider}`);
      return [];
  }

  // Return empty array if no API key is available
  if (!resolvedKey) {
    console.error(`No API key provided for ${provider}`);
    return [];
  }

  try {
    // Call the appropriate provider function
    return provider.toLowerCase() === "openai"
      ? await getOpenAIModels(resolvedKey)
      : await getGroqModels(resolvedKey);
  } catch (error) {
    console.error(`Error fetching ${provider} models:`, error);
    return [];
  }
}

async function callOpenAI(prompt, modelId, systemPrompt, apiKey) {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: modelId,
      response_format: { type: "json_object" }, // Enforce JSON
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  return JSON.parse(response.data.choices[0].message.content);
}

async function callGroq(prompt, modelId, systemPrompt, apiKey) {
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: modelId,
      response_format: { type: "json_object" }, // Enforce JSON
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  return JSON.parse(response.data.choices[0].message.content);
}

// New title generation function
export async function generateTitles(
  genre,
  provider = DEFAULT_PROVIDER,
  modelId = null,
  apiKey = null
) {
  try {
    const prompt = generateTitlePrompt(genre);
    let response;

    if (provider === "groq") {
      response = await callGroq(
        prompt,
        modelId ? modelId : "llama3-8b-8192",
        TITLE_SYSTEM_PROMPT,
        apiKey || GROQ_API_KEY
      );
    } else {
      response = await callOpenAI(
        prompt,
        modelId ? modelId : "gpt-3.5-turbo",
        TITLE_SYSTEM_PROMPT,
        apiKey || OPENAI_API_KEY
      );
    }

    return parseTitleResponse(response);
  } catch (error) {
    console.error("Title generation error:", error);
    return [];
  }
}

// Generate initial story segment
export async function generateInitialSegment(
  game,
  character,
  provider = DEFAULT_PROVIDER,
  modelId = null,
  apiKey = null
) {
  try {
    const prompt = generateInitialPrompt(game, character);

    // Call selected provider
    let response;
    if (provider === "groq") {
      response = await callGroq(
        prompt,
        modelId || "llama3-8b-8192",
        SYSTEM_PROMPT,
        apiKey || GROQ_API_KEY
      );
    } else {
      response = await callOpenAI(
        prompt,
        modelId || "gpt-4-turbo",
        SYSTEM_PROMPT,
        apiKey || OPENAI_API_KEY
      );
    }

    // Parse the response
    return parseResponse(response);
  } catch (error) {
    console.error("Generate initial segment error:", error);
    throw error;
  }
}

// Generate story continuation
export async function generateContinuation(
  context,
  chosenOption,
  shouldEnd = false,
  provider = DEFAULT_PROVIDER,
  modelId = null,
  apiKey = null
) {
  try {
    const prompt = generateContinuationPrompt(context, chosenOption, shouldEnd);

    // Call selected provider
    let response;
    if (provider === "groq") {
      response = await callGroq(
        prompt,
        modelId || "llama3-8b-8192",
        SYSTEM_PROMPT,
        apiKey || GROQ_API_KEY
      );
    } else {
      response = await callOpenAI(
        prompt,
        modelId || "gpt-4-turbo",
        SYSTEM_PROMPT,
        apiKey || OPENAI_API_KEY
      );
    }

    // Parse the response
    return parseResponse(response, shouldEnd);
  } catch (error) {
    console.error("Generate continuation error:", error);
    throw error;
  }
}

export default {
  generateTitles,
  generateInitialSegment,
  generateContinuation,
  getAllAvailableModels,
  getOpenAIModels,
  getGroqModels,
};
