// src/services/llm/generators/characterGenerator.js
import { callLLM } from "../../api/index.js";
import { characterPrompts } from "../prompt/index.js";
import { characterParser } from "../parser/index.js";
import { getRecommendedModel } from "../modelManager.js";
import {
  CHARACTER_NAME_SYSTEM_PROMPT,
  CHARACTER_TRAITS_SYSTEM_PROMPT,
  CHARACTER_BIO_SYSTEM_PROMPT,
} from "../../config/systemPrompts.js";
import { DEFAULT_PROVIDER } from "../../api/apiHelpers.js";

/**
 * Generates character name suggestions
 * @param {string} genre - The game genre
 * @param {string|null} gender - Optional gender specification
 * @param {Object} options - Generation options
 * @returns {Promise<Array<string>>} - Array of character names
 */
export async function generateCharacterNames(
  genre,
  gender = null,
  options = {}
) {
  try {
    const provider = options.provider || DEFAULT_PROVIDER;
    const modelId =
      options.modelId || getRecommendedModel("character", provider);

    const prompt = characterPrompts.generateNamePrompt(genre, gender);

    const response = await callLLM(prompt, CHARACTER_NAME_SYSTEM_PROMPT, {
      provider,
      modelId,
      apiKey: options.apiKey,
    });

    return characterParser.parseNameResponse(response);
  } catch (error) {
    console.error("Character name generation error:", error);
    return [];
  }
}

/**
 * Generates character trait suggestions
 * @param {string} genre - The game genre
 * @param {string} name - Character name
 * @param {string|null} gender - Optional gender specification
 * @param {Object} options - Generation options
 * @returns {Promise<Array<Object>>} - Array of trait combinations
 */
export async function generateCharacterTraits(
  genre,
  name,
  gender = null,
  options = {}
) {
  try {
    const provider = options.provider || DEFAULT_PROVIDER;
    const modelId =
      options.modelId || getRecommendedModel("character", provider);

    const prompt = characterPrompts.generateTraitsPrompt(genre, name, gender);

    const response = await callLLM(prompt, CHARACTER_TRAITS_SYSTEM_PROMPT, {
      provider,
      modelId,
      apiKey: options.apiKey,
    });

    return characterParser.parseTraitsResponse(response);
  } catch (error) {
    console.error("Character traits generation error:", error);
    return [];
  }
}

/**
 * Generates character biography suggestions
 * @param {string} genre - The game genre
 * @param {string} name - Character name
 * @param {Array|string} traits - Character traits
 * @param {string|null} gender - Optional gender specification
 * @param {Object} options - Generation options
 * @returns {Promise<Array<Object>>} - Array of character biographies
 */
export async function generateCharacterBios(
  genre,
  name,
  traits,
  gender = null,
  options = {}
) {
  try {
    const provider = options.provider || DEFAULT_PROVIDER;
    const modelId =
      options.modelId || getRecommendedModel("character", provider);

    const prompt = characterPrompts.generateBioPrompt(
      genre,
      name,
      traits,
      gender
    );

    const response = await callLLM(prompt, CHARACTER_BIO_SYSTEM_PROMPT, {
      provider,
      modelId,
      apiKey: options.apiKey,
    });

    return characterParser.parseBioResponse(response);
  } catch (error) {
    console.error("Character bio generation error:", error);
    return [];
  }
}

export default {
  generateCharacterNames,
  generateCharacterTraits,
  generateCharacterBios,
};
