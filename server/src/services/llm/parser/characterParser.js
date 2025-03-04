// src/services/llm/parser/characterParser.js

/**
 * Parses the character name response
 * @param {Object|string} response - Raw LLM response
 * @returns {Array<string>} - Array of character names
 */
export function parseNameResponse(response) {
  try {
    // Handle both string and pre-parsed responses
    const data = typeof response === "string" ? JSON.parse(response) : response;

    if (!data.suggestions || !Array.isArray(data.suggestions)) {
      throw new Error("Invalid name response structure");
    }

    return data.suggestions
      .slice(0, 5) // Ensure max 5 names
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
  } catch (error) {
    console.error("Name parsing failed:", error);

    // Try to extract names from text as fallback
    if (typeof response === "string") {
      return response
        .split("\n")
        .map((line) => line.replace(/^\d+\.\s*/, "").trim())
        .filter((line) => line.length > 0)
        .slice(0, 5);
    }

    // Return empty array if all parsing fails
    return [];
  }
}

/**
 * Parses the character traits response
 * @param {Object|string} response - Raw LLM response
 * @returns {Array<Object>} - Array of trait combinations
 */
export function parseTraitsResponse(response) {
  try {
    // Handle both string and pre-parsed responses
    const data = typeof response === "string" ? JSON.parse(response) : response;

    if (!data.suggestions || !Array.isArray(data.suggestions)) {
      throw new Error("Invalid traits response structure");
    }

    return data.suggestions
      .slice(0, 5) // Ensure max 5 trait sets
      .map((suggestion) => ({
        traits: Array.isArray(suggestion.traits)
          ? suggestion.traits.map((trait) => trait.trim())
          : [],
        description: suggestion.description
          ? suggestion.description.trim()
          : "",
      }))
      .filter((suggestion) => suggestion.traits.length > 0);
  } catch (error) {
    console.error("Traits parsing failed:", error);
    return [];
  }
}

/**
 * Parses the character biography response
 * @param {Object|string} response - Raw LLM response
 * @returns {Array<Object>} - Array of character biographies
 */
export function parseBioResponse(response) {
  try {
    // Handle both string and pre-parsed responses
    const data = typeof response === "string" ? JSON.parse(response) : response;

    if (!data.suggestions || !Array.isArray(data.suggestions)) {
      throw new Error("Invalid bio response structure");
    }

    return data.suggestions
      .slice(0, 3) // Ensure max 3 bios
      .map((suggestion) => ({
        bio: suggestion.bio ? suggestion.bio.trim() : "",
        summary: suggestion.summary ? suggestion.summary.trim() : "",
      }))
      .filter((suggestion) => suggestion.bio.length > 0);
  } catch (error) {
    console.error("Bio parsing failed:", error);
    return [];
  }
}

export default {
  parseNameResponse,
  parseTraitsResponse,
  parseBioResponse,
};
