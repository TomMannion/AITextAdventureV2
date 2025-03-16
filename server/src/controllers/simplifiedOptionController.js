import prisma from "../models/index.js";
import { ApiError } from "../middleware/errorMiddleware.js";

/**
 * Get all options for a story segment
 * @route GET /api/options/segments/:segmentId/options
 * @access Private
 */
export const getSegmentOptions = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

/**
 * Choose an option to progress the story
 * @route POST /api/options/segments/:segmentId/options/:optionId/choose
 * @access Private
 */
export const chooseOption = async (req, res, next) => {
  try {
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

    // Return success response with data needed for next segment generation
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
  } catch (error) {
    next(error);
  }
};

/**
 * Create a custom option for a segment (simplified without AI validation)
 * @route POST /api/options/segments/:segmentId/options
 * @access Private
 */
export const createSimpleCustomOption = async (req, res, next) => {
  try {
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

    // Simple option validation - just check length
    if (text.length < 3 || text.length > 200) {
      throw new ApiError(
        400,
        "Option text must be between 3 and 200 characters"
      );
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
  } catch (error) {
    next(error);
  }
};
