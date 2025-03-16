import simplifiedGameService from "../services/simplifiedGameService.js";
import simplifiedStoryService from "../services/simplifiedStoryService.js";
import { ApiError } from "../middleware/errorMiddleware.js";
import logger from "../utils/logger.js";

/**
 * Create a new game
 * @route POST /api/games
 * @access Private
 */
export const createGame = async (req, res, next) => {
  try {
    const { genre, totalTurns, title } = req.body;
    const userId = req.user.id;

    // Use the simplified service
    const game = await simplifiedGameService.createGame({
      title,
      genre,
      totalTurns,
      userId,
    });

    return res.status(201).json({
      status: "success",
      data: game,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Start a game by generating the initial story and first segment
 * @route POST /api/games/:gameId/start
 * @access Private
 */
export const startGame = async (req, res, next) => {
  try {
    const gameId = parseInt(req.params.gameId, 10);
    const userId = req.user.id;

    // Validate API key
    const apiKey = req.headers["x-llm-api-key"];
    if (!apiKey) {
      throw new ApiError(401, "API key is required for story generation");
    }

    // Get AI options
    const options = {
      provider:
        req.body.preferredProvider || req.user.preferredProvider || "groq",
      modelId:
        req.body.preferredModel ||
        req.user.preferredModel ||
        "llama-3.1-8b-instant",
      apiKey,
    };

    // Generate initial story
    const game = await simplifiedStoryService.generateInitialStory(
      gameId,
      options
    );

    // Generate first segment
    const firstSegment = await simplifiedStoryService.generateNextSegment(
      gameId,
      options,
      null, // No option ID for first segment
      null // No option text for first segment
    );

    res.status(200).json({
      status: "success",
      data: {
        game,
        firstSegment,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new story segment based on player choice
 * @route POST /api/games/:gameId/segments
 * @access Private
 */
export const createNewSegment = async (req, res, next) => {
  try {
    const gameId = parseInt(req.params.gameId, 10);
    const userId = req.user.id;
    const { optionId, optionText } = req.body;

    // Validate API key presence
    const apiKey = req.headers["x-llm-api-key"];
    if (!apiKey) {
      throw new ApiError(401, "API key is required for story generation");
    }

    // Get the latest segment to check if this is the first segment
    const latestSegment =
      await simplifiedGameService.getLatestStorySegment(gameId);

    // Only require option selection for non-first segments
    if (latestSegment && !optionId && !optionText) {
      throw new ApiError(400, "Please provide either optionId or optionText");
    }

    logger.info(`Creating new segment for game ${gameId}, user ${userId}`);

    // Get AI options from request
    const aiOptions = {
      provider:
        req.body.preferredProvider || req.user.preferredProvider || "groq",
      modelId:
        req.body.preferredModel ||
        req.user.preferredModel ||
        "llama-3.1-8b-instant",
      apiKey,
    };

    // Generate the next story segment
    const result = await simplifiedStoryService.generateNextSegment(
      gameId, // Game ID
      aiOptions, // AI options
      optionId, // Option ID
      optionText // Option text
    );

    res.status(201).json({
      status: "success",
      data: result,
    });
  } catch (err) {
    logger.error(`Error creating segment: ${err.message}`, {
      gameId: req.params.gameId,
      userId: req.user.id,
      data: req.body,
      stack: err.stack,
    });
    next(err);
  }
};

/**
 * Generate a summary for a completed game
 * @route POST /api/games/:gameId/summary
 * @access Private
 */
export const generateGameSummary = async (req, res, next) => {
  try {
    const gameId = parseInt(req.params.gameId, 10);
    const userId = req.user.id;

    // Get AI options from request
    const options = {
      provider:
        req.body.preferredProvider || req.user.preferredProvider || "groq",
      modelId:
        req.body.preferredModel ||
        req.user.preferredModel ||
        "llama-3.1-8b-instant",
      apiKey: req.headers["x-llm-api-key"],
    };

    // Generate game summary
    const summary = await simplifiedStoryService.generateGameSummary(
      gameId,
      userId,
      options
    );

    res.status(200).json({
      status: "success",
      data: summary,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all games for the current user
 * @route GET /api/games
 * @access Private
 */
export const getUserGames = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, limit = 10, page = 1 } = req.query;

    const games = await simplifiedGameService.getUserGames({
      userId,
      status,
      limit: parseInt(limit, 10),
      page: parseInt(page, 10),
    });

    res.status(200).json({
      status: "success",
      results: games.length,
      data: games,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a specific game by ID
 * @route GET /api/games/:id
 * @access Private
 */
export const getGameById = async (req, res, next) => {
  try {
    const gameId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (isNaN(gameId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid game ID format",
      });
    }

    const game = await simplifiedGameService.getGameById(gameId, userId);

    res.status(200).json({
      status: "success",
      data: game,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all segments for a game
 * @route GET /api/games/:gameId/segments
 * @access Private
 */
export const getGameSegments = async (req, res, next) => {
  try {
    const gameId = parseInt(req.params.gameId, 10);
    const userId = req.user.id;

    const segments = await simplifiedGameService.getGameSegments(
      gameId,
      userId
    );

    res.status(200).json({
      status: "success",
      results: segments.length,
      data: segments,
    });
  } catch (err) {
    next(err);
  }
};

// Export all controller functions
export default {
  createGame,
  startGame,
  createNewSegment,
  generateGameSummary,
  getUserGames,
  getGameById,
  getGameSegments,
};
