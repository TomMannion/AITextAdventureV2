// src/services/index.js
import llmService from "./llm/index.js";
import apiService from "./api/index.js";
import config from "./config/index.js";

// Export all services
export { llmService, apiService, config };

export default {
  llm: llmService,
  api: apiService,
  config,
};
