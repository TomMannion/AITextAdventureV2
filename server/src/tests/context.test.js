// src/tests/context.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import assembleContext from "../services/contextService.js";

describe("Context Management", () => {
  let testUser;
  let testCharacter;
  let testGame;
  let testConfig;

  beforeAll(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash("testpassword", 10);
    testUser = await prisma.user.create({
      data: {
        username: "contexttest",
        email: "contexttest@example.com",
        password: hashedPassword,
      },
    });

    // Create a test character
    testCharacter = await prisma.character.create({
      data: {
        name: "Context Test Hero",
        traits: ["brave", "intelligent"],
        bio: "A test character for context testing",
        gender: "female",
        userId: testUser.id,
        achievements: {},
        persistentMemories: {},
      },
    });

    // Create test config
    testConfig = await prisma.contextConfig.create({
      data: {
        userId: testUser.id,
        maxSegments: 3,
        includeItems: true,
        includeCharacters: true,
        maxItems: 5,
        maxCharacters: 3,
        useVectorSearch: false,
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.contextConfig.delete({
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

  beforeEach(async () => {
    // Clean up any existing test games
    await prisma.game.deleteMany({
      where: { userId: testUser.id },
    });

    // Create a test game for each test
    testGame = await prisma.game.create({
      data: {
        title: "Context Test Adventure",
        genre: "Mystery",
        userId: testUser.id,
        characterId: testCharacter.id,
        status: "ACTIVE",
        narrativeStage: "INTRODUCTION",
      },
    });

    // Create test story segments with varying importance
    await prisma.storySegment.create({
      data: {
        gameId: testGame.id,
        sequenceNumber: 1,
        content: "You begin your investigation in a foggy town.",
        importance: 10, // High importance
        locationContext: "Foggy Town",
        options: {
          create: [
            {
              text: "Visit the local inn",
              risk: "LOW",
              wasChosen: true,
            },
            {
              text: "Speak with the sheriff",
              risk: "MEDIUM",
              wasChosen: false,
            },
          ],
        },
      },
    });

    await prisma.storySegment.create({
      data: {
        gameId: testGame.id,
        sequenceNumber: 2,
        content: "At the inn, you meet a mysterious stranger.",
        userChoice: "Visit the local inn",
        importance: 7, // Medium importance
        locationContext: "The Rusty Anchor Inn",
        options: {
          create: [
            {
              text: "Ask about recent strange events",
              risk: "MEDIUM",
              wasChosen: true,
            },
            {
              text: "Ignore the stranger",
              risk: "LOW",
              wasChosen: false,
            },
          ],
        },
      },
    });

    await prisma.storySegment.create({
      data: {
        gameId: testGame.id,
        sequenceNumber: 3,
        content: "The stranger tells you about a haunted mansion on the hill.",
        userChoice: "Ask about recent strange events",
        importance: 5, // Lower importance
        locationContext: "The Rusty Anchor Inn",
        options: {
          create: [
            {
              text: "Investigate the mansion",
              risk: "HIGH",
              wasChosen: false,
            },
            {
              text: "Ask for more details",
              risk: "LOW",
              wasChosen: false,
            },
          ],
        },
      },
    });

    // Create a few items
    await prisma.gameItem.create({
      data: {
        gameId: testGame.id,
        name: "Mysterious Key",
        description: "An ornate key with strange symbols",
        acquiredAt: 2,
        properties: { type: "key", value: "high" },
      },
    });

    await prisma.gameItem.create({
      data: {
        gameId: testGame.id,
        name: "Notebook",
        description: "A leather-bound notebook for recording clues",
        acquiredAt: 1,
        properties: { type: "tool", value: "medium" },
      },
    });

    // Create a game character
    await prisma.gameCharacter.create({
      data: {
        gameId: testGame.id,
        name: "Mysterious Stranger",
        description: "A cloaked figure with a gravelly voice",
        relationship: "neutral",
        firstAppearedAt: 2,
        importance: 8,
      },
    });
  });

  it("should assemble context with the correct structure", async () => {
    const context = await assembleContext(testGame.id, testUser.id);

    // Verify context structure
    expect(context).toBeDefined();
    expect(context.game).toBeDefined();
    expect(context.character).toBeDefined();
    expect(context.storySegments).toBeDefined();
    expect(context.items).toBeDefined();
    expect(context.characters).toBeDefined();

    // Verify game info
    expect(context.game.title).toBe("Context Test Adventure");
    expect(context.game.genre).toBe("Mystery");

    // Verify character info
    expect(context.character.name).toBe("Context Test Hero");

    // Verify story segments (should be ordered by importance and recency)
    expect(context.storySegments.length).toBeLessThanOrEqual(
      testConfig.maxSegments
    );

    // First segment should be the most important one
    expect(context.storySegments[0].content).toContain(
      "You begin your investigation"
    );

    // Verify items
    expect(context.items.length).toBeLessThanOrEqual(testConfig.maxItems);
    expect(context.items.some((item) => item.name === "Mysterious Key")).toBe(
      true
    );

    // Verify characters
    expect(context.characters.length).toBeLessThanOrEqual(
      testConfig.maxCharacters
    );
    expect(
      context.characters.some((char) => char.name === "Mysterious Stranger")
    ).toBe(true);
  });

  it("should respect context config settings", async () => {
    // Update config to exclude items and characters
    await prisma.contextConfig.update({
      where: { userId: testUser.id },
      data: {
        includeItems: false,
        includeCharacters: false,
        maxSegments: 2,
      },
    });

    const context = await assembleContext(testGame.id, testUser.id);

    // Should have no items or characters
    expect(context.items.length).toBe(0);
    expect(context.characters.length).toBe(0);

    // Should have max 2 segments
    expect(context.storySegments.length).toBeLessThanOrEqual(2);
  });
});
