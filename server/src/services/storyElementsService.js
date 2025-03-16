import horror from "../utils/storyElements/horror.js";
import fantasy from "../utils/storyElements/fantasy.js";
import prisma from "../models/index.js";
import logger from "../utils/logger.js";

class StoryElementsService {
  /**
   * All available genre elements
   * @private
   */
  #genreElements = {
    horror,
    fantasy,
    // Add other genres
  };

  /**
   * Get all available story elements for a specific genre
   * @param {string} genre - The game genre
   * @returns {Object} All elements for the genre
   */
  getElementsForGenre(genre) {
    const normalizedGenre = genre.toLowerCase().trim();
    const elements = this.#genreElements[normalizedGenre];

    if (!elements) {
      logger.warn(`No story elements defined for genre: ${genre}`);
      return null;
    }

    return elements;
  }

  /**
   * Generate a random selection of story elements for a game
   * @param {string} genre - The game genre
   * @returns {Object} Selected story elements
   */
  generateRandomElements(genre) {
    const elements = this.getElementsForGenre(genre);
    if (!elements) {
      logger.error(`Failed to generate elements for genre: ${genre}`);
      throw new Error(`No story elements defined for genre: ${genre}`);
    }

    // Select one item randomly from each category
    return {
      narrativeVoice: this.#getRandomElement(elements.narrativeVoice),
      pacingTechnique: this.#getRandomElement(elements.pacingTechniques),
      subgenre: this.#getRandomElement(elements.subgenres),
      emotionalCore: this.#getRandomElement(elements.emotionalCores),
      settingType: this.#getRandomElement(elements.settings),
      languageStyle: this.#getRandomElement(elements.languageStyles),
      choiceDesign: this.#getRandomElement(elements.choiceDesigns),
    };
  }

  /**
   * Generate a diverse set of story elements, avoiding recent combinations
   * @param {string} genre - The game genre
   * @param {number} userId - User ID to track history
   * @returns {Object} Selected story elements with enforced diversity
   */
  async generateRandomElementsWithDiversity(genre, userId) {
    const elements = this.getElementsForGenre(genre);
    if (!elements) {
      logger.error(`Failed to generate elements for genre: ${genre}`);
      throw new Error(`No story elements defined for genre: ${genre}`);
    }

    try {
      // Get unused subgenre to ensure variety
      const subgenre = await this.getUnusedSubgenre(userId, genre);

      // Get unused emotional core
      const emotionalCore = await this.getUnusedEmotionalCore(userId, genre);

      // Get unused setting type
      const settingType = await this.getUnusedSettingType(userId, genre);

      // Select the rest randomly
      return {
        narrativeVoice: this.#getRandomElement(elements.narrativeVoice),
        pacingTechnique: this.#getRandomElement(elements.pacingTechniques),
        subgenre: subgenre,
        emotionalCore: emotionalCore,
        settingType: settingType,
        languageStyle: this.#getRandomElement(elements.languageStyles),
        choiceDesign: this.#getRandomElement(elements.choiceDesigns),
      };
    } catch (error) {
      logger.error(`Error generating diverse elements: ${error.message}`);
      // Fall back to basic random selection
      return this.generateRandomElements(genre);
    }
  }

  /**
   * Get a subgenre that hasn't been used recently by this user
   * @param {number} userId - User ID
   * @param {string} genre - The game genre
   * @returns {Object} Selected subgenre element
   */
  async getUnusedSubgenre(userId, genre) {
    try {
      // Get the last 5 subgenres used by this user
      const recentGames = await prisma.game.findMany({
        where: { userId, genre },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { subgenre: true },
      });

      const recentSubgenres = recentGames
        .map((g) => g.subgenre)
        .filter(Boolean);

      // Get all subgenres for this genre
      const allSubgenres = this.getElementsForGenre(genre).subgenres;

      // Find subgenres not recently used
      const unusedSubgenres = allSubgenres.filter(
        (s) => !recentSubgenres.includes(s.id)
      );

      // If we have unused subgenres, pick one randomly
      if (unusedSubgenres.length > 0) {
        return this.#getRandomElement(unusedSubgenres);
      }

      // Otherwise return a random subgenre
      return this.#getRandomElement(allSubgenres);
    } catch (error) {
      logger.error(`Error getting unused subgenre: ${error.message}`);
      // Fall back to random selection
      return this.#getRandomElement(this.getElementsForGenre(genre).subgenres);
    }
  }

  /**
   * Get an emotional core that hasn't been used recently by this user
   * @param {number} userId - User ID
   * @param {string} genre - The game genre
   * @returns {Object} Selected emotional core element
   */
  async getUnusedEmotionalCore(userId, genre) {
    try {
      // Get the last 5 emotional cores used by this user
      const recentGames = await prisma.game.findMany({
        where: { userId, genre },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { emotionalCore: true },
      });

      const recentEmotionalCores = recentGames
        .map((g) => g.emotionalCore)
        .filter(Boolean);

      // Get all emotional cores for this genre
      const allEmotionalCores = this.getElementsForGenre(genre).emotionalCores;

      // Find emotional cores not recently used
      const unusedEmotionalCores = allEmotionalCores.filter(
        (e) => !recentEmotionalCores.includes(e.id)
      );

      // If we have unused emotional cores, pick one randomly
      if (unusedEmotionalCores.length > 0) {
        return this.#getRandomElement(unusedEmotionalCores);
      }

      // Otherwise return a random emotional core
      return this.#getRandomElement(allEmotionalCores);
    } catch (error) {
      logger.error(`Error getting unused emotional core: ${error.message}`);
      // Fall back to random selection
      return this.#getRandomElement(
        this.getElementsForGenre(genre).emotionalCores
      );
    }
  }

  /**
   * Get a setting type that hasn't been used recently by this user
   * @param {number} userId - User ID
   * @param {string} genre - The game genre
   * @returns {Object} Selected setting type element
   */
  async getUnusedSettingType(userId, genre) {
    try {
      // Get the last 5 setting types used by this user
      const recentGames = await prisma.game.findMany({
        where: { userId, genre },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { settingType: true },
      });

      const recentSettingTypes = recentGames
        .map((g) => g.settingType)
        .filter(Boolean);

      // Get all setting types for this genre
      const allSettingTypes = this.getElementsForGenre(genre).settings;

      // Find setting types not recently used
      const unusedSettingTypes = allSettingTypes.filter(
        (s) => !recentSettingTypes.includes(s.id)
      );

      // If we have unused setting types, pick one randomly
      if (unusedSettingTypes.length > 0) {
        return this.#getRandomElement(unusedSettingTypes);
      }

      // Otherwise return a random setting type
      return this.#getRandomElement(allSettingTypes);
    } catch (error) {
      logger.error(`Error getting unused setting type: ${error.message}`);
      // Fall back to random selection
      return this.#getRandomElement(this.getElementsForGenre(genre).settings);
    }
  }

  /**
   * Randomly select an element from an array
   * @private
   * @param {Array} elements - Array of elements to choose from
   * @returns {Object} Selected element
   */
  #getRandomElement(elements) {
    if (!elements || elements.length === 0) {
      return null;
    }
    return elements[Math.floor(Math.random() * elements.length)];
  }

  /**
   * Build a prompt guidance based on selected elements
   * @param {Object} selectedElements - The story elements chosen for the game
   * @returns {string} Combined prompt guidance for the AI
   */
  buildPromptGuidance(selectedElements) {
    if (!selectedElements) {
      return "";
    }

    let guidance =
      "Apply these storytelling techniques to create a unique and engaging narrative:\n\n";

    // Add each element's guidance if it exists
    Object.entries(selectedElements).forEach(([category, element]) => {
      if (element && element.name && element.promptGuidance) {
        guidance += `${element.name.toUpperCase()} (${category}):\n${element.promptGuidance}\n\n`;
      }
    });

    return guidance;
  }

  /**
   * Get a story element by ID for a specific genre and category
   * @param {string} genre - The game genre
   * @param {string} category - Element category (e.g., 'narrativeVoice')
   * @param {string} elementId - Element ID to find
   * @returns {Object|null} Found element or null
   */
  getElementById(genre, category, elementId) {
    const elements = this.getElementsForGenre(genre);
    if (!elements || !elements[category]) {
      return null;
    }

    return (
      elements[category].find((element) => element.id === elementId) || null
    );
  }

  /**
   * Reconstruct full story elements from IDs stored in game
   * @param {Object} game - Game object with element IDs
   * @returns {Object|null} Complete story elements
   */
  reconstructElementsFromGame(game) {
    if (!game || !game.genre) {
      return null;
    }

    try {
      // If full elements are stored as JSON, return that
      if (game.storyElements) {
        return game.storyElements;
      }

      // Otherwise reconstruct from IDs
      return {
        narrativeVoice: game.narrativeVoice
          ? this.getElementById(
              game.genre,
              "narrativeVoice",
              game.narrativeVoice
            )
          : null,
        pacingTechnique: game.pacingTechnique
          ? this.getElementById(
              game.genre,
              "pacingTechniques",
              game.pacingTechnique
            )
          : null,
        subgenre: game.subgenre
          ? this.getElementById(game.genre, "subgenres", game.subgenre)
          : null,
        emotionalCore: game.emotionalCore
          ? this.getElementById(
              game.genre,
              "emotionalCores",
              game.emotionalCore
            )
          : null,
        settingType: game.settingType
          ? this.getElementById(game.genre, "settings", game.settingType)
          : null,
        languageStyle: game.languageStyle
          ? this.getElementById(
              game.genre,
              "languageStyles",
              game.languageStyle
            )
          : null,
        choiceDesign: game.choiceDesign
          ? this.getElementById(game.genre, "choiceDesigns", game.choiceDesign)
          : null,
      };
    } catch (error) {
      logger.error(`Error reconstructing elements for game ${game.id}:`, error);
      return null;
    }
  }
}

export default new StoryElementsService();
