// src/features/desktop/Desktop.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import DesktopBackground from "./components/DesktopBackground";
import DesktopIcons from "./components/DesktopIcons";
import Taskbar from "./components/Taskbar";
import StartMenu from "./components/StartMenu";
import WindowSystem, { useWindowSystem } from "../window-system/WindowSystem";
import registerApplicationWindows from "./registerWindows";
import { openSettings } from "../settings/SettingsModule";
import { placeholderIcons } from "../../utils/iconUtils";

const DesktopContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
`;

/**
 * Desktop Content component
 * This is separated from the Desktop component to access the context providers properly
 */
const DesktopContent = ({ username = "User" }) => {
  // State for start menu
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  // Get window system functions
  const windowContext = useWindowSystem();
  const { openWindow } = windowContext;

  // Register application windows on first render
  // Use a ref to ensure it only runs once
  const registeredRef = React.useRef(false);

  useEffect(() => {
    if (!registeredRef.current) {
      registerApplicationWindows();
      registeredRef.current = true;
    }
  }, []);

  // Toggle start menu
  const handleToggleStartMenu = () => {
    setIsStartMenuOpen((prev) => !prev);
  };

  // Handle icon opening
  const handleIconOpen = (iconId) => {
    // Handle icon open based on ID
    console.log(`Opening icon: ${iconId}`);

    // Close start menu when opening an icon
    setIsStartMenuOpen(false);

    // Open the associated application
    switch (iconId) {
      case "text-adventure":
        openWindow("text-adventure", {
          icon: placeholderIcons.adventure,
        });
        break;
      case "settings":
        // Open the settings window using our helper
        openSettings(windowContext);
        break;
      case "my-documents":
        openWindow("my-documents", {
          icon: placeholderIcons.myDocuments,
        });
        break;
      case "recycle-bin":
        // For now just show a notification about not being implemented
        const { showInfo } = windowContext;
        if (showInfo) {
          showInfo("The Recycle Bin feature is not yet implemented.", {
            title: "Recycle Bin",
            icon: placeholderIcons.recycle,
            timeout: 3000,
          });
        }
        break;
      case "user-profile":
        openWindow("user-profile", {
          icon: placeholderIcons.user,
        });
        break;
      default:
        console.log(`Unknown icon: ${iconId}`);
    }
  };

  // Handle start menu item click
  const handleStartMenuItemClick = (itemId) => {
    // Handle menu item click based on ID
    console.log(`Menu item clicked: ${itemId}`);

    // Close start menu after clicking an item
    setIsStartMenuOpen(false);

    // Open the associated application
    switch (itemId) {
      case "text-adventure":
        openWindow("text-adventure", {
          icon: placeholderIcons.adventure,
        });
        break;
      case "settings":
        // Open the settings window using our helper
        openSettings(windowContext);
        break;
      case "user-profile":
        openWindow("user-profile", {
          icon: placeholderIcons.user,
        });
        break;
      case "my-documents":
        openWindow("my-documents", {
          icon: placeholderIcons.myDocuments,
        });
        break;
      case "notepad":
        // For now just show a notification about not being implemented
        const { showInfo } = windowContext;
        if (showInfo) {
          showInfo("Notepad is not yet implemented.", {
            title: "Notepad",
            icon: placeholderIcons.notepad,
            timeout: 3000,
          });
        }
        break;
      case "shutdown":
        // Will be implemented by the auth context in the StartMenu component
        break;
      default:
        console.log(`Unknown menu item: ${itemId}`);
    }
  };

  // Handle clicks outside of start menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the start menu and start button
      if (
        isStartMenuOpen &&
        !event.target.closest("#start-menu") &&
        !event.target.closest('button[aria-label="Start menu"]')
      ) {
        setIsStartMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isStartMenuOpen]);

  return (
    <DesktopContainer>
      {/* Desktop Background */}
      <DesktopBackground />

      {/* Desktop Icons */}
      <DesktopIcons onIconOpen={handleIconOpen} />

      {/* Window System */}
      <WindowSystem />

      {/* Taskbar */}
      <Taskbar
        isStartMenuOpen={isStartMenuOpen}
        toggleStartMenu={handleToggleStartMenu}
      />

      {/* Start Menu */}
      <StartMenu
        isOpen={isStartMenuOpen}
        username={username}
        onMenuItemClick={handleStartMenuItemClick}
      />
    </DesktopContainer>
  );
};

export default DesktopContent;
