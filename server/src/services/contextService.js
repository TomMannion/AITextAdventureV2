import prisma from "../models/index.js";
import logger from "../utils/logger.js";

class ContextService {
  /**
   * Get the maximum number of segments to include in context window
   * @param {number} userId - User ID
   * @returns {number} Maximum segments for context
   */
  async getMaxSegments(userId) {
    try {
      // Get user's context config
      const contextConfig = await prisma.contextConfig.findUnique({
        where: { userId },
      });

      // Return default if not found
      return contextConfig?.maxSegments || 16;
    } catch (error) {
      logger.error(`Error getting max segments for user ${userId}:`, error);
      return 16; // Default to 16 if error
    }
  }

  /**
   * Build context window for a game
   * @param {Object} params - Parameters for building context
   * @param {number} params.gameId - Game ID
   * @param {number} params.userId - User ID
   * @param {number} params.maxTokens - Maximum tokens for context
   * @returns {Object} Context window information
   */
  async buildContextWindow({ gameId, userId, maxTokens = 4000 }) {
    try {
      // Get user's max segments preference
      const maxSegments = await this.getMaxSegments(userId);

      // Get the game
      const game = await prisma.game.findUnique({
        where: { id: gameId },
        select: {
          initialStory: true,
          turnCount: true,
          totalTurns: true,
        },
      });

      if (!game) {
        throw new Error("Game not found");
      }

      // Get all segments
      const allSegments = await prisma.storySegment.findMany({
        where: { gameId },
        orderBy: { sequenceNumber: "asc" },
        include: {
          options: {
            where: { wasChosen: true },
          },
        },
      });

      // Calculate initial story token estimate (rough approximation)
      const initialStoryTokens = this.estimateTokens(game.initialStory);
      let remainingTokens = maxTokens - initialStoryTokens;

      // Always include the initial story
      const context = {
        initialStory: game.initialStory,
        segments: [],
        turnCount: game.turnCount,
        totalTurns: game.totalTurns,
        estimatedTokens: initialStoryTokens,
      };

      // If we have more segments than the max, we need to select strategically
      if (allSegments.length > maxSegments) {
        // Always include the most recent segments up to half of maxSegments
        const recentSegmentsCount = Math.ceil(maxSegments / 2);
        const recentSegments = allSegments.slice(-recentSegmentsCount);

        // For the remaining slots, select segments at regular intervals from the earlier segments
        const earlierSegments = allSegments.slice(0, -recentSegmentsCount);
        const remainingSlots = maxSegments - recentSegmentsCount;

        // Only add earlier segments if we have slots and segments to add
        const selectedEarlierSegments = [];
        if (remainingSlots > 0 && earlierSegments.length > 0) {
          const interval = Math.max(
            1,
            Math.floor(earlierSegments.length / remainingSlots)
          );
          for (
            let i = 0;
            i < earlierSegments.length &&
            selectedEarlierSegments.length < remainingSlots;
            i += interval
          ) {
            selectedEarlierSegments.push(earlierSegments[i]);
          }
        }

        // Combine the segments and sort by sequence number
        context.segments = [...selectedEarlierSegments, ...recentSegments].sort(
          (a, b) => a.sequenceNumber - b.sequenceNumber
        );
      } else {
        // If we have fewer segments than the max, include all of them
        context.segments = allSegments;
      }

      // Estimate tokens for each segment and check if we need to trim
      for (const segment of context.segments) {
        const segmentText = `${segment.SegmentTitle}: ${segment.content}`;
        const choiceText =
          segment.options.length > 0
            ? `Player chose: ${segment.options[0].text}`
            : "";

        const segmentTokens = this.estimateTokens(segmentText + choiceText);
        context.estimatedTokens += segmentTokens;

        // If we've exceeded our token budget, we need to trim segments
        if (context.estimatedTokens > maxTokens) {
          // Keep removing older segments until we're under budget
          // Skip the most recent segment to ensure continuity
          if (segment !== context.segments[context.segments.length - 1]) {
            context.segments = context.segments.filter(
              (s) => s.id !== segment.id
            );
            context.estimatedTokens -= segmentTokens;
          }
        }
      }

      return context;
    } catch (error) {
      logger.error(`Error building context window for game ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Estimate the number of tokens in a text
   * This is a rough approximation - actual token count depends on the tokenizer used by the model
   * @param {string} text - Text to estimate tokens for
   * @returns {number} Estimated token count
   */
  estimateTokens(text) {
    if (!text) return 0;

    // Very rough approximation: 1 token ≈ 4 characters for English text
    // This will vary by model and language
    return Math.ceil(text.length / 4);
  }
}

export default new ContextService();
