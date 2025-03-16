// Create a new file: src/features/desktop/components/DesktopContent.jsx
import React from "react";
import { useWindowSystem } from "../../window-system/WindowSystem";
import DesktopBackground from "./DesktopBackground";
import DesktopIcons from "./DesktopIcons";
import Taskbar from "./Taskbar";
import StartMenu from "./StartMenu";
import WindowSystem from "../../window-system/WindowSystem";
import registerApplicationWindows from "../registerWindows";

const DesktopContent = ({ username, isStartMenuOpen, setIsStartMenuOpen }) => {
  // Now we can safely use the window system hooks
  const { openWindow } = useWindowSystem();

  // Register application windows on first render
  React.useEffect(() => {
    registerApplicationWindows();
  }, []);

  // Toggle start menu
  const handleToggleStartMenu = () => {
    setIsStartMenuOpen((prev) => !prev);
  };

  // Handle icon opening
  const handleIconOpen = (iconId) => {
    console.log(`Opening icon: ${iconId}`);
    setIsStartMenuOpen(false);

    switch (iconId) {
      case "text-adventure":
        openWindow("sample-app", { name: username });
        break;
      // Other cases...
      default:
        console.log(`Unknown icon: ${iconId}`);
    }
  };

  // Handle start menu item click
  const handleStartMenuItemClick = (itemId) => {
    console.log(`Menu item clicked: ${itemId}`);
    setIsStartMenuOpen(false);

    switch (itemId) {
      case "text-adventure":
        openWindow("sample-app", { name: username });
        break;
      // Other cases...
      default:
        console.log(`Unknown menu item: ${itemId}`);
    }
  };

  return (
    <>
      <DesktopBackground />
      <DesktopIcons onIconOpen={handleIconOpen} />
      <WindowSystem />
      <Taskbar
        isStartMenuOpen={isStartMenuOpen}
        toggleStartMenu={handleToggleStartMenu}
      />
      <StartMenu
        isOpen={isStartMenuOpen}
        username={username}
        onMenuItemClick={handleStartMenuItemClick}
      />
    </>
  );
};

export default DesktopContent;
