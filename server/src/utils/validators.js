import { ApiError } from "../middleware/errorMiddleware.js";

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is email valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} Is password strong enough
 */
export const isStrongPassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate user registration data
 * @param {Object} userData - User data to validate
 * @throws {ApiError} Validation error
 */
export const validateUserData = (userData) => {
  const { username, email, password } = userData;

  // Required fields
  if (!username || !email || !password) {
    throw new ApiError(400, "Username, email, and password are required");
  }

  // Username validation
  if (username.length < 3 || username.length > 50) {
    throw new ApiError(400, "Username must be between 3 and 50 characters");
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    throw new ApiError(
      400,
      "Username can only contain alphanumeric characters, underscores, and hyphens"
    );
  }

  // Email validation
  if (!isValidEmail(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  // Password validation
  if (!isStrongPassword(password)) {
    throw new ApiError(
      400,
      "Password must be at least 8 characters and include uppercase, lowercase, and a number"
    );
  }
};

/**
 * Validate game data
 * @param {Object} gameData - Game data to validate
 * @throws {ApiError} Validation error
 */
export const validateGameData = (gameData) => {
  const { title, genre, totalTurns } = gameData;

  // Title validation
  if (!title) {
    throw new ApiError(400, "Game title is required");
  }

  if (title.length < 3 || title.length > 100) {
    throw new ApiError(400, "Game title must be between 3 and 100 characters");
  }

  // Genre validation
  if (!genre) {
    throw new ApiError(400, "Game genre is required");
  }

  const validGenres = [
    "fantasy",
    "sci-fi",
    "horror",
    "mystery",
    "adventure",
    "romance",
    "historical",
    "cyberpunk",
    "western",
    "thriller",
    "comedy",
    "drama",
    "dystopian",
    "post-apocalyptic",
    "superhero",
  ];

  if (!validGenres.includes(genre.toLowerCase())) {
    throw new ApiError(
      400,
      `Invalid genre. Valid genres are: ${validGenres.join(", ")}`
    );
  }

  // Total turns validation
  if (totalTurns && (totalTurns < 5 || totalTurns > 50)) {
    throw new ApiError(400, "Total turns must be between 5 and 50");
  }
};

/**
 * Validate AI provider options
 * @param {Object} options - AI provider options
 * @returns {Object} Validated options with defaults
 * @throws {ApiError} Validation error
 */
export const validateAIOptions = (options) => {
  const { provider, modelId, apiKey } = options;

  if (!apiKey) {
    throw new ApiError(401, "API key is required for AI operations");
  }

  // Default provider and model if not provided
  const validatedOptions = {
    provider: provider || "groq",
    modelId: modelId || "llama-3.1-8b-instant",
    apiKey,
  };

  const validProviders = ["openai", "anthropic", "groq"];
  if (!validProviders.includes(validatedOptions.provider.toLowerCase())) {
    throw new ApiError(
      400,
      `Invalid AI provider. Valid providers are: ${validProviders.join(", ")}`
    );
  }

  return validatedOptions;
};

/**
 * Validate pagination parameters
 * @param {Object} params - Pagination parameters
 * @returns {Object} Validated pagination parameters
 */
export const validatePagination = (params) => {
  let { page, limit } = params;

  // Convert to numbers
  page = Number(page) || 1;
  limit = Number(limit) || 10;

  // Validate range
  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;

  return { page, limit };
};
