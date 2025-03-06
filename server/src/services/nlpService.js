// src/services/nlpService.js
import spacy from "spacy";
import stringSimilarity from "string-similarity";
import { normalizeEntityName } from "../utils/entityUtils.js";

let nlp;

// Initialize spaCy with English model
async function initializeNLP() {
  if (!nlp) {
    try {
      // Load English model - you'll need to install this
      // npm install spacy
      // python -m spacy download en_core_web_sm
      nlp = await spacy.load("en_core_web_sm");
      console.log("NLP service initialized with spaCy");
    } catch (error) {
      console.error("Failed to initialize spaCy:", error);
      // Fallback to basic processing if spaCy fails
      nlp = null;
    }
  }
  return nlp;
}

/**
 * Extract entities from text using spaCy
 * @param {string} text - Text to analyze
 * @returns {Object} - Extracted entities by type
 */
async function extractEntities(text) {
  // Initialize if not already initialized
  const nlpProcessor = await initializeNLP();

  // Default response structure
  const result = {
    characters: [],
    items: [],
    locations: [],
    concepts: [],
    relationships: [],
  };

  // If NLP initialization failed, fall back to regex-based extraction
  if (!nlpProcessor) {
    return fallbackExtractEntities(text);
  }

  try {
    // Process text with spaCy
    const doc = await nlpProcessor(text);

    // Extract named entities
    for (const ent of doc.ents) {
      switch (ent.label_) {
        case "PERSON":
          result.characters.push(ent.text);
          break;
        case "LOC":
        case "GPE":
        case "FAC":
          result.locations.push(ent.text);
          break;
        case "PRODUCT":
        case "WORK_OF_ART":
          result.items.push(ent.text);
          break;
        default:
          // Consider other entity types for concepts
          if (
            ![
              "DATE",
              "TIME",
              "PERCENT",
              "MONEY",
              "QUANTITY",
              "ORDINAL",
              "CARDINAL",
            ].includes(ent.label_)
          ) {
            result.concepts.push(ent.text);
          }
      }
    }

    // Extract noun chunks as potential items
    for (const chunk of doc.noun_chunks) {
      const text = chunk.text.toLowerCase();
      // Exclude pronouns and basic determiners
      if (
        ![
          "i",
          "you",
          "he",
          "she",
          "it",
          "we",
          "they",
          "this",
          "that",
          "these",
          "those",
        ].includes(text)
      ) {
        if (chunk.root.pos_ === "NOUN") {
          result.items.push(chunk.text);
        }
      }
    }

    // Extract relationships between entities
    result.relationships = extractRelationships(doc);

    // Deduplicate and normalize
    return {
      characters: [
        ...new Set(result.characters.map(normalizeEntityName)),
      ].filter(Boolean),
      items: [...new Set(result.items.map(normalizeEntityName))].filter(
        Boolean
      ),
      locations: [...new Set(result.locations.map(normalizeEntityName))].filter(
        Boolean
      ),
      concepts: [...new Set(result.concepts.map(normalizeEntityName))].filter(
        Boolean
      ),
      relationships: result.relationships,
    };
  } catch (error) {
    console.error("Error in NLP entity extraction:", error);
    return fallbackExtractEntities(text);
  }
}

/**
 * Extract relationships between entities in text
 * @param {Object} doc - spaCy document
 * @returns {Array} - Extracted relationships
 */
