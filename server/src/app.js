import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { sanitizeInput } from "./middleware/validateRequest.js";
import config from "./config/index.js";

// Import routes
import routes from "./routes/index.js";
import simplifiedRoutes from "./routes/simplifiedRoutes.js";

// Initialize express app
const app = express();

// Security middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS

// Body parsers
app.use(express.json({ limit: "10kb" })); // Parse JSON bodies with size limit
app.use(express.urlencoded({ extended: true, limit: "10kb" })); // Parse URL-encoded bodies

// Logging middleware
app.use(morgan(config.server.env === "development" ? "dev" : "combined"));

// Input sanitization to prevent XSS
app.use(sanitizeInput);

// Global rate limiting
app.use("/api", apiLimiter);

// API Routes
app.use("/api", simplifiedRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    environment: config.server.env,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: "fail", message: "Route not found" });
});

// Error handler middleware (must be last)
app.use(errorHandler);

export default app;
