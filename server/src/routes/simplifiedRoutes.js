import express from "express";
import userRoutes from "./userRoutes.js";
import simplifiedGameRoutes from "./simplifiedGameRoutes.js";
import simplifiedStoryRoutes from "./simplifiedStoryRoutes.js";
import simplifiedOptionRoutes from "./simplifiedOptionRoutes.js";
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

// Mount route groups - using the simplified versions
router.use("/users", userRoutes);
router.use("/games", simplifiedGameRoutes);
router.use("/story", simplifiedStoryRoutes);
router.use("/options", simplifiedOptionRoutes);

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
