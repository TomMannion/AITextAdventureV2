/**
 * Story element definitions for the horror genre
 */
export default {
  genre: "horror",
  narrativeVoice: [
    {
      id: "first_person_immediacy",
      name: "First-person immediacy",
      description: "Create urgent dread with present-tense narration",
      promptGuidance:
        "Use first-person present tense with short, urgent sentences.",
    },
    {
      id: "detached_third_person",
      name: "Detached third-person",
      description: "Build slow-burning unease through clinical observation",
      promptGuidance:
        "Use detached, observational third-person perspective with clinical precision.",
    },
    {
      id: "second_person_immersion",
      name: "Second-person immersion",
      description: "Pull players directly into uncomfortable situations",
      promptGuidance:
        "Address the reader directly using 'you' to create immediate immersion.",
    },
    {
      id: "unreliable_narrator",
      name: "Unreliable narrator",
      description:
        "Use a perspective that increasingly contradicts itself or reality",
      promptGuidance:
        "Create a narrator whose perception becomes increasingly questionable or contradictory.",
    },
    {
      id: "found_materials",
      name: "Found materials",
      description:
        "Present the story through journal entries, transcripts, or reports",
      promptGuidance:
        "Frame narrative as discovered documents, recordings, or reports.",
    },
  ],
  pacingTechniques: [
    {
      id: "slow_burn",
      name: "Slow burn",
      description:
        "Gradual escalation where normalcy erodes almost imperceptibly",
      promptGuidance:
        "Start normal and very gradually introduce subtle, unsettling elements.",
    },
    {
      id: "punctuated_terror",
      name: "Punctuated terror",
      description:
        "Long stretches of mundanity broken by sudden disturbing moments",
      promptGuidance:
        "Establish ordinary scenes interrupted by brief, intense moments of wrongness.",
    },
    {
      id: "crescendo",
      name: "Crescendo",
      description:
        "Steadily increasing tension that builds toward a climactic revelation",
      promptGuidance:
        "Increase tension consistently throughout, building toward a dramatic climax.",
    },
    {
      id: "cyclical",
      name: "Cyclical",
      description:
        "Patterns that repeat with subtle, disturbing variations each cycle",
      promptGuidance:
        "Create repeating patterns where each iteration includes a subtle, disturbing change.",
    },
    {
      id: "fragmented",
      name: "Fragmented",
      description:
        "Disjointed scenes that force the player to piece together what's happening",
      promptGuidance:
        "Present disconnected scenes that gradually form a disturbing whole when pieced together.",
    },
  ],
  subgenres: [
    {
      id: "body_horror",
      name: "Body horror",
      description: "Focus on physical transformation, decay, or violation",
      promptGuidance:
        "Focus on disturbing physical transformations or bodily violations.",
    },
    {
      id: "folk_horror",
      name: "Folk horror",
      description: "Incorporate disturbing community practices or traditions",
      promptGuidance:
        "Center on isolated communities, ancient traditions, or disturbing folk practices.",
    },
    {
      id: "psychological_horror",
      name: "Psychological horror",
      description: "Emphasize deteriorating mental states and perception",
      promptGuidance:
        "Focus on deteriorating mental states, unclear perception, or paranoia.",
    },
    {
      id: "cosmic_horror",
      name: "Cosmic horror",
      description: "Suggest larger, incomprehensible forces at work",
      promptGuidance:
        "Emphasize humanity's insignificance against incomprehensible cosmic forces.",
    },
    {
      id: "gothic_horror",
      name: "Gothic horror",
      description: "Use decay, family secrets, and haunted histories",
      promptGuidance:
        "Include elements of decay, ancient family secrets, and the weight of history.",
    },
  ],
  emotionalCores: [
    {
      id: "guilt_driven",
      name: "Guilt-driven",
      description:
        "Center on a past action the protagonist is trying to escape",
      promptGuidance:
        "Make guilt over a past action the driving emotional force.",
    },
    {
      id: "grief_warped",
      name: "Grief-warped",
      description: "Build around loss and the distortion of memory",
      promptGuidance:
        "Center on grief that becomes distorted, leading to denial or delusions.",
    },
    {
      id: "paranoia_fueled",
      name: "Paranoia-fueled",
      description: "Focus on trust issues and perceived threats",
      promptGuidance:
        "Build tension through growing paranoia and suspicion about others.",
    },
    {
      id: "isolation_centered",
      name: "Isolation-centered",
      description: "Emphasize disconnection and abandonment",
      promptGuidance:
        "Use physical or social isolation to create vulnerability and helplessness.",
    },
    {
      id: "identity_questioning",
      name: "Identity-questioning",
      description: "Challenge the protagonist's sense of self",
      promptGuidance:
        "Undermine the protagonist's understanding of their own identity.",
    },
  ],
  settings: [
    {
      id: "claustrophobic",
      name: "Claustrophobic",
      description: "Tight spaces that grow increasingly constrained",
      promptGuidance:
        "Set the story in confined spaces that create a sense of constriction.",
    },
    {
      id: "agoraphobic",
      name: "Agoraphobic",
      description: "Open spaces that feel exposed and vulnerable",
      promptGuidance:
        "Use vast open spaces to create a sense of exposure and vulnerability.",
    },
    {
      id: "liminal_spaces",
      name: "Liminal spaces",
      description:
        "Transitional areas like hallways, waiting rooms, or stairwells",
      promptGuidance:
        "Set scenes in transitional spaces that feel caught between destinations.",
    },
    {
      id: "corrupted_comfort",
      name: "Corrupted comfort",
      description: "Familiar places made wrong (home, school, workplace)",
      promptGuidance:
        "Take familiar, comfortable settings and make them feel wrong or threatening.",
    },
    {
      id: "seasonal_affect",
      name: "Seasonal affect",
      description: "Use weather and time of year to set distinct moods",
      promptGuidance:
        "Use a specific season or weather condition to enhance the atmosphere.",
    },
  ],
  languageStyles: [
    {
      id: "minimalist",
      name: "Minimalist",
      description: "Short, precise sentences creating stark imagery",
      promptGuidance: "Use short, direct sentences with minimal description.",
    },
    {
      id: "poetic",
      name: "Poetic",
      description: "Rich, sensory language that creates atmosphere",
      promptGuidance:
        "Use rich metaphors, similes, and sensory details to create atmosphere.",
    },
    {
      id: "conversational",
      name: "Conversational",
      description: "Casual tone that disarms before disturbing",
      promptGuidance:
        "Write in a casual, conversational tone that contrasts with disturbing content.",
    },
    {
      id: "technical",
      name: "Technical",
      description:
        "Precise, jargon-filled language that creates clinical distance",
      promptGuidance:
        "Use technical terminology and clinical observations to create emotional distance.",
    },
    {
      id: "stream_of_consciousness",
      name: "Stream-of-consciousness",
      description: "Flowing, associative text that mimics thought patterns",
      promptGuidance:
        "Write in a flowing style that mimics thoughts, with minimal punctuation.",
    },
  ],
  choiceDesigns: [
    {
      id: "moral_dilemmas",
      name: "Moral dilemmas",
      description:
        "Force difficult ethical choices with no clear 'right' answer",
      promptGuidance:
        "Present choices with significant moral costs or ethical implications.",
    },
    {
      id: "perception_choices",
      name: "Perception choices",
      description: "Offer different ways to interpret ambiguous situations",
      promptGuidance:
        "Offer choices that represent different interpretations of ambiguous situations.",
    },
    {
      id: "relationship_focused",
      name: "Relationship-focused",
      description: "Center on how the player interacts with other characters",
      promptGuidance:
        "Focus choices on relationships—who to trust, help, abandon, or confront.",
    },
    {
      id: "action_vs_inaction",
      name: "Action vs. inaction",
      description: "Make doing nothing a meaningful choice with consequences",
      promptGuidance:
        "Present choices where inaction has its own significant consequences.",
    },
    {
      id: "investigation_depth",
      name: "Investigation depth",
      description: "Allow players to determine how much truth they uncover",
      promptGuidance:
        "Offer choices that determine how deeply the player investigates the horror.",
    },
  ],
};
