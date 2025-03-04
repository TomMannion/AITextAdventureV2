// src/routes/characterRoutes.js
import express from "express";
import {
  getCharacters,
  getCharacter,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from "../controllers/characterController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// All character routes require authentication
router.use(authenticate);

router.get("/", getCharacters);
router.get("/:id", getCharacter);
router.post("/", createCharacter);
router.put("/:id", updateCharacter);
router.delete("/:id", deleteCharacter);

export default router;
