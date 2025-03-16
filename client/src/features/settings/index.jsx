// src/features/settings/index.js
import Settings from "./Settings";
import LLMSettings from "./tabs/LLMSettings";
import AccessibilitySettings from "./tabs/AccessibilitySettings";
import NotificationSettings from "./tabs/NotificationSettings";
import DisplaySettings from "./tabs/DisplaySettings";
import GameSettings from "./tabs/GameSettings";

// Export all settings components
export {
  Settings,
  LLMSettings,
  AccessibilitySettings,
  NotificationSettings,
  DisplaySettings,
  GameSettings,
};

// Register settings window with the window registry
import {
  registerWindowType,
  placementStrategies,
} from "../window-system/registry/windowRegistry";

/**
 * Register the settings window with the window registry
 */
export const registerSettingsWindow = () => {
  registerWindowType("settings", {
    component: Settings,
    defaultProps: {},
    title: "Settings",
    width: 700,
    height: 500,
    icon: "/icons/settings.ico", // Use your actual icon path
    placement: placementStrategies.CENTER,
    resizable: true,
  });

  console.log("Registered settings window");
  return true;
};

export default Settings;