function extractRelationships(doc) {
  const relationships = [];

  // Look for identity reveal patterns
  // Examples: "The ghost is actually John", "The shadowy figure revealed herself as the queen"
  const identityPatterns = [
    { pattern: [{ lower: "is" }, { lower: "actually" }], rel: "IDENTITY" },
    { pattern: [{ lower: "revealed" }, { lower: "as" }], rel: "IDENTITY" },
    {
      pattern: [
        { lower: "turns" },
        { lower: "out" },
        { lower: "to" },
        { lower: "be" },
      ],
      rel: "IDENTITY",
    },
    { pattern: [{ lower: "is" }, { lower: "really" }], rel: "IDENTITY" },
  ];

  // Look for state change patterns for items
  // Examples: "The sword broke", "The potion was consumed"
  const statePatterns = [
    { pattern: [{ lower: "broke" }], state: "BROKEN" },
    { pattern: [{ lower: "consumed" }], state: "CONSUMED" },
    { pattern: [{ lower: "used" }], state: "USED" },
    { pattern: [{ lower: "gave" }], state: "GIVEN_AWAY" },
    { pattern: [{ lower: "lost" }], state: "LOST" },
    { pattern: [{ lower: "found" }], state: "FOUND" },
  ];

  // Process sentences to find patterns
  for (const sentence of doc.sents) {
    // Check for identity reveals
    for (const pattern of identityPatterns) {
      const matches = findPatternInSpan(sentence, pattern.pattern);
      if (matches.length > 0) {
        for (const match of matches) {
          // Look for entities before and after the pattern
          const beforeEntities = findEntitiesBeforeMatch(sentence, match);
          const afterEntities = findEntitiesAfterMatch(sentence, match);

          if (beforeEntities.length > 0 && afterEntities.length > 0) {
            relationships.push({
              type: pattern.rel,
              source: beforeEntities[0],
              target: afterEntities[0],
              context: sentence.text,
            });
          }
        }
      }
    }

    // Check for state changes
    for (const pattern of statePatterns) {
      const matches = findPatternInSpan(sentence, pattern.pattern);
      if (matches.length > 0) {
        for (const match of matches) {
          // Look for entities before the pattern
          const entities = findEntitiesBeforeMatch(sentence, match);
          if (entities.length > 0) {
            relationships.push({
              type: "STATE_CHANGE",
              source: entities[0],
              newState: pattern.state,
              context: sentence.text,
            });
          }
        }
      }
    }
  }

  return relationships;
}

// Helper functions for pattern matching in spaCy docs
function findPatternInSpan(span, pattern) {
  const matches = [];
  for (let i = 0; i < span.length - pattern.length + 1; i++) {
    let match = true;
    for (let j = 0; j < pattern.length; j++) {
      const token = span[i + j];
      const patternItem = pattern[j];

      if (patternItem.lower && token.text.toLowerCase() !== patternItem.lower) {
        match = false;
        break;
      }
      // Add more pattern matching conditions as needed
    }
    if (match) {
      matches.push({ start: i, end: i + pattern.length });
    }
  }
  return matches;
}

function findEntitiesBeforeMatch(span, match) {
  const entities = [];
  for (let i = 0; i < match.start; i++) {
    if (span[i].ent_type_) {
      entities.push(span[i].text);
    }
  }
  return entities;
}

function findEntitiesAfterMatch(span, match) {
  const entities = [];
  for (let i = match.end; i < span.length; i++) {
    if (span[i].ent_type_) {
      entities.push(span[i].text);
    }
  }
  return entities;
}

/**
 * Fallback entity extraction using regex patterns
 * @param {string} text - Text to analyze
 * @returns {Object} - Extracted entities
 */
function fallbackExtractEntities(text) {
  if (!text) {
    return {
      characters: [],
      items: [],
      locations: [],
      concepts: [],
      relationships: [],
    };
  }

  // 1. Extract potential named entities (capitalized words/phrases)
  const namedEntityRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const namedEntities = text.match(namedEntityRegex) || [];

  // 2. Extract potential items (often preceded by specific words)
  const itemRegex =
    /\b(?:the|a|an|his|her|your|this|that|these|those)\s+([a-z]+(?:\s+[a-z]+){0,3})\b/gi;
  const itemMatches = [...text.matchAll(itemRegex)];
  const potentialItems = itemMatches.map((match) => match[1]);

  // 3. Extract potential locations (often preceded by prepositions)
  const locationRegex =
    /\b(?:in|at|on|near|inside|outside|to|from|through)\s+(?:the\s+)?([a-z]+(?:\s+[a-z]+){0,3})\b/gi;
  const locationMatches = [...text.matchAll(locationRegex)];
  const potentialLocations = locationMatches.map((match) => match[1]);

  // 4. Extract key concepts (nouns with adjectives)
  const conceptRegex = /\b(?:[a-z]+\s+)?([a-z]+(?:\s+[a-z]+){0,2})\b/gi;
  const allWords = [...text.matchAll(conceptRegex)].map((match) => match[1]);

  // 5. Basic classification
  const characters = namedEntities.filter(
    (entity) =>
      !potentialLocations.some((loc) => entity.includes(loc)) &&
      !potentialItems.some((item) => entity.includes(item))
  );

  const locations = [
    ...namedEntities.filter((entity) =>
      potentialLocations.some((loc) => entity.includes(loc))
    ),
    ...potentialLocations,
  ];

  const items = [
    ...namedEntities.filter((entity) =>
      potentialItems.some((item) => entity.includes(item))
    ),
    ...potentialItems,
  ];

  // Extract key concepts - words that appear multiple times
  const wordFrequency = {};
  allWords.forEach((word) => {
    const normalized = word.toLowerCase();
    wordFrequency[normalized] = (wordFrequency[normalized] || 0) + 1;
  });

  const concepts = Object.entries(wordFrequency)
    .filter(([word, count]) => count > 1 && word.length > 3)
    .map(([word]) => word);

  // Extract relationships using regex patterns
  const relationships = extractRelationshipsRegex(text);

  // Normalize and deduplicate
  const normalizeAndDeduplicate = (arr) => [
    ...new Set(arr.map(normalizeEntityName).filter(Boolean)),
  ];

  return {
    characters: normalizeAndDeduplicate(characters),
    items: normalizeAndDeduplicate(items),
    locations: normalizeAndDeduplicate(locations),
    concepts: normalizeAndDeduplicate(concepts),
    relationships,
  };
}

