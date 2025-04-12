// src/features/settings/tabs/DisplaySettings.jsx
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { win95Border } from "../../../utils/styleUtils";
import Text from "../../../components/common/Text";
import Button from "../../../components/common/Button";
import { useSettings } from "../../../contexts/SettingsContext";
import { useThemeContext } from "../../../contexts/ThemeContext";
import { placeholderIcons } from "../../../utils/iconUtils";

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

const NotificationPreview = styled.div`
  ${win95Border("outset")}
  margin-top: 20px;
  background-color: #c0c0c0;
  width: 100%;
  max-width: 300px;
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #000080;
  color: white;
  padding: 3px 5px;
  font-weight: bold;
  font-size: 12px;
`;

const PreviewIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 8px;
`;

const PreviewHeaderContent = styled.div`
  display: flex;
  align-items: center;
`;

const PreviewContent = styled.div`
  padding: 8px;
  font-size: 12px;
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

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
`;

const PreviewButton = styled(Button)`
  margin-top: 10px;
`;

const PreviewSection = styled.div`
  ${win95Border("inset")}
  padding: 15px;
  margin-top: 15px;
  background-color: var(--win95-window-bg);
`;

const PreviewTitle = styled.h3`
  margin-bottom: 10px;
  font-size: 14px;
`;

const PreviewWindow = styled.div`
  ${win95Border("outset")}
  width: 100%;
  height: 120px;
  background-color: var(--win95-window-bg);
  position: relative;
  margin-bottom: 10px;
  overflow: hidden;
`;

// Renamed from PreviewHeader to ThemePreviewHeader to avoid duplication
const ThemePreviewHeader = styled.div`
  background-color: var(--win95-window-header);
  color: white;
  padding: 3px 5px;
  font-weight: bold;
  display: flex;
  align-items: center;
`;

const ThemePreviewContent = styled.div`
  padding: 10px;
  position: relative;
  height: calc(100% - 24px);
  overflow: hidden;
`;

// CRT effect overlay for preview
const CRTOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: ${props => props.$intensity || 0.5};
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%, 
    rgba(0, 0, 0, 0.25) 50%
  );
  background-size: 100% 4px;
  z-index: 2;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at center,
      rgba(18, 16, 16, 0) 0%,
      rgba(0, 0, 0, 0.1) 100%
    );
    z-index: 2;
  }
  
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      to right,
      rgba(255, 0, 0, 0.03),
      rgba(0, 255, 0, 0.03),
      rgba(0, 0, 255, 0.03)
    );
    z-index: 3;
  }
`;

/**
 * Display Settings Component
 */
