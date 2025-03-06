// src/services/llm/prompt/genrePromptSystem.js

/**
 * Comprehensive genre prompt system that scales easily with new genres
 */
const NARRATIVE_PRINCIPLES = {
  FOUNDATIONS: `
## Core Storytelling Principles ##
1. Thematic Resonance: Every scene must:
   - Advance at least two plot threads
   - Reveal new character dimension
   - Deepen central thematic conflict

2. Dynamic Perspective:
   - Environmental details reflect viewpoint character's emotional state
   - Sensory information prioritized by current urgency level
   - Memory fragments emerge organically from context triggers

3. Revelatory Design:
   - Early Setup (Turns 1-8): Plant 3 competing theories
   - Middle Development (Turns 9-16): Confirm and contradict equally
   - Endgame (Turns 17-25): Resolve through unexpected synthesis

4. Language Craft:
   - Vary sentence structures using the 1-3-1 rhythm:
     * 1 complex atmospheric sentence
     * 3 varied-pace action/dialogue sentences
     * 1 concise impactful statement
   - Rotate descriptive focal points: 
     Tactile -> Auditory -> Olfactory -> Spatial
`,

  PACING_MATRIX: (currentTurn, maxTurns) => {
    const turnPercentage = (currentTurn / maxTurns) * 100;
    return `
## Turn ${currentTurn} Pacing Guide (${maxTurns} Total) ##
${
  turnPercentage < 33
    ? `Early Game (World-Building Focus):
- Introduce 2 environmental mysteries
- Establish 1 false character assumption
- Bury 1 subtle foreshadowing element`
    : turnPercentage < 66
    ? `Mid Game (Consequence Focus):
- Force reconciliation of conflicting goals
- Reveal hidden cost of earlier choices
- Complicate 1 key relationship`
    : `End Game (Synthesis Focus):
- Resolve minor plot thread unexpectedly early
- Make victory require personal sacrifice
- Leave 1 mystery deliberately ambiguous`
}`;
  },
};

// Base components for all story types
const BASE_COMPONENTS = {
  NARRATIVE_VOICE: {
    FIRST_PERSON:
      "Write from a first-person perspective, using 'I' and 'my' to immerse the player.",
    SECOND_PERSON:
      "Write from a second-person perspective, using 'you' and 'your' to directly address the player.",
    THIRD_PERSON:
      "Write from a third-person perspective, describing the player character's actions and experiences.",
  },

  TONE_MODIFIERS: {
    HUMOROUS: "Include elements of humor and wit in your narrative.",
    DARK: "Maintain a dark, foreboding tone throughout the story.",
    WHIMSICAL: "Infuse the narrative with whimsy and charm.",
    SERIOUS: "Keep the tone serious and contemplative.",
    SUSPENSEFUL: "Build and maintain suspense throughout each segment.",
  },

  PACING_GUIDES: {
    FAST: "Maintain fast-paced, action-oriented storytelling.",
    DELIBERATE:
      "Take a measured approach to storytelling, with careful attention to detail.",
    VARYING: "Vary the pacing to match the story's emotional beats.",
  },
};

// Base stage descriptions that apply across all genres
const BASE_STAGE_PROMPTS = {
  INTRODUCTION: `
You are crafting the INTRODUCTION of a story.
Focus on:
- Establishing the main character and setting
- Creating intrigue and a hook
- Introducing a potential problem or goal
- Setting the tone for the adventure
- Providing meaningful initial choices that establish the character's approach
  `,

  RISING_ACTION: `
You are continuing the RISING_ACTION of a story.
Focus on:
- Building complications and obstacles
- Deepening character relationships
- Introducing important items or tools
- Creating escalating tension
- Offering choices that test the character's abilities and determination
  `,

  CLIMAX: `
You are writing the CLIMAX of a story.
Focus on:
- Creating a decisive moment or confrontation
- Bringing conflicts to a head
- Testing the character with their greatest challenge
- High-stakes decisions with significant consequences
- Emotional intensity and dramatic moments
  `,

  FALLING_ACTION: `
You are writing the FALLING_ACTION of a story.
Focus on:
- Showing the immediate aftermath of the climax
- Resolving secondary conflicts
- Character reflecting on their journey
- Beginning to tie up loose ends
- Choices about how to handle the new status quo
  `,

  RESOLUTION: `
You are writing the RESOLUTION of a story.
Focus on:
- Providing closure to the main storyline
- Showing character growth and changes
- Revealing the final state of the world and relationships
- Potentially hinting at future adventures
- A satisfying ending that fits the story's themes
  `,
};

