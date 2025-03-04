// src/services/llm/responseParser.js
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
    console.error("Title parsing failed, using fallback", error);
    // Fallback to legacy text parsing
    return response
      .split("\n")
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((title) => title.length > 0)
      .slice(0, 5);
  }
}

export function parseResponse(response, isEnding = false) {
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
        risk: opt.risk.toUpperCase() || "MEDIUM",
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
    console.error("JSON parsing failed, falling back to text parser");
    return legacyTextParser(response, isEnding);
  }
}

// Parse a story generation response from the LLM
function legacyTextParser(response, isEnding = false) {
  try {
    // Default structure
    const result = {
      content: "",
      options: [],
      newItems: [],
      newCharacters: [],
      locationContext: "",
    };

    // Simple parsing strategy - look for markers in the text
    const lines = response.split("\n");

    let currentSection = "content";
    let contentLines = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) continue;

      // Check for section markers
      if (
        trimmedLine.startsWith("CHOICES:") ||
        trimmedLine.match(/^OPTIONS:?/i) ||
        trimmedLine.match(/^CHOICE(S)?:?/i)
      ) {
        currentSection = "options";
        continue;
      } else if (
        trimmedLine.startsWith("ITEMS:") ||
        trimmedLine.match(/^ITEM(S)?:?/i) ||
        trimmedLine.match(/^INVENTORY:?/i)
      ) {
        currentSection = "items";
        continue;
      } else if (
        trimmedLine.startsWith("CHARACTERS:") ||
        trimmedLine.match(/^CHARACTER(S)?:?/i) ||
        trimmedLine.match(/^NPC(S)?:?/i)
      ) {
        currentSection = "characters";
        continue;
      } else if (
        trimmedLine.startsWith("LOCATION:") ||
        trimmedLine.match(/^LOCATION:?/i) ||
        trimmedLine.match(/^SETTING:?/i)
      ) {
        currentSection = "location";
        continue;
      }

      // Process line based on current section
      if (currentSection === "content") {
        contentLines.push(trimmedLine);
      } else if (currentSection === "options" && !isEnding) {
        // Look for numbered or bulleted options
        const optionMatch = trimmedLine.match(/^[\d\-\*\•]+[\.\)]*\s*(.+)$/);
        if (optionMatch) {
          result.options.push({
            text: optionMatch[1].trim(),
            risk: determineRiskLevel(optionMatch[1]),
          });
        }
      } else if (currentSection === "items") {
        const itemMatch = trimmedLine.match(/^[\d\-\*\•]+[\.\)]*\s*(.+)$/);
        if (itemMatch) {
          const itemText = itemMatch[1].trim();
          // Extract name and description if possible
          const itemParts = itemText.split(":").map((p) => p.trim());
          result.newItems.push({
            name: itemParts[0],
            description: itemParts.length > 1 ? itemParts[1] : "",
          });
        }
      } else if (currentSection === "characters") {
        const charMatch = trimmedLine.match(/^[\d\-\*\•]+[\.\)]*\s*(.+)$/);
        if (charMatch) {
          const charText = charMatch[1].trim();
          // Extract name, description, and relationship if possible
          const charParts = charText.split(":").map((p) => p.trim());
          const relationship = extractRelationship(charText);
          result.newCharacters.push({
            name: charParts[0],
            description: charParts.length > 1 ? charParts[1] : "",
            relationship: relationship,
          });
        }
      } else if (currentSection === "location") {
        if (!result.locationContext) {
          result.locationContext = trimmedLine;
        }
      }
    }

    // Join content lines
    result.content = contentLines.join("\n");

    // If no location was explicitly provided, try to extract it from content
    if (!result.locationContext) {
      result.locationContext = extractLocation(result.content);
    }

    // If ending but no options provided, ensure options array is empty
    if (isEnding) {
      result.options = [];
    }

    // If no options were found in a non-ending segment, create default options
    if (!isEnding && result.options.length === 0) {
      result.options = [
        { text: "Continue forward", risk: "MEDIUM" },
        { text: "Take a cautious approach", risk: "LOW" },
        { text: "Try something bold", risk: "HIGH" },
      ];
    }

    return result;
  } catch (error) {
    console.error("Error parsing LLM response:", error);
    // Return a fallback result
    return {
      content: response,
      options: !isEnding
        ? [
            { text: "Continue", risk: "MEDIUM" },
            { text: "Take another approach", risk: "MEDIUM" },
          ]
        : [],
      newItems: [],
      newCharacters: [],
      locationContext: "Unknown location",
    };
  }
}

// Helper function to determine risk level from option text
function determineRiskLevel(optionText) {
  const text = optionText.toLowerCase();

  // Words indicating high risk
  if (
    text.includes("danger") ||
    text.includes("risk") ||
    text.includes("attack") ||
    text.includes("confront") ||
    text.includes("challenge") ||
    text.includes("fight")
  ) {
    return "HIGH";
  }

  // Words indicating low risk
  if (
    text.includes("careful") ||
    text.includes("safe") ||
    text.includes("cautious") ||
    text.includes("hide") ||
    text.includes("wait") ||
    text.includes("retreat")
  ) {
    return "LOW";
  }

  // Default to medium risk
  return "MEDIUM";
}

// Helper function to extract relationship info
function extractRelationship(text) {
  const lowerText = text.toLowerCase();

  if (
    lowerText.includes("friend") ||
    lowerText.includes("ally") ||
    lowerText.includes("helpful") ||
    lowerText.includes("friendly")
  ) {
    return "friendly";
  }

  if (
    lowerText.includes("enemy") ||
    lowerText.includes("hostile") ||
    lowerText.includes("antagonist") ||
    lowerText.includes("foe")
  ) {
    return "hostile";
  }

  return "neutral";
}

// Helper function to extract location from content
function extractLocation(content) {
  // Simple approach: take the first sentence and extract location-like phrases
  const firstSentence = content.split(".")[0];

  // Look for location prepositions followed by a place
  const locationMatches = firstSentence.match(
    /\b(in|at|near|inside|outside|within) the ([^,.]+)/i
  );
  if (locationMatches && locationMatches[2]) {
    return locationMatches[2].trim();
  }

  return "Unknown location";
}

export default { parseResponse, parseTitleResponse };
