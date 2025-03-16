// src/features/desktop/components/Taskbar.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "../../../components/common/Button";
import Text from "../../../components/common/Text";
import { useWindowContext } from "../../../contexts/WindowContext";
import NotificationIcon from "../../../components/notifications/NotificationIcon";
import { useAudio } from "../../../contexts/AudioContext";
import { placeholderIcons } from "../../../utils/iconUtils";
import MuteButton from "../../../components/common/MuteButton";
import { win95Border } from "../../../utils/styleUtils";

const TaskbarContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 28px;
  background-color: var(--win95-button-face, #c0c0c0);
  border-top: 1px solid var(--win95-border-light, #ffffff);
  display: flex;
  align-items: center;
  padding: 2px;
  z-index: 10000; /* Ensure taskbar is above windows */
`;

const StartButtonContainer = styled.div`
  margin: 2px;
  position: relative;
`;

const StartButton = styled.button`
  background-color: #c0c0c0;
  border-top: 1px solid #ffffff;
  border-left: 1px solid #ffffff;
  border-right: 1px solid #808080;
  border-bottom: 1px solid #808080;
  padding: 1px 5px;
  font-family: "ms_sans_serif", sans-serif;
  font-size: 11px;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
  outline: none;

  /* Apply pressed appearance when the start menu is open */
  ${({ $isOpen }) =>
    $isOpen &&
    `
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    border-right: 1px solid #ffffff;
    border-bottom: 1px solid #ffffff;
    background-color: #c0c0c0;
  `}
`;

const TaskbarItems = styled.div`
  display: flex;
  flex: 1;
  padding: 0 2px;
  margin: 0 2px;
  overflow-x: auto;
  overflow-y: hidden;
  gap: 2px;
  height: 24px;

  /* Hide scrollbar */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`;

const TaskbarItem = styled.button`
  padding: 0 4px;
  height: 22px;
  min-width: 120px;
  max-width: 200px;
  font-size: 11px;
  ${win95Border((props) => (props.$active ? "inset" : "outset"))}
  background-color: #c0c0c0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 5px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: "ms_sans_serif", sans-serif;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background-color: ${(props) => (props.$active ? "#c0c0c0" : "#d0d0d0")};
  }
`;

const ItemIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 4px;
`;

const ItemText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: ${(props) => (props.$active ? "bold" : "normal")};
`;

const SystemTray = styled.div`
  display: flex;
  align-items: center;
  margin: 2px 0;
  background-color: #c0c0c0;
  ${win95Border("inset")}
  padding: 0 4px;
  height: 22px;
`;

const SystemTrayItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 4px;
`;

const Clock = styled.div`
  padding: 0 8px;
  height: 22px;
  display: flex;
  align-items: center;
  border-left: 1px solid var(--win95-border-dark, #808080);
  margin-left: 4px;
`;

const WindowsLogoImg = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 4px;
`;

/**
 * Taskbar component - Windows 95 style taskbar with start button, task items, and system tray
 */
const Taskbar = ({ isStartMenuOpen, toggleStartMenu }) => {
  const {
    minimizedWindows,
    visibleWindows,
    activeWindowId,
    restoreWindow,
    focusWindow,
  } = useWindowContext();

  const { playUISound } = useAudio();
  const [time, setTime] = useState(getFormattedTime());

  // Combine all windows to get a complete picture of window state
  const allWindows = [...visibleWindows, ...minimizedWindows];

  // Format current time
  function getFormattedTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;

    return `${hours}:${minutesStr} ${ampm}`;
  }

  // Get icon for window
  const getWindowIcon = (window) => {
    if (!window || !window.icon) {
      return placeholderIcons.windows;
    }

    // Handle different icon formats
    if (typeof window.icon === "string") {
      if (window.icon.startsWith("http") || window.icon.startsWith("/")) {
        return window.icon;
      }

      // If it's an emoji or other string, use default
      return placeholderIcons.windows;
    }

    return placeholderIcons.windows;
  };

  // Handle taskbar item click (restore or focus window)
  const handleTaskbarItemClick = (windowId) => {
    // Check if window is minimized
    const window = allWindows.find((w) => w.id === windowId);

    if (window) {
      if (window.isMinimized) {
        playUISound("maximize");
        restoreWindow(windowId);
      } else {
        focusWindow(windowId);
      }
    }
  };

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getFormattedTime());
    }, 30000); // Every 30 seconds to be more reactive

    return () => clearInterval(timer);
  }, []);

  return (
    <TaskbarContainer>
      <StartButtonContainer>
        <StartButton
          id="start-button"
          onClick={toggleStartMenu}
          $isOpen={isStartMenuOpen}
          aria-label="Start menu"
        >
          <WindowsLogoImg src={placeholderIcons.windows} alt="Windows 95" />
          Start
        </StartButton>
      </StartButtonContainer>

      <TaskbarItems>
        {allWindows.map((window) => (
          <TaskbarItem
            key={window.id}
            onClick={() => handleTaskbarItemClick(window.id)}
            $active={activeWindowId === window.id && !window.isMinimized}
            title={window.title}
          >
            <ItemIcon src={getWindowIcon(window)} alt="" />
            <ItemText
              $active={activeWindowId === window.id && !window.isMinimized}
            >
              {window.title}
            </ItemText>
          </TaskbarItem>
        ))}
      </TaskbarItems>

      <SystemTray>
        <SystemTrayItem>
          <NotificationIcon />
        </SystemTrayItem>

        <SystemTrayItem>
          <MuteButton />
        </SystemTrayItem>

        <Clock>
          <Text size="11px">{time}</Text>
        </Clock>
      </SystemTray>
    </TaskbarContainer>
  );
};

export default Taskbar;
