/**
 * Enhanced prompt templates for truly literary-quality interactive fiction
 * Focused on psychological depth, narrative continuity, and immersive experience
 */
/**
 * Enhanced prompt templates for truly literary-quality interactive fiction
 * Focused on psychological depth, narrative continuity, and immersive experience
 */
const prompts = {
  /**
   * Generate the initial story prompt based on genre and story elements
   * @param {string} genre - The game genre
   * @param {Object} storyElements - Story elements configuration
   * @returns {Array} Array of message objects
   */
  initialStory: (genre, storyElements) => {
    // Build story element guidance
    let storyElementGuidance = "";
    if (storyElements) {
      storyElementGuidance = `
      Apply these specific storytelling techniques:
      
      NARRATIVE VOICE: ${storyElements.narrativeVoice?.name || "Not specified"}
      ${storyElements.narrativeVoice?.promptGuidance || ""}
      
      PACING: ${storyElements.pacingTechnique?.name || "Not specified"}
      ${storyElements.pacingTechnique?.promptGuidance || ""}
      
      SUBGENRE: ${storyElements.subgenre?.name || "Not specified"}
      ${storyElements.subgenre?.promptGuidance || ""}
      
      EMOTIONAL CORE: ${storyElements.emotionalCore?.name || "Not specified"}
      ${storyElements.emotionalCore?.promptGuidance || ""}
      
      SETTING: ${storyElements.settingType?.name || "Not specified"}
      ${storyElements.settingType?.promptGuidance || ""}
      
      LANGUAGE STYLE: ${storyElements.languageStyle?.name || "Not specified"}
      ${storyElements.languageStyle?.promptGuidance || ""}
      `;
    }

    return [
      {
        role: "system",
        content: `You are a master of literary ${genre} fiction with a distinctive voice akin to acclaimed contemporary authors. I need you to craft a complete 600-word literary story that establishes:
    
        1. A protagonist with clear psychological motivations and a compelling reason for their situation
        2. A specific contemporary geographic and social context that grounds the narrative
        3. A central tension or conflict that avoids well-worn tropes and generic scenarios
        4. Rich sensory details and atmosphere that immerse the reader
        5. At least one significant interpersonal relationship that creates emotional stakes
        
        Critical elements to include:
        - Establish WHY the protagonist is in this situation (not just inheritance or coincidence)
        - Create specific psychological traits that explain their choices
        - Ground the narrative in a concrete contemporary setting with authentic details
        - Use precise, evocative language with strong imagery and metaphor
        - Explore subject matter, perspectives, or experiences not commonly represented in fiction
        
        Avoid these common pitfalls:
        - Vague character motivations or generic protagonists
        - Unspecified settings or contexts
        - Overused plot structures and character archetypes
        - Clichéd genre tropes without subversion or psychological depth
        - Predictable resolutions or moralistic endings
        
        Your response MUST be in JSON format with the following schema:
        {
          "title": "Title of the story",
          "content": "The complete story...",
          "status": "ACTIVE"
        }`,
      },
      {
        role: "user",
        content: `Write a complete literary-quality ${genre} story of approximately 600 words that establishes a psychologically complex protagonist in a specific situation with clear motivations.
    
        Make sure to ground the narrative in a specific contemporary geographic location and social context, and establish the emotional stakes through at least one significant relationship. The protagonist should have clear, compelling reasons for being in their situation and making their choices.
        
        Focus on subject matter, perspectives, or experiences that are underrepresented in fiction. Avoid common tropes and predictable narratives in favor of something fresh and distinctive.
        
        Remember to employ literary techniques like foreshadowing, symbolism, and subtext. The story should reward careful reading and provide a complete narrative arc within the 600-word constraint.
        
        It is CRITICAL that your response be in the following JSON format:
        {
          "title": "Title of the story",
          "content": "The complete story...",
          "status": "ACTIVE"
        }
        `,
      },
    ];
  },

  /**
   * Generate the FIRST chapter based on the initial story as inspiration
   * @param {Object} params - Parameters for the prompt
   * @param {string} params.initialStory - The initial story that serves as inspiration
   * @param {number} params.totalTurns - Total number of turns for the game
   * @param {Object} params.storyElements - Story elements configuration
   * @returns {Array} Array of message objects
   */
  firstSegment: ({ initialStory, totalTurns, storyElements }) => {
    // Build story element guidance for choice design
    let choiceDesignGuidance = "";
    if (storyElements && storyElements.choiceDesign) {
      choiceDesignGuidance = `
      NARRATIVE BRANCHING APPROACH: ${storyElements.choiceDesign.name}
      ${storyElements.choiceDesign.promptGuidance}
      `;
    }

    // Build story element guidance for other elements
    let storyElementGuidance = "";
    if (storyElements) {
      storyElementGuidance = `
      Apply these specific literary techniques:
      
      NARRATIVE VOICE: ${storyElements.narrativeVoice?.name || "Not specified"}
      ${storyElements.narrativeVoice?.promptGuidance || ""}
      
      PACING: ${storyElements.pacingTechnique?.name || "Not specified"}
      ${storyElements.pacingTechnique?.promptGuidance || ""}
      
      SUBGENRE: ${storyElements.subgenre?.name || "Not specified"}
      ${storyElements.subgenre?.promptGuidance || ""}
      
      EMOTIONAL CORE: ${storyElements.emotionalCore?.name || "Not specified"}
      ${storyElements.emotionalCore?.promptGuidance || ""}
      
      LANGUAGE STYLE: ${storyElements.languageStyle?.name || "Not specified"}
      ${storyElements.languageStyle?.promptGuidance || ""}
      `;
    }

    return [
      {
        role: "system",
        content: `You are creating the first chapter of a literary interactive narrative inspired by the provided story elements. Your task is to write a cohesive chapter that establishes psychological complexity, advances the narrative, and subtly presents multiple potential paths forward without breaking immersion.

        ${storyElementGuidance}
        
        This is the first chapter of a ${totalTurns}-chapter narrative arc.
        
        WORD COUNT REQUIREMENT:
        - Your chapter MUST be EXACTLY 200-300 words in length. This is a firm requirement.
        - Prioritize quality storytelling within this strict word limit.
        - Focus on evocative language and meaningful character development despite the brevity.
        
        Your chapter should:
        
        1) Begin with a subtle, evocative chapter title (2-4 words) that hints at themes
        
        2) Establish the narrative while maintaining literary tone, atmosphere, and psychological depth. Develop:
          - Insight into the protagonist's motivations and inner conflicts
          - Establishment of the setting and context
          - Development of interpersonal relationships
          - Exploration of mysterious elements with subtle restraint
        
        3) Throughout the closing section of your chapter (not just the final paragraph), subtly introduce 2-3 potential paths the protagonist might take:
          - These paths should be woven organically into the narrative, not grouped together
          - They should emerge from the protagonist's thoughts, observations, or interactions
          - Avoid any formatting or phrasing that makes them feel like explicit "game choices"
          - Each path should feel like a natural extension of the protagonist's psychological state
          - The narrative should read like a literary novel, maintaining complete immersion
        
        ${choiceDesignGuidance}
        
        OPTION GENERATION RULES:
        - Each option MUST ONLY reference elements, characters, locations, or concepts that have EXPLICITLY appeared in THIS segment's narrative.
        - NEVER introduce new story elements, locations, or plot developments in the options that weren't established in this segment.
        - Before finalizing each option, verify it directly connects to specific content mentioned in your segment.
        - Options should feel like natural continuations of explicitly mentioned possibilities.
        
        VERIFICATION:
        After writing your segment and options, VERIFY that each option is directly grounded in specific sentences or paragraphs from your segment. If any option references something not explicitly established, revise it immediately.
        
        Note: The "options" in the JSON will be used programmatically, but should be brief summaries (5-7 words) that discreetly capture the paths subtly woven into your narrative.`,
      },
      {
        role: "user",
        content: `Here is the initial story that should serve as inspiration for our literary narrative:
        
        ${initialStory}
        
        Please craft the first chapter of our interactive narrative using these elements as inspiration. Establish the protagonist, setting, and central tensions while maintaining high literary quality and psychological depth throughout.
        
        CRITICAL REQUIREMENTS:
        1. Your chapter MUST be between 200-300 words EXACTLY. This is a strict requirement.
        2. Throughout the closing section of your chapter, subtly introduce 2-3 potential paths the protagonist might take, weaving them organically into the narrative.
        3. These paths should NOT be obviously presented as choices but rather emerge naturally from the protagonist's thoughts, observations, or interactions.
        4. Each option MUST ONLY reference elements, characters, locations, or concepts that have EXPLICITLY appeared in THIS segment's narrative.
        
        This is chapter 1 of a ${totalTurns}-chapter narrative.
        
        VERIFY before submitting that each option directly connects to specific content mentioned in your segment.
        
        It is CRITICAL that your response be in the following JSON format:
        {
          "segmentTitle": "Evocative chapter title",
          "content": "Literary-quality chapter with subtly woven potential paths...",
          "options": ["path one", "path two", "path three"],
          "status": "ACTIVE"
        }`,
      },
    ];
  },

  /**
   * Generate the next chapter based on the story so far and the user's choice
   * @param {Object} params - Parameters for the prompt
   * @param {string} params.initialStory - The initial story that serves as inspiration
   * @param {Array} params.segments - Previous story segments
   * @param {string} params.userChoice - The reader's choice that led to this chapter
   * @param {number} params.turnCount - Current chapter number
   * @param {number} params.totalTurns - Total number of chapters
   * @param {Object} params.storyElements - Story elements configuration
   * @returns {Array} Array of message objects
   */
  nextSegment: ({
    initialStory,
    segments,
    userChoice,
    turnCount,
    totalTurns,
    storyElements,
  }) => {
    // Construct context from previous segments in a literary format
    const previousContext = segments
      .map(
        (segment) =>
          `Chapter ${segment.sequenceNumber}: "${segment.SegmentTitle}"\n\n${segment.content}\n\nPath chosen: "${segment.userChoice || "Initial chapter"}"\n`
      )
      .join("\n");

    // Determine if this is the final turn
    const isFinalTurn = turnCount >= totalTurns;

    // If it's the final turn, use the final segment prompt instead
    if (isFinalTurn) {
      return prompts.finalSegment({
        initialStory,
        segments,
        userChoice,
        turnCount,
        totalTurns,
        storyElements,
      });
    }

    // Calculate how many chapters are left including this one
    const remainingChapters = totalTurns - turnCount + 1;

    // Build story element guidance for choice design
    let choiceDesignGuidance = "";
    if (storyElements && storyElements.choiceDesign) {
      choiceDesignGuidance = `
      NARRATIVE BRANCHING APPROACH: ${storyElements.choiceDesign.name}
      ${storyElements.choiceDesign.promptGuidance}
      `;
    }

    // Build story element guidance for other elements
    let storyElementGuidance = "";
    if (storyElements) {
      storyElementGuidance = `
      Apply these specific literary techniques:
      
      NARRATIVE VOICE: ${storyElements.narrativeVoice?.name || "Not specified"}
      ${storyElements.narrativeVoice?.promptGuidance || ""}
      
      PACING: ${storyElements.pacingTechnique?.name || "Not specified"}
      ${storyElements.pacingTechnique?.promptGuidance || ""}
      
      LANGUAGE STYLE: ${storyElements.languageStyle?.name || "Not specified"}
      ${storyElements.languageStyle?.promptGuidance || ""}
      `;
    }

    // Narrative pacing guidance based on remaining chapters
    let narrativeGuidance = "";
    if (remainingChapters <= 3) {
      narrativeGuidance = `
      NARRATIVE ARC GUIDANCE: This is chapter ${turnCount} of ${totalTurns}, with only ${remainingChapters} chapters remaining to conclude the narrative. The story should be building toward its climax now. Begin deepening the central mystery, heightening emotional stakes, and revealing subtle truths that have been foreshadowed earlier.
      `;
    } else if (remainingChapters <= totalTurns / 2) {
      narrativeGuidance = `
      NARRATIVE ARC GUIDANCE: This is chapter ${turnCount} of ${totalTurns}, with ${remainingChapters} chapters remaining. You're in the middle section of the narrative. The story should be developing complications, deepening characterization, and expanding on the mysterious elements introduced earlier.
      `;
    } else {
      narrativeGuidance = `
      NARRATIVE ARC GUIDANCE: This is chapter ${turnCount} of ${totalTurns}, with ${remainingChapters} chapters remaining. You're in the early development of the narrative. Focus on building upon the foundation established so far, introducing subtle complications while maintaining narrative cohesion.
      `;
    }

    return [
      {
        role: "system",
        content: `You are continuing a sophisticated literary narrative. Your task is to write the next chapter based on the story so far and the narrative path the reader has chosen. Your writing must maintain the established literary quality while responding directly and meaningfully to the specific path chosen.

        ${storyElementGuidance}
        
        ${narrativeGuidance}
        
        ${choiceDesignGuidance}
        
        WORD COUNT REQUIREMENT:
        - Your chapter MUST be EXACTLY 200-300 words in length. This is a firm requirement.
        - Prioritize quality storytelling within this strict word limit.
        - Focus on evocative language and meaningful character development despite the brevity.
        
        Your continuation should:
        
        1) Begin with a subtle, evocative chapter title (2-6 words)
        
        2) Respond directly and meaningfully to the specific path chosen in the previous chapter. This chosen path should:
           - Be the clear starting point for this chapter
           - Receive substantial attention and development
           - Feel like the natural continuation of that specific choice
        
        3) Deepen the narrative by:
           - Further exploring the psychological complexities of the protagonist
           - Developing the specific tension or mystery related to the chosen path
           - Maintaining the established atmosphere and tone
           - Adding new revelations or complications that emerge naturally from the chosen path
           
        4) Throughout the closing section of your chapter (not just in a single paragraph at the end), subtly introduce 2-3 potential paths the protagonist might take:
           - These paths should be woven organically throughout the narrative's closing section
           - They should emerge from the protagonist's thoughts, observations, or interactions with the world
           - Avoid any formatting or phrasing that makes them feel like explicit "game choices"
           - Each path should feel like a natural extension of the protagonist's psychological state
           - The narrative should maintain complete immersion like a literary novel

        OPTION GENERATION RULES:
        - Each option MUST ONLY reference elements, characters, locations, or concepts that have EXPLICITLY appeared in either:
          1. THIS current segment's narrative, OR
          2. The IMMEDIATELY PRECEDING segment (the one where the user made their choice)
        - NEVER introduce new story elements, locations, or plot developments in the options that weren't established in one of these two segments.
        - Before finalizing each option, verify it directly connects to specific content mentioned in your current segment or the immediately preceding segment.
        - Options should feel like natural continuations of explicitly mentioned possibilities.
        
        VERIFICATION:
        After writing your segment and options, VERIFY that each option is directly grounded in specific sentences or paragraphs from your segment or the immediately preceding segment. If any option references something not explicitly established, revise it immediately.

        Note: The "options" should be brief summaries (5-12 words) of the paths that are subtly embedded in your narrative.`,
      },
      {
        role: "user",
        content: `Here is our literary narrative so far:
        
        INITIAL STORY INSPIRATION:
        ${initialStory}
        
        PREVIOUS CHAPTERS:
        ${previousContext}
        
        The path chosen from the previous chapter was: "${userChoice}"
        
        CRITICAL REQUIREMENTS:
        1. Your chapter MUST be between 200-300 words EXACTLY. This is a strict requirement.
        2. Begin by directly developing the consequences of the chosen path: "${userChoice}"
        3. Throughout the closing section of your chapter, subtly introduce 2-3 potential paths the protagonist might take.
        4. Each option MUST ONLY reference elements, characters, locations, or concepts that have EXPLICITLY appeared in either:
           - THIS current segment you're writing, OR
           - The IMMEDIATELY PRECEDING segment (where the user made their choice)
        
        Please craft chapter ${turnCount} of our ${totalTurns}-chapter narrative, directly continuing from this specific chosen path.
        
        VERIFY before submitting that each option directly connects to specific content mentioned in your segment or the immediately preceding segment.
        
        Remember that all potential paths should continue to deepen the current storyline rather than branch into unrelated directions.
        
        It is CRITICAL that your response be in the following JSON format:
        {
          "segmentTitle": "Evocative chapter title",
          "content": "Literary-quality continuation with subtly woven paths...",
          "options": ["path one", "path two", "path three"],
          "status": "ACTIVE"
        }`,
      },
    ];
  },

  /**
   * Generate the final chapter
   * @param {Object} params - Parameters for the prompt
   * @param {string} params.initialStory - The initial story that served as inspiration
   * @param {Array} params.segments - Previous story segments
   * @param {string} params.userChoice - The reader's choice that led to this chapter
   * @param {number} params.turnCount - Current chapter number
   * @param {number} params.totalTurns - Total number of chapters
   * @param {Object} params.storyElements - Story elements configuration
   * @returns {Array} Array of message objects
   */
  finalSegment: ({
    initialStory,
    segments,
    userChoice,
    turnCount,
    totalTurns,
    storyElements,
  }) => {
    // Construct context from previous segments
    const previousContext = segments
      .map(
        (segment) =>
          `Chapter ${segment.sequenceNumber}: "${segment.SegmentTitle}"\n\n${segment.content}\n\nPath chosen: "${segment.userChoice || "Initial chapter"}"\n`
      )
      .join("\n");

    // Build story element guidance
    let storyElementGuidance = "";
    if (storyElements) {
      storyElementGuidance = `
      Apply these specific literary techniques for your conclusion:
      
      NARRATIVE VOICE: ${storyElements.narrativeVoice?.name || "Not specified"}
      ${storyElements.narrativeVoice?.promptGuidance || ""}
      
      EMOTIONAL CORE: ${storyElements.emotionalCore?.name || "Not specified"}
      ${storyElements.emotionalCore?.promptGuidance || ""}
      
      LANGUAGE STYLE: ${storyElements.languageStyle?.name || "Not specified"}
      ${storyElements.languageStyle?.promptGuidance || ""}
      `;
    }

    return [
      {
        role: "system",
        content: `You are crafting the final chapter of a sophisticated literary narrative. This culminating chapter should directly respond to the specific path chosen while providing a satisfying conclusion that maintains the narrative's psychological complexity.

        ${storyElementGuidance}
        
        WORD COUNT REQUIREMENT:
        - Your final chapter MUST be between 300-500 words in length. This is a firm requirement.
        - Prioritize quality storytelling within this strict word limit.
        - Focus on providing a satisfying conclusion despite the brevity.
        
        Your conclusion should:
        
        1) Begin with a subtle, evocative final chapter title (2-4 words)
        
        2) Respond directly and meaningfully to the specific path chosen in the previous chapter. This chosen path should:
           - Be the clear starting point for this final chapter
           - Receive substantial attention and development
           - Feel like the natural continuation of that specific choice
        
        3) Provide resolution that feels both surprising and inevitable by:
           - Revealing deeper truths about the protagonist and their situation
           - Resolving the central tension or mystery in a way that respects the psychological complexity established
           - Maintaining the established tone and atmosphere
           - Offering closure while preserving appropriate ambiguity
        
        4) Honor these principles of literary endings:
           - The conclusion should feel like the culmination of the protagonist's psychological journey
           - Avoid explicit morals or lessons
           - Preserve subtlety and nuance
           - End with a resonant final image or moment that encapsulates the narrative's themes
           
        COHERENCE REQUIREMENT:
        - Your conclusion must ONLY reference elements, characters, locations, or concepts that have been EXPLICITLY established in previous chapters.
        - Verify that any revelation or resolution derives directly from narrative elements that were previously introduced.
        - Do not introduce entirely new story elements or explanations in this final chapter.`,
      },
      {
        role: "user",
        content: `Here is our literary narrative so far:
        
        INITIAL STORY INSPIRATION:
        ${initialStory}
        
        PREVIOUS CHAPTERS:
        ${previousContext}
        
        The final path chosen was: "${userChoice}"
        
        CRITICAL REQUIREMENTS:
        1. Your final chapter MUST be between 300-500 words EXACTLY. This is a strict requirement.
        2. Begin by directly developing the consequences of the chosen path: "${userChoice}"
        3. Provide a satisfying conclusion that maintains the narrative's psychological complexity.
        4. Only reference elements, characters, locations, or concepts that have been EXPLICITLY established in previous chapters.
        
        Please craft the final chapter (${turnCount} of ${totalTurns}) of our narrative, responding directly to this specific chosen path and bringing the story to a satisfying literary conclusion.
        
        This final chapter should begin by developing the consequences of this particular choice, then move toward a resolution that feels both surprising and inevitable. Provide closure while maintaining the psychological complexity and literary quality of the narrative.
        
        Since this is the conclusion, the chapter should end with a resonant final image or moment that brings the narrative journey to completion. The entire narrative should read like a cohesive book that maintains immersion throughout.
        
        It is CRITICAL that your response be in the following JSON format:
        {
          "segmentTitle": "Evocative final chapter title",
          "content": "Literary-quality conclusion...",
          "options": [],
          "status": "COMPLETED"
        }`,
      },
    ];
  },

  /**
   * Generate a summary of the completed narrative
   * @param {Object} params - Parameters for the prompt
   * @param {string} params.initialStory - The initial story that served as inspiration
   * @param {Array} params.segments - All story segments
   * @returns {Array} Array of message objects
   */
  gameSummary: ({ initialStory, segments }) => {
    // Construct full story from all segments in a literary format
    const fullStory = segments
      .map(
        (segment) =>
          `Chapter ${segment.sequenceNumber}: "${segment.SegmentTitle}"\n\n${segment.content}\n\nPath chosen: "${segment.userChoice || "Initial chapter"}"\n`
      )
      .join("\n\n");

    return [
      {
        role: "system",
        content: `You are a literary critic crafting an insightful analysis of a recently completed interactive narrative.
        
        Create a sophisticated analysis that examines the work's literary merits, thematic elements, and narrative structure. Focus on psychological depth, symbolic patterns, and the consequences of narrative choices.
        
        The "title" should be a thoughtful, literary title for your analysis, 2-7 words.
        The "summary" should be a 300-400 word literary analysis written in sophisticated prose.
        The "keyMoments" should identify 3-5 pivotal narrative moments and their significance.
        The "theme" should analyze the central thematic concerns and motifs.
        The "characterArcs" should offer insight into psychological development.
        The "readerImpact" should analyze how narrative choices influenced thematic and character development.`,
      },
      {
        role: "user",
        content: `Here is the complete interactive narrative for literary analysis:
        
        INITIAL STORY INSPIRATION:
        ${initialStory}
        
        COMPLETE NARRATIVE:
        ${fullStory}
        
        Please provide a thoughtful literary analysis of this narrative, examining its thematic concerns, symbolic patterns, character development, and narrative structure. Focus on the work's literary merits and how the interactive element contributed to its artistic impact.
        
        Consider how the narrative's branching paths created different thematic and psychological possibilities, and how the chosen paths shaped the ultimate meaning of the work.
        
        It is CRITICAL that your response be in the following JSON format:
        {
          "title": "Analysis Title",
          "summary": "Your comprehensive analysis...",
          "keyMoments": ["Significant narrative moment 1", "Significant narrative moment 2", "Significant narrative moment 3"],
          "theme": "The central thematic concerns of the narrative",
          "characterArcs": [
            {
              "name": "Character name",
              "arc": "Literary analysis of their psychological journey"
            }
          ],
          "readerImpact": "How the reader's narrative choices shaped the thematic and psychological development"
        }`,
      },
    ];
  },

  /**
   * Generate a title for a narrative
   * @param {string} initialStory - The initial story that served as inspiration
   * @returns {Array} Array of message objects
   */
  generateTitle: (initialStory) => {
    return [
      {
        role: "system",
        content: `You are a literary editor tasked with creating an evocative, artful title for a sophisticated piece of fiction.
        
        Generate a title that captures the essence of the story's atmosphere, themes, and psychological concerns. The title should be intriguing and literary in quality, avoiding genre clichés and formulaic patterns.
        
        Avoid these patterns:
        - "The [adjective] [noun]" formula
        - Genre clichés and obvious horror/fantasy tropes
        - Overly explanatory titles that telegraph the plot
        - Titles that focus on technology, algorithms, or digital elements`,
      },
      {
        role: "user",
        content: `Please create a literary-quality title for this story inspiration:

        ${initialStory}
        
        The title should capture the story's atmosphere, emotional resonance, and thematic concerns while avoiding formulaic patterns. Focus on creating something evocative and nuanced that would appear on a literary fiction cover.
        
        It is CRITICAL that your response be in the following JSON format:
        {
          "title": "The Literary Title",
          "alternativeTitles": ["Alternative 1", "Alternative 2"]
        }`,
      },
    ];
  },

  /**
   * Analyze story themes and elements
   * @param {string} fullStory - The complete story
   * @returns {Array} Array of message objects
   */
  analyzeStory: (fullStory) => {
    return [
      {
        content: `You are a literary critic analyzing a work of fiction for its artistic merits and thematic concerns.
        
        Please analyze the provided narrative with the sophisticated perspective of a literary scholar, identifying its key elements and artistic strategies.`,
      },
      {
        role: "user",
        content: `Please provide a literary analysis of this narrative:

        ${fullStory}
        
        Approach this as a sophisticated literary critic examining a work of fiction. Focus on thematic depth, symbolic patterns, narrative strategies, character psychology, and the work's relation to its genre conventions.
        
        Rather than simple description, provide insightful analysis of how these elements function in the narrative and contribute to its artistic impact.
        
        It is CRITICAL that your response be in the following JSON format:
        {
          "themes": ["Thematic element 1", "Thematic element 2", "Thematic element 3"],
          "settings": ["Setting 1", "Setting 2"],
          "characters": [
            {
              "name": "Character name",
              "role": "Narrative function",
              "psychological_profile": "Analysis of their interior landscape"
            }
          ],
          "narrative_techniques": ["Technique 1", "Technique 2"],
          "symbolic_patterns": ["Pattern 1", "Pattern 2"],
          "genre_analysis": "Analysis of genre conventions and subversions"
        }`,
      },
    ];
  },
};

export default prompts;
