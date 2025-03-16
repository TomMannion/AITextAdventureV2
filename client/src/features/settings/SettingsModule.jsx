// src/features/settings/SettingsModule.jsx
import React, { useEffect, useRef } from "react"; // Add useRef
import { useWindowContext } from "../../contexts/WindowContext";
import { SettingsProvider } from "../../contexts/SettingsContext";
import Settings from "./Settings";
import { registerSettingsWindow } from "./index";

/**
 * Settings Module - A wrapper for the Settings system
 */
const SettingsModule = () => {
  const { openWindow } = useWindowContext();
  const registeredRef = useRef(false); // Add this ref to track registration

  // Register the settings window type with the window registry
  useEffect(() => {
    // Only register if it hasn't been registered yet
    if (!registeredRef.current) {
      registerSettingsWindow();
      registeredRef.current = true;
      console.log("Settings window registered");
    }
  }, []);

  return (
    <SettingsProvider>
      {/* This is just a container component - it doesn't render anything itself */}
    </SettingsProvider>
  );
};

/**
 * Open the settings window with optional tab selection
 * @param {Object} windowContext - The window context from useWindowContext()
 * @param {string} activeTab - Optional tab to open (llm, accessibility, notifications, display, game)
 */
export const openSettings = (windowContext, activeTab = "llm") => {
  if (!windowContext || !windowContext.openWindow) {
    console.error("Window context not available - cannot open settings");
    return;
  }

  windowContext.openWindow("settings", { activeTab });
};

export default SettingsModule;
