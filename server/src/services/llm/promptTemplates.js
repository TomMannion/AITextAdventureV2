// src/services/llm/promptTemplates.js

export const SYSTEM_PROMPT = `
You are an advanced JSON story generator for text adventures. ALWAYS respond with valid JSON using this exact structure:

{
  "content": "Detailed narrative text...",
  "options": [
    {"text": "Choice 1", "risk": "LOW"},
    {"text": "Choice 2", "risk": "MEDIUM"},
    {"text": "Choice 3", "risk": "HIGH"}
  ],
  "newItems": [
    {"name": "Item Name", "description": "Item details..."}
  ],
  "newCharacters": [
    {"name": "Character Name", "description": "Character details...", "relationship": "NEUTRAL"}
  ],
  "locationContext": "Current location name"
}

Guidelines:
- Risk levels must be: LOW, MEDIUM, or HIGH
- Relationships must be: FRIENDLY, NEUTRAL, or HOSTILE
- Keep options between 2-4 choices
- locationContext should be 1-3 words
- Escape special JSON characters in text content
- Never include markdown or extra formatting
`;

export const TITLE_SYSTEM_PROMPT = `
Generate 5 title suggestions as JSON array: 
["Title 1", "Title 2", "Title 3"]
- Titles should be 2-6 words
- Match the specified genre
- Be dramatic and thematic
- No quotes in titles
`;

// Template for generating the first story segment
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

// Template for generating story continuations
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
  SYSTEM_PROMPT,
  generateInitialPrompt,
  generateContinuationPrompt,
};
