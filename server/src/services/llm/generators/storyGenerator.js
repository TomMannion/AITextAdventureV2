// src/services/llm/generators/storyGenerator.js
import { callLLM } from "../../api/index.js";
import {
  generateInitialUserPrompt,
  generateContinuationUserPrompt,
} from "../prompt/gamePrompts.js";
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

    // Generate the user prompt
    const userPrompt = generateInitialUserPrompt(game, character);

    // Call LLM with separated system prompt and user prompt
    const response = await callLLM(
      userPrompt, // User prompt (specific request)
      STORY_SYSTEM_PROMPT, // System prompt (role and format)
      {
        provider,
        modelId,
        apiKey: options.apiKey,
        requireJson: true,
      }
    );

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

    // Generate the user prompt
    const userPrompt = generateContinuationUserPrompt(
      context,
      chosenOption,
      shouldEnd
    );

    // Call LLM with separated system prompt and user prompt
    const response = await callLLM(
      userPrompt, // User prompt (specific request)
      STORY_SYSTEM_PROMPT, // System prompt (role and format)
      {
        provider,
        modelId,
        apiKey: options.apiKey,
        requireJson: true,
      }
    );

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
