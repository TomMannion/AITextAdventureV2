// src/controllers/modelController.js
import { llmService } from "../services/index.js";

export async function getProviderModels(req, res) {
  try {
    const { provider } = req.params;
    const apiKey = req.headers["x-llm-api-key"] || null;

    const models = await llmService.getModels({
      provider: provider,
      apiKey: apiKey,
      useCache: true,
    });

    res.json(models);
  } catch (error) {
    console.error(`Get ${provider} models error:`, error);
    res.status(500).json({
      message: `Failed to retrieve ${provider} models`,
      error: error.message,
    });
  }
}

export default {
  getProviderModels,
};
