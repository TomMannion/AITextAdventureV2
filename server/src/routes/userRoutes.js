import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { validateUserData } from '../utils/validators.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes with rate limiting for auth
router.post('/register', 
  authLimiter,
  validateRequest(validateUserData),
  catchAsync(userController.registerUser)
);

router.post('/login', 
  authLimiter,
  catchAsync(userController.loginUser)
);

// Protected routes (require authentication)
router.use(protect);

router.get('/me', catchAsync(userController.getCurrentUser));
router.put('/me', catchAsync(userController.updateCurrentUser));
router.put('/preferences', catchAsync(userController.updateUserPreferences));
router.post('/logout', catchAsync(userController.logoutUser));
router.delete('/me', catchAsync(userController.deleteCurrentUser));

export default router;