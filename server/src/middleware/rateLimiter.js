import rateLimit from 'express-rate-limit';
import { ApiError } from './errorMiddleware.js';

// Default rate limit window and max requests
const WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS 
  ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) 
  : 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = process.env.RATE_LIMIT_MAX 
  ? parseInt(process.env.RATE_LIMIT_MAX, 10) 
  : 50; // 50 requests per window

/**
 * Create a general API rate limiter
 * @returns {Function} Express middleware
 */
export const apiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests
});

/**
 * Create a stricter limiter for auth routes
 * @returns {Function} Express middleware
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 login attempts per hour
  message: {
    status: 'error',
    message: 'Too many login attempts from this IP, please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Create a limiter for AI generation routes
 * @returns {Function} Express middleware
 */
export const aiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 20, // 20 AI requests per window
  message: {
    status: 'error',
    message: 'You have exceeded the AI generation rate limit. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use API key as rate limit key if available, otherwise use IP
    return req.headers['x-llm-api-key'] || req.ip;
  },
});

/**
 * Create a per-user rate limiter for specific resources
 * @param {number} maxRequests - Maximum requests per window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Express middleware
 */
export const createUserRateLimiter = (maxRequests = 30, windowMs = WINDOW_MS) => {
  const userLimiters = new Map();
  
  return (req, res, next) => {
    // Skip if no authenticated user
    if (!req.user || !req.user.id) {
      return next();
    }

    const userId = req.user.id;
    
    // Create a limiter for this user if it doesn't exist
    if (!userLimiters.has(userId)) {
      userLimiters.set(userId, {
        count: 0,
        resetTime: Date.now() + windowMs,
      });
      
      // Clean up after window expires
      setTimeout(() => {
        userLimiters.delete(userId);
      }, windowMs);
    }
    
    const userLimiter = userLimiters.get(userId);
    
    // Reset if window has expired
    if (Date.now() > userLimiter.resetTime) {
      userLimiter.count = 0;
      userLimiter.resetTime = Date.now() + windowMs;
    }
    
    // Increment count and check limit
    userLimiter.count++;
    
    // Check if user has exceeded their limit
    if (userLimiter.count > maxRequests) {
      throw new ApiError(429, 'You have exceeded the rate limit for this resource. Please try again later.');
    }
    
    // Set headers to inform the client about their rate limit status
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - userLimiter.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(userLimiter.resetTime / 1000));
    
    next();
  };
};