// Genre-specific configuration
const GENRE_CONFIGS = {
  // Fantasy genre configuration
  fantasy: {
    description:
      "A fantasy adventure with elements of magic, mythical creatures, and epic quests.",
    defaultNarrativeVoice: "SECOND_PERSON",
    defaultTone: "VARYING",
    defaultPacing: "VARYING",
    elements: {
      settings: [
        "ancient forests",
        "magical kingdoms",
        "enchanted ruins",
        "mystical mountains",
        "wizard towers",
      ],
      characters: [
        "wizards",
        "knights",
        "elves",
        "dwarves",
        "mystical creatures",
        "royalty",
        "common folk with destiny",
      ],
      items: [
        "magical artifacts",
        "enchanted weapons",
        "ancient scrolls",
        "mystical gems",
        "potions",
      ],
      themes: [
        "good vs. evil",
        "coming of age",
        "the hero's journey",
        "power and responsibility",
        "ancient prophecies",
      ],
    },
    stageSpecifics: {
      INTRODUCTION:
        "Create a sense of wonder and establish the magical elements of the world.",
      RISING_ACTION:
        "Introduce magical challenges and mysterious forces working against the character.",
      CLIMAX:
        "Create a magical confrontation that tests both the character's physical and moral strength.",
      FALLING_ACTION:
        "Show how the magical world has been changed by the character's actions.",
      RESOLUTION:
        "Reflect on how the character has grown in their understanding of magic and their place in this world.",
    },
  },

  // Mystery genre configuration
  mystery: {
    description:
      "A detective story focused on solving a crime or uncovering a secret.",
    defaultNarrativeVoice: "FIRST_PERSON",
    defaultTone: "SUSPENSEFUL",
    defaultPacing: "DELIBERATE",
    elements: {
      settings: [
        "crime scenes",
        "detective offices",
        "interrogation rooms",
        "suspects' homes",
        "shadowy locations",
      ],
      characters: [
        "detectives",
        "suspects",
        "witnesses",
        "victims",
        "law enforcement",
        "criminals",
      ],
      items: [
        "evidence",
        "clues",
        "murder weapons",
        "personal effects",
        "incriminating documents",
      ],
      themes: [
        "justice",
        "deception",
        "obsession",
        "truth and lies",
        "moral ambiguity",
      ],
    },
    stageSpecifics: {
      INTRODUCTION:
        "Establish the mystery or crime that needs solving and introduce initial suspicions.",
      RISING_ACTION:
        "Complicate the investigation with conflicting evidence, red herrings, and mounting stakes.",
      CLIMAX:
        "Build to a crucial revelation or confrontation that changes the understanding of the case.",
      FALLING_ACTION:
        "Show the aftermath of the revelation and how it affects all involved parties.",
      RESOLUTION:
        "Provide a satisfying solution to the mystery that ties together the various clues.",
    },
  },

  // Horror genre configuration
  horror: {
    description: "A terrifying story designed to instill fear and dread.",
    defaultNarrativeVoice: "SECOND_PERSON",
    defaultTone: "DARK",
    defaultPacing: "VARYING",
    elements: {
      settings: [
        "abandoned buildings",
        "dark forests",
        "cursed locations",
        "isolated places",
        "nighttime scenes",
      ],
      characters: [
        "survivors",
        "monsters",
        "cultists",
        "paranormal entities",
        "troubled individuals",
      ],
      items: [
        "cursed objects",
        "improvised weapons",
        "ancient artifacts",
        "mysterious relics",
        "personal tokens",
      ],
      themes: [
        "survival",
        "sanity vs. madness",
        "the unknown",
        "corruption",
        "isolation",
      ],
    },
    stageSpecifics: {
      INTRODUCTION:
        "Establish an atmosphere of unease and introduce subtle hints that something is wrong.",
      RISING_ACTION:
        "Escalate the tension with increasingly disturbing incidents and diminishing safety.",
      CLIMAX:
        "Create a moment of peak terror where the character faces the full horror of their situation.",
      FALLING_ACTION:
        "Show the aftermath of the horrific events and the struggle to return to normalcy.",
      RESOLUTION: "Leave lingering unease—true horror never fully resolves.",
    },
  },

  // Science fiction genre configuration
  scifi: {
    description:
      "An adventure set in a speculative future or alternate reality with advanced technology.",
    defaultNarrativeVoice: "THIRD_PERSON",
    defaultTone: "SERIOUS",
    defaultPacing: "VARYING",
    elements: {
      settings: [
        "spaceships",
        "alien worlds",
        "futuristic cities",
        "research facilities",
        "dystopian societies",
      ],
      characters: [
        "scientists",
        "explorers",
        "artificial intelligence",
        "aliens",
        "enhanced humans",
        "rebels",
      ],
      items: [
        "advanced technology",
        "futuristic weapons",
        "AI interfaces",
        "spaceships",
        "experimental devices",
      ],
      themes: [
        "humanity's future",
        "technological ethics",
        "exploration",
        "evolution",
        "societal structures",
      ],
    },
    stageSpecifics: {
      INTRODUCTION:
        "Establish the technological or scientific premise that drives the story.",
      RISING_ACTION:
        "Explore the implications and complications of the core sci-fi elements.",
      CLIMAX:
        "Create a moment where technology and humanity intersect in a critical way.",
      FALLING_ACTION:
        "Examine the consequences of the climactic events on both individuals and society.",
      RESOLUTION:
        "Reflect on the relationship between humanity and technology/science.",
    },
  },

  // Adventure genre configuration
  adventure: {
    description:
      "An exciting journey or quest filled with challenges and discoveries.",
    defaultNarrativeVoice: "SECOND_PERSON",
    defaultTone: "VARYING",
    defaultPacing: "FAST",
    elements: {
      settings: [
        "unexplored territories",
        "ancient ruins",
        "treacherous landscapes",
        "exotic locations",
        "hidden treasure sites",
      ],
      characters: [
        "explorers",
        "guides",
        "rivals",
        "natives",
        "wealthy sponsors",
        "team members",
      ],
      items: [
        "maps",
        "survival gear",
        "historical artifacts",
        "treasures",
        "transportation methods",
      ],
      themes: [
        "discovery",
        "overcoming obstacles",
        "rivalries",
        "personal growth",
        "the unknown",
      ],
    },
    stageSpecifics: {
      INTRODUCTION:
        "Establish the quest or journey and the character's motivation for embarking on it.",
      RISING_ACTION:
        "Present increasingly difficult challenges that test different skills and attributes.",
      CLIMAX:
        "Create a moment where all seems lost before a daring action or discovery changes everything.",
      FALLING_ACTION:
        "Show the character processing their discoveries and accomplishments.",
      RESOLUTION:
        "Reflect on how the journey has changed the character and what awaits them next.",
    },
  },
};

