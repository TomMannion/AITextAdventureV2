// src/services/llm/prompt/gamePrompts.js

/**
 * Generates a prompt for creating game title suggestions
 * @param {string} genre - The game genre
 * @returns {string} - Formatted prompt
 */
export function generateTitlePrompt(genre) {
  return `
Generate 5 title suggestions for a ${genre} text adventure game.
The titles should be evocative, memorable, and fit the ${genre} genre.
`;
}

/**
 * Generates a prompt for the initial story segment
 * @param {Object} game - Game information
 * @param {Object} character - Character information
 * @returns {string} - Formatted prompt
 */
export function generateInitialPrompt(game, character) {
  return `
Generate the opening scene for a new adventure:
- Title: "${game.title}"
- Genre: "${game.genre}"
- Character: ${character ? character.name : "Anonymous adventurer"}
${character ? `- Character traits: ${character.traits.join(", ")}` : ""}
${character ? `- Character bio: ${character.bio}` : ""}

Write an engaging opening scene that sets up the adventure and presents the player with their first set of choices. Include a location context.
`;
}

/**
 * Generates a prompt for story continuation
 * @param {Object} context - Game context including story history
 * @param {string} chosenOption - The player's chosen option
 * @param {boolean} shouldEnd - Whether this should be the final segment
 * @returns {string} - Formatted prompt
 */
export function generateContinuationPrompt(
  context,
  chosenOption,
  shouldEnd = false
) {
  const { game, character, storySegments, items, characters } = context;

  // Build story segments section
  const segmentsText = storySegments
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
GAME CONTEXT:
- Title: "${game.title}"
- Genre: "${game.genre}"
- Turn: ${game.turnCount}
- Narrative Stage: ${game.narrativeStage}

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
    : ""
}

Based on this context and the player's choice, continue the story with a new segment. Include:
1. Narrative continuation (200-400 words)
2. ${
    shouldEnd
      ? "No choices (this is the end)"
      : "2-4 meaningful choices for the player"
  }
3. Information about any new items or characters
4. Current location
`;
}

export default {
  generateTitlePrompt,
  generateInitialPrompt,
  generateContinuationPrompt,
};
