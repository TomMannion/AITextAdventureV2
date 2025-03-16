import express from 'express';
import * as gameController from '../controllers/gameController.js';
import { protect } from '../middleware/authMiddleware.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import { validateRequest, validateIdParam, validateApiKey } from '../middleware/validateRequest.js';
import { validateGameData } from '../utils/validators.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All game routes require authentication
router.use(protect);

// Game CRUD routes
router.post('/', 
  validateRequest(validateGameData),
  catchAsync(gameController.createGame)
);

router.get('/', catchAsync(gameController.getUserGames));

router.get('/:id', 
  validateIdParam('id'),
  catchAsync(gameController.getGameById)
);

router.put('/:id', 
  validateIdParam('id'),
  catchAsync(gameController.updateGame)
);

router.delete('/:id', 
  validateIdParam('id'),
  catchAsync(gameController.deleteGame)
);

router.put('/:id/status', 
  validateIdParam('id'),
  catchAsync(gameController.updateGameStatus)
);

// Story related routes - these require API key and are rate limited
router.post('/:gameId/start', 
  validateIdParam('gameId'),
  validateApiKey,
  aiLimiter,
  catchAsync(gameController.startGame)
);

router.post('/:gameId/segments', 
  validateIdParam('gameId'),
  validateApiKey,
  aiLimiter,
  catchAsync(gameController.createNewSegment)
);

router.get('/:gameId/segments', 
  validateIdParam('gameId'),
  catchAsync(gameController.getGameSegments)
);

router.post('/:gameId/summary', 
  validateIdParam('gameId'),
  validateApiKey,
  aiLimiter,
  catchAsync(gameController.generateGameSummary)
);

export default router;