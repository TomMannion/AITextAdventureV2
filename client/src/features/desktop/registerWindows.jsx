// src/features/desktop/registerWindows.jsx
import {
  registerWindowType,
  placementStrategies,
} from "../window-system/registry/windowRegistry";
import GameModule from "../game-engine/GameModule";
import Settings from "../settings/Settings";
import UserProfile from "../auth/components/UserProfile";
import { placeholderIcons } from "../../utils/iconUtils";

/**
 * Register all application windows with the window registry
 * This ensures consistent configuration of windows throughout the application
 */
const registerApplicationWindows = () => {
  // Register the Text Adventure Game window
  registerWindowType("text-adventure", {
    component: GameModule,
    defaultProps: {},
    title: "Text Adventure Game",
    width: 800,
    height: 600,
    icon: placeholderIcons.adventure,
    placement: placementStrategies.CENTER,
  });

  // Register the Settings window
  registerWindowType("settings", {
    component: Settings,
    defaultProps: {},
    title: "Settings",
    width: 700,
    height: 500,
    icon: placeholderIcons.settings,
    placement: placementStrategies.CENTER,
    resizable: true,
  });

  // Register the User Profile window
  registerWindowType("user-profile", {
    component: UserProfile,
    defaultProps: {},
    title: "User Profile",
    width: 450,
    height: 400,
    icon: placeholderIcons.user,
    placement: placementStrategies.CENTER,
    resizable: true,
  });

  // Register My Documents window
  registerWindowType("my-documents", {
    component: GameModule, // Assuming this can show saved adventures
    defaultProps: { initialView: "browsing" },
    title: "My Documents",
    width: 700,
    height: 500,
    icon: placeholderIcons.myDocuments,
    placement: placementStrategies.CENTER,
    resizable: true,
  });

  console.log("Registered all application windows");
  return true;
};

export default registerApplicationWindows;
