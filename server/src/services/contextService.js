// src/services/contextService.js
import prisma from "../config/db.js";
import { normalizeEntityName } from "../utils/entityUtils.js";

/**
 * Extracts important entities from text using NLP-inspired techniques
 * @param {string} content - Text content to analyze
 * @returns {Object} - Object with extracted entities by type
 */
function extractEntities(content) {
  if (!content)
    return { characters: [], items: [], locations: [], concepts: [] };

  // 1. Extract potential named entities (capitalized words/phrases)
  const namedEntityRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const namedEntities = content.match(namedEntityRegex) || [];

  // 2. Extract potential items (often preceded by specific words)
  const itemRegex =
    /\b(?:the|a|an|his|her|your|this|that|these|those)\s+([a-z]+(?:\s+[a-z]+){0,3})\b/gi;
  const itemMatches = [...content.matchAll(itemRegex)];
  const potentialItems = itemMatches.map((match) => match[1]);

  // 3. Extract potential locations (often preceded by prepositions)
  const locationRegex =
    /\b(?:in|at|on|near|inside|outside|to|from|through)\s+(?:the\s+)?([a-z]+(?:\s+[a-z]+){0,3})\b/gi;
  const locationMatches = [...content.matchAll(locationRegex)];
  const potentialLocations = locationMatches.map((match) => match[1]);

  // 4. Extract key concepts (nouns with adjectives)
  const conceptRegex = /\b(?:[a-z]+\s+)?([a-z]+(?:\s+[a-z]+){0,2})\b/gi;
  const allWords = [...content.matchAll(conceptRegex)].map((match) => match[1]);

  // 5. Basic classification - this would be much more sophisticated with a real NLP library
  const characters = namedEntities.filter(
    (entity) =>
      !potentialLocations.some((loc) => entity.includes(loc)) &&
      !potentialItems.some((item) => entity.includes(item))
  );

  const locations = [
    ...namedEntities.filter((entity) =>
      potentialLocations.some((loc) => entity.includes(loc))
    ),
    ...potentialLocations,
  ];

  const items = [
    ...namedEntities.filter((entity) =>
      potentialItems.some((item) => entity.includes(item))
    ),
    ...potentialItems,
  ];

  // Extract key concepts - words that appear multiple times
  const wordFrequency = {};
  allWords.forEach((word) => {
    const normalized = word.toLowerCase();
    wordFrequency[normalized] = (wordFrequency[normalized] || 0) + 1;
  });

  const concepts = Object.entries(wordFrequency)
    .filter(([word, count]) => count > 1 && word.length > 3)
    .map(([word]) => word);

  // Normalize and deduplicate
  const normalizeAndDeduplicate = (arr) => [
    ...new Set(arr.map(normalizeEntityName).filter(Boolean)),
  ];

  return {
    characters: normalizeAndDeduplicate(characters),
    items: normalizeAndDeduplicate(items),
    locations: normalizeAndDeduplicate(locations),
    concepts: normalizeAndDeduplicate(concepts),
  };
}

/**
 * Calculates relevance score for a segment based on various factors
 * @param {Object} segment - Story segment
 * @param {Object} latestSegment - Most recent story segment
 * @param {Object} extractedEntities - Entities from latest segment
 * @param {Array} activeItems - Currently active items
 * @param {Array} activeCharacters - Current characters
 * @returns {number} - Relevance score (higher means more relevant)
 */
