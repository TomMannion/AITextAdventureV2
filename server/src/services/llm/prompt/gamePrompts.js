// src/services/llm/prompt/gamePrompts.js

import genrePromptSystem from "./genrePromptSystem.js";

/**
 * Generates a user prompt for the initial story segment
 * @param {Object} game - Game information
 * @param {Object} character - Character information
 * @returns {string} - Formatted user prompt
 */

export function generateInitialUserPrompt(game, character) {
  // Get genre and stage specific prompt components
  const genreStagePrompt = genrePromptSystem.createGenreStagePrompt(
    game,
    game.genre,
    "INTRODUCTION"
  );

  return `
${genreStagePrompt}

GAME DETAILS:
- Title: "${game.title}"
- Genre: "${game.genre}"
- Character: ${character ? character.name : "Anonymous adventurer"}
${character ? `- Character traits: ${character.traits.join(", ")}` : ""}
${character ? `- Character bio: ${character.bio}` : ""}

Task: Write an engaging opening scene that sets up the adventure and presents the player with their first set of choices. Include a location context.

In this introduction:
1. Establish the initial setting with sensory details
2. Introduce the main character's situation
3. Present an inciting incident or call to adventure
4. Offer 2-4 meaningful first choices that help establish the character's approach

IMPORTANT: Only introduce new items or characters if they are central to the plot. Most sessions should have few or no new items/characters. Avoid adding background elements as formal items - only include truly interactive objects.
`;
}

/**
 * Generates a user prompt for story continuation
 * @param {Object} context - Game context including story history
 * @param {string} chosenOption - The player's chosen option
 * @param {boolean} shouldEnd - Whether this should be the final segment
 * @returns {string} - Formatted user prompt
 */
export function generateContinuationUserPrompt(
  context,
  chosenOption,
  shouldEnd = false
) {
  const { game, character, storySegments, items, characters } = context;

  // Get the appropriate narrative stage
  const currentStage = shouldEnd ? "RESOLUTION" : game.narrativeStage;

  // Get genre and stage specific prompt
  const genreStagePrompt = genrePromptSystem.createGenreStagePrompt(
    game,
    game.genre,
    currentStage
  );

  // Build story segments section (only include the most recent segments for context)
  const relevantSegments = storySegments.slice(
    0,
    Math.min(storySegments.length, 3)
  );
  const segmentsText = relevantSegments
    .map(
      (segment) =>
        `SEGMENT: ${segment.content}\n` +
        `PLAYER CHOICE: ${segment.userChoice || "N/A"}\n` +
        `LOCATION: ${segment.locationContext || "Unknown"}\n`
    )
    .join("\n");

  // Build items section
  const itemsText =
    items.length > 0
      ? `Current items: ${items.map((item) => item.name).join(", ")}`
      : "No items in inventory";

  // Build characters section
  const charactersText =
    characters.length > 0
      ? `NPCs encountered: ${characters
          .map((npc) => `${npc.name} (${npc.relationship})`)
          .join(", ")}`
      : "No NPCs encountered yet";

  return `
${genreStagePrompt}

GAME CONTEXT:
- Title: "${game.title}"
- Genre: "${game.genre}"
- Turn: ${game.turnCount}
- Narrative Stage: ${currentStage}

CHARACTER:
${character ? `- Name: ${character.name}` : "- Anonymous adventurer"}
${character ? `- Traits: ${character.traits.join(", ")}` : ""}

STORY SO FAR:
${segmentsText}

INVENTORY:
${itemsText}

CHARACTERS:
${charactersText}

PLAYER'S CHOICE:
The player has chosen to: "${chosenOption}"

${
  shouldEnd
    ? "IMPORTANT: This is the final segment of the story. Create a satisfying conclusion that wraps up the adventure."
    : "Continue the story based on the player's choice."
}

Include in your response:
1. Narrative continuation (200-400 words)
2. ${
    shouldEnd
      ? "No choices (this is the end)"
      : "2-4 meaningful choices for the player that offer different approaches"
  }
3. The current location

REGARDING ITEMS AND CHARACTERS:
- DO NOT add new items or characters unless they are directly interacted with or absolutely critical to the plot
- Most story segments should have empty newItems and newCharacters arrays
- Background objects mentioned in narration should NOT be added as formal items
- If the player already has several items, focus on using those rather than introducing new ones
`;
}

/**
 * Generates a user prompt for title suggestions
 * @param {string} genre - The game genre
 * @returns {string} - Formatted user prompt
 */
export function generateTitleUserPrompt(genre) {
  // Get genre info
  const genreInfo = genrePromptSystem.getGenreInfo(genre) || {};

  let prompt = `Create 5 compelling title suggestions for a ${genre} text adventure game.`;

  // Add genre-specific themes if available
  if (genreInfo?.elements?.themes?.length > 0) {
    prompt += `\n\nIncorporate themes common to the ${genre} genre such as: ${genreInfo.elements.themes.join(
      ", "
    )}.`;
  }

  // Add genre-specific settings if available
  if (genreInfo?.elements?.settings?.length > 0) {
    prompt += `\n\nThe game may take place in settings like: ${genreInfo.elements.settings.join(
      ", "
    )}.`;
  }

  return (
    prompt +
    `\n\nEach title should be evocative, memorable, and instantly communicate the ${genre} genre to players.`
  );
}

// Updated API call structure
export function callStoryGeneration(
  systemPrompt,
  userPrompt,
  provider,
  modelId,
  apiKey
) {
  return callLLM(
    userPrompt, // User prompt contains specific request
    systemPrompt, // System prompt contains role and format instructions
    {
      provider,
      modelId,
      apiKey,
      requireJson: true,
    }
  );
}

export default {
  generateInitialUserPrompt,
  generateContinuationUserPrompt,
  generateTitleUserPrompt,
  callStoryGeneration,
};
