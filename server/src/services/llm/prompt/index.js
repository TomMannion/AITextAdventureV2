// src/services/llm/prompt/index.js
import gamePrompts from "./gamePrompts.js";
import characterPrompts from "./characterPrompts.js";

export { gamePrompts, characterPrompts };

export default {
  ...gamePrompts,
  ...characterPrompts,
};
