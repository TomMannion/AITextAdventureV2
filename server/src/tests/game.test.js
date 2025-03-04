// src/tests/game.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import prisma from "../config/db.js";
import bcrypt from "bcrypt";

describe("Game Model", () => {
  let testUser;
  let testCharacter;
  let testGame;

  beforeAll(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash("testpassword", 10);
    testUser = await prisma.user.create({
      data: {
        username: "gametest",
        email: "gametest@example.com",
        password: hashedPassword,
      },
    });

    // Create a test character
    testCharacter = await prisma.character.create({
      data: {
        name: "Game Test Hero",
        traits: ["brave", "clever"],
        bio: "A test character for our game unit tests",
        gender: "non-binary",
        userId: testUser.id,
        achievements: {},
        persistentMemories: {},
      },
    });
  });

  afterAll(async () => {
    // Clean up
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
        title: "Test Adventure",
        genre: "Fantasy",
        userId: testUser.id,
        characterId: testCharacter.id,
        status: "ACTIVE",
        narrativeStage: "INTRODUCTION",
      },
    });
  });

  it("should create a game with the correct fields", async () => {
    expect(testGame).toBeDefined();
    expect(testGame.title).toBe("Test Adventure");
    expect(testGame.genre).toBe("Fantasy");
    expect(testGame.status).toBe("ACTIVE");
    expect(testGame.userId).toBe(testUser.id);
    expect(testGame.characterId).toBe(testCharacter.id);
  });

  it("should create a story segment for the game", async () => {
    const storySegment = await prisma.storySegment.create({
      data: {
        gameId: testGame.id,
        sequenceNumber: 1,
        content: "The adventure begins in a dark forest.",
        importance: 10,
        options: {
          create: [
            {
              text: "Go deeper into the forest",
              risk: "MEDIUM",
            },
            {
              text: "Turn back",
              risk: "LOW",
            },
          ],
        },
      },
      include: {
        options: true,
      },
    });

    expect(storySegment).toBeDefined();
    expect(storySegment.content).toBe("The adventure begins in a dark forest.");
    expect(storySegment.options.length).toBe(2);
    expect(storySegment.options[0].text).toBe("Go deeper into the forest");
  });

  it("should update game turnCount when making a choice", async () => {
    // First create a story segment
    const segment = await prisma.storySegment.create({
      data: {
        gameId: testGame.id,
        sequenceNumber: 1,
        content: "The adventure begins.",
        importance: 10,
        options: {
          create: [
            {
              text: "Option 1",
              risk: "MEDIUM",
            },
            {
              text: "Option 2",
              risk: "LOW",
            },
          ],
        },
      },
      include: {
        options: true,
      },
    });

    // Update the game's turnCount
    const updatedGame = await prisma.game.update({
      where: { id: testGame.id },
      data: {
        turnCount: 1,
      },
    });

    expect(updatedGame.turnCount).toBe(1);

    // Mark an option as chosen
    await prisma.option.update({
      where: { id: segment.options[0].id },
      data: { wasChosen: true },
    });

    const chosenOption = await prisma.option.findUnique({
      where: { id: segment.options[0].id },
    });

    expect(chosenOption.wasChosen).toBe(true);
  });
});
