import prisma from "../models/index.js";
import aiService from "../services/aiService.js";
import { ApiError } from "../middleware/errorMiddleware.js";

/**
 * Get all options for a story segment
 * @route GET /api/options/segments/:segmentId/options
 * @access Private
 */
export const getSegmentOptions = async (req, res) => {
  const segmentId = parseInt(req.params.segmentId, 10);

  // Get the segment with options
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
    results: segment.options.length,
    data: segment.options,
  });
};

/**
 * Choose an option to progress the story
 * @route POST /api/options/segments/:segmentId/options/:optionId/choose
 * @access Private
 */
export const chooseOption = async (req, res) => {
  const segmentId = parseInt(req.params.segmentId, 10);
  const optionId = parseInt(req.params.optionId, 10);

  // Check if the segment exists
  const segment = await prisma.storySegment.findUnique({
    where: { id: segmentId },
    include: {
      game: {
        select: {
          userId: true,
          id: true,
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

  // Check if the option exists
  const option = await prisma.option.findUnique({
    where: { id: optionId },
  });

  if (!option) {
    throw new ApiError(404, "Option not found");
  }

  // Check if the option belongs to the segment
  if (option.storySegmentId !== segmentId) {
    throw new ApiError(400, "Option does not belong to this segment");
  }

  // Mark this option as chosen
  await prisma.option.update({
    where: { id: optionId },
    data: { wasChosen: true },
  });

  // Redirect to the game controller to generate the next segment
  res.status(200).json({
    status: "success",
    message: "Option chosen successfully",
    data: {
      gameId: segment.game.id,
      segmentId,
      optionId,
      optionText: option.text,
    },
  });
};

/**
 * Create a custom option for a segment
 * @route POST /api/options/segments/:segmentId/options
 * @access Private
 */
export const createCustomOption = async (req, res) => {
  const segmentId = parseInt(req.params.segmentId, 10);
  const { text } = req.body;

  if (!text) {
    throw new ApiError(400, "Option text is required");
  }

  // Check if the segment exists
  const segment = await prisma.storySegment.findUnique({
    where: { id: segmentId },
    include: {
      game: {
        select: {
          userId: true,
          id: true,
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

  // Get AI options from request
  const aiOptions = {
    provider:
      req.body.preferredProvider || req.user.preferredProvider || "groq",
    modelId:
      req.body.preferredModel ||
      req.user.preferredModel ||
      "llama-3.1-8b-instant",
    apiKey: req.headers["x-llm-api-key"],
  };

  // Validate the option using AI to ensure it's coherent with the story
  const promptData = {
    messages: [
      {
        role: "system",
        content: `You are an AI that validates player choices in a text adventure game.
        Given a story segment and a player's custom choice, determine if the choice is:
        1. Coherent with the story context
        2. Appropriate for the genre and tone
        3. Clear and actionable
        
        Respond with either "VALID" or "INVALID: [reason]".`,
      },
      {
        role: "user",
        content: `Story segment: ${segment.content}\n\nPlayer's custom choice: "${text}"\n\nIs this choice valid?`,
      },
    ],
    temperature: 0.3,
    maxTokens: 100,
  };

  // Skip AI validation if no API key provided
  let validationResult = "VALID";
  if (req.headers["x-llm-api-key"]) {
    validationResult = await aiService.generateText(aiOptions, promptData);
  }

  // If the option is invalid, return the reason
  if (validationResult.startsWith("INVALID")) {
    throw new ApiError(400, validationResult.substring(9).trim());
  }

  // Create the custom option
  const newOption = await prisma.option.create({
    data: {
      text,
      storySegmentId: segmentId,
    },
  });

  res.status(201).json({
    status: "success",
    data: newOption,
  });
};

/**
 * Update an option
 * @route PUT /api/options/:id
 * @access Private
 */
export const updateOption = async (req, res) => {
  const optionId = parseInt(req.params.id, 10);
  const { text } = req.body;

  if (!text) {
    throw new ApiError(400, "Option text is required");
  }

  // Check if the option exists
  const option = await prisma.option.findUnique({
    where: { id: optionId },
    include: {
      storySegment: {
        include: {
          game: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!option) {
    throw new ApiError(404, "Option not found");
  }

  // Check if the option belongs to the user's game
  if (option.storySegment.game.userId !== req.user.id) {
    throw new ApiError(403, "You do not have permission to update this option");
  }

  // Check if the option has already been chosen
  if (option.wasChosen) {
    throw new ApiError(
      400,
      "Cannot update an option that has already been chosen"
    );
  }

  // Update the option
  const updatedOption = await prisma.option.update({
    where: { id: optionId },
    data: { text },
  });

  res.status(200).json({
    status: "success",
    data: updatedOption,
  });
};

/**
 * Delete an option
 * @route DELETE /api/options/:id
 * @access Private
 */
export const deleteOption = async (req, res) => {
  const optionId = parseInt(req.params.id, 10);

  // Check if the option exists
  const option = await prisma.option.findUnique({
    where: { id: optionId },
    include: {
      storySegment: {
        include: {
          game: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!option) {
    throw new ApiError(404, "Option not found");
  }

  // Check if the option belongs to the user's game
  if (option.storySegment.game.userId !== req.user.id) {
    throw new ApiError(403, "You do not have permission to delete this option");
  }

  // Check if the option has already been chosen
  if (option.wasChosen) {
    throw new ApiError(
      400,
      "Cannot delete an option that has already been chosen"
    );
  }

  // Count remaining options to ensure we don't delete the last one
  const optionCount = await prisma.option.count({
    where: { storySegmentId: option.storySegmentId },
  });

  if (optionCount <= 1) {
    throw new ApiError(
      400,
      "Cannot delete the last remaining option for a segment"
    );
  }

  // Delete the option
  await prisma.option.delete({
    where: { id: optionId },
  });

  res.status(204).send();
};
