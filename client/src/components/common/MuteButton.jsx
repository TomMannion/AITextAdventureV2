// src/components/common/MuteButton.jsx
import React, { useState } from "react";
import styled from "styled-components";
import { useAudio } from "../../contexts/AudioContext";
import { placeholderIcons } from "../../utils/iconUtils";
import Win95Tooltip from "../notifications/elements/Win95Tooltip";

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
`;

const IconImage = styled.img`
  width: 16px;
  height: 16px;
`;

/**
 * Mute button component for toggling audio
 */
const MuteButton = () => {
  const { audioSettings, toggleMute } = useAudio();
  const [showTooltip, setShowTooltip] = useState(false);

  // Check if audio is currently muted
  const isMuted = audioSettings?.masterVolume <= 0;

  // Handle click to toggle mute state
  const handleClick = () => {
    toggleMute();
  };

  return (
    <ButtonContainer
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <IconImage
        src={isMuted ? placeholderIcons.noSound : placeholderIcons.sound}
        alt={isMuted ? "Unmute" : "Mute"}
      />

      <Win95Tooltip show={showTooltip} position="top">
        {isMuted ? "Unmute sounds (M)" : "Mute all sounds (M)"}
      </Win95Tooltip>
    </ButtonContainer>
  );
};

export default MuteButton;