/**
 * Creates a complete prompt for a specific genre and narrative stage
 * @param {string} genre - Genre key (e.g., 'fantasy', 'mystery')
 * @param {string} stage - Narrative stage (e.g., 'INTRODUCTION', 'CLIMAX')
 * @param {Object} options - Additional options (tone overrides, etc.)
 * @returns {string} - Complete genre and stage specific prompt
 */
function createGenreStagePrompt(game, genre, stage, options = {}) {
  // Normalize genre input
  const normalizedGenre = genre.toLowerCase().trim();

  // Get genre config or use a generic default
  const genreConfig = GENRE_CONFIGS[normalizedGenre] || {
    description: "A text-based adventure story.",
    defaultNarrativeVoice: "SECOND_PERSON",
    defaultTone: "VARYING",
    defaultPacing: "VARYING",
    elements: {
      settings: [],
      characters: [],
      items: [],
      themes: [],
    },
    stageSpecifics: {},
  };

  // Determine narrative voice, tone, and pacing
  const narrativeVoice =
    options.narrativeVoice || genreConfig.defaultNarrativeVoice;
  const tone = options.tone || genreConfig.defaultTone;
  const pacing = options.pacing || genreConfig.defaultPacing;

  // Build the prompt
  let prompt = `You are writing a ${genreConfig.description}\n\n`;

  // Add narrative voice, tone, and pacing
  if (BASE_COMPONENTS.NARRATIVE_VOICE[narrativeVoice]) {
    prompt += BASE_COMPONENTS.NARRATIVE_VOICE[narrativeVoice] + "\n";
  }

  if (BASE_COMPONENTS.TONE_MODIFIERS[tone]) {
    prompt += BASE_COMPONENTS.TONE_MODIFIERS[tone] + "\n";
  }

  if (BASE_COMPONENTS.PACING_GUIDES[pacing]) {
    prompt += BASE_COMPONENTS.PACING_GUIDES[pacing] + "\n\n";
  }

  // Add base stage prompt
  if (BASE_STAGE_PROMPTS[stage]) {
    prompt += BASE_STAGE_PROMPTS[stage] + "\n";
  }

  // Add genre-specific stage guidance
  if (genreConfig.stageSpecifics[stage]) {
    prompt += genreConfig.stageSpecifics[stage] + "\n\n";
  }

  // Add genre elements guidance
  if (Object.keys(genreConfig.elements).length > 0) {
    prompt += "Include appropriate elements for this genre such as:\n";

    for (const [category, elements] of Object.entries(genreConfig.elements)) {
      if (elements.length > 0) {
        prompt += `- ${
          category.charAt(0).toUpperCase() + category.slice(1)
        }: Consider ${elements.join(", ")}\n`;
      }
    }

    prompt += "\n";
  }

  // Add genre themes
  if (genreConfig.elements.themes && genreConfig.elements.themes.length > 0) {
    prompt += `Emphasize themes common to this genre such as: ${genreConfig.elements.themes.join(
      ", "
    )}.\n\n`;
  }

  // Add core principles
  prompt += NARRATIVE_PRINCIPLES.FOUNDATIONS;

  // Add dynamic pacing
  prompt += NARRATIVE_PRINCIPLES.PACING_MATRIX(game.turnCount, 25);

  // Modified tone guidance
  prompt += `
  Tone Construction:
  - Emotional palette: Blend 2 contrasting moods
  - Dialogue subtext: 40% of meaning unspoken
  - Environmental personality: Make setting react to events`;

  // Updated element guidance
  prompt += `
  Element Implementation:
  1. For ${genreConfig.elements.settings[0]}:
     - Show 1 normal function
     - Hint at 1 hidden purpose
     - Leave 1 mystery unresolved
  
  2. For ${genreConfig.elements.items[0]}:
     - Reveal unexpected limitation
     - Suggest alternative uses
     - Bury origin story fragment`;

  return prompt;
}

