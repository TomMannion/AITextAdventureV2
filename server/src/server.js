// src/server.js (updated with character generation routes)
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import characterRoutes from "./routes/characterRoutes.js";
import characterGenerationRoutes from "./routes/characterGenerationRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import contextConfigRoutes from "./routes/contextConfigRoutes.js";
import modelRoutes from "./routes/modelRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/character-generator", characterGenerationRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/context-config", contextConfigRoutes);
app.use("/api/models", modelRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "AI Text Adventure API is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
