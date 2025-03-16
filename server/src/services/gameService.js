import prisma from "../models/index.js";
import logger from "../utils/logger.js";
import { ApiError } from "../middleware/errorMiddleware.js";
import storyElementsService from "./storyElementsService.js";
import storyService from "./storyService.js";

class GameService {
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

      // Generate story elements for the genre with diversity
      const storyElements = userId
        ? await storyElementsService.generateRandomElementsWithDiversity(
            genre,
            userId
          )
        : await storyElementsService.generateRandomElements(genre);

      // Extract individual element IDs for database fields
      const narrativeVoice = storyElements?.narrativeVoice?.id || null;
      const pacingTechnique = storyElements?.pacingTechnique?.id || null;
      const subgenre = storyElements?.subgenre?.id || null;
      const emotionalCore = storyElements?.emotionalCore?.id || null;
      const settingType = storyElements?.settingType?.id || null;
      const languageStyle = storyElements?.languageStyle?.id || null;
      const choiceDesign = storyElements?.choiceDesign?.id || null;

      // Create the game in the database
      const game = await prisma.game.create({
        data: {
          title: finalTitle,
          genre,
          totalTurns: totalTurns || 16,
          userId,
          status: "ACTIVE",
          turnCount: 0,

          // Add story elements to the game
          narrativeVoice,
          pacingTechnique,
          subgenre,
          emotionalCore,
          settingType,
          languageStyle,
          choiceDesign,

          // Store complete story elements object
          storyElements: storyElements,
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
   * Start a game by generating initial story and first segment
   */
  async startGame(gameId, userId, aiOptions) {
    try {
      // Get the game
      const game = await this.getGameById(gameId, userId);

      // Generate initial story if needed
      let updatedGame = game;
      if (!game.initialStory) {
        updatedGame = await storyService.generateInitialStory(
          gameId,
          aiOptions
        );
      }

      // Check if any segments already exist
      const existingSegments = await prisma.storySegment.count({
        where: { gameId },
      });

      let firstSegment;
      if (existingSegments === 0) {
        // Generate first segment
        firstSegment = await storyService.generateNextSegment(
          gameId,
          aiOptions,
          null, // No optionId for first segment
          null // No optionText for first segment
        );
      } else {
        // Get the existing first segment
        firstSegment = await prisma.storySegment.findFirst({
          where: { gameId, sequenceNumber: 1 },
          include: { options: true },
        });
      }

      return {
        game: updatedGame,
        firstSegment,
      };
    } catch (error) {
      logger.error(`Error starting game ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Get a game by ID
   * @param {string} gameId - Game ID
   * @param {int} userId - User ID
   * @returns {Promise<Object>} Game object
   */
  async getGameById(gameId, userId) {
    try {
      // No need to parse here if controllers consistently provide integers
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
   * @param {string} gameId - Game ID
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
   * Update a game
   * @param {string} gameId - Game ID
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated game
   */
  async updateGame(gameId, userId, updateData) {
    try {
      // First check if game exists and belongs to user
      const game = await this.getGameById(gameId, userId);

      logger.debug(
        `Updating game ${gameId} with data: ${JSON.stringify(updateData)}`
      );

      return await prisma.game.update({
        where: { id: gameId },
        data: updateData,
      });
    } catch (error) {
      logger.error(`Error updating game ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a game
   * @param {string} gameId - Game ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deleted game
   */
  async deleteGame(gameId, userId) {
    try {
      // First check if game exists and belongs to user
      const game = await this.getGameById(gameId, userId);

      logger.info(`Deleting game ${gameId} for user ${userId}`);

      return await prisma.game.delete({
        where: { id: gameId },
      });
    } catch (error) {
      logger.error(`Error deleting game ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Update game status
   * @param {string} gameId - Game ID
   * @param {string} userId - User ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated game
   */
  async updateGameStatus(gameId, userId, status) {
    try {
      // First check if game exists and belongs to user
      const game = await this.getGameById(gameId, userId);

      logger.info(`Updating game ${gameId} status to ${status}`);

      return await prisma.game.update({
        where: { id: gameId },
        data: {
          status,
          lastPlayedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error(`Error updating game status ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Increment game turn count
   * @param {string} gameId - Game ID
   * @returns {Promise<Object>} Updated game
   */
  async incrementTurnCount(gameId) {
    try {
      const game = await prisma.game.findUnique({
        where: { id: gameId },
      });

      if (!game) {
        throw new ApiError(404, `Game with ID ${gameId} not found`);
      }

      logger.debug(
        `Incrementing turn count for game ${gameId} from ${game.turnCount} to ${game.turnCount + 1}`
      );

      return await prisma.game.update({
        where: { id: gameId },
        data: {
          turnCount: game.turnCount + 1,
          lastPlayedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error(`Error incrementing turn count for game ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Update game with generated story
   * @param {string} gameId - Game ID
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
   * @param {string} gameId - Game ID
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
   * @param {string} gameId - Game ID
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

export default new GameService();
