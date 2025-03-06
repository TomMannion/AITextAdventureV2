// src/controllers/storyController.js
import prisma from "../config/db.js";
import assembleContext from "../services/contextService.js";
import { llmService } from "../services/index.js";
import entityProcessor from "../services/entityProcessor.js";

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
    // Set up options for LLM service
    const options = {
      provider: req.body.preferredProvider || "groq",
      modelId: req.body.preferredModel || "llama-3.1-8b-instant",
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

    // Process entities using our enhanced processor
    if (initialSegment.newItems && initialSegment.newItems.length > 0) {
      await entityProcessor.processNewItems(gameId, initialSegment.newItems, 1);
    }

    if (
      initialSegment.newCharacters &&
      initialSegment.newCharacters.length > 0
    ) {
      await entityProcessor.processNewCharacters(
        gameId,
        initialSegment.newCharacters,
        1
      );
    }

    // Process all entities mentioned in the segment
    // await entityProcessor.processSegmentEntities(gameId, storySegment, 1);

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
    // Set up options for LLM service
    const options = {
      provider: req.body.preferredProvider || "groq",
      modelId: req.body.preferredModel || "llama-3.1-8b-instant",
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

    // Process entities using our enhanced processor
    if (nextSegment.newItems && nextSegment.newItems.length > 0) {
      await entityProcessor.processNewItems(
        gameId,
        nextSegment.newItems,
        updatedTurnCount
      );
    }

    if (nextSegment.newCharacters && nextSegment.newCharacters.length > 0) {
      await entityProcessor.processNewCharacters(
        gameId,
        nextSegment.newCharacters,
        updatedTurnCount
      );
    }

    // Process all entities mentioned in the segment
    // await entityProcessor.processSegmentEntities(
    //   gameId,
    //   newSegment,
    //   updatedTurnCount
    // );

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

// Get entity history
export async function getEntityHistory(req, res) {
  try {
    const { gameId, entityType, entityId } = req.params;
    const userId = req.user.id;

    // Check game ownership
    const game = await prisma.game.findUnique({
      where: { id: Number(gameId) },
    });

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    if (game.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Validate entity type
    if (!["item", "character"].includes(entityType.toLowerCase())) {
      return res.status(400).json({ message: "Invalid entity type" });
    }

    // Get entity data based on type
    let entity;

    if (entityType.toLowerCase() === "item") {
      entity = await prisma.gameItem.findUnique({
        where: {
          id: Number(entityId),
          gameId: Number(gameId),
        },
      });
    } else {
      entity = await prisma.gameCharacter.findUnique({
        where: {
          id: Number(entityId),
          gameId: Number(gameId),
        },
      });
    }

    if (!entity) {
      return res.status(404).json({ message: "Entity not found" });
    }

    // Get all mentions of this entity
    const mentions = await prisma.entityMention.findMany({
      where: {
        entityType: entityType.toUpperCase(),
        entityId: Number(entityId),
      },
      include: {
        storySegment: {
          select: {
            sequenceNumber: true,
            content: true,
            locationContext: true,
          },
        },
      },
      orderBy: {
        storySegment: {
          sequenceNumber: "asc",
        },
      },
    });

    // Get all related entities if this is a character
    let relatedEntities = [];
    if (entityType.toLowerCase() === "character") {
      // Get identities this character has been revealed as
      const originalIdentities = await prisma.gameCharacter.findMany({
        where: {
          originalCharacterId: Number(entityId),
          gameId: Number(gameId),
        },
        select: {
          id: true,
          name: true,
        },
      });

      // Get identities that this character has revealed
      const revealedIdentity = entity.originalCharacterId
        ? await prisma.gameCharacter.findUnique({
            where: {
              id: entity.originalCharacterId,
            },
            select: {
              id: true,
              name: true,
            },
          })
        : null;

      relatedEntities = {
        originalIdentities,
        revealedIdentity,
      };
    }

    // Format and return entity history
    const history = {
      entity,
      stateHistory: entity.stateHistory || [],
      mentions: mentions.map((mention) => ({
        segmentNumber: mention.storySegment.sequenceNumber,
        stateChange: mention.stateChange,
        newState: mention.newState,
        context: mention.context,
        location: mention.storySegment.locationContext,
      })),
      relatedEntities,
    };

    res.json(history);
  } catch (error) {
    console.error("Get entity history error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export default {
  getStoryState,
  startStory,
  makeChoice,
  getEntityHistory,
};
