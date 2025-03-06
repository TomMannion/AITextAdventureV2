// src/services/llm/prompt/characterPrompts.js

/**
 * Generates a prompt for character name suggestions
 * @param {string} genre - The game genre
 * @param {string|null} gender - Optional gender specification
 * @returns {string} - Formatted prompt
 */
export function generateNamePrompt(genre, gender = null) {
  return `
Generate five character name options for a ${genre} text adventure game.
${
  gender
    ? `The character should be ${gender}.`
    : "Include a mix of character genders."
}

IMPORTANT: Provide a diverse range of naming styles, including:
- At least one common, everyday name (like "Sarah Johnson" or "Tom Miller")
- At least one name that's moderately distinctive but still realistic
- Names appropriate for the ${genre} genre and setting
- A variety of cultural backgrounds, where appropriate for the genre
- Avoid making all names sound overly exotic or fantastical

For example, a good mix for fantasy might include names like:
- Elizabeth "Lizzy" Cooper (common name)
- Marcus Reed (moderately distinctive)
- Thalia Nightshade (more fantastical)
- Gorin Ironhammer (genre-specific)
- Mina Zhao (culturally diverse)

For science fiction, a good mix might include:
- David Chen (common name)
- Aisha Okafor (culturally diverse)
- Zeke Voss (moderately distinctive)
- Nova Reeves (genre-appropriate)
- Commander Kellix (more unusual/alien)

Focus on names that a player would genuinely choose for their character in a ${genre} setting, balancing realism with genre expectations.
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
Generate 4-5 diverse trait combinations for a character named "${name}" in a ${genre} text adventure.
${gender ? `The character is ${gender}.` : ""}

IMPORTANT: Provide a variety of character archetypes that would be interesting to play, including:
- At least one set of traits that creates a "regular person" caught up in extraordinary circumstances
- At least one set with a mix of notable strengths and significant flaws
- Characters with different motivations and approaches to problems
- A range from comedic/lighthearted to serious/dramatic personalities

Each set should have 3-5 traits that work together to form a coherent character personality.

For example, for a horror setting, trait sets might include:
1. Curious, Skeptical, Quick-witted, Easily Startled (everyday person with realistic reactions)
2. Protective, Resourceful, Haunted Past, Stubborn (flawed hero)
3. Sarcastic, Tech-savvy, Commitment Issues, Lucky (more lighthearted)
4. Analytical, Brave, Secretive, Plagued by Nightmares (serious, dramatic)

Ensure that the traits create characters that would be fun and engaging to role-play in a ${genre} setting.
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
Create 2-3 diverse character backgrounds for "${name}", a character with the following traits: ${traitsText}.
${gender ? `The character is ${gender}.` : ""}

IMPORTANT: Provide a range of background options with different tones and character origins, such as:
- One background that's relatively grounded/realistic - someone with everyday experiences that players can relate to
- One with more unusual or dramatic elements appropriate for the ${genre} genre
- Varied motivations for adventuring (duty, curiosity, necessity, ambition, redemption, etc.)

The backgrounds should:
- Naturally incorporate and explain how the character developed their traits: ${traitsText}
- Establish clear reasoning for why this character is embarking on adventures
- Range in tone from lighthearted to serious, giving players different interpretations of the same traits
- Leave room for character growth and development during gameplay
- Be around 150-300 words each

For example, the same character traits could be explained through:
- A comedic misadventure that led to unexpected skills
- A poignant life lesson from overcoming hardship
- An apprenticeship or professional background
- A personal quest for knowledge or redemption

Make each biography distinct and compelling, giving players multiple options for how they might envision this character's origins.
`;
}

export default {
  generateNamePrompt,
  generateTraitsPrompt,
  generateBioPrompt,
};
