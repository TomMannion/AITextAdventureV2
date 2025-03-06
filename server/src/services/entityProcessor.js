// src/services/entityProcessor.js
import prisma from "../config/db.js";
import nlpService from "./nlpService.js";
import { normalizeEntityName } from "../utils/entityUtils.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Process entities mentioned in a story segment
 * @param {number} gameId - Game ID
 * @param {Object} segment - Story segment
 * @param {number} turnCount - Current turn count
 * @returns {Promise<Object>} - Processing results
 */
export async function processSegmentEntities(gameId, segment, turnCount) {
  try {
    // Extract entities using NLP
    const { content, id: segmentId } = segment;
    const extractedEntities = await nlpService.extractEntities(content);

    // Get current items and characters for the game
    const existingItems = await prisma.gameItem.findMany({
      where: { gameId: Number(gameId) },
    });

    const existingCharacters = await prisma.gameCharacter.findMany({
      where: { gameId: Number(gameId) },
    });

    // Process items
    const itemResults = await processItemMentions(
      gameId,
      segmentId,
      extractedEntities.items,
      extractedEntities.relationships,
      existingItems,
      turnCount
    );

    // Process characters
    const characterResults = await processCharacterMentions(
      gameId,
      segmentId,
      extractedEntities.characters,
      extractedEntities.relationships,
      existingCharacters,
      turnCount
    );

    // Return processing results
    return {
      processedItems: itemResults,
      processedCharacters: characterResults,
      extractedEntities,
    };
  } catch (error) {
    console.error("Entity processing error:", error);
    throw error;
  }
}

/**
 * Process item mentions and state changes
 * @param {number} gameId - Game ID
 * @param {number} segmentId - Story segment ID
 * @param {Array} mentionedItems - Item mentions from NLP
 * @param {Array} relationships - Extracted relationships
 * @param {Array} existingItems - Existing items in database
 * @param {number} turnCount - Current turn count
 * @returns {Promise<Array>} - Processing results
 */
async function processItemMentions(
  gameId,
  segmentId,
  mentionedItems,
  relationships,
  existingItems,
  turnCount
) {
  const results = [];
  const itemStateChanges = relationships.filter(
    (rel) => rel.type === "STATE_CHANGE"
  );

  // Process each mentioned item
  for (const itemName of mentionedItems) {
    // Skip items with no name
    if (!itemName || itemName.trim() === "") continue;

    // Find matching item
    const matchedItem = nlpService.matchEntity(itemName, existingItems, 0.85);

    // Check for state changes for this item
    const stateChange = itemStateChanges.find((change) =>
      nlpService.matchEntity(change.source, [{ name: itemName }], 0.85)
    );

    if (matchedItem) {
      // Update existing item
      const updates = {
        lastMentionedAt: turnCount,
      };

      // Apply state change if found
      if (stateChange) {
        updates.currentState = stateChange.newState;

        // Update state history
        const stateHistory = matchedItem.stateHistory || [];
        stateHistory.push({
          turn: turnCount,
          state: stateChange.newState,
          context: stateChange.context,
        });

        updates.stateHistory = stateHistory;

        // Handle special states
        if (
          ["LOST", "CONSUMED", "GIVEN_AWAY", "DESTROYED"].includes(
            stateChange.newState
          )
        ) {
          updates.lostAt = turnCount;
        }
      }

      // Update the item
      const updatedItem = await prisma.gameItem.update({
        where: { id: matchedItem.id },
        data: updates,
      });

      // Record the mention
      await prisma.entityMention.create({
        data: {
          entityType: "ITEM",
          entityId: matchedItem.id,
          segmentId,
          stateChange: !!stateChange,
          newState: stateChange?.newState,
          context: stateChange?.context,
        },
      });

      results.push({
        item: updatedItem,
        action: "UPDATED",
        stateChange: stateChange?.newState,
      });
    } else {
      // Create new item if not found and not an extremely generic term
      const genericTerms = ["thing", "object", "stuff", "it", "them", "those"];
      if (!genericTerms.includes(itemName.toLowerCase())) {
        // Generate a canonical ID for this item
        const canonicalId = uuidv4();

        // Create the new item
        const newItem = await prisma.gameItem.create({
          data: {
            gameId: Number(gameId),
            name: itemName.trim(),
            acquiredAt: turnCount,
            lastMentionedAt: turnCount,
            canonicalId,
            currentState: stateChange?.newState || "DEFAULT",
            stateHistory: stateChange
              ? [
                  {
                    turn: turnCount,
                    state: stateChange.newState,
                    context: stateChange.context,
                  },
                ]
              : [],
            // Set lostAt if the item is already in a "lost" state
            lostAt:
              stateChange &&
              ["LOST", "CONSUMED", "GIVEN_AWAY", "DESTROYED"].includes(
                stateChange.newState
              )
                ? turnCount
                : null,
          },
        });

        // Record the mention
        await prisma.entityMention.create({
          data: {
            entityType: "ITEM",
            entityId: newItem.id,
            segmentId,
            stateChange: !!stateChange,
            newState: stateChange?.newState,
            context: stateChange?.context,
          },
        });

        results.push({
          item: newItem,
          action: "CREATED",
          stateChange: stateChange?.newState,
        });
      }
    }
  }

  return results;
}

