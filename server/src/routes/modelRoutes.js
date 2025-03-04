// src/routes/modelRoutes.js
import express from "express";
import { getProviderModels } from "../controllers/modelController.js";

const router = express.Router();

// Get models for a specific provider
router.get("/:provider", getProviderModels);

export default router;
