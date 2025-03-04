// src/controllers/characterController.js
import prisma from "../config/db.js";

// Get all characters for the current user
export async function getCharacters(req, res) {
  try {
    const userId = req.user.id;

    const characters = await prisma.character.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(characters);
  } catch (error) {
    console.error("Get characters error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Get a specific character by ID
export async function getCharacter(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const character = await prisma.character.findUnique({
      where: {
        id: Number(id),
        userId,
      },
    });

    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    // Ensure the character belongs to the current user
    if (character.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(character);
  } catch (error) {
    console.error("Get character error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Create a new character
export async function createCharacter(req, res) {
  try {
    const { name, traits, bio, gender, image } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!name || !bio || !Array.isArray(traits)) {
      return res.status(400).json({
        message: "Name, bio, and traits array are required",
      });
    }

    // Create character
    const character = await prisma.character.create({
      data: {
        name,
        traits,
        bio,
        gender,
        image,
        userId,
        achievements: {}, // Initialize empty objects for JSON fields
        persistentMemories: {},
      },
    });

    res.status(201).json(character);
  } catch (error) {
    console.error("Create character error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Update a character
export async function updateCharacter(req, res) {
  try {
    const { id } = req.params;
    const { name, traits, bio, gender, image } = req.body;
    const userId = req.user.id;

    // Check if character exists and belongs to user
    const existingCharacter = await prisma.character.findUnique({
      where: { id: Number(id) },
    });

    if (!existingCharacter) {
      return res.status(404).json({ message: "Character not found" });
    }

    if (existingCharacter.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update character
    const updatedCharacter = await prisma.character.update({
      where: { id: Number(id) },
      data: {
        name: name || undefined,
        traits: traits || undefined,
        bio: bio || undefined,
        gender: gender || undefined,
        image: image || undefined,
      },
    });

    res.json(updatedCharacter);
  } catch (error) {
    console.error("Update character error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Delete a character
export async function deleteCharacter(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if character exists and belongs to user
    const character = await prisma.character.findUnique({
      where: { id: Number(id) },
    });

    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    if (character.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete character
    await prisma.character.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Character deleted" });
  } catch (error) {
    console.error("Delete character error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
