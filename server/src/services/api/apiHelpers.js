// src/services/api/apiHelpers.js
import dotenv from "dotenv";

dotenv.config();

// API configuration
export const API_KEYS = {
  openai: process.env.OPENAI_API_KEY,
  groq: process.env.GROQ_API_KEY,
};

// Default configuration values
export const DEFAULT_PROVIDER = process.env.DEFAULT_LLM_PROVIDER || "openai";
export const DEFAULT_MODELS = {
  openai: "gpt-3.5-turbo",
  groq: "llama3-8b-8192",
};

// Default request parameters
export const DEFAULT_REQUEST_PARAMS = {
  temperature: 0.7,
  max_tokens: 1000,
};

/**
 * Resolves which API key to use based on provider and user-provided key
 * @param {string} provider - The provider name ('openai' or 'groq')
 * @param {string|null} apiKey - Optional API key provided by the user
 * @returns {string|null} - The resolved API key
 */
export function resolveApiKey(provider, apiKey = null) {
  const normalizedProvider = provider.toLowerCase();
  return apiKey || API_KEYS[normalizedProvider] || null;
}

/**
 * Formats error messages consistently
 * @param {string} operation - The operation that failed
 * @param {Error} error - The error object
 * @returns {string} - Formatted error message
 */
export function formatErrorMessage(operation, error) {
  const responseData = error.response?.data || {};
  const message = error.message || "Unknown error";
  return `${operation} error: ${message} - ${JSON.stringify(responseData)}`;
}