/**
 * Gets a list of all supported genres
 * @returns {Array<string>} Array of supported genre keys
 */
function getSupportedGenres() {
  return Object.keys(GENRE_CONFIGS);
}

/**
 * Gets detailed information about a specific genre
 * @param {string} genre - The genre key
 * @returns {Object|null} Genre configuration or null if not found
 */
function getGenreInfo(genre) {
  const normalizedGenre = genre.toLowerCase().trim();
  return GENRE_CONFIGS[normalizedGenre] || null;
}

/**
 * Adds a new genre to the system
 * @param {string} genreKey - Unique genre key (e.g., 'western')
 * @param {Object} genreConfig - Complete genre configuration
 * @returns {boolean} Success status
 */
function addGenre(genreKey, genreConfig) {
  if (!genreKey || typeof genreKey !== "string") {
    return false;
  }

  const normalizedGenre = genreKey.toLowerCase().trim();

  // Validate required fields
  const requiredFields = [
    "description",
    "defaultNarrativeVoice",
    "defaultTone",
    "defaultPacing",
    "elements",
    "stageSpecifics",
  ];

  for (const field of requiredFields) {
    if (!genreConfig[field]) {
      console.error(`Invalid genre config: missing '${field}'`);
      return false;
    }
  }

  // Add to genre configs
  GENRE_CONFIGS[normalizedGenre] = genreConfig;
  return true;
}

// Export the module
export default {
  createGenreStagePrompt,
  getSupportedGenres,
  getGenreInfo,
  addGenre,
  BASE_COMPONENTS,
  BASE_STAGE_PROMPTS,
};
