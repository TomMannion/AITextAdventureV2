// src/utils/entityUtils.js

/**
 * Normalizes an entity name for consistent comparison
 * Removes articles (the, a, an), trims whitespace, and converts to lowercase
 *
 * @param {string} name - The entity name to normalize
 * @returns {string} - Normalized entity name
 */
export function normalizeEntityName(name) {
  if (!name) return "";

  return name
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing whitespace
    .replace(/^(the|a|an) /i, "") // Remove leading articles
    .replace(/\s+/g, " "); // Normalize internal whitespace
}

/**
 * Calculates similarity between two strings using Levenshtein distance
 *
 * @param {string} str1 - First string to compare
 * @param {string} str2 - Second string to compare
 * @returns {number} - Similarity score between 0 and 1
 */
export function calculateStringSimilarity(str1, str2) {
  // Simple case - exact match
  if (str1 === str2) return 1.0;

  // Quick length check to avoid unnecessary computation
  const len1 = str1.length;
  const len2 = str2.length;
  const maxLen = Math.max(len1, len2);

  // If one string is empty, similarity is 0
  if (maxLen === 0) return 1.0;

  // If length difference is too significant, consider them different
  // (This helps with performance and avoids false positives)
  if (Math.abs(len1 - len2) > maxLen * 0.5) return 0.0;

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(str1, str2);

  // Convert to similarity score (0-1)
  return 1 - distance / maxLen;
}

/**
 * Calculates the Levenshtein distance between two strings
 *
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Levenshtein distance
 */
function levenshteinDistance(a, b) {
  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Deletion
        matrix[i][j - 1] + 1, // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Checks if there's a similar entity in the provided array
 *
 * @param {Array} entities - Array of entity objects with name property
 * @param {string} newName - Name to check for similarity
 * @param {number} threshold - Similarity threshold (0-1), default 0.85
 * @returns {Object|null} - Most similar entity or null if none exceeds threshold
 */
export function findSimilarEntity(entities, newName, threshold = 0.85) {
  if (!entities || !entities.length || !newName) return null;

  const normalizedNew = normalizeEntityName(newName);

  let mostSimilar = null;
  let highestSimilarity = 0;

  for (const entity of entities) {
    const normalizedExisting = normalizeEntityName(entity.name);
    const similarity = calculateStringSimilarity(
      normalizedNew,
      normalizedExisting
    );

    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      mostSimilar = entity;
    }
  }

  return highestSimilarity >= threshold ? mostSimilar : null;
}

/**
 * Checks if a new entity name is similar to any existing entities in the database
 *
 * @param {Object} prisma - Prisma client
 * @param {number} gameId - Game ID
 * @param {string} entityType - Type of entity to check ('character' or 'item')
 * @param {string} newName - New entity name to check
 * @param {number} threshold - Similarity threshold
 * @returns {Promise<Object|null>} - Similar entity or null if none found
 */
export async function findSimilarEntityInDb(
  prisma,
  gameId,
  entityType,
  newName,
  threshold = 0.85
) {
  // Determine the correct model to query
  const model = entityType === "character" ? "gameCharacter" : "gameItem";

  // Find all entities for this game
  const entities = await prisma[model].findMany({
    where: { gameId: Number(gameId) },
    select: { id: true, name: true },
  });

  // Check for similar entities
  return findSimilarEntity(entities, newName, threshold);
}
