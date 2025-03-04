// src/services/llm/prompt/characterPrompts.js

/**
 * Generates a prompt for character name suggestions
 * @param {string} genre - The game genre
 * @param {string|null} gender - Optional gender specification
 * @returns {string} - Formatted prompt
 */
export function generateNamePrompt(genre, gender = null) {
  return `
Generate character name options for a ${genre} text adventure game.
${
  gender
    ? `The character should be ${gender}.`
    : "Include a mix of character genders."
}
Names should feel appropriate for the ${genre} genre while remaining original.
`;
}

/**
 * Generates a prompt for character trait suggestions
 * @param {string} genre - The game genre
 * @param {string} name - Character name
 * @param {string|null} gender - Optional gender specification
 * @returns {string} - Formatted prompt
 */
export function generateTraitsPrompt(genre, name, gender = null) {
  return `
Generate trait combinations for a character named "${name}" in a ${genre} text adventure.
${gender ? `The character is ${gender}.` : ""}
Suggest traits that would create an interesting character to play in a ${genre} setting.
Each set of traits should form a coherent character personality that would be fun to role-play.
`;
}

/**
 * Generates a prompt for character biography suggestions
 * @param {string} genre - The game genre
 * @param {string} name - Character name
 * @param {Array|string} traits - Character traits
 * @param {string|null} gender - Optional gender specification
 * @returns {string} - Formatted prompt
 */
export function generateBioPrompt(genre, name, traits, gender = null) {
  const traitsText = Array.isArray(traits) ? traits.join(", ") : traits;

  return `
Create character backgrounds for "${name}", a character with the following traits: ${traitsText}.
${gender ? `The character is ${gender}.` : ""}
The background should establish why this character is embarking on adventures in a ${genre} setting.
Backgrounds should incorporate the character's traits and explain how they developed these characteristics.
Make the biography compelling and leave room for adventure and character growth.
`;
}

export default {
  generateNamePrompt,
  generateTraitsPrompt,
  generateBioPrompt,
};
