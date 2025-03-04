// src/services/contextService.js
import prisma from "../config/db.js";

// Assemble context for a game based on user preferences
export async function assembleContext(gameId, userId) {
  try {
    // Get user's context config
    const contextConfig = (await prisma.contextConfig.findUnique({
      where: { userId },
    })) || {
      // Default values if no config exists
      maxSegments: 5,
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

    // Get relevant story segments, ordered by importance and recency
    const storySegments = await prisma.storySegment.findMany({
      where: { gameId: Number(gameId) },
      orderBy: [{ importance: "desc" }, { sequenceNumber: "desc" }],
      take: contextConfig.maxSegments,
      include: {
        options: {
          where: { wasChosen: true }, // Only include chosen options
        },
      },
    });

    // Get active items if config includes items
    const items = contextConfig.includeItems
      ? await prisma.gameItem.findMany({
          where: {
            gameId: Number(gameId),
            lostAt: null, // Only active items
          },
          take: contextConfig.maxItems,
        })
      : [];

    // Get important characters if config includes characters
    const characters = contextConfig.includeCharacters
      ? await prisma.gameCharacter.findMany({
          where: { gameId: Number(gameId) },
          orderBy: { importance: "desc" },
          take: contextConfig.maxCharacters,
        })
      : [];

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
      storySegments: storySegments.map((segment) => ({
        content: segment.content,
        userChoice: segment.userChoice,
        locationContext: segment.locationContext,
        options: segment.options.map((option) => option.text),
      })),
      items,
      characters,
    };

    return context;
  } catch (error) {
    console.error("Context assembly error:", error);
    throw error;
  }
}

// Export for use in story progression
export default assembleContext;
