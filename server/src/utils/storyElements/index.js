/**
 * Central export for all genre story elements
 */
import horror from "./horror.js";
import fantasy from "./fantasy.js";
// Import other genres as they are created
// import scifi from './scifi.js';
// import mystery from './mystery.js';

// Export all genres in an object for easy access
export default {
  horror,
  fantasy,
  // Add other genres as they are implemented
  // scifi,
  // mystery,
};

// Export individual genres for direct imports
export {
  horror,
  fantasy,
  // scifi,
  // mystery,
};