/**
 * Process character mentions and relationship changes
 * @param {number} gameId - Game ID
 * @param {number} segmentId - Story segment ID
 * @param {Array} mentionedCharacters - Character mentions from NLP
 * @param {Array} relationships - Extracted relationships
 * @param {Array} existingCharacters - Existing characters in database
 * @param {number} turnCount - Current turn count
 * @returns {Promise<Array>} - Processing results
 */
async function processCharacterMentions(
  gameId,
  segmentId,
  mentionedCharacters,
  relationships,
  existingCharacters,
  turnCount
) {
  const results = [];

  // Get identity relationships
  const identityRelationships = relationships.filter(
    (rel) => rel.type === "IDENTITY"
  );

  // Process each mentioned character
  for (const characterName of mentionedCharacters) {
    // Skip characters with no name
    if (!characterName || characterName.trim() === "") continue;

    // Find matching character
    const matchedCharacter = nlpService.matchEntity(
      characterName,
      existingCharacters,
      0.85
    );

    // Check for identity reveals for this character
    const identityReveal = identityRelationships.find((reveal) =>
      nlpService.matchEntity(reveal.source, [{ name: characterName }], 0.85)
    );

    if (matchedCharacter) {
      // Update existing character
      const updates = {
        lastAppearedAt: turnCount,
        lastMentionedAt: turnCount,
      };

      // Handle identity reveal
      if (identityReveal) {
        // Check if the target identity exists
        const targetIdentity = nlpService.matchEntity(
          identityReveal.target,
          existingCharacters,
          0.85
        );

        if (targetIdentity) {
          // Link characters if target exists
          updates.originalCharacterId = targetIdentity.id;
        } else {
          // Add as an alias if target doesn't exist
          const aliases = matchedCharacter.aliases || [];
          if (!aliases.includes(identityReveal.target)) {
            aliases.push(identityReveal.target);
            updates.aliases = aliases;
          }
        }

        // Update state history
        const stateHistory = matchedCharacter.stateHistory || [];
        stateHistory.push({
          turn: turnCount,
          type: "IDENTITY_REVEALED",
          newIdentity: identityReveal.target,
          context: identityReveal.context,
        });

        updates.stateHistory = stateHistory;
      }

      // Update the character
      const updatedCharacter = await prisma.gameCharacter.update({
        where: { id: matchedCharacter.id },
        data: updates,
      });

      // Record the mention
      await prisma.entityMention.create({
        data: {
          entityType: "CHARACTER",
          entityId: matchedCharacter.id,
          segmentId,
          stateChange: !!identityReveal,
          newState: identityReveal ? "IDENTITY_REVEALED" : null,
          context: identityReveal?.context,
        },
      });

      results.push({
        character: updatedCharacter,
        action: "UPDATED",
        identityReveal: identityReveal ? identityReveal.target : null,
      });
    } else {
      // Create new character if not found and not a generic term
      const genericTerms = [
        "person",
        "someone",
        "man",
        "woman",
        "they",
        "he",
        "she",
      ];
      if (!genericTerms.includes(characterName.toLowerCase())) {
        // Generate a canonical ID for this character
        const canonicalId = uuidv4();

        // Handle case where character is revealed as another character
        let originalCharacterId = null;
        if (identityReveal) {
          const targetIdentity = nlpService.matchEntity(
            identityReveal.target,
            existingCharacters,
            0.85
          );

          if (targetIdentity) {
            originalCharacterId = targetIdentity.id;
          }
        }

        // Create the new character
        const newCharacter = await prisma.gameCharacter.create({
          data: {
            gameId: Number(gameId),
            name: characterName.trim(),
            firstAppearedAt: turnCount,
            lastAppearedAt: turnCount,
            lastMentionedAt: turnCount,
            canonicalId,
            aliases: identityReveal ? [identityReveal.target] : [],
            originalCharacterId,
            stateHistory: identityReveal
              ? [
                  {
                    turn: turnCount,
                    type: "IDENTITY_REVEALED",
                    newIdentity: identityReveal.target,
                    context: identityReveal.context,
                  },
                ]
              : [],
          },
        });

        // Record the mention
        await prisma.entityMention.create({
          data: {
            entityType: "CHARACTER",
            entityId: newCharacter.id,
            segmentId,
            stateChange: !!identityReveal,
            newState: identityReveal ? "IDENTITY_REVEALED" : null,
            context: identityReveal?.context,
          },
        });

        results.push({
          character: newCharacter,
          action: "CREATED",
          identityReveal: identityReveal ? identityReveal.target : null,
        });
      }
    }
  }

  return results;
}

