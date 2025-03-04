// src/tests/auth.test.js
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";

describe("Authentication", () => {
  let testUser;

  beforeAll(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash("testpassword", 10);
    testUser = await prisma.user.create({
      data: {
        username: "testuser",
        email: "test@example.com",
        password: hashedPassword,
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    await prisma.$disconnect();
  });

  it("generates a valid JWT token", () => {
    const token = generateToken(testUser.id);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
  });

  it("should hash passwords correctly", async () => {
    const password = "testpassword";
    const hashedPassword = await bcrypt.hash(password, 10);

    const isMatch = await bcrypt.compare(password, hashedPassword);
    expect(isMatch).toBe(true);

    const isNotMatch = await bcrypt.compare("wrongpassword", hashedPassword);
    expect(isNotMatch).toBe(false);
  });
});
