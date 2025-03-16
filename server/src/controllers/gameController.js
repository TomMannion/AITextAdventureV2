import gameService from "../services/gameService.js";
import storyService from "../services/storyService.js";
import { ApiError } from "../middleware/errorMiddleware.js";
import prisma from "../models/index.js";
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

    // Use the service which properly sets story elements
    const game = await gameService.createGame({
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
 * Get all games for the current user
 * @route GET /api/games
 * @access Private
 */
export const getUserGames = async (req, res) => {
  const userId = req.user.id;
  const { status, limit = 10, page = 1 } = req.query;

  const games = await gameService.getUserGames({
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
};

/**
 * Get a specific game by ID
 * @route GET /api/games/:id
 * @access Private
 */
export const getGameById = async (req, res, next) => {
  try {
    // Always parse IDs as integers
    const gameId = parseInt(req.params.id, 10);

    // Validate that the ID is a valid integer
    if (isNaN(gameId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid game ID format",
      });
    }

    const userId = req.user.id; // User ID should also be an integer now

    const game = await gameService.getGameById(gameId, userId);

    res.status(200).json({
      status: "success",
      data: game,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update a game
 * @route PUT /api/games/:id
 * @access Private
 */
export const updateGame = async (req, res) => {
  const gameId = parseInt(req.params.id, 10);
  const userId = req.user.id;
  const { title, genre } = req.body;

  const updatedGame = await gameService.updateGame(gameId, userId, {
    title,
    genre,
  });

  res.status(200).json({
    status: "success",
    data: updatedGame,
  });
};

/**
 * Delete a game
 * @route DELETE /api/games/:id
 * @access Private
 */
export const deleteGame = async (req, res) => {
  const gameId = parseInt(req.params.id, 10);
  const userId = req.user.id;

  await gameService.deleteGame(gameId, userId);

  res.status(204).json({
    status: "success",
    data: null,
  });
};

/**
 * Update game status
 * @route PUT /api/games/:id/status
 * @access Private
 */
export const updateGameStatus = async (req, res) => {
  const gameId = parseInt(req.params.id, 10);
  const userId = req.user.id;
  const { status } = req.body;

  if (!status || !["ACTIVE", "COMPLETED", "ABANDONED"].includes(status)) {
    throw new ApiError(
      400,
      "Please provide a valid status (ACTIVE, COMPLETED, or ABANDONED)"
    );
  }

  const updatedGame = await gameService.updateGameStatus(
    gameId,
    userId,
    status
  );

  res.status(200).json({
    status: "success",
    data: updatedGame,
  });
};

/**
 * Start a game by generating the initial story and first segment
 * @route POST /api/games/:gameId/start
 * @access Private
 */
export const startGame = async (req, res, next) => {
  try {
    // Always parse IDs as integers
    const gameId = parseInt(req.params.gameId, 10);

    // Validate that the ID is a valid integer
    if (isNaN(gameId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid game ID format",
      });
    }

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

    // Generate content
    const response = await gameService.startGame(gameId, userId, options);

    res.status(200).json({
      status: "success",
      data: response,
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
    const latestSegment = await gameService.getLatestStorySegment(gameId);
    console.log(latestSegment);
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

    // Generate the next story segment - make sure parameters are in the correct order
    const result = await storyService.generateNextSegment(
      gameId, // Game ID (number)
      aiOptions, // AI options (object with provider, model, apiKey)
      optionId, // Option ID (number or null)
      optionText // Option text (string or null)
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
 * Get all segments for a game
 * @route GET /api/games/:gameId/segments
 * @access Private
 */
export const getGameSegments = async (req, res) => {
  const gameId = parseInt(req.params.gameId, 10);
  const userId = req.user.id;

  const segments = await gameService.getGameSegments(gameId, userId);

  res.status(200).json({
    status: "success",
    results: segments.length,
    data: segments,
  });
};

/**
 * Generate a summary for a completed game
 * @route POST /api/games/:gameId/summary
 * @access Private
 */
export const generateGameSummary = async (req, res) => {
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
  const summary = await storyService.generateGameSummary(
    gameId,
    userId,
    options
  );

  res.status(200).json({
    status: "success",
    data: summary,
  });
};
