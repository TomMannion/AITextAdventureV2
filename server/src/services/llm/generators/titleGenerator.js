// src/services/llm/generators/titleGenerator.js
import { callLLM } from "../../api/index.js";
import { gamePrompts } from "../prompt/index.js";
import { gameParser } from "../parser/index.js";
import { getRecommendedModel } from "../modelManager.js";
import { TITLE_SYSTEM_PROMPT } from "../../config/systemPrompts.js";
import { DEFAULT_PROVIDER } from "../../api/apiHelpers.js";

/**
 * Generates title suggestions for a game
 * @param {string} genre - The game genre
 * @param {Object} options - Generation options
 * @returns {Promise<Array<string>>} - Array of title suggestions
 */
export async function generateTitles(genre, options = {}) {
  try {
    const provider = options.provider || DEFAULT_PROVIDER;
    const modelId = options.modelId || getRecommendedModel("title", provider);

    const prompt = gamePrompts.generateTitlePrompt(genre);

    const response = await callLLM(prompt, TITLE_SYSTEM_PROMPT, {
      provider,
      modelId,
      apiKey: options.apiKey,
    });

    return gameParser.parseTitleResponse(response);
  } catch (error) {
    console.error("Title generation error:", error);
    return [];
  }
}

export default {
  generateTitles,
};
