// src/services/llm/generators/storyGenerator.js
import { callLLM } from "../../api/index.js";
import { gamePrompts } from "../prompt/index.js";
import { gameParser } from "../parser/index.js";
import { getRecommendedModel } from "../modelManager.js";
import { STORY_SYSTEM_PROMPT } from "../../config/systemPrompts.js";
import { DEFAULT_PROVIDER } from "../../api/apiHelpers.js";

/**
 * Generates an initial story segment
 * @param {Object} game - Game information
 * @param {Object} character - Character information
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} - Generated story segment
 */
export async function generateInitialSegment(game, character, options = {}) {
  try {
    const provider = options.provider || DEFAULT_PROVIDER;
    const modelId = options.modelId || getRecommendedModel("story", provider);

    const prompt = gamePrompts.generateInitialPrompt(game, character);

    const response = await callLLM(prompt, STORY_SYSTEM_PROMPT, {
      provider,
      modelId,
      apiKey: options.apiKey,
    });

    return gameParser.parseStoryResponse(response);
  } catch (error) {
    console.error("Generate initial segment error:", error);
    throw error;
  }
}

/**
 * Generates a continuation of the story based on player choice
 * @param {Object} context - Game context (history, character, etc.)
 * @param {string} chosenOption - The player's chosen option
 * @param {boolean} shouldEnd - Whether this segment should end the story
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} - Generated story segment
 */
export async function generateContinuation(
  context,
  chosenOption,
  shouldEnd = false,
  options = {}
) {
  try {
    const provider = options.provider || DEFAULT_PROVIDER;
    const modelId = options.modelId || getRecommendedModel("story", provider);

    const prompt = gamePrompts.generateContinuationPrompt(
      context,
      chosenOption,
      shouldEnd
    );

    const response = await callLLM(prompt, STORY_SYSTEM_PROMPT, {
      provider,
      modelId,
      apiKey: options.apiKey,
    });

    return gameParser.parseStoryResponse(response, shouldEnd);
  } catch (error) {
    console.error("Generate continuation error:", error);
    throw error;
  }
}

export default {
  generateInitialSegment,
  generateContinuation,
};
