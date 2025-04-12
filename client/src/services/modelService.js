// src/services/modelService.js
import { apiClient } from './api.service';

const modelService = {
  /**
   * Get available models from a specific provider
   * @param {string} provider - Provider name (openai, anthropic, groq, gemini)
   * @param {string} apiKey - API key for the provider
   * @returns {Promise<Array>} List of models
   */
  getProviderModels: async (provider, apiKey) => {
    if (!apiKey) {
      return Promise.reject({
        status: 'fail',
        message: 'API key is required to fetch models'
      });
    }

    try {
      console.log(`Fetching models for ${provider}`);
      
      const response = await apiClient.get(`/models/${provider}`, {
        headers: {
          'x-llm-api-key': apiKey
        }
      });

      // Handle different API response structures
      let models = [];
      
      if (response.data?.models && Array.isArray(response.data.models)) {
        models = response.data.models;
      } else if (response.models && Array.isArray(response.models)) {
        models = response.models;
      } else if (Array.isArray(response.data)) {
        models = response.data;
      } else if (Array.isArray(response)) {
        models = response;
      }
      
      console.log(`Retrieved ${models.length} models for ${provider}`);
      return models;
    } catch (error) {
      console.error(`Error fetching models for ${provider}:`, error);
      
      // Format error message for UI display
      let errorMessage = 'Failed to fetch models';
      
      if (error.status === 401) {
        errorMessage = 'Invalid API key or unauthorized access';
      } else if (error.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw { 
        message: errorMessage,
        status: error.status || 500,
        details: error.details || {}
      };
    }
  }
};

export default modelService;