const DisplaySettings = () => {
  const { settings, updateSettings } = useSettings();
  const { 
    applySpecificTheme, 
    applyGenreTheme, 
    forceThemeReapplication,
    currentTheme,
    crtEffectLevel,
    updateCrtEffectLevel
  } = useThemeContext();
  
  // Local state with original values for potential reset
  const [originalSettings, setOriginalSettings] = useState(settings.display);
  const [localSettings, setLocalSettings] = useState(settings.display);
  
  // State for preview mode
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  
  // State to track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Define the available genre themes
  const genreThemes = ["fantasy", "scifi", "horror", "mystery", "western"];
  
  // Update local state when settings change from context
  useEffect(() => {
    setLocalSettings(settings.display);
    setOriginalSettings(settings.display);
    setHasUnsavedChanges(false);
  }, [settings.display]);

  // Handle checkbox change
  const handleCheckboxChange = useCallback((e) => {
    const { name, checked } = e.target;

    setLocalSettings(prev => ({
      ...prev,
      [name]: checked
    }));
    
    setHasUnsavedChanges(true);
  }, []);

  // Handle select change
  const handleSelectChange = useCallback((e) => {
    const { name, value } = e.target;

    setLocalSettings(prev => ({
      ...prev,
      [name]: value
    }));
    
    setHasUnsavedChanges(true);
  }, []);

  // Handle slider change
  const handleSliderChange = useCallback((e) => {
    const { name, value } = e.target;
    const parsedValue = parseFloat(value);

    setLocalSettings(prev => ({
      ...prev,
      [name]: parsedValue
    }));
    
    setHasUnsavedChanges(true);
    
    // If in preview mode, apply CRT effect immediately
    if (isPreviewActive && name === 'crtEffectLevel') {
      updateCrtEffectLevel(parsedValue);
    }
  }, [isPreviewActive, updateCrtEffectLevel]);

  // Apply theme based on the selected theme value
  const applyTheme = useCallback((themeValue) => {
    console.log(`Applying theme: ${themeValue}`);

    // Handle specific themes - removed highContrast from here
    if (themeValue === "win95") {
      applySpecificTheme("win95");
    }
    // Handle genre themes
    else if (genreThemes.includes(themeValue)) {
      applyGenreTheme(themeValue);
    } else {
      // Default to win95 if theme is unknown
      console.warn(`Unknown theme value: ${themeValue}, defaulting to win95`);
      applySpecificTheme("win95");
    }
  }, [applySpecificTheme, applyGenreTheme, genreThemes]);

  // Select a theme from the theme grid
  const handleThemeSelect = useCallback((themeValue) => {
    setLocalSettings(prev => ({
      ...prev,
      theme: themeValue
    }));
    
    setHasUnsavedChanges(true);
    
    // If in preview mode, apply theme immediately
    if (isPreviewActive) {
      applyTheme(themeValue);
    }
  }, [applyTheme, isPreviewActive]);

  // Apply settings to preview without saving
  const handlePreview = useCallback(() => {
    setIsPreviewActive(true);
    
    // Apply theme
    applyTheme(localSettings.theme);
    
    // Apply CRT effect
    updateCrtEffectLevel(localSettings.crtEffectLevel);
    
    // Force reapplication of theme to ensure all settings take effect
    forceThemeReapplication();
  }, [localSettings, applyTheme, updateCrtEffectLevel, forceThemeReapplication]);

  // Save changes to context
  const handleSave = useCallback(() => {
    updateSettings("display", localSettings);
    setIsPreviewActive(false);
    setHasUnsavedChanges(false);
    
    // Apply theme and effects permanently
    applyTheme(localSettings.theme);
    updateCrtEffectLevel(localSettings.crtEffectLevel);
    forceThemeReapplication();
  }, [localSettings, updateSettings, applyTheme, updateCrtEffectLevel, forceThemeReapplication]);

  // Reset to original settings
  const handleCancel = useCallback(() => {
    setLocalSettings(originalSettings);
    setHasUnsavedChanges(false);
    setIsPreviewActive(false);
    
    // Reapply original theme and effects
    applyTheme(originalSettings.theme);
    updateCrtEffectLevel(originalSettings.crtEffectLevel);
    forceThemeReapplication();
  }, [originalSettings, applyTheme, updateCrtEffectLevel, forceThemeReapplication]);

  // Get color for a genre theme
  const getGenreColor = useCallback((genre) => {
    const colors = {
      fantasy: "#1a472a", // Forest green
      scifi: "#000435", // Deep space blue
      horror: "#350000", // Blood red
      mystery: "#2f2c3d", // Dark purple/blue
      western: "#8b5a2b", // Sandy brown
      win95: "#008080", // Windows 95 teal
    };

    return colors[genre] || "#c0c0c0";
  }, []);

  // Available themes with name and color - removed highContrast
  const availableThemes = [
    { value: "win95", label: "Windows 95", color: getGenreColor("win95") },
    ...genreThemes.map(genre => ({
      value: genre,
      label: genre.charAt(0).toUpperCase() + genre.slice(1),
      color: getGenreColor(genre)
    }))
  ];

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
          {availableThemes.map(theme => (
            <option key={theme.value} value={theme.value}>
              {theme.label}
            </option>
          ))}
        </Select>

        <HelperText style={{ marginLeft: 0 }}>
          Select a theme or background style for the desktop environment
        </HelperText>

        <ThemePreviewGrid>
          {availableThemes.map(theme => (
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
                  ["horror", "scifi"].includes(theme.value)
                    ? "white"
                    : "black"
                }
                bold
              >
                {theme.label}
              </Text>
            </ThemePreviewItem>
          ))}
        </ThemePreviewGrid>

        {/* Added note about High Contrast mode */}
        <Text size="11px" color="#666" margin="10px 0 0 0">
          Note: High Contrast Mode has been moved to the Accessibility tab
        </Text>
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

      {/* Preview section */}
      <SettingsSection>
        <SectionTitle>Preview</SectionTitle>
        
        <PreviewSection>
          <PreviewTitle>Current Theme Preview</PreviewTitle>
          
          <PreviewWindow>
            {/* Using ThemePreviewHeader instead of PreviewHeader here */}
            <ThemePreviewHeader>
              <img 
                src={placeholderIcons.windows} 
                alt="Window" 
                style={{ width: "16px", height: "16px", marginRight: "5px" }} 
              />
              Sample Window
            </ThemePreviewHeader>
            {/* Using ThemePreviewContent instead of PreviewContent here */}
            <ThemePreviewContent>
              <Text>This is how your windows will appear with the selected theme.</Text>
              <Text>Try adjusting the CRT effect to see how it changes the appearance.</Text>
              
              {/* CRT Effect layer */}
              {!settings.accessibility.disableCrtEffect && (
                <CRTOverlay $intensity={isPreviewActive ? localSettings.crtEffectLevel : crtEffectLevel} />
              )}
            </ThemePreviewContent>
          </PreviewWindow>
          
          <Text size="11px" color="#666">
            Theme: {isPreviewActive ? localSettings.theme : currentTheme}
            {" | "}
            CRT Effect: {isPreviewActive ? 
              `${Math.round(localSettings.crtEffectLevel * 100)}%` : 
              `${Math.round(crtEffectLevel * 100)}%`}
          </Text>
        </PreviewSection>
        
        <ActionButtons>
          <PreviewButton 
            onClick={handlePreview}
            disabled={!hasUnsavedChanges}
          >
            Preview Changes
          </PreviewButton>
          
          <Button 
            onClick={handleSave}
            primary
            disabled={!hasUnsavedChanges}
          >
            Save Changes
          </Button>
          
          <Button 
            onClick={handleCancel}
            disabled={!hasUnsavedChanges}
          >
            Cancel
          </Button>
        </ActionButtons>
      </SettingsSection>
    </div>
  );
};

export default DisplaySettings;