function calculateSegmentRelevance(
  segment,
  latestSegment,
  extractedEntities,
  activeItems,
  activeCharacters
) {
  if (!segment.content) return 0;

  let score = 0;
  const content = segment.content.toLowerCase();

  // 1. Base importance (from database)
  score += segment.importance * 2;

  // 2. Location continuity
  if (segment.locationContext && latestSegment.locationContext) {
    const segmentLocation = normalizeEntityName(segment.locationContext);
    const currentLocation = normalizeEntityName(latestSegment.locationContext);

    if (segmentLocation === currentLocation) {
      score += 10; // Same location is highly relevant
    } else if (
      extractedEntities.locations.some((loc) => segmentLocation.includes(loc))
    ) {
      score += 5; // Location is mentioned in latest segment
    }
  }

  // 3. Character continuity
  const characterScore = extractedEntities.characters.reduce(
    (sum, character) => {
      return sum + (content.includes(character.toLowerCase()) ? 3 : 0);
    },
    0
  );
  score += characterScore;

  // Current active characters
  const activeCharacterScore = activeCharacters.reduce((sum, character) => {
    return (
      sum + (content.includes(normalizeEntityName(character.name)) ? 2 : 0)
    );
  }, 0);
  score += activeCharacterScore;

  // 4. Item continuity
  const itemScore = extractedEntities.items.reduce((sum, item) => {
    return sum + (content.includes(item.toLowerCase()) ? 3 : 0);
  }, 0);
  score += itemScore;

  // Current active items
  const activeItemScore = activeItems.reduce((sum, item) => {
    return sum + (content.includes(normalizeEntityName(item.name)) ? 2 : 0);
  }, 0);
  score += activeItemScore;

  // 5. Key concept continuity
  const conceptScore = extractedEntities.concepts.reduce((sum, concept) => {
    // Count occurrences of the concept
    const regex = new RegExp(`\\b${concept}\\b`, "gi");
    const matches = content.match(regex) || [];
    return sum + matches.length;
  }, 0);
  score += conceptScore;

  // 6. Recency bonus (more recent segments get a bonus)
  if (segment.sequenceNumber > latestSegment.sequenceNumber - 5) {
    score += (5 - (latestSegment.sequenceNumber - segment.sequenceNumber)) * 2;
  }

  // 7. Introduction bonus (first segment is important for context)
  if (segment.sequenceNumber === 1) {
    score += 5;
  }

  return score;
}

/**
 * Assembles the most relevant story segments for context
 * @param {number} gameId - The game ID
 * @param {Array} segments - All story segments
 * @param {Object} latestSegment - The most recent segment
 * @param {Object} extractedEntities - Extracted entities from latest segment
 * @param {Array} activeItems - Currently active items
 * @param {Array} activeCharacters - Current characters
 * @param {number} maxSegments - Maximum segments to include
 * @returns {Array} - Most relevant segments, ordered by relevance
 */
async function assembleRelevantSegments(
  gameId,
  segments,
  latestSegment,
  extractedEntities,
  activeItems,
  activeCharacters,
  maxSegments = 6
) {
  // Always include the most recent segment
  const selectedSegments = [latestSegment];

  // Also include the previous segment for continuity (if it exists)
  const previousSegment = segments.find(
    (s) => s.sequenceNumber === latestSegment.sequenceNumber - 1
  );
  if (previousSegment) {
    selectedSegments.push(previousSegment);
  }

  // Calculate relevance scores for all other segments
  const otherSegments = segments.filter(
    (s) => !selectedSegments.some((selected) => selected.id === s.id)
  );

  const scoredSegments = otherSegments.map((segment) => ({
    segment,
    score: calculateSegmentRelevance(
      segment,
      latestSegment,
      extractedEntities,
      activeItems,
      activeCharacters
    ),
  }));

  // Sort by score (descending)
  scoredSegments.sort((a, b) => b.score - a.score);

  // Select top segments up to maxSegments
  const remainingCount = maxSegments - selectedSegments.length;
  const topScoredSegments = scoredSegments
    .slice(0, remainingCount)
    .map(({ segment }) => segment);

  // Combine selected segments with top scored segments
  const allSelectedSegments = [...selectedSegments, ...topScoredSegments];

  // Re-sort by sequence number for proper chronological order
  allSelectedSegments.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  return allSelectedSegments;
}

