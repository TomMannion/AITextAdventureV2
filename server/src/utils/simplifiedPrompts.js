/**
 * Simplified prompt templates for AI text adventure game
 * Only requires genre as input, with minimal complexity
 */

const simplifiedPrompts = {
  /**
   * Generate the initial story prompt based on genre
   * @param {string} genre - The game genre (e.g., "fantasy", "horror")
   * @returns {Array} Array of message objects for AI
   */
  initialStory: (genre) => {
    const uniqueId = `uid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return [
      {
        role: "user",
        content: `uniqueId: ${uniqueId}
        
        Please write a nosleep style ${genre} story of approximately 500 words. The story should avoid common tropes and cliches.
        The should explore themes in the ${genre} genre that are not often explored. try to think of something unique and interesting.

        

        Your response MUST be in JSON format with the following schema:
        {
          "title": "Title of the story",
          "content": "The complete story...",
          "status": "ACTIVE"
        }`,
      },
    ];
  },

  /**
   * Generate the first segment/chapter based on the initial story
   * @param {string} initialStory - The initial story that serves as inspiration
   * @param {string} genre - The game genre
   * @returns {Array} Array of message objects for AI
   */
  firstSegment: (initialStory, genre) => {
    return [
      {
        role: "system",
        content: `You are creating the first chapter of an turn based nosleep style ${genre} story.`,
      },
      {
        role: "user",
        content: `Here is the rough outline of the story:

        ${initialStory}

        Write the first chapter (200-300 words) of a turn based nosleep style ${genre} story that follows the outline and style of this story. At the end, provide 2-3 possible choices for the protagonist to take.

        Your response MUST be in JSON format:
        {
          "segmentTitle": "Chapter title",
          "content": "The chapter content...",
          "options": ["option 1", "option 2", "option 3"],
          "status": "ACTIVE"
        }`,
      },
    ];
  },

  /**
   * Generate the next segment based on previous segments and player choice
   * @param {string} initialStory - The initial story
   * @param {Array} segments - Previous story segments
   * @param {string} userChoice - The reader's choice that led to this chapter
   * @param {string} genre - The game genre
   * @returns {Array} Array of message objects for AI
   */
  nextSegment: (initialStory, segments, userChoice, genre) => {
    // Construct a simple context from previous segments
    const previousContext = segments
      .map(
        (segment) =>
          `Chapter ${segment.sequenceNumber}: "${segment.segmentTitle || "Untitled"}"\n${segment.content}\n\nPlayer chose: "${segment.userChoice || "Initial chapter"}"\n`
      )
      .join("\n");

    return [
      {
        role: "system",
        content: `You are continuing a turn based nosleep style ${genre} story based on previous chapters and the player's choice.`,
      },
      {
        role: "user",
        content: `Outline of the story:
        ${initialStory}

        Previous chapters:
        ${previousContext}

        The player chose: "${userChoice}"

        Write the next chapter (200-300 words) of a turn based nosleep style ${genre} story that continues the story based on the players choice, and previous chapters and taking into account the outline of the story. At the end, provide 2-3 possible paths for the protagonist to take.

        Your response MUST be in JSON format:
        {
          "segmentTitle": "Chapter title",
          "content": "The chapter content...",
          "options": ["option 1", "option 2", "option 3"],
          "status": "ACTIVE"
        }`,
      },
    ];
  },

  /**
   * Generate final segment based on previous segments and player choice
   * @param {string} initialStory - The initial story
   * @param {Array} segments - Previous story segments
   * @param {string} userChoice - The reader's choice that led to this chapter
   * @param {string} genre - The game genre
   * @returns {Array} Array of message objects for AI
   */
  finalSegment: (initialStory, segments, userChoice, genre) => {
    // Construct a simple context from previous segments
    const previousContext = segments
      .map(
        (segment) =>
          `Chapter ${segment.sequenceNumber}: "${segment.segmentTitle || "Untitled"}"\n${segment.content}\n\nPlayer chose: "${segment.userChoice || "Initial chapter"}"\n`
      )
      .join("\n");

    return [
      {
        role: "system",
        content: `You are writing the final chapter of an interactive ${genre} narrative.`,
      },
      {
        role: "user",
        content: `Initial story:
        ${initialStory}

        Previous chapters:
        ${previousContext}

        The player chose: "${userChoice}"

        Write the final chapter (300-500 words) that concludes the story based on the player's choice. Provide a satisfying ending that wraps up the narrative.

        Your response MUST be in JSON format:
        {
          "segmentTitle": "Final chapter title",
          "content": "The chapter content...",
          "options": [],
          "status": "COMPLETED"
        }`,
      },
    ];
  },

  /**
   * Generate a simple game summary
   * @param {string} initialStory - The initial story
   * @param {Array} segments - All story segments
   * @param {string} genre - The game genre
   * @returns {Array} Array of message objects for AI
   */
  gameSummary: (initialStory, segments, genre) => {
    // Construct full story from all segments
    const fullStory = segments
      .map(
        (segment) =>
          `Chapter ${segment.sequenceNumber}: "${segment.segmentTitle || "Untitled"}"\n${segment.content}\n`
      )
      .join("\n");

    return [
      {
        role: "system",
        content: `You are summarizing a completed interactive ${genre} narrative.`,
      },
      {
        role: "user",
        content: `Initial story:
        ${initialStory}

        Complete narrative:
        ${fullStory}

        Provide a summary of this interactive story. Include the key moments and themes.

        Your response MUST be in JSON format:
        {
          "title": "Summary title",
          "summary": "Overall summary of the story",
          "keyMoments": ["key moment 1", "key moment 2", "key moment 3"],
          "theme": "Main theme of the story"
        }`,
      },
    ];
  },
};

export default simplifiedPrompts;
