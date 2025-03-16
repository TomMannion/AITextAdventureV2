import express from "express";
import * as optionController from "../controllers/optionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { catchAsync } from "../middleware/errorMiddleware.js";
import { validateIdParam } from "../middleware/validateRequest.js";

const router = express.Router();

// All option routes require authentication
router.use(protect);

// Get options for a segment
router.get(
  "/segments/:segmentId/options",
  validateIdParam("segmentId"),
  catchAsync(optionController.getSegmentOptions)
);

// Choose an option
router.post(
  "/segments/:segmentId/options/:optionId/choose",
  validateIdParam("segmentId"),
  validateIdParam("optionId"),
  catchAsync(optionController.chooseOption)
);

// Create custom option without AI validation - simplified version
router.post(
  "/segments/:segmentId/options",
  validateIdParam("segmentId"),
  catchAsync(optionController.createSimpleCustomOption)
);

export default router;
