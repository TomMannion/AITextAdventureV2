// src/routes/characterGenerationRoutes.js
import express from "express";
import {
  generateNames,
  generateTraits,
  generateBios,
  generateRandomCharacter,
} from "../controllers/characterGenerationController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// All character generation routes require authentication
router.use(authenticate);

// Character generation routes
router.post("/names", generateNames);
router.post("/traits", generateTraits);
router.post("/bios", generateBios);
router.post("/random", generateRandomCharacter);

export default router;
