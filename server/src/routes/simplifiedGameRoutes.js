import express from "express";
import * as simplifiedGameController from "../controllers/simplifiedGameController.js";
import { protect } from "../middleware/authMiddleware.js";
import { catchAsync } from "../middleware/errorMiddleware.js";
import {
  validateIdParam,
  validateApiKey,
} from "../middleware/validateRequest.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// All game routes require authentication
router.use(protect);

// Game creation
router.post("/", catchAsync(simplifiedGameController.createGame));

// Get user games
router.get("/", catchAsync(simplifiedGameController.getUserGames));

// Get specific game
router.get(
  "/:id",
  validateIdParam("id"),
  catchAsync(simplifiedGameController.getGameById)
);

// Story generation routes - these require API key and are rate limited
router.post(
  "/:gameId/start",
  validateIdParam("gameId"),
  validateApiKey,
  aiLimiter,
  catchAsync(simplifiedGameController.startGame)
);

router.post(
  "/:gameId/segments",
  validateIdParam("gameId"),
  validateApiKey,
  aiLimiter,
  catchAsync(simplifiedGameController.createNewSegment)
);

router.get(
  "/:gameId/segments",
  validateIdParam("gameId"),
  catchAsync(simplifiedGameController.getGameSegments)
);

router.post(
  "/:gameId/summary",
  validateIdParam("gameId"),
  validateApiKey,
  aiLimiter,
  catchAsync(simplifiedGameController.generateGameSummary)
);

export default router;
