import express from 'express';
import * as modelController from '../controllers/modelController.js';
import { protect } from '../middleware/authMiddleware.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import { validateApiKey } from '../middleware/validateRequest.js';

const router = express.Router();

// Public endpoint - only requires API key
console.log("[DEBUG] Loading modelRoutes.js");

// Replace your route with this debug version
router.get('/:provider', (req, res, next) => {
  console.log(`[DEBUG] Model provider route hit: ${req.params.provider}`);
  validateApiKey(req, res, () => {
    catchAsync(modelController.getProviderModels)(req, res, next);
  });
});

// All OTHER model routes require authentication
router.use(protect);

export default router;