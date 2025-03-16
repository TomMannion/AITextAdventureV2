import prisma from "../models/index.js";
import logger from "../utils/logger.js";
import { ApiError } from "../middleware/errorMiddleware.js";

class SimplifiedGameService {
  /**
   * Create a new game
   * @param {Object} gameData - Game data
   * @returns {Promise<Object>} Created game
   */
  async createGame(gameData) {
    try {
      const { title, genre, totalTurns, userId } = gameData;

      // Validate required fields
      if (!genre) {
        throw new ApiError(400, "Game genre is required");
      }

      // Set a default title if none is provided
      const finalTitle =
        title ||
        `New ${genre.charAt(0).toUpperCase() + genre.slice(1)} Adventure`;

      logger.info(
        `Creating new ${genre} game titled "${finalTitle}" for user ${userId}`
      );

      // Create the game in the database - much simpler without story elements
      const game = await prisma.game.create({
        data: {
          title: finalTitle,
          genre,
          totalTurns: totalTurns || 16,
          userId,
          status: "ACTIVE",
          turnCount: 0,
        },
      });

      logger.debug(`Created game with id ${game.id}`);
      return game;
    } catch (error) {
      logger.error("Error creating game:", error);
      throw error;
    }
  }

  /**
   * Get all games for a user with filtering and pagination
   * @param {Object} options - Query options
   * @param {string} options.userId - User ID
   * @param {string} options.status - Filter by game status
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @returns {Promise<Object>} Array of games with pagination info
   */
  async getUserGames(options) {
    const { userId, status, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    try {
      const where = { userId };

      // Add status filter if provided
      if (status) {
        where.status = status;
      }

      // Query games
      const games = await prisma.game.findMany({
        where,
        orderBy: {
          lastPlayedAt: "desc",
        },
        skip,
        take: Number(limit),
        include: {
          // Include first segment to display preview
          storySegments: {
            where: { sequenceNumber: 1 },
            include: { options: true },
            take: 1,
          },
        },
      });

      // Get total count for pagination
      const totalGames = await prisma.game.count({ where });

      logger.debug(
        `Retrieved ${games.length} games for user ${userId}, page ${page}`
      );

      return {
        data: games,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalGames,
          totalPages: Math.ceil(totalGames / limit),
        },
      };
    } catch (error) {
      logger.error(`Error fetching games for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get a game by ID
   * @param {number} gameId - Game ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Game object
   */
  async getGameById(gameId, userId) {
    try {
      const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
          storySegments: {
            orderBy: {
              sequenceNumber: "asc",
            },
            include: {
              options: true,
            },
            take: 5, // Limit for efficiency
          },
        },
      });

      if (!game) {
        throw new ApiError(404, `Game with ID ${gameId} not found`);
      }

      // Check if the game belongs to the user
      if (userId && game.userId !== userId) {
        throw new ApiError(
          403,
          "You do not have permission to access this game"
        );
      }

      return game;
    } catch (error) {
      logger.error(`Error fetching game ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Get all segments for a game
   * @param {number} gameId - Game ID
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Game segments
   */
  async getGameSegments(gameId, userId) {
    try {
      // First verify the game exists and belongs to the user
      const game = await this.getGameById(gameId, userId);

      // Get all segments for the game
      const segments = await prisma.storySegment.findMany({
        where: { gameId },
        orderBy: { sequenceNumber: "asc" },
        include: { options: true },
      });

      logger.debug(`Retrieved ${segments.length} segments for game ${gameId}`);

      return segments;
    } catch (error) {
      logger.error(`Error fetching game segments for game ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Get the latest story segment for a game
   * @param {number} gameId - Game ID
   * @returns {Promise<Object|null>} Latest story segment or null
   */
  async getLatestStorySegment(gameId) {
    try {
      // Get the latest segment based on sequence number
      const latestSegment = await prisma.storySegment.findFirst({
        where: { gameId },
        orderBy: {
          sequenceNumber: "desc",
        },
        include: {
          options: true,
        },
      });

      return latestSegment;
    } catch (error) {
      logger.error(`Error fetching latest segment for game ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Update game with generated story
   * @param {number} gameId - Game ID
   * @param {string} initialStory - Generated initial story
   * @returns {Promise<Object>} Updated game
   */
  async updateGameWithInitialStory(gameId, initialStory) {
    try {
      logger.debug(
        `Updating game ${gameId} with initial story (${initialStory.length} chars)`
      );

      return await prisma.game.update({
        where: { id: gameId },
        data: {
          initialStory,
          lastPlayedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error(`Error updating game with initial story ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Update game title
   * @param {number} gameId - Game ID
   * @param {string} title - New title
   * @returns {Promise<Object>} Updated game
   */
  async updateGameTitle(gameId, title) {
    try {
      logger.debug(`Updating game ${gameId} title to: ${title}`);

      return await prisma.game.update({
        where: { id: gameId },
        data: { title },
      });
    } catch (error) {
      logger.error(`Error updating game title ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Add summary to completed game
   * @param {number} gameId - Game ID
   * @param {string} summary - Text summary
   * @param {Object} endingSummary - Structured summary data
   * @returns {Promise<Object>} Updated game
   */
  async addGameSummary(gameId, summary, endingSummary) {
    try {
      logger.info(`Adding summary to completed game ${gameId}`);

      return await prisma.game.update({
        where: { id: gameId },
        data: {
          summary,
          endingSummary,
          status: "COMPLETED",
          lastPlayedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error(`Error adding game summary ${gameId}:`, error);
      throw error;
    }
  }
}

export default new SimplifiedGameService();
