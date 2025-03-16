import { ApiError } from "./errorMiddleware.js";

/**
 * Middleware factory to validate request bodies against schema functions
 * @param {Function} validationFn - Validation function to use
 * @param {string} source - Source of data to validate ('body', 'params', 'query')
 * @returns {Function} Express middleware
 */
export const validateRequest = (validationFn, source = "body") => {
  return (req, res, next) => {
    try {
      // Get data from the specified source
      const data = req[source];

      // Run the validation function
      validationFn(data);

      // If validation passes, continue
      next();
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(400, error.message));
      }
    }
  };
};

/**
 * Middleware to validate the presence of required API key for AI operations
 * @returns {Function} Express middleware
 */
export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-llm-api-key"];

  if (!apiKey) {
    return next(new ApiError(401, "API key is required for this operation"));
  }

  // Add the API key to the request options
  if (!req.aiOptions) {
    req.aiOptions = {};
  }

  req.aiOptions.apiKey = apiKey;

  // Add user preferences if authenticated
  if (req.user) {
    req.aiOptions.provider =
      req.body.preferredProvider || req.user.preferredProvider || "groq";
    req.aiOptions.modelId =
      req.body.preferredModel ||
      req.user.preferredModel ||
      "llama-3.1-8b-instant";
  } else {
    req.aiOptions.provider = req.body.preferredProvider || "groq";
    req.aiOptions.modelId = req.body.preferredModel || "llama-3.1-8b-instant";
  }

  next();
};

/**
 * Middleware to sanitize user input to prevent XSS attacks
 * @returns {Function} Express middleware
 */
export const sanitizeInput = (req, res, next) => {
  // Function to sanitize a string
  const sanitizeString = (str) => {
    if (typeof str !== "string") return str;
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };

  // Function to recursively sanitize an object
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== "object") return obj;

    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      if (typeof value === "string") {
        obj[key] = sanitizeString(value);
      } else if (typeof value === "object") {
        obj[key] = sanitizeObject(value);
      }
    });

    return obj;
  };

  // Sanitize req.body, req.params, and req.query
  req.body = sanitizeObject(req.body);
  req.params = sanitizeObject(req.params);
  req.query = sanitizeObject(req.query);

  next();
};

/**
 * Middleware to validate ID parameters - supports UUID strings
 * @param {string} paramName - Name of the parameter to validate
 * @returns {Function} Express middleware
 */
export const validateIdParam = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id) {
      return next(new ApiError(400, `${paramName} parameter is required`));
    }

    // UUID validation regex
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Handle numeric IDs (convert to string) or validate UUID format
    if (!isNaN(id)) {
      // It's a numeric ID, no need to validate further
      // req.params[paramName] remains as is (a string)
      return next();
    } else if (uuidRegex.test(id)) {
      // Valid UUID format
      return next();
    }

    // Neither a valid number nor a valid UUID
    return next(
      new ApiError(
        400,
        `Invalid ${paramName} parameter. Must be a valid UUID or a number`
      )
    );
  };
};
