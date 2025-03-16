import prisma from "../models/index.js";
import aiService from "./aiService.js";
import gameService from "./gameService.js";
import storyElementsService from "./storyElementsService.js";
import prompts from "../utils/prompts.js";
import { ApiError } from "../middleware/errorMiddleware.js";
import logger from "../utils/logger.js";

class StoryService {
  /**
   * Generate initial story for a game
   * @param {string} gameId - Game ID
   * @param {Object} aiOptions - AI provider options
   * @returns {Promise<Object>} Updated game with initial story
   */
  async generateInitialStory(gameId, aiOptions) {
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

      // Get story elements for the game's genre, using diversity-enhanced method if userId is available
      let storyElements;
      if (game.userId) {
        storyElements =
          game.storyElements ||
          storyElementsService.reconstructElementsFromGame(game) ||
          (await storyElementsService.generateRandomElementsWithDiversity(
            game.genre,
            game.userId
          ));
      } else {
        storyElements =
          game.storyElements ||
          storyElementsService.reconstructElementsFromGame(game) ||
          storyElementsService.generateRandomElements(game.genre);
      }

      // Get recent games from this user to avoid repetitive themes
      let recentGames = [];
      if (game.userId) {
        recentGames = await prisma.game.findMany({
          where: {
            userId: game.userId,
            genre: game.genre,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { initialStory: true, title: true },
        });
      }

      // Extract recent themes to avoid
      const recentThemes = recentGames.map((g) => g.title.toLowerCase());
      const avoidancePrompt =
        recentThemes.length > 0
          ? `Avoid themes similar to these recent stories: ${recentThemes.join(", ")}. Create something distinctly different.`
          : "";

      // Generate the initial story
      const initialStoryPrompt = prompts.initialStory(
        game.genre,
        storyElements
      );

      // Add theme avoidance instruction
      // if (avoidancePrompt) {
      //   initialStoryPrompt[1].content += `\n\n${avoidancePrompt}`;
      // }

      logger.debug(`Calling LLM with initial story prompt for game ${gameId}`);

      // Add diversity parameters to reduce repetition
      let initialStoryResponse = await aiService.generateJSON(aiOptions, {
        messages: initialStoryPrompt,
        temperature: 1.1, // Increased from 0.9 to 1.0
        maxTokens: 8000,
        top_p: 0.9,
        // Add these if your provider supports them
        frequency_penalty: 0.8, // Reduce repetition
        presence_penalty: 0.6, // Encourage new topics
      });

      // Extract the story content and title
      let { title, content, status } = initialStoryResponse;

      // Check if title follows "The Algorithmic X" pattern or similar patterns
      if (
        title.match(/^The\s+\w+\s+\w+$/) ||
        title.toLowerCase().includes("algorithm") ||
        title.toLowerCase().includes("digital") ||
        title.toLowerCase().includes("cyber")
      ) {
        logger.info(
          `Detected potentially repetitive title pattern: "${title}", regenerating...`
        );

        // Regenerate with stronger diversity instructions
        initialStoryPrompt[0].content +=
          "\n\nIMPORTANT: DO NOT use a title starting with 'The' followed by two words. DO NOT use anything related to algorithms, technology, AI, digital, or cyber themes. Be truly original and avoid technology-related horror completely.";

        // Try again with even higher temperature
        initialStoryResponse = await aiService.generateJSON(aiOptions, {
          messages: initialStoryPrompt,
          temperature: 1.5,
          maxTokens: 8000,
          frequency_penalty: 1.0,
          presence_penalty: 1.0,
        });

        // Update the variables with new content
        title = initialStoryResponse.title;
        content = initialStoryResponse.content;
        status = initialStoryResponse.status;
      }

      if (!content) {
        throw new ApiError(500, "Failed to generate story content");
      }

      logger.debug(
        `Generated initial story (${content.length} chars) for game ${gameId}`
      );

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
        include: { user: true },
      });

      logger.info(game.initialStory);

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
          logger.debug(`Looking up option with ID: ${optionId}`);

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

      // Increment turn count - do this early to use accurate count in prompt
      await prisma.game.update({
        where: { id: gameId },
        data: {
          turnCount: {
            increment: 1,
          },
          lastPlayedAt: new Date(),
        },
      });

      // Get updated game to get current turn count
      const updatedGame = await prisma.game.findUnique({
        where: { id: gameId },
        select: { turnCount: true, totalTurns: true },
      });

      // Get story elements
      const storyElements = game.storyElements;

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
          messages: prompts.finalSegment({
            initialStory: game.initialStory,
            segments: allSegments,
            userChoice,
            turnCount: updatedGame.turnCount,
            totalTurns: updatedGame.totalTurns,
            storyElements,
          }),
          temperature: 0.8,
          maxTokens: 2000,
        };
      } else if (isFirstSegment) {
        // First segment prompt
        promptData = {
          messages: prompts.firstSegment({
            initialStory: game.initialStory,
            totalTurns: updatedGame.totalTurns,
            storyElements,
          }),
          temperature: 0.9,
          maxTokens: 1500,
        };
      } else {
        // Regular next segment prompt
        promptData = {
          messages: prompts.nextSegment({
            initialStory: game.initialStory,
            segments: allSegments,
            userChoice,
            turnCount: updatedGame.turnCount,
            totalTurns: updatedGame.totalTurns,
            storyElements,
          }),
          temperature: 0.9,
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
   * @param {string} gameId - Game ID
   * @param {Object} aiOptions - AI provider options
   * @returns {Object} Updated game with summary
   */
  async generateGameSummary(gameId, aiOptions) {
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
        messages: prompts.gameSummary({
          initialStory: game.initialStory,
          segments,
        }),
        temperature: 0.7,
        maxTokens: 1000,
      };

      // Use the generateJSON method
      logger.debug(`Calling LLM for game summary for game ${gameId}`);
      const response = await aiService.generateJSON(aiOptions, promptData);

      // Extract data from the response
      const { title, summary, keyMoments, theme, characterArcs, playerImpact } =
        response;

      if (!summary) {
        throw new ApiError(500, "AI response missing required 'summary' field");
      }

      // Convert to detailed JSON structure
      const summaryData = {
        title: title || "Adventure Summary",
        content: summary,
        keyMoments: keyMoments || [],
        theme: theme || "Adventure",
        characterArcs: characterArcs || [],
        playerImpact: playerImpact || "Player choices shaped the outcome.",
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

export default new StoryService();
