import React, { useState, useEffect } from "react";
import styled from "styled-components";
import DesktopBackground from "./components/DesktopBackground";
import DesktopIcons from "./components/DesktopIcons";
import Taskbar from "./components/Taskbar";
import StartMenu from "./components/StartMenu";
import WindowSystem, { useWindowSystem } from "../window-system/WindowSystem";
import registerApplicationWindows from "./registerWindows";

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

  // Get window system functions - this works now because we're inside the provider
  const { openWindow } = useWindowSystem();

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
        openWindow("text-adventure");
        break;
      case "sample-app":
        openWindow("sample-app", { name: username });
        break;
      case "my-documents":
        // Will be implemented later
        break;
      case "settings":
        // Will be implemented later
        break;
      case "recycle-bin":
        // Will be implemented later
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
        openWindow("text-adventure");
        break;
      case "settings":
        // Will be implemented later
        break;
      case "shutdown":
        // Will be implemented later
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
