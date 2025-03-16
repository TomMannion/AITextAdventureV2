// src/features/settings/tabs/DisplaySettings.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { win95Border } from "../../../utils/styleUtils";
import Text from "../../../components/common/Text";
import { useSettings } from "../../../contexts/SettingsContext";
import { useThemeContext } from "../../../contexts/ThemeContext";

// Styled components
const SettingsSection = styled.div`
  ${win95Border("outset")}
  padding: 15px;
  margin-bottom: 20px;
  background-color: #f0f0f0;
`;

const SectionTitle = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--win95-border-dark);
  padding-bottom: 5px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Select = styled.select`
  width: 100%;
  padding: 5px;
  ${win95Border("inset")}
  font-family: "ms_sans_serif", sans-serif;
  font-size: 12px;
  background-color: white;
  margin-bottom: 5px;
`;

const OptionContainer = styled.div`
  margin-bottom: 12px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 8px;

  input {
    margin-right: 8px;
  }
`;

const HelperText = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 3px;
  margin-left: 24px;
`;

const SliderContainer = styled.div`
  margin: 15px 0;
`;

const SliderLabel = styled.label`
  display: block;
  margin-bottom: 5px;
`;

const SliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SliderValue = styled.div`
  font-size: 12px;
  width: 60px;
  text-align: center;
  ${win95Border("inset")}
  padding: 2px 5px;
  background-color: white;
`;

const Slider = styled.input`
  flex-grow: 1;
  height: 2px;
  appearance: none;
  background: #c0c0c0;
  outline: none;
  border: 1px solid #808080;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 15px;
    height: 15px;
    background: #c0c0c0;
    cursor: pointer;
    border: 1px solid #000000;
    border-top-color: #ffffff;
    border-left-color: #ffffff;
  }

  &::-moz-range-thumb {
    width: 15px;
    height: 15px;
    background: #c0c0c0;
    cursor: pointer;
    border: 1px solid #000000;
    border-top-color: #ffffff;
    border-left-color: #ffffff;
  }
`;

const ThemePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 15px;
`;

const ThemePreviewItem = styled.div`
  ${win95Border((props) => (props.$selected ? "inset" : "outset"))}
  padding: 5px;
  cursor: pointer;
  background-color: ${(props) => props.$color || "#c0c0c0"};
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &:hover {
    filter: brightness(1.1);
  }

  &::after {
    content: ${(props) => (props.$selected ? '"✓"' : '""')};
    position: absolute;
    bottom: 2px;
    right: 2px;
    font-weight: bold;
  }
`;

/**
 * Display Settings Component
 */
const DisplaySettings = () => {
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings.display);
  const { applyGenreTheme, applySpecificTheme } = useThemeContext();

  // Update local state when settings change
  useEffect(() => {
    setLocalSettings(settings.display);
  }, [settings.display]);

  // Save changes to context
  const saveChanges = () => {
    updateSettings("display", localSettings);
  };

  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setLocalSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle select change
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Apply theme change immediately
    if (name === "theme") {
      if (value === "win95") {
        applySpecificTheme("win95");
      } else if (genreThemes.includes(value)) {
        applyGenreTheme(value);
      }
    }
  };

  // Handle slider change
  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  // Automatically save changes when fields change
  useEffect(() => {
    saveChanges();
  }, [localSettings]);

  // Available themes
  const themes = [
    { value: "win95", label: "Windows 95 (Default)", color: "#008080" },
    { value: "highContrast", label: "High Contrast", color: "#000000" },
  ];

  // Available genre themes (can be selected as desktop background)
  const genreThemes = ["fantasy", "scifi", "horror", "mystery", "western"];

  // Select a theme from the theme grid
  const handleThemeSelect = (themeValue) => {
    setLocalSettings((prev) => ({
      ...prev,
      theme: themeValue,
    }));

    // Apply theme change immediately
    if (themeValue === "win95") {
      applySpecificTheme("win95");
    } else if (genreThemes.includes(themeValue)) {
      applyGenreTheme(themeValue);
    }
  };

  // Get color for a genre theme
  const getGenreColor = (genre) => {
    const colors = {
      fantasy: "#1a472a", // Forest green
      scifi: "#000435", // Deep space blue
      horror: "#350000", // Blood red
      mystery: "#2f2c3d", // Dark purple/blue
      western: "#8b5a2b", // Sandy brown
    };

    return colors[genre] || "#c0c0c0";
  };

  return (
    <div>
      <Text size="16px" bold margin="0 0 15px 0">
        Display Settings
      </Text>

      <SettingsSection>
        <SectionTitle>Theme Selection</SectionTitle>

        <Label>Desktop Theme:</Label>
        <Select
          name="theme"
          value={localSettings.theme}
          onChange={handleSelectChange}
        >
          {themes.map((theme) => (
            <option key={theme.value} value={theme.value}>
              {theme.label}
            </option>
          ))}
        </Select>

        <HelperText style={{ marginLeft: 0 }}>
          Select a theme or background style for the desktop environment
        </HelperText>

        <ThemePreviewGrid>
          {[
            ...themes,
            ...genreThemes.map((genre) => ({
              value: genre,
              label: genre.charAt(0).toUpperCase() + genre.slice(1),
              color: getGenreColor(genre),
            })),
          ].map((theme) => (
            <ThemePreviewItem
              key={theme.value}
              $color={theme.color}
              $selected={localSettings.theme === theme.value}
              onClick={() => handleThemeSelect(theme.value)}
              title={theme.label}
            >
              <Text
                size="10px"
                color={
                  ["highContrast", "horror", "scifi"].includes(theme.value)
                    ? "white"
                    : "black"
                }
                bold
              >
                {theme.label || theme.value}
              </Text>
            </ThemePreviewItem>
          ))}
        </ThemePreviewGrid>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>Visual Effects</SectionTitle>

        <SliderContainer>
          <SliderLabel>CRT Effect Intensity:</SliderLabel>
          <SliderRow>
            <Slider
              type="range"
              name="crtEffectLevel"
              min="0"
              max="1"
              step="0.1"
              value={localSettings.crtEffectLevel}
              onChange={handleSliderChange}
              disabled={settings.accessibility.disableCrtEffect}
            />
            <SliderValue>
              {Math.round(localSettings.crtEffectLevel * 100)}%
            </SliderValue>
          </SliderRow>
          <HelperText>
            {settings.accessibility.disableCrtEffect
              ? "CRT effect is disabled in Accessibility settings"
              : "Adjust the intensity of the CRT screen effect"}
          </HelperText>
        </SliderContainer>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>Interface Options</SectionTitle>

        <OptionContainer>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="showStatusBar"
              checked={localSettings.showStatusBar}
              onChange={handleCheckboxChange}
            />
            Show Status Bar
          </CheckboxLabel>
          <HelperText>
            Display status information at the bottom of windows
          </HelperText>
        </OptionContainer>
      </SettingsSection>
    </div>
  );
};

export default DisplaySettings;
