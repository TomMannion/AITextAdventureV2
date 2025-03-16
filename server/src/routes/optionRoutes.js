import express from 'express';
import * as optionController from '../controllers/optionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import { validateIdParam, validateApiKey } from '../middleware/validateRequest.js';

const router = express.Router();

// All option routes require authentication
router.use(protect);

// Basic option routes
router.get('/segments/:segmentId/options',
  validateIdParam('segmentId'),
  catchAsync(optionController.getSegmentOptions)
);

router.post('/segments/:segmentId/options/:optionId/choose',
  validateIdParam('segmentId'),
  validateIdParam('optionId'),
  catchAsync(optionController.chooseOption)
);

router.put('/options/:id',
  validateIdParam('id'),
  catchAsync(optionController.updateOption)
);

router.delete('/options/:id',
  validateIdParam('id'),
  catchAsync(optionController.deleteOption)
);

// Custom option creation with AI validation
router.post('/segments/:segmentId/options',
  validateIdParam('segmentId'),
  validateApiKey, // Only needed for AI validation
  catchAsync(optionController.createCustomOption)
);

export default router;