/**
 * Process new items from LLM generation with state tracking
 * @param {number} gameId - Game ID
 * @param {Array} newItems - New items from story generation
 * @param {number} turnCount - Current turn count
 * @returns {Promise<Array>} - Array of created or updated items
 */
export async function processNewItems(gameId, newItems, turnCount) {
  if (!newItems || !newItems.length) return [];

  const results = [];
  const existingItems = await prisma.gameItem.findMany({
    where: { gameId: Number(gameId) },
  });

  for (const item of newItems) {
    // Skip items with no name
    if (!item.name || item.name.trim() === "") continue;

    // Check for explicit state information in description
    const stateInfo = extractStateFromDescription(item.description);

    // Find similar item
    const matchedItem = nlpService.matchEntity(item.name, existingItems, 0.85);

    if (matchedItem) {
      // Update existing item
      const updates = {
        lastMentionedAt: turnCount,
      };

      // Only update description if the new one is longer/more detailed
      if (
        item.description &&
        (!matchedItem.description ||
          item.description.length > matchedItem.description.length)
      ) {
        updates.description = item.description;
      }

      // Apply state change if found
      if (stateInfo) {
        updates.currentState = stateInfo.state;

        // Update state history
        const stateHistory = matchedItem.stateHistory || [];
        stateHistory.push({
          turn: turnCount,
          state: stateInfo.state,
          context: item.description,
        });

        updates.stateHistory = stateHistory;

        // Handle special states
        if (
          ["LOST", "CONSUMED", "GIVEN_AWAY", "DESTROYED"].includes(
            stateInfo.state
          )
        ) {
          updates.lostAt = turnCount;
        }
      }

      const updatedItem = await prisma.gameItem.update({
        where: { id: matchedItem.id },
        data: updates,
      });

      results.push(updatedItem);
    } else {
      // Create new item
      const canonicalId = uuidv4();

      const newItem = await prisma.gameItem.create({
        data: {
          gameId: Number(gameId),
          name: item.name.trim(),
          description: item.description ? item.description.trim() : null,
          acquiredAt: turnCount,
          lastMentionedAt: turnCount,
          canonicalId,
          currentState: stateInfo?.state || "DEFAULT",
          stateHistory: stateInfo
            ? [
                {
                  turn: turnCount,
                  state: stateInfo.state,
                  context: item.description,
                },
              ]
            : [],
          lostAt:
            stateInfo &&
            ["LOST", "CONSUMED", "GIVEN_AWAY", "DESTROYED"].includes(
              stateInfo.state
            )
              ? turnCount
              : null,
        },
      });

      results.push(newItem);
    }
  }

  return results;
}

/**
 * Process new characters from LLM generation with identity tracking
 * @param {number} gameId - Game ID
 * @param {Array} newCharacters - New characters from story generation
 * @param {number} turnCount - Current turn count
 * @returns {Promise<Array>} - Array of created or updated characters
 */
