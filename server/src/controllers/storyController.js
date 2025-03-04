// src/controllers/storyController.js
import prisma from "../config/db.js";
import assembleContext from "../services/contextService.js";
import { llmService } from "../services/index.js";
import {
  findSimilarEntityInDb,
  normalizeEntityName,
} from "../utils/entityUtils.js";

// Utility function to determine if a story should end
function shouldEndStory(game) {
  // Story should end if it's reached the RESOLUTION stage
  if (game.narrativeStage === "RESOLUTION") {
    return true;
  }

  // Story should end if it's passed the hard max turns
  if (game.turnCount >= game.hardMaxTurns) {
    return true;
  }

  // Story should consider ending if it's passed the soft max turns and in FALLING_ACTION
  if (
    game.turnCount >= game.softMaxTurns &&
    game.narrativeStage === "FALLING_ACTION"
  ) {
    // 50% chance to end if in soft max range
    return Math.random() > 0.5;
  }

  return false;
}

// Utility to advance narrative stage based on turn count and current stage
function determineNarrativeStage(game) {
  const { turnCount, minTurns, softMaxTurns, narrativeStage } = game;

  // Progress through narrative stages based on turn count
  if (narrativeStage === "INTRODUCTION" && turnCount >= minTurns * 0.2) {
    return "RISING_ACTION";
  }

  if (narrativeStage === "RISING_ACTION" && turnCount >= minTurns * 0.5) {
    return "CLIMAX";
  }

  if (narrativeStage === "CLIMAX" && turnCount >= minTurns * 0.8) {
    return "FALLING_ACTION";
  }

  if (narrativeStage === "FALLING_ACTION" && turnCount >= softMaxTurns) {
    return "RESOLUTION";
  }

  return narrativeStage;
}

/**
 * Process new game items with duplicate detection
 * @param {number} gameId - Game ID
 * @param {Array} newItems - New items from story generation
 * @param {number} turnCount - Current turn count
 * @returns {Promise<Array>} - Array of created or updated items
 */
async function processNewItems(gameId, newItems, turnCount) {
  if (!newItems || !newItems.length) return [];

  const results = [];

  for (const item of newItems) {
    // Skip items with no name
    if (!item.name || item.name.trim() === "") continue;

    // Find similar item
    const similarItem = await findSimilarEntityInDb(
      prisma,
      gameId,
      "item",
      item.name,
      0.85
    );

    if (similarItem) {
      // Update existing item if needed
      // This might involve enhancing description or marking it as reappearing
      const updatedItem = await prisma.gameItem.update({
        where: { id: similarItem.id },
        data: {
          // Only update description if the new one is longer/more detailed
          description:
            item.description &&
            (!similarItem.description ||
              item.description.length > similarItem.description.length)
              ? item.description
              : undefined,
          // Update other properties as needed
        },
      });

      results.push(updatedItem);
    } else {
      // Create new item
      const newItem = await prisma.gameItem.create({
        data: {
          gameId: Number(gameId),
          name: item.name.trim(),
          description: item.description ? item.description.trim() : null,
          acquiredAt: turnCount,
          properties: {},
        },
      });

      results.push(newItem);
    }
  }

  return results;
}

/**
 * Process new game characters with duplicate detection
 * @param {number} gameId - Game ID
 * @param {Array} newCharacters - New characters from story generation
 * @param {number} turnCount - Current turn count
 * @returns {Promise<Array>} - Array of created or updated characters
 */
async function processNewCharacters(gameId, newCharacters, turnCount) {
  if (!newCharacters || !newCharacters.length) return [];

  const results = [];

  for (const character of newCharacters) {
    // Skip characters with no name
    if (!character.name || character.name.trim() === "") continue;

    // Find similar character
    const similarCharacter = await findSimilarEntityInDb(
      prisma,
      gameId,
      "character",
      character.name,
      0.85
    );

    if (similarCharacter) {
      // Update existing character
      const updatedCharacter = await prisma.gameCharacter.update({
        where: { id: similarCharacter.id },
        data: {
          // Only update description if the new one is longer/more detailed
          description:
            character.description &&
            (!similarCharacter.description ||
              character.description.length >
                similarCharacter.description.length)
              ? character.description
              : undefined,
          relationship: character.relationship || undefined,
          lastAppearedAt: turnCount,
        },
      });

      results.push(updatedCharacter);
    } else {
      // Create new character
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
          importance: 5, // Default importance
        },
      });

      results.push(newCharacter);
    }
  }

  return results;
}

