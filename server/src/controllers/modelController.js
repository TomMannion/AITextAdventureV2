import aiService from "../services/aiService.js";
import { ApiError } from "../middleware/errorMiddleware.js";
import logger from "../utils/logger.js";

/**
 * Get available models for a specific LLM provider
 * @route GET /api/models/:provider
 * @access Private
 */
export const getProviderModels = async (req, res) => {
  const { provider } = req.params;
  const apiKey = req.headers["x-llm-api-key"];
  
  if (!apiKey) {
    throw new ApiError(401, "API key is required for fetching models");
  }
  
  // Validate provider
  if (!["openai", "anthropic", "groq", "gemini"].includes(provider.toLowerCase())) {
    throw new ApiError(400, `Unsupported provider: ${provider}`);
  }
  
  logger.info(`Fetching models for provider: ${provider}`);
  
  try {
    const models = await aiService.getAvailableModels({
      provider: provider.toLowerCase(),
      apiKey
    });
    
    res.status(200).json({
      status: "success",
      data: {
        provider,
        count: models.length,
        models
      }
    });
  } catch (error) {
    logger.error(`Error fetching models for ${provider}:`, error);
    
    // If it's already an ApiError, throw it directly
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Otherwise, create a new ApiError
    throw new ApiError(
      error.status || 500,
      error.message || `Failed to fetch models from ${provider}`
    );
  }
};