// Assemble context for a game based on user preferences and relevance
export async function assembleContext(gameId, userId) {
  try {
    // Get user's context config
    const contextConfig = (await prisma.contextConfig.findUnique({
      where: { userId },
    })) || {
      // Default values if no config exists
      maxSegments: 6,
      includeItems: true,
      includeCharacters: true,
      maxItems: 10,
      maxCharacters: 5,
      useVectorSearch: false,
    };

    // Get the game with relations
    const game = await prisma.game.findUnique({
      where: { id: Number(gameId) },
      include: {
        character: true,
      },
    });

    if (!game) {
      throw new Error("Game not found");
    }

    // Get all story segments for this game
    const allStorySegments = await prisma.storySegment.findMany({
      where: { gameId: Number(gameId) },
      orderBy: { sequenceNumber: "desc" },
      include: {
        options: {
          where: { wasChosen: true }, // Only include chosen options
        },
      },
    });

    if (allStorySegments.length === 0) {
      // No segments yet, return default context
      return {
        game: {
          id: game.id,
          title: game.title,
          genre: game.genre,
          turnCount: game.turnCount,
          narrativeStage: game.narrativeStage,
        },
        character: game.character,
        storySegments: [],
        items: [],
        characters: [],
      };
    }

    // Latest segment
    const latestSegment = allStorySegments[0];

    // Extract important entities from latest segment
    const extractedEntities = extractEntities(latestSegment.content);

    // Get active items
    const activeItems = contextConfig.includeItems
      ? await prisma.gameItem.findMany({
          where: {
            gameId: Number(gameId),
            lostAt: null, // Only active items
          },
          take: contextConfig.maxItems,
        })
      : [];

    // Get active characters
    const activeCharacters = contextConfig.includeCharacters
      ? await prisma.gameCharacter.findMany({
          where: { gameId: Number(gameId) },
          orderBy: [{ lastAppearedAt: "desc" }, { importance: "desc" }],
          take: contextConfig.maxCharacters,
        })
      : [];

    // Get the most relevant segments
    const relevantSegments = await assembleRelevantSegments(
      gameId,
      allStorySegments,
      latestSegment,
      extractedEntities,
      activeItems,
      activeCharacters,
      contextConfig.maxSegments
    );

    // Assemble context object
    const context = {
      game: {
        id: game.id,
        title: game.title,
        genre: game.genre,
        turnCount: game.turnCount,
        narrativeStage: game.narrativeStage,
      },
      character: game.character,
      storySegments: relevantSegments.map((segment) => ({
        content: segment.content,
        userChoice: segment.userChoice,
        locationContext: segment.locationContext,
        options: segment.options?.map((option) => option.text) || [],
      })),
      items: activeItems,
      characters: activeCharacters,
    };

    return context;
  } catch (error) {
    console.error("Context assembly error:", error);
    throw error;
  }
}

/**
 * Creates a debug report explaining why each segment was chosen
 * Useful for testing and optimizing the relevance algorithm
 *
 * @param {number} gameId - Game ID
 * @param {number} userId - User ID
 * @returns {Object} - Debug report
 */
export async function createContextDebugReport(gameId, userId) {
  try {
    // Get basic context first
    const context = await assembleContext(gameId, userId);

    // Get all segments for comparison
    const allSegments = await prisma.storySegment.findMany({
      where: { gameId: Number(gameId) },
      orderBy: { sequenceNumber: "desc" },
    });

    // Latest segment
    const latestSegment = allSegments[0];

    // Extract important entities
    const extractedEntities = extractEntities(latestSegment.content);

    // Calculate scores for all segments
    const scoredSegments = allSegments.map((segment) => {
      const score = calculateSegmentRelevance(
        segment,
        latestSegment,
        extractedEntities,
        context.items,
        context.characters
      );

      return {
        id: segment.id,
        sequenceNumber: segment.sequenceNumber,
        score,
        isIncluded: context.storySegments.some(
          (s) =>
            s.content === segment.content &&
            s.locationContext === segment.locationContext
        ),
        // Add details about why this score
        reasons: {
          baseImportance: segment.importance * 2,
          locationContinuity:
            segment.locationContext === latestSegment.locationContext ? 10 : 0,
          characterMentions: extractedEntities.characters.filter((c) =>
            segment.content.toLowerCase().includes(c.toLowerCase())
          ),
          itemMentions: extractedEntities.items.filter((i) =>
            segment.content.toLowerCase().includes(i.toLowerCase())
          ),
          conceptMentions: extractedEntities.concepts.filter((c) =>
            segment.content.toLowerCase().includes(c.toLowerCase())
          ),
          recencyBonus:
            segment.sequenceNumber > latestSegment.sequenceNumber - 5
              ? (5 - (latestSegment.sequenceNumber - segment.sequenceNumber)) *
                2
              : 0,
          introductionBonus: segment.sequenceNumber === 1 ? 5 : 0,
        },
      };
    });

    // Sort by score
    scoredSegments.sort((a, b) => b.score - a.score);

    return {
      extractedEntities,
      segments: scoredSegments,
      includedSegmentIds: context.storySegments.map(
        (_, i) => scoredSegments.find((s) => s.isIncluded)?.id || null
      ),
    };
  } catch (error) {
    console.error("Context debug report error:", error);
    throw error;
  }
}

// Export for use in story progression
export default assembleContext;
