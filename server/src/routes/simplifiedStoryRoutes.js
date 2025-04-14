import express from "express";
import * as storyController from "../controllers/simplifiedStoryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { catchAsync } from "../middleware/errorMiddleware.js";
import {
  validateApiKey,
  validateIdParam,
} from "../middleware/validateRequest.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// All story routes require authentication
router.use(protect);

// Get a specific story segment (doesn't require AI)
router.get(
  "/segments/:id",
  validateIdParam("id"),
  catchAsync(storyController.getStorySegment)
);

// Routes requiring API key for AI operations
router.use(validateApiKey);
router.use(aiLimiter);

// The only AI-powered story operation we need is title generation
// Since story generation is now handled by the game controller
router.post("/generate-title", catchAsync(storyController.generateStoryTitle));

export default router;
