// src/tests/api.test.js
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import express from "express";
import request from "supertest";
import authRoutes from "../routes/authRoutes.js";
import characterRoutes from "../routes/characterRoutes.js";
import gameRoutes from "../routes/gameRoutes.js";
import contextConfigRoutes from "../routes/contextConfigRoutes.js";

// Mock the entire services module with the new structure
vi.mock("../services/index.js", () => ({
  llmService: {
    generateInitialSegment: vi.fn(() => ({
      content: "Test story content",
      options: [
        {
          text: "Option 1",
          risk: "LOW",
        },
      ],
      locationContext: "test-location",
      newItems: [],
      newCharacters: [],
    })),
    generateContinuation: vi.fn(() => ({
      content: "Continued story content",
      options: [
        {
          text: "Next Option",
          risk: "MEDIUM",
        },
      ],
      locationContext: "new-location",
      newItems: [],
      newCharacters: [],
    })),
    generateTitles: vi.fn(() => [
      "Test Title 1",
      "Test Title 2",
      "Test Title 3",
    ]),
    generateCharacterNames: vi.fn(() => [
      "Character Name 1",
      "Character Name 2",
    ]),
    generateCharacterTraits: vi.fn(() => [
      { traits: ["brave", "smart", "quick"], description: "A clever hero" },
    ]),
    generateCharacterBios: vi.fn(() => [
      { bio: "Test character bio", summary: "Test summary" },
    ]),
  },
}));

// Also mock axios to prevent any actual API calls
vi.mock("axios", () => ({
  default: {
    post: vi.fn(() =>
      Promise.resolve({
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  content: "Test content",
                  options: [{ text: "Test option", risk: "MEDIUM" }],
                  locationContext: "Test location",
                  newItems: [],
                  newCharacters: [],
                }),
              },
            },
          ],
        },
      })
    ),
    get: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

// Setup test app
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/context-config", contextConfigRoutes);

describe("API Endpoints", () => {
  let testUser;
  let authToken;
  let testCharacterId;
  let testGameId;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("testpassword", 10);
    testUser = await prisma.user.create({
      data: {
        id: 1,
        username: "apitest",
        email: "apitest@example.com",
        password: hashedPassword,
        preferredProvider: "openai",
        preferredModel: "gpt-3.5-turbo",
      },
    });

    // Generate token for auth
    authToken = generateToken(testUser.id);
  });

  afterAll(async () => {
    // Clean up
    await prisma.contextConfig.deleteMany({
      where: { userId: testUser.id },
    });

    await prisma.game.deleteMany({
      where: { userId: testUser.id },
    });

    await prisma.character.deleteMany({
      where: { userId: testUser.id },
    });

    await prisma.user.delete({
      where: { id: testUser.id },
    });

    await prisma.$disconnect();
  });

  describe("Authentication", () => {
    it("should login successfully with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "apitest@example.com",
        password: "testpassword",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should get current user profile", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.username).toBe("apitest");
    });
  });

  describe("Character Management", () => {
    it("should create a character", async () => {
      const res = await request(app)
        .post("/api/characters")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "API Test Character",
          traits: ["brave", "smart"],
          bio: "A character for API testing",
          gender: "non-binary",
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("API Test Character");

      // Save ID for future tests
      testCharacterId = res.body.id;
    });

    it("should get all characters", async () => {
      const res = await request(app)
        .get("/api/characters")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("Game Management", () => {
    it("should create a game", async () => {
      const res = await request(app)
        .post("/api/games")
        .set("Authorization", `Bearer ${authToken}`)
        .set("x-llm-api-key", "TEST_API_KEY")
        .send({
          title: "API Test Game",
          genre: "Science Fiction",
          characterId: testCharacterId,
        });

      expect(res.status).toBe(201);
      expect(res.body.game.title).toBe("API Test Game");

      // Save ID for future tests
      testGameId = res.body.game.id;
    });

    it("should get all games", async () => {
      const res = await request(app)
        .get("/api/games")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("Context Config", () => {
    it("should get default context config", async () => {
      const res = await request(app)
        .get("/api/context-config")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("maxSegments");
      expect(res.body).toHaveProperty("includeItems");
      expect(res.body).toHaveProperty("includeCharacters");
    });

    it("should update context config", async () => {
      const res = await request(app)
        .put("/api/context-config")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          maxSegments: 4,
          includeItems: false,
          maxItems: 7,
        });

      expect(res.status).toBe(200);
      expect(res.body.maxSegments).toBe(4);
      expect(res.body.includeItems).toBe(false);
      expect(res.body.maxItems).toBe(7);
    });
  });

  describe("Story Progression", () => {
    // Add a valid test API key or mock implementation
    const TEST_API_KEY = "sk-test-key-mock";

    it("should start a story", async () => {
      const res = await request(app)
        .post(`/api/games/${testGameId}/story/start`)
        .set("Authorization", `Bearer ${authToken}`)
        .set("x-openai-key", TEST_API_KEY);

      // Debugging log
      if (res.status !== 200) {
        console.log("Start story error response:", res.body);
      }

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("content");
      expect(res.body).toHaveProperty("options");
      expect(Array.isArray(res.body.options)).toBe(true);
    });

    it("should get story state", async () => {
      const res = await request(app)
        .get(`/api/games/${testGameId}/story`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("game");
      expect(res.body.currentSegment).toBeTruthy();
      expect(res.body.currentSegment.options).toBeInstanceOf(Array);
    });

    it("should make a choice to progress the story", async () => {
      // First get current story state
      const stateRes = await request(app)
        .get(`/api/games/${testGameId}/story`)
        .set("Authorization", `Bearer ${authToken}`);

      // Verify story state is valid
      expect(stateRes.body.currentSegment).toBeTruthy();
      expect(stateRes.body.currentSegment.options.length).toBeGreaterThan(0);

      const optionId = stateRes.body.currentSegment.options[0].id;

      // Make a choice
      const res = await request(app)
        .post(`/api/games/${testGameId}/story/choice`)
        .set("Authorization", `Bearer ${authToken}`)
        .set("x-openai-key", TEST_API_KEY)
        .send({ optionId });

      // Debugging log
      if (res.status !== 200) {
        console.log("Make choice error response:", res.body);
      }

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("content");
    });
  });
});
