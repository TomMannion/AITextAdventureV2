import prisma from "../models/index.js";
import aiService from "./aiService.js";
import gameService from "./gameService.js";
import simplifiedPrompts from "../utils/simplifiedPrompts.js";
import { ApiError } from "../middleware/errorMiddleware.js";
import logger from "../utils/logger.js";

class SimplifiedStoryService {
  /**
   * Generate initial story for a game
   * @param {number} gameId - Game ID
   * @param {Object} aiOptions - AI provider options
   * @returns {Promise<Object>} Updated game with initial story
   */
  async generateInitialStory(gameId, aiOptions) {
    console.log(aiOptions);
    try {
      // Get the game data
      const game = await gameService.getGameById(gameId);

      if (!game) {
        throw new ApiError(404, `Game with ID ${gameId} not found`);
      }

      // Check if the game already has an initial story
      if (game.initialStory) {
        logger.debug(
          `Game ${gameId} already has an initial story, skipping generation`
        );
        return game;
      }

      logger.info(
        `Generating initial story for game ${gameId}, genre: ${game.genre}`
      );

      // Generate the initial story using simplified prompts
      const initialStoryPrompt = simplifiedPrompts.initialStory(game.genre);

      logger.debug(`Calling LLM with initial story prompt for game ${gameId}`);

      // Get response from AI service
      const initialStoryResponse = await aiService.generateJSON(aiOptions, {
        messages: initialStoryPrompt,
        temperature: 0.7,
        maxTokens: 2000,
      });

      // Extract the story content and title
      const { title, content, status } = initialStoryResponse;

      if (!content) {
        throw new ApiError(500, "Failed to generate story content");
      }

      logger.debug(`Generated initial story for game ${gameId}`);

      // Update the game with the initial story
      await gameService.updateGameWithInitialStory(gameId, content);

      // Update the game title if generated
      if (title && title !== game.title) {
        logger.debug(`Updating game ${gameId} title to: ${title}`);
        await gameService.updateGameTitle(gameId, title);
      }

      // Get the updated game
      return await gameService.getGameById(gameId);
    } catch (error) {
      logger.error(`Error generating initial story for game ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Generate the next story segment based on player choice
   * @param {number} gameId - Game ID
   * @param {Object} aiOptions - AI provider options
   * @param {number|null} optionId - Option ID (if choosing existing option)
   * @param {string|null} optionText - Custom option text (if not using existing option)
   * @returns {Object} New story segment with options
   */
  async generateNextSegment(gameId, aiOptions, optionId, optionText) {
    try {
      // Check if the game exists
      const game = await prisma.game.findUnique({
        where: { id: gameId },
      });

      if (!game) {
        throw new ApiError(404, `Game with ID ${gameId} not found`);
      }

      // Make sure the game has an initial story
      if (!game.initialStory) {
        throw new ApiError(
          400,
          "Game needs an initial story before generating segments"
        );
      }

      // Get all segments for context
      const allSegments = await prisma.storySegment.findMany({
        where: { gameId },
        orderBy: { sequenceNumber: "asc" },
        include: { options: true },
      });

      // Variable to store the user's choice text
      let userChoice = null;

      // Get the latest segment
      const latestSegment =
        allSegments.length > 0 ? allSegments[allSegments.length - 1] : null;

      // For segments after the first one, verify the user's choice
      if (latestSegment) {
        if (optionId) {
          // Make sure optionId is properly parsed as an integer
          const optId =
            typeof optionId === "string" ? parseInt(optionId, 10) : optionId;

          // Find the option by ID
          const option = await prisma.option.findUnique({
            where: { id: optId },
          });

          if (!option) {
            throw new ApiError(404, "Option not found");
          }

          // Check if the option belongs to the latest segment
          if (option.storySegmentId !== latestSegment.id) {
            throw new ApiError(
              400,
              "Option does not belong to the latest story segment"
            );
          }

          userChoice = option.text;
        } else if (optionText) {
          // Use custom option text
          userChoice = optionText;
        } else {
          // Only throw this error if we have existing segments and no choice
          throw new ApiError(
            400,
            "Either optionId or optionText must be provided for non-first segments"
          );
        }
      }

      // Determine if this is the first segment
      const isFirstSegment = allSegments.length === 0;

      // Prepare the next sequence number
      const nextSequenceNumber = isFirstSegment
        ? 1
        : Math.max(...allSegments.map((s) => s.sequenceNumber)) + 1;

      // Increment turn count
      await prisma.game.update({
        where: { id: gameId },
        data: {
          turnCount: { increment: 1 },
          lastPlayedAt: new Date(),
        },
      });

      // Get updated game to get current turn count
      const updatedGame = await prisma.game.findUnique({
        where: { id: gameId },
        select: { turnCount: true, totalTurns: true },
      });

      // Determine what type of prompt to use
      const isFinalTurn = updatedGame.turnCount >= updatedGame.totalTurns;
      let promptData;

      logger.info(
        `Generating ${isFirstSegment ? "first" : isFinalTurn ? "final" : "next"} segment for game ${gameId}. ` +
          `Turn ${updatedGame.turnCount}/${updatedGame.totalTurns}`
      );

      if (isFinalTurn) {
        // Final segment prompt
        promptData = {
          messages: simplifiedPrompts.finalSegment(
            game.initialStory,
            allSegments,
            userChoice,
            game.genre
          ),
          temperature: 0.7,
          maxTokens: 2000,
        };
      } else if (isFirstSegment) {
        // First segment prompt
        promptData = {
          messages: simplifiedPrompts.firstSegment(
            game.initialStory,
            game.genre
          ),
          temperature: 0.7,
          maxTokens: 1500,
        };
      } else {
        // Regular next segment prompt
        promptData = {
          messages: simplifiedPrompts.nextSegment(
            game.initialStory,
            allSegments,
            userChoice,
            game.genre
          ),
          temperature: 0.7,
          maxTokens: 1500,
        };
      }

      // Generate the content using LLM
      logger.debug(
        `Calling LLM for segment ${nextSequenceNumber} of game ${gameId}`
      );

      const response = await aiService.generateJSON(aiOptions, promptData);

      // Extract data from the response
      const { segmentTitle, content, options = [], status } = response;

      if (!content) {
        throw new ApiError(500, "AI response missing required 'content' field");
      }

      // For non-final segments, we should have options
      if (!isFinalTurn && (!options || options.length === 0)) {
        logger.warn(
          `Generated non-final segment without options for game ${gameId}`
        );
        // Generate default options instead of failing
        options.push("Continue the journey.");
        options.push("Take a different approach.");
      }

      logger.debug(
        `Generated segment ${nextSequenceNumber} for game ${gameId}: ` +
          `"${segmentTitle}" with ${options.length} options`
      );

      // Create the new story segment
      const newSegment = await prisma.storySegment.create({
        data: {
          gameId,
          sequenceNumber: nextSequenceNumber,
          segmentTitle: segmentTitle || `Part ${nextSequenceNumber}`,
          content,
          userChoice,
          options: {
            create: options.map((text) => ({ text })),
          },
        },
        include: {
          options: true,
        },
      });

      // Update game status based on the AI response and turn count
      if (
        status === "COMPLETED" ||
        updatedGame.turnCount >= updatedGame.totalTurns
      ) {
        logger.info(`Marking game ${gameId} as COMPLETED`);
        await prisma.game.update({
          where: { id: gameId },
          data: { status: "COMPLETED" },
        });
      }

      return newSegment;
    } catch (error) {
      logger.error(`Error generating segment for game ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Generate a summary for a completed game
   * @param {number} gameId - Game ID
   * @param {string} userId - User ID
   * @param {Object} aiOptions - AI provider options
   * @returns {Object} Updated game with summary
   */
  async generateGameSummary(gameId, userId, aiOptions) {
    try {
      // Check if the game exists
      const game = await prisma.game.findUnique({
        where: { id: gameId },
      });

      if (!game) {
        throw new ApiError(404, `Game with ID ${gameId} not found`);
      }

      // Make sure the game is completed
      if (game.status !== "COMPLETED") {
        throw new ApiError(
          400,
          "Cannot generate summary for a game that is not completed"
        );
      }

      // Game already has a summary
      if (game.summary) {
        logger.debug(
          `Game ${gameId} already has a summary, returning existing data`
        );
        return game;
      }

      logger.info(`Generating summary for completed game ${gameId}`);

      // Get all segments
      const segments = await prisma.storySegment.findMany({
        where: { gameId },
        orderBy: { sequenceNumber: "asc" },
        include: { options: true },
      });

      // Generate the summary
      const promptData = {
        messages: simplifiedPrompts.gameSummary(
          game.initialStory,
          segments,
          game.genre
        ),
        temperature: 0.7,
        maxTokens: 1000,
      };

      // Use the generateJSON method
      logger.debug(`Calling LLM for game summary for game ${gameId}`);
      const response = await aiService.generateJSON(aiOptions, promptData);

      // Extract data from the response
      const { title, summary, keyMoments, theme } = response;

      if (!summary) {
        throw new ApiError(500, "AI response missing required 'summary' field");
      }

      // Convert to detailed JSON structure
      const summaryData = {
        title: title || "Adventure Summary",
        content: summary,
        keyMoments: keyMoments || [],
        theme: theme || "Adventure",
      };

      logger.debug(
        `Generated summary for game ${gameId}: "${title}" (${summary.length} chars)`
      );

      // Update the game with the summary
      const updatedGame = await prisma.game.update({
        where: { id: gameId },
        data: {
          summary: summary,
          endingSummary: summaryData,
        },
      });

      return updatedGame;
    } catch (error) {
      logger.error(`Error generating summary for game ${gameId}:`, error);
      throw error;
    }
  }
}

export default new SimplifiedStoryService();
