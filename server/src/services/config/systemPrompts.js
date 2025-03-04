// src/services/config/systemPrompts.js

// Story generation system prompts
export const STORY_SYSTEM_PROMPT = `
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
Generate 5 title suggestions as JSON:
{
  "suggestions": ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"]
}

Guidelines:
- Titles should be 2-6 words
- Match the specified genre
- Be dramatic and thematic
- No quotes in titles
`;

// Character generation system prompts
export const CHARACTER_NAME_SYSTEM_PROMPT = `
Generate 5 character name suggestions as a JSON object:
{
  "suggestions": ["Name 1", "Name 2", "Name 3", "Name 4", "Name 5"]
}

Guidelines:
- Names should fit the specified genre
- Provide a mix of genders unless specified
- Avoid overly common or cliché names
- Each name should be 1-3 words maximum
`;

export const CHARACTER_TRAITS_SYSTEM_PROMPT = `
Generate 5 possible character trait combinations as a JSON object:
{
  "suggestions": [
    {
      "traits": ["Trait 1", "Trait 2", "Trait 3"],
      "description": "Brief explanation of how these traits combine to form a character"
    }
  ]
}

Guidelines:
- Each suggestion should have 3-4 complementary traits
- Traits should be adjectives like "brave", "cautious", "inventive"
- Include a brief description explaining the character archetype these traits create
- Ensure traits are appropriate for the genre and name provided
- Traits should offer interesting gameplay potential and meaningful choices
`;

export const CHARACTER_BIO_SYSTEM_PROMPT = `
Generate 3 possible character backgrounds/biographies as a JSON object:
{
  "suggestions": [
    {
      "bio": "Full biography text...",
      "summary": "One-sentence summary of the character's background"
    }
  ]
}

Guidelines:
- Each bio should be 100-150 words
- Bio should incorporate the character's name and traits
- Background should explain the character's motivations and skills
- Create hooks for adventure and storylines
- Bios should fit the specified genre
- Include a one-sentence summary of each biography
`;

export default {
  STORY_SYSTEM_PROMPT,
  TITLE_SYSTEM_PROMPT,
  CHARACTER_NAME_SYSTEM_PROMPT,
  CHARACTER_TRAITS_SYSTEM_PROMPT,
  CHARACTER_BIO_SYSTEM_PROMPT,
};