// Get current story state
export async function getStoryState(req, res) {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;

    const game = await prisma.game.findUnique({
      where: { id: Number(gameId) },
      include: {
        character: {
          select: {
            id: true,
            name: true,
            traits: true,
            gender: true,
          },
        },
        storySegments: {
          orderBy: { sequenceNumber: "desc" },
          take: 1,
          include: {
            options: true,
          },
        },
        gameItems: {
          where: { lostAt: null }, // Only active items
        },
        gameCharacters: true,
      },
    });

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Ensure the game belongs to the current user
    if (game.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Format response for easier consumption
    const currentSegment = game.storySegments[0] || null;

    const response = {
      game: {
        id: game.id,
        title: game.title,
        genre: game.genre,
        status: game.status,
        turnCount: game.turnCount,
        narrativeStage: game.narrativeStage,
      },
      character: game.character,
      currentSegment,
      items: game.gameItems,
      characters: game.gameCharacters,
    };

    res.json(response);
  } catch (error) {
    console.error("Get story state error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Start a new story
export async function startStory(req, res) {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;

    // Get game with character
    const game = await prisma.game.findUnique({
      where: { id: Number(gameId) },
      include: {
        character: true,
      },
    });

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Ensure the game belongs to the current user
    if (game.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if story already has segments
    const existingSegments = await prisma.storySegment.count({
      where: { gameId: Number(gameId) },
    });

    if (existingSegments > 0) {
      return res.status(400).json({
        message: "Story already started. Use the progress endpoint instead.",
      });
    }

    // Get user's preferred provider and model
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferredProvider: true,
        preferredModel: true,
      },
    });

    // Set up options for LLM service
    const options = {
      provider:
        user?.preferredProvider || process.env.DEFAULT_LLM_PROVIDER || "openai",
      modelId: user?.preferredModel,
      apiKey: req.headers["x-llm-api-key"],
    };

    // Generate initial story segment with LLM
    const initialSegment = await llmService.generateInitialSegment(
      game,
      game.character,
      options
    );

    // Create story segment in database
    const storySegment = await prisma.storySegment.create({
      data: {
        gameId: Number(gameId),
        sequenceNumber: 1,
        content: initialSegment.content,
        importance: 10, // First segment is very important
        locationContext: initialSegment.locationContext,
        options: {
          create: initialSegment.options.map((option) => ({
            text: option.text,
            risk: option.risk,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    // Process new items with duplicate detection
    if (initialSegment.newItems && initialSegment.newItems.length > 0) {
      await processNewItems(gameId, initialSegment.newItems, 1);
    }

    // Process new characters with duplicate detection
    if (
      initialSegment.newCharacters &&
      initialSegment.newCharacters.length > 0
    ) {
      await processNewCharacters(gameId, initialSegment.newCharacters, 1);
    }

    // Update game's lastPlayedAt
    await prisma.game.update({
      where: { id: Number(gameId) },
      data: {
        lastPlayedAt: new Date(),
      },
    });

    res.json(storySegment);
  } catch (error) {
    console.error("Start story error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Progress story with a choice
export async function makeChoice(req, res) {
  try {
    const { gameId } = req.params;
    const { optionId } = req.body;
    const userId = req.user.id;

    if (!optionId) {
      return res.status(400).json({ message: "Option ID is required" });
    }

    // Get game with current state
    const game = await prisma.game.findUnique({
      where: { id: Number(gameId) },
      include: {
        character: true,
        storySegments: {
          orderBy: { sequenceNumber: "desc" },
          take: 1,
          include: {
            options: true,
          },
        },
        gameItems: {
          where: { lostAt: null }, // Only active items
        },
        gameCharacters: true,
      },
    });

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Ensure the game belongs to the current user
    if (game.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if game is already completed
    if (game.status !== "ACTIVE") {
      return res.status(400).json({
        message: `Game is ${game.status.toLowerCase()}, cannot progress story`,
      });
    }

    // Check if the game has any story segments
    if (!game.storySegments.length) {
      return res.status(400).json({
        message: "Story not started. Use the start endpoint first.",
      });
    }

    const currentSegment = game.storySegments[0];

    // Verify the option belongs to the current segment
    const selectedOption = currentSegment.options.find(
      (option) => option.id === Number(optionId)
    );

    if (!selectedOption) {
      return res.status(400).json({ message: "Invalid option ID" });
    }

    // Mark the option as chosen
    await prisma.option.update({
      where: { id: Number(optionId) },
      data: { wasChosen: true },
    });

    // Increment turn count
    const updatedTurnCount = game.turnCount + 1;

    // Determine new narrative stage
    const updatedGame = {
      ...game,
      turnCount: updatedTurnCount,
    };
    const newNarrativeStage = determineNarrativeStage(updatedGame);

    // Check if the story should end
    const shouldEnd = shouldEndStory({
      ...updatedGame,
      narrativeStage: newNarrativeStage,
    });

    // Get user's preferred provider and model
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferredProvider: true,
        preferredModel: true,
      },
    });

    // Set up options for LLM service
    const options = {
      provider:
        user?.preferredProvider || process.env.DEFAULT_LLM_PROVIDER || "openai",
      modelId: user?.preferredModel,
      apiKey: req.headers["x-llm-api-key"],
    };

    // Gather context for generating the next segment
    const context = await assembleContext(gameId, userId);

    // Generate next segment with LLM
    const nextSegment = await llmService.generateContinuation(
      context,
      selectedOption.text,
      shouldEnd,
      options
    );

    // Create the next story segment in database
    const newSegment = await prisma.storySegment.create({
      data: {
        gameId: Number(gameId),
        sequenceNumber: currentSegment.sequenceNumber + 1,
        content: nextSegment.content,
        userChoice: selectedOption.text,
        importance: shouldEnd ? 8 : 5, // Endings are more important
        locationContext: nextSegment.locationContext,
        options: {
          create: nextSegment.options.map((option) => ({
            text: option.text,
            risk: option.risk,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    // Process new items with duplicate detection
    if (nextSegment.newItems && nextSegment.newItems.length > 0) {
      await processNewItems(gameId, nextSegment.newItems, updatedTurnCount);
    }

    // Process new characters with duplicate detection
    if (nextSegment.newCharacters && nextSegment.newCharacters.length > 0) {
      await processNewCharacters(
        gameId,
        nextSegment.newCharacters,
        updatedTurnCount
      );
    }

    // Update game state
    await prisma.game.update({
      where: { id: Number(gameId) },
      data: {
        turnCount: updatedTurnCount,
        narrativeStage: newNarrativeStage,
        lastPlayedAt: new Date(),
        status: shouldEnd ? "COMPLETED" : "ACTIVE",
        summary: shouldEnd
          ? `An adventure in ${game.genre} that lasted ${updatedTurnCount} turns.`
          : undefined,
      },
    });

    res.json(newSegment);
  } catch (error) {
    console.error("Make choice error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export default {
  getStoryState,
  startStory,
  makeChoice,
};
