// src/features/game-engine/registerGameWindows.js
import {
  registerWindowType,
  placementStrategies,
} from "../window-system/registry/windowRegistry";
import GameModule from "./GameModule";

const registerGameWindows = () => {
  registerWindowType("text-adventure", {
    component: GameModule,
    defaultProps: {},
    title: "Text Adventure Game",
    width: 800,
    height: 600,
    icon: "🧙", // This would be a proper icon path in production
    placement: placementStrategies.CENTER,
  });

  console.log("Registered game windows");
  return true;
};

export default registerGameWindows;