/**
 * Extract relationships using regex patterns (fallback method)
 * @param {string} text - Text to analyze
 * @returns {Array} - Extracted relationships
 */
function extractRelationshipsRegex(text) {
  const relationships = [];

  // Identity reveal patterns
  const identityPatterns = [
    /the (\w+(?:\s+\w+)*) (?:is|was) (?:actually|really) (?:the )?(\w+(?:\s+\w+)*)/gi,
    /(\w+(?:\s+\w+)*) (?:revealed|turns out to be|identifies) (?:themselves|himself|herself|itself) as (?:the )?(\w+(?:\s+\w+)*)/gi,
    /(\w+(?:\s+\w+)*) (?:is|was) revealed to be (?:the )?(\w+(?:\s+\w+)*)/gi,
  ];

  // State change patterns for items
  const statePatterns = [
    {
      regex: /the (\w+(?:\s+\w+)*) (?:broke|shattered|cracked)/gi,
      state: "BROKEN",
    },
    {
      regex: /(\w+(?:\s+\w+)*) (?:consumed|drank|ate|used up)/gi,
      state: "CONSUMED",
    },
    { regex: /(\w+(?:\s+\w+)*) (?:gave|handed|passed)/gi, state: "GIVEN_AWAY" },
    { regex: /(?:lost|misplaced) the (\w+(?:\s+\w+)*)/gi, state: "LOST" },
    {
      regex: /(?:found|discovered|obtained) the (\w+(?:\s+\w+)*)/gi,
      state: "FOUND",
    },
  ];

  // Extract identity relationships
  for (const pattern of identityPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      relationships.push({
        type: "IDENTITY",
        source: match[1].trim(),
        target: match[2].trim(),
        context: match[0],
      });
    }
  }

  // Extract state changes
  for (const { regex, state } of statePatterns) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      relationships.push({
        type: "STATE_CHANGE",
        source: match[1].trim(),
        newState: state,
        context: match[0],
      });
    }
  }

  return relationships;
}

/**
 * Match entity against known entities
 * @param {string} entityName - Entity name to match
 * @param {Array} knownEntities - Array of known entities
 * @param {number} threshold - Similarity threshold
 * @returns {Object|null} - Matched entity or null
 */
function matchEntity(entityName, knownEntities, threshold = 0.85) {
  if (!entityName || !knownEntities || knownEntities.length === 0) {
    return null;
  }

  const normalized = normalizeEntityName(entityName);

  // First try exact match
  const exactMatch = knownEntities.find(
    (entity) => normalizeEntityName(entity.name) === normalized
  );

  if (exactMatch) {
    return exactMatch;
  }

  // Check aliases for characters
  const aliasMatch = knownEntities.find(
    (entity) =>
      entity.aliases &&
      entity.aliases.some((alias) => normalizeEntityName(alias) === normalized)
  );

  if (aliasMatch) {
    return aliasMatch;
  }

  // Try fuzzy matching
  const matches = knownEntities.map((entity) => ({
    entity,
    similarity: stringSimilarity.compareTwoStrings(
      normalized,
      normalizeEntityName(entity.name)
    ),
  }));

  // Sort by similarity (descending)
  matches.sort((a, b) => b.similarity - a.similarity);

  // Return the best match if above threshold
  return matches.length > 0 && matches[0].similarity >= threshold
    ? matches[0].entity
    : null;
}

export default {
  extractEntities,
  matchEntity,
  initializeNLP,
};
