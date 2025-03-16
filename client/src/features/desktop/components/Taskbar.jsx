import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "../../../components/common/Button";
import Text from "../../../components/common/Text";
import { useWindowContext } from "../../../contexts/WindowContext";
import NotificationIcon from "../../../components/notifications/NotificationIcon";
import { useAudio } from "../../../contexts/AudioContext";
import { placeholderIcons } from "../../../utils/iconUtils";
import MuteButton from "../../../components/common/MuteButton";

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
  padding: 2px;
  margin-left: 2px;
`;

const TaskbarItem = styled.button`
  padding: 0 4px;
  margin-right: 2px;
  height: 22px;
  min-width: 150px;
  max-width: 200px;
  font-size: 11px;
  background-color: #c0c0c0;
  border-top: 1px solid #ffffff;
  border-left: 1px solid #ffffff;
  border-right: 1px solid #808080;
  border-bottom: 1px solid #808080;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: "ms_sans_serif", sans-serif;
  cursor: pointer;

  ${({ $active }) =>
    $active &&
    `
    font-weight: bold;
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    border-right: 1px solid #ffffff;
    border-bottom: 1px solid #ffffff;
  `}
`;

const SystemTray = styled.div`
  display: flex;
  align-items: center;
  margin: 2px 0;
  background-color: #c0c0c0;
  border-top: 1px solid #808080;
  border-left: 1px solid #808080;
  border-right: 1px solid #ffffff;
  border-bottom: 1px solid #ffffff;
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

const Taskbar = ({
  isStartMenuOpen,
  toggleStartMenu,
  windows = [], // Provide default value
  activeWindow,
  onWindowRestore,
  onWindowFocus,
  username,
  onOpenApplication,
}) => {
  const { audioSettings, toggleMute, playUISound } = useAudio();

  // Format current time
  const getFormattedTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;

    return `${hours}:${minutesStr} ${ampm}`;
  };

  // Current time state
  const [time, setTime] = React.useState(getFormattedTime());

  // Update clock every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(getFormattedTime());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <TaskbarContainer>
      <StartButtonContainer>
        <StartButton
          id="start-button"
          onClick={toggleStartMenu}
          $isOpen={isStartMenuOpen}
        >
          <WindowsLogoImg src={placeholderIcons.windows} alt="Windows 95" />
          Start
        </StartButton>
      </StartButtonContainer>

      <TaskbarItems>
        {Array.isArray(windows) &&
          windows
            .filter((window) => window && window.isMinimized)
            .map((window) => (
              <TaskbarItem
                key={window.id}
                onClick={() => onWindowRestore && onWindowRestore(window.id)}
                $active={activeWindow === window.id}
              >
                {window.title}
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
