// src/utils/apiUtils.js

/**
 * Utility functions for working with API responses
 */

/**
 * Extract the actual data from various API response formats
 *
 * @param {Object|Array} response - The API response
 * @param {string} key - Optional key to extract from the response
 * @param {*} defaultValue - Default value to return if data not found
 * @returns {*} The extracted data
 */
export const extractApiData = (response, key = null, defaultValue = null) => {
  if (!response) {
    return defaultValue;
  }

  // If response is an array and we're not looking for a specific key, return it
  if (Array.isArray(response) && !key) {
    return response;
  }

  // Handle wrapped data formats common in REST APIs
  if (response.data) {
    // If we have data.data structure
    if (response.data.data && (key === "data" || !key)) {
      return response.data.data;
    }

    // If we have data structure and a specific key
    if (key && response.data[key] !== undefined) {
      return response.data[key];
    }

    // If we have data structure and no specific key
    if (!key) {
      return response.data;
    }
  }

  // Direct access for specific key
  if (key && response[key] !== undefined) {
    return response[key];
  }

  // If no key specified, return the whole response
  if (!key) {
    return response;
  }

  return defaultValue;
};

/**
 * Extract an array from an API response, handling different formats
 *
 * @param {Object|Array} response - The API response
 * @param {string} key - Optional key to extract the array from
 * @returns {Array} The extracted array or empty array if not found
 */
export const extractApiArray = (response, key = null) => {
  const data = extractApiData(response, key, []);
  return Array.isArray(data) ? data : [];
};

/**
 * Format API error messages for user-friendly display
 *
 * @param {Error|Object} error - The error object
 * @param {string} fallbackMessage - Default message if none can be extracted
 * @returns {string} User-friendly error message
 */
export const formatApiError = (
  error,
  fallbackMessage = "An unexpected error occurred"
) => {
  if (!error) {
    return fallbackMessage;
  }

  // Handle standard Error objects
  if (error.message) {
    return error.message;
  }

  // Handle API error responses
  if (error.response) {
    // Try to get structured error message
    if (error.response.data && error.response.data.message) {
      return error.response.data.message;
    }

    // Try to get error based on status code
    const status = error.response.status;
    if (status === 401) {
      return "Authentication required. Please log in again.";
    }
    if (status === 403) {
      return "You don't have permission to access this resource.";
    }
    if (status === 404) {
      return "The requested resource was not found.";
    }
    if (status === 429) {
      return "Too many requests. Please wait a moment and try again.";
    }
    if (status >= 500) {
      return "A server error occurred. Please try again later.";
    }
  }

  // Default error message
  return fallbackMessage;
};

/**
 * Parse API pagination data for consistent handling
 *
 * @param {Object} response - API response with pagination data
 * @returns {Object} Standardized pagination object
 */
export const parseApiPagination = (response) => {
  const defaultPagination = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  if (!response) {
    return defaultPagination;
  }

  // Extract pagination data from common formats
  const pagination = response.pagination || response.meta || {};

  return {
    currentPage: pagination.page || pagination.currentPage || 1,
    totalPages: pagination.totalPages || pagination.pageCount || 1,
    totalItems: pagination.totalItems || pagination.total || 0,
    hasNextPage:
      pagination.hasNextPage ||
      pagination.page < pagination.totalPages ||
      false,
    hasPrevPage: pagination.hasPrevPage || pagination.page > 1 || false,
  };
};

/**
 * Prepare API parameters for consistent backend communication
 *
 * @param {Object} params - Original parameters
 * @returns {Object} Processed parameters ready for API call
 */
export const prepareApiParams = (params = {}) => {
  const result = { ...params };

  // Convert pagination params to backend format if needed
  if (result.page !== undefined) {
    result.page = parseInt(result.page, 10) || 1;
  }

  if (result.limit !== undefined) {
    result.limit = parseInt(result.limit, 10) || 10;
  }

  // Convert sorting params to backend format if needed
  if (result.sortBy) {
    // If sortDirection is desc, prefix the field with minus
    if (result.sortDirection === "desc") {
      result.sort = `-${result.sortBy}`;
    } else {
      result.sort = result.sortBy;
    }

    // Remove the original sort properties
    delete result.sortBy;
    delete result.sortDirection;
  }

  // Convert filters from array format to API-specific format if needed
  if (result.filters && Array.isArray(result.filters)) {
    result.filters.forEach((filter) => {
      if (filter.field && filter.value !== undefined) {
        result[filter.field] = filter.value;
      }
    });

    // Remove the original filters array
    delete result.filters;
  }

  return result;
};
