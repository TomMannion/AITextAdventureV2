// src/tests/character.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import prisma from "../config/db.js";
import bcrypt from "bcrypt";

describe("Character Model", () => {
  let testUser;
  let testCharacter;

  beforeAll(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash("testpassword", 10);
    testUser = await prisma.user.create({
      data: {
        username: "charactertest",
        email: "charactertest@example.com",
        password: hashedPassword,
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.character.deleteMany({
      where: { userId: testUser.id },
    });

    await prisma.user.delete({
      where: { id: testUser.id },
    });

    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up any existing test characters
    await prisma.character.deleteMany({
      where: { userId: testUser.id },
    });

    // Create a test character for each test
    testCharacter = await prisma.character.create({
      data: {
        name: "Test Hero",
        traits: ["brave", "clever"],
        bio: "A test character for our unit tests",
        gender: "non-binary",
        userId: testUser.id,
        achievements: {},
        persistentMemories: {},
      },
    });
  });

  it("should create a character with the correct fields", async () => {
    expect(testCharacter).toBeDefined();
    expect(testCharacter.name).toBe("Test Hero");
    expect(testCharacter.traits).toEqual(["brave", "clever"]);
    expect(testCharacter.bio).toBe("A test character for our unit tests");
    expect(testCharacter.gender).toBe("non-binary");
    expect(testCharacter.userId).toBe(testUser.id);
  });

  it("should retrieve a character by ID", async () => {
    const character = await prisma.character.findUnique({
      where: { id: testCharacter.id },
    });

    expect(character).toBeDefined();
    expect(character.name).toBe("Test Hero");
  });

  it("should update a character's traits", async () => {
    const updatedCharacter = await prisma.character.update({
      where: { id: testCharacter.id },
      data: {
        traits: ["brave", "clever", "resourceful"],
      },
    });

    expect(updatedCharacter.traits).toEqual(["brave", "clever", "resourceful"]);
  });

  it("should delete a character", async () => {
    await prisma.character.delete({
      where: { id: testCharacter.id },
    });

    const character = await prisma.character.findUnique({
      where: { id: testCharacter.id },
    });

    expect(character).toBeNull();
  });
});
