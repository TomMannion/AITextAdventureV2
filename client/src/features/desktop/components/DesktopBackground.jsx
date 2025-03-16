import React from "react";
import styled from "styled-components";
import { useThemeContext } from "../../../contexts/ThemeContext";

const Background = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--win95-bg);
  overflow: hidden;
`;

/**
 * Desktop background component
 * Renders the desktop wallpaper or background color based on the current theme
 */
const DesktopBackground = () => {
  const { theme } = useThemeContext();

  return (
    <Background>{/* We could add wallpaper support here later */}</Background>
  );
};

export default DesktopBackground;