export async function processNewCharacters(gameId, newCharacters, turnCount) {
  if (!newCharacters || !newCharacters.length) return [];

  const results = [];
  const existingCharacters = await prisma.gameCharacter.findMany({
    where: { gameId: Number(gameId) },
  });

  for (const character of newCharacters) {
    // Skip characters with no name
    if (!character.name || character.name.trim() === "") continue;

    // Check for identity information in description
    const identityInfo = extractIdentityFromDescription(character.description);

    // Find similar character
    const matchedCharacter = nlpService.matchEntity(
      character.name,
      existingCharacters,
      0.85
    );

    if (matchedCharacter) {
      // Update existing character
      const updates = {
        lastAppearedAt: turnCount,
        lastMentionedAt: turnCount,
        relationship: character.relationship || undefined,
      };

      // Only update description if the new one is longer/more detailed
      if (
        character.description &&
        (!matchedCharacter.description ||
          character.description.length > matchedCharacter.description.length)
      ) {
        updates.description = character.description;
      }

      // Handle identity reveal if found
      if (identityInfo) {
        // Check if the target identity exists
        const targetIdentity = nlpService.matchEntity(
          identityInfo.trueName,
          existingCharacters,
          0.85
        );

        if (targetIdentity) {
          // Link characters if target exists
          updates.originalCharacterId = targetIdentity.id;
        } else {
          // Add as an alias if target doesn't exist
          const aliases = matchedCharacter.aliases || [];
          if (!aliases.includes(identityInfo.trueName)) {
            aliases.push(identityInfo.trueName);
            updates.aliases = aliases;
          }
        }

        // Update state history
        const stateHistory = matchedCharacter.stateHistory || [];
        stateHistory.push({
          turn: turnCount,
          type: "IDENTITY_REVEALED",
          newIdentity: identityInfo.trueName,
          context: character.description,
        });

        updates.stateHistory = stateHistory;
      }

      const updatedCharacter = await prisma.gameCharacter.update({
        where: { id: matchedCharacter.id },
        data: updates,
      });

      results.push(updatedCharacter);
    } else {
      // Create new character
      const canonicalId = uuidv4();

      // Handle case where character is revealed as another character
      let originalCharacterId = null;
      if (identityInfo) {
        const targetIdentity = nlpService.matchEntity(
          identityInfo.trueName,
          existingCharacters,
          0.85
        );

        if (targetIdentity) {
          originalCharacterId = targetIdentity.id;
        }
      }

      const newCharacter = await prisma.gameCharacter.create({
        data: {
          gameId: Number(gameId),
          name: character.name.trim(),
          description: character.description
            ? character.description.trim()
            : null,
          relationship: character.relationship || "NEUTRAL",
          firstAppearedAt: turnCount,
          lastAppearedAt: turnCount,
          lastMentionedAt: turnCount,
          importance: 5, // Default importance
          canonicalId,
          aliases: identityInfo ? [identityInfo.trueName] : [],
          originalCharacterId,
          stateHistory: identityInfo
            ? [
                {
                  turn: turnCount,
                  type: "IDENTITY_REVEALED",
                  newIdentity: identityInfo.trueName,
                  context: character.description,
                },
              ]
            : [],
        },
      });

      results.push(newCharacter);
    }
  }

  return results;
}

/**
 * Extract state information from item description
 * @param {string} description - Item description
 * @returns {Object|null} - Extracted state info or null
 */
function extractStateFromDescription(description) {
  if (!description) return null;

  // Look for explicit state markers from LLM
  const stateMarker = /ITEM_UPDATE: (.*?) \| (.*?) \| (.*?)(?:\n|$)/i;
  const match = description.match(stateMarker);

  if (match) {
    return {
      state: match[2].toUpperCase(),
      reason: match[3],
    };
  }

  // Look for common state descriptions
  const statePatterns = [
    { regex: /broken|shattered|cracked|damaged/i, state: "BROKEN" },
    { regex: /consumed|used up|empty|depleted/i, state: "CONSUMED" },
    { regex: /given away|handed over|transferred/i, state: "GIVEN_AWAY" },
    { regex: /lost|missing|misplaced/i, state: "LOST" },
    { regex: /found|discovered|obtained/i, state: "FOUND" },
    { regex: /modified|altered|changed/i, state: "MODIFIED" },
  ];

  for (const pattern of statePatterns) {
    if (pattern.regex.test(description)) {
      return {
        state: pattern.state,
        reason: description,
      };
    }
  }

  return null;
}

/**
 * Extract identity information from character description
 * @param {string} description - Character description
 * @returns {Object|null} - Extracted identity info or null
 */
function extractIdentityFromDescription(description) {
  if (!description) return null;

  // Look for explicit identity markers from LLM
  const identityMarker = /CHARACTER_UPDATE: (.*?) \| (.*?) \| (.*?)(?:\n|$)/i;
  const match = description.match(identityMarker);

  if (match) {
    return {
      trueName: match[2],
      reason: match[3],
    };
  }

  // Look for common identity reveal language
  const identityPatterns = [
    /actually (is|was) (.*?)(\.|\s|$)/i,
    /revealed to be (.*?)(\.|\s|$)/i,
    /true identity is (.*?)(\.|\s|$)/i,
    /secretly (is|was) (.*?)(\.|\s|$)/i,
  ];

  for (const pattern of identityPatterns) {
    const match = description.match(pattern);
    if (match) {
      return {
        trueName: match[pattern.lastIndex - 1].trim(),
        reason: description,
      };
    }
  }

  return null;
}

export default {
  processSegmentEntities,
  processNewItems,
  processNewCharacters,
};
