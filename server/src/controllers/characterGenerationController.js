// src/controllers/characterGenerationController.js
import prisma from "../config/db.js";
import { llmService } from "../services/index.js";

// Generate character name suggestions
export async function generateNames(req, res) {
  try {
    const { genre, gender } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!genre) {
      return res.status(400).json({
        message: "Genre is required",
      });
    }

    // Get user's preferred provider and model
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferredProvider: true,
        preferredModel: true,
      },
    });

    // Set up options for LLM service
    const options = {
      provider: req.body.preferredProvider || "groq",
      modelId: req.body.preferredModel || "llama-3.1-8b-instant",
      apiKey: req.headers["x-llm-api-key"],
    };

    console.log(options);
    // Generate names with options object
    const names = await llmService.generateCharacterNames(
      genre,
      gender || null,
      options
    );

    if (!names || names.length === 0) {
      return res.status(500).json({
        message: "Failed to generate character names",
      });
    }

    res.json({ names });
  } catch (error) {
    console.error("Generate character names error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Generate character trait suggestions
export async function generateTraits(req, res) {
  try {
    const { genre, name, gender } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!genre || !name) {
      return res.status(400).json({
        message: "Genre and name are required",
      });
    }

    // Get user's preferred provider and model
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferredProvider: true,
        preferredModel: true,
      },
    });

    // Set up options for LLM service
    // Set up options for LLM service
    const options = {
      provider: req.body.preferredProvider || "groq",
      modelId: req.body.preferredModel || "llama-3.1-8b-instant",
      apiKey: req.headers["x-llm-api-key"],
    };

    // Generate traits with options object
    const traitSuggestions = await llmService.generateCharacterTraits(
      genre,
      name,
      gender || null,
      options
    );

    if (!traitSuggestions || traitSuggestions.length === 0) {
      return res.status(500).json({
        message: "Failed to generate character traits",
      });
    }

    res.json({ traitSuggestions });
  } catch (error) {
    console.error("Generate character traits error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Generate character biography suggestions
export async function generateBios(req, res) {
  try {
    const { genre, name, traits, gender } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!genre || !name || !traits) {
      return res.status(400).json({
        message: "Genre, name, and traits are required",
      });
    }

    // Get user's preferred provider and model
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferredProvider: true,
        preferredModel: true,
      },
    });

    // Set up options for LLM service
    // Set up options for LLM service
    const options = {
      provider: req.body.preferredProvider || "groq",
      modelId: req.body.preferredModel || "llama-3.1-8b-instant",
      apiKey: req.headers["x-llm-api-key"],
    };

    // Generate bios with options object
    const bioSuggestions = await llmService.generateCharacterBios(
      genre,
      name,
      traits,
      gender || null,
      options
    );

    if (!bioSuggestions || bioSuggestions.length === 0) {
      return res.status(500).json({
        message: "Failed to generate character biographies",
      });
    }

    res.json({ bioSuggestions });
  } catch (error) {
    console.error("Generate character bios error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Generate a complete random character
export async function generateRandomCharacter(req, res) {
  try {
    const { genre, gender } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!genre) {
      return res.status(400).json({
        message: "Genre is required",
      });
    }

    // Get user's preferred provider and model
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferredProvider: true,
        preferredModel: true,
      },
    });

    // Set up options for LLM service
    // Set up options for LLM service
    const options = {
      provider: req.body.preferredProvider || "groq",
      modelId: req.body.preferredModel || "llama-3.1-8b-instant",
      apiKey: req.headers["x-llm-api-key"],
    };

    // Step 1: Generate a name
    const names = await llmService.generateCharacterNames(
      genre,
      gender || null,
      options
    );

    if (!names || names.length === 0) {
      return res.status(500).json({
        message: "Failed to generate character name",
      });
    }

    const name = names[0]; // Use the first name

    // Step 2: Generate traits
    const traitSuggestions = await llmService.generateCharacterTraits(
      genre,
      name,
      gender || null,
      options
    );

    if (!traitSuggestions || traitSuggestions.length === 0) {
      return res.status(500).json({
        message: "Failed to generate character traits",
      });
    }

    const traits = traitSuggestions[0].traits; // Use the first trait set

    // Step 3: Generate bio
    const bioSuggestions = await llmService.generateCharacterBios(
      genre,
      name,
      traits,
      gender || null,
      options
    );

    if (!bioSuggestions || bioSuggestions.length === 0) {
      return res.status(500).json({
        message: "Failed to generate character biography",
      });
    }

    const bio = bioSuggestions[0].bio; // Use the first bio

    // Return the complete character
    res.json({
      character: {
        name,
        traits,
        bio,
        gender: gender || null,
      },
    });
  } catch (error) {
    console.error("Generate random character error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export default {
  generateNames,
  generateTraits,
  generateBios,
  generateRandomCharacter,
};
