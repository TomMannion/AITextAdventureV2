// src/routes/gameRoutes.js
import express from "express";
import {
  generateTitleSuggestions,
  getGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
} from "../controllers/gameController.js";
import {
  getStoryState,
  startStory,
  makeChoice,
} from "../controllers/storyController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// All game routes require authentication
router.use(authenticate);

// Game CRUD routes
router.get("/", getGames);
router.get("/:id", getGame);
router.post("/", createGame);
router.put("/:id", updateGame);
router.delete("/:id", deleteGame);

// Story progression routes
router.post("/generate-titles", generateTitleSuggestions);
router.get("/:gameId/story", getStoryState);
router.post("/:gameId/story/start", startStory);
router.post("/:gameId/story/choice", makeChoice);

export default router;
