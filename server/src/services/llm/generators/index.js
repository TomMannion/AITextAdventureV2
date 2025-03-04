// src/services/llm/generators/index.js
import storyGenerator from "./storyGenerator.js";
import titleGenerator from "./titleGenerator.js";
import characterGenerator from "./characterGenerator.js";

export { storyGenerator, titleGenerator, characterGenerator };

export default {
  ...storyGenerator,
  ...titleGenerator,
  ...characterGenerator,
};
