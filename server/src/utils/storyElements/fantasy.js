/**
 * Story element definitions for the fantasy genre
 */
export default {
  genre: "fantasy",
  narrativeVoice: [
    {
      id: "epic_chronicler",
      name: "Epic Chronicler",
      description:
        "Grand, sweeping narrative voice that captures the scope of a vast world",
      example:
        "The dragons soared above the ancient citadel, their shadows dancing across the spires.",
      promptGuidance:
        "Use rich, formal language that emphasizes epic scale and ancient history.",
    },
    {
      id: "folklore_storyteller",
      name: "Folklore Storyteller",
      description:
        "Intimate, conversational style reminiscent of oral tradition",
      example:
        "Now listen close, for this tale has been passed down since the Old Kings ruled.",
      promptGuidance:
        "Write as if telling a story around a campfire with direct reader addresses.",
    },
    {
      id: "mystic_observer",
      name: "Mystic Observer",
      description: "Dreamy, philosophical voice that perceives deeper meanings",
      example:
        "The threads of destiny wove together, invisible to most, but shimmering like silver.",
      promptGuidance:
        "Use metaphysical language that suggests hidden patterns and deeper meanings.",
    },
    {
      id: "scholarly_archivist",
      name: "Scholarly Archivist",
      description:
        "Academic, detail-oriented perspective that catalogs the fantastic with precision",
      example:
        "The third dynasty introduced seventeen distinct variations of levitation spells.",
      promptGuidance:
        "Adopt a scholarly tone that treats magical elements as subjects of serious study.",
    },
    {
      id: "enchanted_perspective",
      name: "Enchanted Perspective",
      description: "Whimsical, lyrical voice that sees wonder in everything",
      example:
        "The forest breathed dreams and whispered secrets to those who would listen.",
      promptGuidance:
        "Use whimsical language that infuses everything with magic and wonder.",
    },
  ],
  pacingTechniques: [
    {
      id: "quest_driven",
      name: "Quest-Driven",
      description: "Forward momentum built around achieving clear objectives",
      example:
        "With the map in hand, they set forth toward the Crystal Mountains.",
      promptGuidance:
        "Structure around specific goals with distinct milestones that create progression.",
    },
    {
      id: "discovery_based",
      name: "Discovery-Based",
      description:
        "Progression through gradually unfolding world and character revelations",
      example:
        "Each chamber revealed new wonders and hinted at deeper mysteries.",
      promptGuidance:
        "Base pacing on successive revelations that expand understanding and raise questions.",
    },
    {
      id: "prophecy_fulfillment",
      name: "Prophecy Fulfillment",
      description:
        "Narrative structured around fulfilling (or subverting) foretold events",
      example: "The first sign had appeared. Now they waited for the second.",
      promptGuidance:
        "Frame events in relation to a prophecy or prediction creating tension.",
    },
    {
      id: "seasons_and_cycles",
      name: "Seasons and Cycles",
      description: "Story rhythm tied to natural or magical cycles",
      example:
        "As winter's grip loosened, so too did the enchantment's power begin to wane.",
      promptGuidance:
        "Link story progression to cyclical elements like seasons or magical tides.",
    },
    {
      id: "magical_escalation",
      name: "Magical Escalation",
      description:
        "Increasing scale and power of magical elements and challenges",
      example:
        "What began as flickering candles had grown into commanding lightning from the sky.",
      promptGuidance:
        "Structure around the escalation of magical abilities, with each development surpassing the last.",
    },
  ],
  subgenres: [
    {
      id: "high_fantasy",
      name: "High Fantasy",
      description:
        "Epic adventures in entirely fictional worlds with well-developed magic systems",
      example:
        "The Council of Seven Kingdoms gathered beneath the ancient World Tree.",
      promptGuidance:
        "Create a fully realized secondary world with consistent internal logic.",
    },
    {
      id: "sword_and_sorcery",
      name: "Sword and Sorcery",
      description:
        "Gritty, personal adventures focusing on self-interested characters",
      example:
        "Karak spat blood, tightened his grip on the jewel-encrusted dagger, and grinned.",
      promptGuidance:
        "Focus on individual physical prowess and morally ambiguous protagonists.",
    },
    {
      id: "magical_realism",
      name: "Magical Realism",
      description: "Subtle magic woven into otherwise ordinary settings",
      example:
        "The grandmother's recipes always tasted of memories, sometimes ones not yet experienced.",
      promptGuidance:
        "Blend magical elements seamlessly into an otherwise realistic setting.",
    },
    {
      id: "mythic_fantasy",
      name: "Mythic Fantasy",
      description: "Stories drawing heavily from existing myths and legends",
      example:
        "The new god stood where the old oak had fallen, her hair a crown of living branches.",
      promptGuidance:
        "Draw from real-world mythology, folklore, and religious narratives.",
    },
    {
      id: "dark_fantasy",
      name: "Dark Fantasy",
      description: "Grim, often morally ambiguous tales with horror elements",
      example:
        "The healing spell worked—the wound closed. But beneath the skin, something else now lived.",
      promptGuidance:
        "Incorporate elements of horror into fantasy settings with morally challenging situations.",
    },
  ],
  emotionalCores: [
    {
      id: "coming_of_age",
      name: "Coming of Age",
      description: "Emotional journey of discovery and identity formation",
      example:
        "The magic responded differently now, no longer wild bursts but focused streams.",
      promptGuidance:
        "Center on a character discovering their true abilities or place in the world.",
    },
    {
      id: "burden_of_power",
      name: "Burden of Power",
      description:
        "Exploring the responsibilities and costs of special abilities",
      example:
        "Each spell aged him imperceptibly to others, but he felt the years accumulating.",
      promptGuidance:
        "Focus on the sacrifices or difficult choices required of those with great power.",
    },
    {
      id: "lost_legacy",
      name: "Lost Legacy",
      description:
        "Reconnecting with forgotten heritage or ancestral knowledge",
      example: "The symbols on the tomb matched the birthmark on her palm.",
      promptGuidance:
        "Build around uncovering or reclaiming a hidden personal or cultural heritage.",
    },
    {
      id: "found_family",
      name: "Found Family",
      description: "Creating bonds of loyalty and love beyond blood relations",
      example:
        "They had no common tongue or homeland—but shared dangers had forged something stronger.",
      promptGuidance:
        "Emphasize the formation of deep bonds between initially unrelated characters.",
    },
    {
      id: "redemptive_journey",
      name: "Redemptive Journey",
      description: "Seeking forgiveness or purpose after a fall from grace",
      example:
        "The sword that had taken thousands of lives was now being used to protect the innocent.",
      promptGuidance:
        "Center on seeking to make amends for past wrongs or find new purpose after failure.",
    },
  ],
  settings: [
    {
      id: "ancient_ruins",
      name: "Ancient Ruins",
      description: "Lost civilizations and forgotten places of power",
      example:
        "Towers of impossible height stood exposed where the sands had shifted.",
      promptGuidance:
        "Set key scenes in mysterious abandoned structures from advanced lost civilizations.",
    },
    {
      id: "enchanted_wilderness",
      name: "Enchanted Wilderness",
      description: "Natural settings infused with magic and sentience",
      example:
        "The trees shifted their roots to clear a path, recognizing the ancient bloodline.",
      promptGuidance:
        "Create natural environments alive with magic, possibly sentient, with their own rules.",
    },
    {
      id: "magical_academy",
      name: "Magical Academy",
      description: "Institutions for the study and training of magical arts",
      example:
        "The west tower was forbidden to first-years—time flowed differently inside.",
      promptGuidance:
        "Use educational settings with hierarchies, specialized knowledge, and competitions.",
    },
    {
      id: "liminal_doorways",
      name: "Liminal Doorways",
      description: "Thresholds between worlds or states of being",
      example:
        "The ordinary wardrobe had been crafted from wood that remembered another world.",
      promptGuidance:
        "Center around portals or gateways that connect different realms or times.",
    },
    {
      id: "pocket_realms",
      name: "Pocket Realms",
      description: "Small, self-contained magical domains with their own rules",
      example:
        "Inside the locket was an entire kingdom, where a thousand years passed in a day.",
      promptGuidance:
        "Create small magical environments with unique laws, existing inside objects.",
    },
  ],
  languageStyles: [
    {
      id: "archaic_formality",
      name: "Archaic Formality",
      description:
        "Elevated, slightly antiquated language suggesting ancient traditions",
      example:
        "Henceforth, whosoever draws the blade shall rightfully claim the throne.",
      promptGuidance:
        "Use formal, slightly archaic language with complex sentence structures.",
    },
    {
      id: "elemental_metaphor",
      name: "Elemental Metaphor",
      description:
        "Description rooted in natural forces and primordial elements",
      example:
        "His rage was a wildfire, consuming reason and leaving only ash.",
      promptGuidance:
        "Build descriptions around elemental forces (fire, water, earth, air).",
    },
    {
      id: "magical_terminology",
      name: "Magical Terminology",
      description: "Specialized vocabulary for magical concepts and processes",
      example:
        "The thaumaturge began the encantation, balancing the aetherial resonances.",
      promptGuidance:
        "Use specialized terminology for magical elements creating a formalized system.",
    },
    {
      id: "sensory_enchantment",
      name: "Sensory Enchantment",
      description: "Rich, sensory language that emphasizes magical experiences",
      example:
        "The spell tasted like lightning and old copper, setting her teeth buzzing.",
      promptGuidance:
        "Describe magic through sensory details that convey how it feels and sounds.",
    },
    {
      id: "naming_power",
      name: "Naming Power",
      description: "Emphasis on the importance and power of names and naming",
      example: "She offered only her use-name, keeping her true-name guarded.",
      promptGuidance:
        "Emphasize the significance of names and the possible power in knowing true names.",
    },
  ],
  choiceDesigns: [
    {
      id: "moral_ambiguity",
      name: "Moral Ambiguity",
      description:
        "Choices between different values or priorities with no clear right answer",
      example:
        "Do you use the artifact to save the village now, or save power for the greater threat?",
      promptGuidance:
        "Present choices that force weighing different values with no clearly 'right' option.",
    },
    {
      id: "magical_consequence",
      name: "Magical Consequence",
      description:
        "Decisions that trigger different magical effects or transformations",
      example:
        "Will you drink from the silver fountain, the golden chalice, or the crystal vial?",
      promptGuidance:
        "Offer choices that trigger different magical effects or transformations.",
    },
    {
      id: "faction_allegiance",
      name: "Faction Allegiance",
      description:
        "Choices that align the player with different groups or interests",
      example:
        "Will you deliver the message to the Council or share it with the Alliance?",
      promptGuidance:
        "Present choices that align with different factions, each with their own values.",
    },
    {
      id: "prophetic_interpretation",
      name: "Prophetic Interpretation",
      description:
        "Decisions about how to interpret or fulfill ambiguous prophecies",
      example:
        "The prophecy speaks of 'a sacrifice freely given'—what will you offer?",
      promptGuidance:
        "Present choices around interpreting ambiguous prophecies or riddles.",
    },
    {
      id: "magical_cost_benefit",
      name: "Magical Cost-Benefit",
      description: "Weighing the price and reward of using magical power",
      example:
        "Will you use your healing gift, knowing it will leave you vulnerable for days?",
      promptGuidance:
        "Offer choices that require weighing the benefits of magic against personal costs.",
    },
  ],
};
