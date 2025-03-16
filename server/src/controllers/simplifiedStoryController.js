import prisma from "../models/index.js";
import aiService from "../services/aiService.js";
import gameService from "../services/gameService.js";
import { ApiError } from "../middleware/errorMiddleware.js";

/**
 * Get a specific story segment
 * @route GET /api/story/segments/:id
 * @access Private
 */
export const getStorySegment = async (req, res, next) => {
  try {
    const segmentId = parseInt(req.params.id, 10);

    // Get the segment
    const segment = await prisma.storySegment.findUnique({
      where: { id: segmentId },
      include: {
        options: true,
        game: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!segment) {
      throw new ApiError(404, "Story segment not found");
    }

    // Check if the segment belongs to the user's game
    if (segment.game.userId !== req.user.id) {
      throw new ApiError(
        403,
        "You do not have permission to access this segment"
      );
    }

    res.status(200).json({
      status: "success",
      data: segment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a title for a story
 * @route POST /api/story/generate-title
 * @access Private
 */
export const generateStoryTitle = async (req, res, next) => {
  try {
    const { gameId } = req.body;
    const userId = req.user.id;

    if (!gameId) {
      throw new ApiError(400, "Game ID is required");
    }

    // Get the game
    const game = await gameService.getGameById(parseInt(gameId, 10), userId);

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

    // Create a simple prompt for generating a title
    const promptData = {
      messages: [
        {
          role: "system",
          content: `You are an AI that creates compelling titles for stories.
          Generate a short, catchy, and appropriate title for the story based on its content.
          The title should be 2-7 words and capture the essence of the story.
          Return only the title, nothing else.`,
        },
        {
          role: "user",
          content: `Generate a title for this story:\n\n${game.initialStory}`,
        },
      ],
      temperature: 0.8,
      maxTokens: 50,
    };

    const title = await aiService.generateText(options, promptData);

    // Update the game with the new title
    const updatedGame = await prisma.game.update({
      where: { id: parseInt(gameId, 10) },
      data: { title: title.trim() },
    });

    res.status(200).json({
      status: "success",
      data: {
        title: updatedGame.title,
      },
    });
  } catch (error) {
    next(error);
  }
};
