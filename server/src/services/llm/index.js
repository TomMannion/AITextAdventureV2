// src/services/llm/index.js
import {
  storyGenerator,
  titleGenerator,
  characterGenerator,
} from "./generators/index.js";
import modelManager from "./modelManager.js";

// Export all functionality from the LLM service
export default {
  // Story generation
  generateInitialSegment: storyGenerator.generateInitialSegment,
  generateContinuation: storyGenerator.generateContinuation,

  // Title generation
  generateTitles: titleGenerator.generateTitles,

  // Character generation
  generateCharacterNames: characterGenerator.generateCharacterNames,
  generateCharacterTraits: characterGenerator.generateCharacterTraits,
  generateCharacterBios: characterGenerator.generateCharacterBios,

  // Model management
  getModels: modelManager.getModels,
  getRecommendedModel: modelManager.getRecommendedModel,
};

// Named exports for more specific imports
export const story = storyGenerator;
export const title = titleGenerator;
export const character = characterGenerator;
export const models = modelManager;
