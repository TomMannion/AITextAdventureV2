// src/services/llm/parser/index.js
import gameParser from "./gameParser.js";
import characterParser from "./characterParser.js";

export { gameParser, characterParser };

export default {
  ...gameParser,
  ...characterParser,
};
