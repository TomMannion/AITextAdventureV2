import express from "express";
import userRoutes from "./userRoutes.js";
import gameRoutes from "./gameRoutes.js";
import storyRoutes from "./storyRoutes.js";
import optionRoutes from "./optionRoutes.js";
import modelRoutes from "./modelRoutes.js";
import { ApiError } from "../middleware/errorMiddleware.js";

const router = express.Router();

// API version check middleware - custom headers for API versioning
router.use((req, res, next) => {
  // You can implement API versioning here if needed
  // Example: Check for API version header and route accordingly
  next();
});

// API key validation middleware for endpoints requiring AI services
router.use("/games/:gameId/story", (req, res, next) => {
  const apiKey = req.headers["x-llm-api-key"];
  if (!apiKey) {
    return next(new ApiError(401, "API key is required for story generation"));
  }
  next();
});

// Mount route groups
router.use("/users", userRoutes);
router.use("/games", gameRoutes);
router.use("/story", storyRoutes);
router.use("/options", optionRoutes);
router.use("/models", modelRoutes);

// API documentation route (optional)
router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the AI Text Adventure API",
    version: "1.0.0",
    documentation: "/api/docs", // If you implement API docs
  });
});

export default router;