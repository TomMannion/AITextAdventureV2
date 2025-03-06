// src/services/llm/parser/gameParser.js
/**
 * Parses the title generation response
 * @param {Object|string} response - Raw LLM response
 * @returns {Array<string>} - Array of title suggestions
 */
export function parseTitleResponse(response) {
  try {
    // Handle both string and pre-parsed responses
    const data = typeof response === "string" ? JSON.parse(response) : response;
    if (!data.suggestions || !Array.isArray(data.suggestions)) {
      throw new Error("Invalid title response structure");
    }
    return data.suggestions
      .slice(0, 5) // Ensure max 5 titles
      .map((title) => title.trim().replace(/"/g, ""))
      .filter((title) => title.length > 0);
  } catch (error) {
    console.error("Title parsing failed:", error);
    // Fallback to legacy text parsing
    const responseText =
      typeof response === "string" ? response : JSON.stringify(response);
    return responseText
      .split("\n")
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((title) => title.length > 0)
      .slice(0, 5);
  }
}

/**
 * Parses the story generation response
 * @param {Object|string} response - Raw LLM response
 * @param {boolean} isEnding - Whether this is the final segment
 * @returns {Object} - Parsed story segment
 */
export function parseStoryResponse(response, isEnding = false) {
  console.log(response);
  try {
    // Directly parse the JSON response
    const result =
      typeof response === "string" ? JSON.parse(response) : response;
    // Validate structure
    const requiredKeys = [
      "content",
      "options",
      "newItems",
      "newCharacters",
      "locationContext",
    ];

    if (!requiredKeys.every((k) => k in result)) {
      throw new Error("Invalid response structure");
    }
    // Normalize values
    return {
      content: result.content.trim(),
      options: (isEnding ? [] : result.options).map((opt) => ({
        text: opt.text.trim(),
        risk: (opt.risk || "MEDIUM").toUpperCase(),
      })),
      newItems: result.newItems.map((item) => ({
        name: item.name.trim(),
        description: (item.description || "").trim(),
      })),
      newCharacters: result.newCharacters.map((char) => ({
        name: char.name.trim(),
        description: (char.description || "").trim(),
        relationship: (char.relationship || "NEUTRAL").toUpperCase(),
      })),
      locationContext: result.locationContext.trim(),
    };
  } catch (error) {
    console.error("JSON parsing failed, falling back to text parser:", error);
  }
}

export default {
  parseTitleResponse,
  parseStoryResponse,
};
