// src/controllers/contextConfigController.js
import prisma from "../config/db.js";

// Get context config for the current user
export async function getContextConfig(req, res) {
  try {
    const userId = req.user.id;

    // Find existing config or create default
    let config = await prisma.contextConfig.findUnique({
      where: { userId },
    });

    // If no config exists, create default
    if (!config) {
      config = await prisma.contextConfig.create({
        data: {
          userId,
          maxSegments: 5,
          includeItems: true,
          includeCharacters: true,
          maxItems: 10,
          maxCharacters: 5,
          useVectorSearch: false,
        },
      });
    }

    res.json(config);
  } catch (error) {
    console.error("Get context config error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Update context config
export async function updateContextConfig(req, res) {
  try {
    const userId = req.user.id;
    const {
      maxSegments,
      includeItems,
      includeCharacters,
      maxItems,
      maxCharacters,
      useVectorSearch,
    } = req.body;

    // Find existing config or create new one with updates
    const config = await prisma.contextConfig.upsert({
      where: { userId },
      update: {
        maxSegments: maxSegments !== undefined ? maxSegments : undefined,
        includeItems: includeItems !== undefined ? includeItems : undefined,
        includeCharacters:
          includeCharacters !== undefined ? includeCharacters : undefined,
        maxItems: maxItems !== undefined ? maxItems : undefined,
        maxCharacters: maxCharacters !== undefined ? maxCharacters : undefined,
        useVectorSearch:
          useVectorSearch !== undefined ? useVectorSearch : undefined,
      },
      create: {
        userId,
        maxSegments: maxSegments ?? 5,
        includeItems: includeItems ?? true,
        includeCharacters: includeCharacters ?? true,
        maxItems: maxItems ?? 10,
        maxCharacters: maxCharacters ?? 5,
        useVectorSearch: useVectorSearch ?? false,
      },
    });

    res.json(config);
  } catch (error) {
    console.error("Update context config error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
