// src/controllers/gameController.js
import prisma from "../config/db.js";
import { llmService } from "../services/index.js";

// Add this new controller method for title generation
export async function generateTitleSuggestions(req, res) {
  try {
    const { genre } = req.body;
    const userId = req.user.id;

    // Validate required field
    if (!genre) {
      return res.status(400).json({ message: "Genre is required" });
    }

    // Get user's LLM preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferredProvider: true,
        preferredModel: true,
      },
    });

    // Setup options for title generation
    const options = {
      provider:
        user?.preferredProvider || process.env.DEFAULT_LLM_PROVIDER || "openai",
      modelId: user?.preferredModel,
      apiKey: req.headers["x-llm-api-key"],
    };

    // Generate titles through LLM service
    const suggestions = await llmService.generateTitles(genre, options);

    res.json({
      success: true,
      suggestions: suggestions.slice(0, 5), // Ensure max 5 titles
    });
  } catch (error) {
    console.error("Title generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate title suggestions",
      error: error.message,
    });
  }
}

export async function createGame(req, res) {
  try {
    const { title, genre, characterId } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!title || !genre) {
      return res.status(400).json({
        success: false,
        message: "Title and genre are required",
      });
    }

    // Validate character ownership if provided
    if (characterId) {
      const character = await prisma.character.findUnique({
        where: { id: Number(characterId) },
      });

      if (!character || character.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Invalid character ID",
        });
      }
    }

    // Create the game
    const game = await prisma.game.create({
      data: {
        title: title.trim(),
        genre: genre.trim(),
        userId,
        characterId: characterId ? Number(characterId) : null,
        status: "ACTIVE",
        narrativeStage: "INTRODUCTION",
        minTurns: 7,
        softMaxTurns: 18,
        hardMaxTurns: 25,
      },
    });

    res.status(201).json({
      success: true,
      game,
    });
  } catch (error) {
    console.error("Create game error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create game",
      error: error.message,
    });
  }
}

// Get all games for the current user
export async function getGames(req, res) {
  try {
    const userId = req.user.id;

    const games = await prisma.game.findMany({
      where: { userId },
      orderBy: { lastPlayedAt: "desc" },
      include: {
        character: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(games);
  } catch (error) {
    console.error("Get games error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Get a specific game by ID with details
export async function getGame(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const game = await prisma.game.findUnique({
      where: {
        id: Number(id),
      },
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
          orderBy: { sequenceNumber: "asc" },
          include: {
            options: true,
          },
        },
        gameItems: true,
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

    res.json(game);
  } catch (error) {
    console.error("Get game error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Update a game
export async function updateGame(req, res) {
  try {
    const { id } = req.params;
    const { title, genre, status } = req.body;
    const userId = req.user.id;

    // Check if game exists and belongs to user
    const existingGame = await prisma.game.findUnique({
      where: { id: Number(id) },
    });

    if (!existingGame) {
      return res.status(404).json({ message: "Game not found" });
    }

    if (existingGame.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update game
    const updatedGame = await prisma.game.update({
      where: { id: Number(id) },
      data: {
        title: title || undefined,
        genre: genre || undefined,
        status: status || undefined,
        lastPlayedAt: new Date(),
      },
    });

    res.json(updatedGame);
  } catch (error) {
    console.error("Update game error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Delete a game
export async function deleteGame(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if game exists and belongs to user
    const game = await prisma.game.findUnique({
      where: { id: Number(id) },
    });

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    if (game.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete game and all related records (cascade will handle relations)
    await prisma.game.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Game deleted" });
  } catch (error) {
    console.error("Delete game error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
