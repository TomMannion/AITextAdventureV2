// src/features/settings/tabs/DisplaySettings.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
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

// Desktop preview container with inline styles
const DesktopPreview = styled.div`
  width: 100%;
  height: 80px;
  background-color: ${props => props.$bgColor || "#008080"};
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// Window preview with inline styles
const PreviewWindow = styled.div`
  width: 100%;
  height: 120px;
  position: relative;
  margin-bottom: 10px;
  overflow: hidden;
  border: 2px solid #000000;
  box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.3);
  background-color: ${props => props.$bgColor || "#c0c0c0"};
`;

// Window header with inline styles
const ThemePreviewHeader = styled.div`
  background-color: ${props => props.$bgColor || "#000080"};
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
  background-color: ${props => props.$bgColor || "#c0c0c0"};
  color: ${props => props.$textColor || "#000000"};
`;

// CRT effect overlay with inline styles for preview
const CRTOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: ${props => props.$intensity || 0};
  display: ${props => (props.$disabled || props.$intensity <= 0) ? 'none' : 'block'};
  
  /* Scanlines */
  background: ${props => props.$intensity > 0 ? `
    linear-gradient(
      rgba(18, 16, 16, 0) 50%, 
      rgba(0, 0, 0, ${0.25 * props.$intensity}) 50%
    )
  ` : 'none'};
  background-size: 100% 4px;
  
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
      rgba(0, 0, 0, ${props => 0.2 * (props.$intensity || 0)}) 100%
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
 * Display Settings Component with localized preview
 */
const DisplaySettings = () => {
  const { settings, updateSettings } = useSettings();
  const { 
    applySpecificTheme, 
    applyGenreTheme, 
    forceThemeReapplication,
    currentTheme,
    currentGenre,
    crtEffectLevel,
    updateCrtEffectLevel,
    theme: activeTheme, // Get the active theme object
  } = useThemeContext();
  
  // Local state with original values for potential reset
  const [originalSettings, setOriginalSettings] = useState(settings.display);
  const [localSettings, setLocalSettings] = useState(settings.display);
  
  // State for preview mode
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  
  // State to track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Use a ref to track the currently selected theme (helps with async updates)
  const selectedThemeRef = useRef(localSettings.theme);
  const selectedCrtLevelRef = useRef(localSettings.crtEffectLevel);

  // Preview theme colors
  const [previewColors, setPreviewColors] = useState({
    desktop: "#008080",
    window: "#c0c0c0",
    windowHeader: "#000080",
    text: "#000000",
    textLight: "#ffffff",
    crtEffectLevel: 0.5,
  });

  // Define the available genre themes
  const genreThemes = ["fantasy", "scifi", "horror", "mystery", "western"];
  
  // Update local state when settings change from context
  useEffect(() => {
    setLocalSettings(settings.display);
    setOriginalSettings(settings.display);
    selectedThemeRef.current = settings.display.theme;
    selectedCrtLevelRef.current = settings.display.crtEffectLevel;
    setHasUnsavedChanges(false);
    
    // Update preview colors based on active theme
    updatePreviewColorsFromTheme(activeTheme);
  }, [settings.display, activeTheme]);

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

  // Update preview colors based on a theme object
  const updatePreviewColorsFromTheme = useCallback((theme) => {
    setPreviewColors({
      desktop: theme?.desktop || "#008080",
      window: theme?.window || "#c0c0c0",
      windowHeader: theme?.windowHeader || "#000080",
      text: theme?.text || "#000000",
      textLight: theme?.textLight || "#ffffff",
      crtEffectLevel: theme?.crtEffectLevel || 0.5,
    });
  }, []);

  // Get theme colors for a specific theme
  const getThemeColors = useCallback((themeName) => {
    // For Windows 95, return base theme
    if (themeName === "win95") {
      return {
        desktop: "#008080",
        window: "#c0c0c0",
        windowHeader: "#000080",
        text: "#000000",
        textLight: "#ffffff",
        crtEffectLevel: selectedCrtLevelRef.current,
      };
    }
    
    // For genre themes
    const genreThemeColors = {
      fantasy: {
        desktop: "#1a472a",
        window: "#c0c0c0",
        windowHeader: "#5d0000",
        text: "#000000",
        textLight: "#ffffff",
        crtEffectLevel: selectedCrtLevelRef.current,
      },
      scifi: {
        desktop: "#000435",
        window: "#c0c0c0",
        windowHeader: "#0c64c0",
        text: "#000000",
        textLight: "#ffffff",
        crtEffectLevel: selectedCrtLevelRef.current,
      },
      horror: {
        desktop: "#121212",
        window: "#c0c0c0",
        windowHeader: "#350000",
        text: "#000000",
        textLight: "#ffffff",
        crtEffectLevel: selectedCrtLevelRef.current,
      },
      mystery: {
        desktop: "#2f2c3d",
        window: "#c0c0c0",
        windowHeader: "#4b2b45",
        text: "#000000",
        textLight: "#ffffff",
        crtEffectLevel: selectedCrtLevelRef.current,
      },
      western: {
        desktop: "#8b5a2b",
        window: "#c0c0c0",
        windowHeader: "#542900",
        text: "#000000",
        textLight: "#ffffff",
        crtEffectLevel: selectedCrtLevelRef.current,
      },
    };
    
    return genreThemeColors[themeName] || genreThemeColors.win95;
  }, []);

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
    
    // Store the selected theme in the ref for immediate access
    if (name === 'theme') {
      selectedThemeRef.current = value;
      
      // Update preview colors but don't apply to the app
      const themeColors = getThemeColors(value);
      setPreviewColors(themeColors);
    }
    
    setHasUnsavedChanges(true);
  }, [getThemeColors]);

  // Handle slider change
  const handleSliderChange = useCallback((e) => {
    const { name, value } = e.target;
    const parsedValue = parseFloat(value);

    setLocalSettings(prev => ({
      ...prev,
      [name]: parsedValue
    }));
    
    // Store the selected CRT level in the ref for immediate access
    if (name === 'crtEffectLevel') {
      selectedCrtLevelRef.current = parsedValue;
      
      // Update the preview CRT effect level
      setPreviewColors(prev => ({
        ...prev,
        crtEffectLevel: parsedValue,
      }));
    }
    
    setHasUnsavedChanges(true);
  }, []);

  // Select a theme from the theme grid (for preview only)
  const handleThemeSelect = useCallback((themeValue) => {
    // Update local state
    setLocalSettings(prev => ({
      ...prev,
      theme: themeValue
    }));
    
    // Store the selected theme in the ref
    selectedThemeRef.current = themeValue;
    
    // Update preview colors but don't apply to app
    const themeColors = getThemeColors(themeValue);
    setPreviewColors(themeColors);
    
    setHasUnsavedChanges(true);
  }, [getThemeColors]);

  // Apply settings to preview box only - doesn't change app theme
  const handlePreview = useCallback(() => {
    setIsPreviewActive(true);
    
    // Get colors for the selected theme
    const themeColors = getThemeColors(selectedThemeRef.current);
    
    // Update preview colors with current CRT level
    setPreviewColors({
      ...themeColors,
      crtEffectLevel: selectedCrtLevelRef.current,
    });
  }, [getThemeColors]);

  // Save changes and apply them to the app
  const handleSave = useCallback(() => {
    // Use the ref value to ensure we have the latest theme selection
    const themeToApply = selectedThemeRef.current;
    const crtLevelToApply = selectedCrtLevelRef.current;
    
    // Save settings to context
    updateSettings("display", {
      ...localSettings,
      theme: themeToApply,
      crtEffectLevel: crtLevelToApply
    });
    
    // Apply theme and effects permanently
    if (themeToApply === "win95") {
      applySpecificTheme("win95");
    } else if (genreThemes.includes(themeToApply)) {
      applyGenreTheme(themeToApply);
    }
    
    // Apply CRT effect level
    updateCrtEffectLevel(crtLevelToApply);
    
    // Force reapplication to ensure changes take effect
    setTimeout(() => {
      forceThemeReapplication();
    }, 50);
    
    setIsPreviewActive(false);
    setHasUnsavedChanges(false);
  }, [localSettings, updateSettings, applySpecificTheme, applyGenreTheme, updateCrtEffectLevel, forceThemeReapplication, genreThemes]);

  // Reset to original settings
  const handleCancel = useCallback(() => {
    // Reset local state and refs
    setLocalSettings(originalSettings);
    selectedThemeRef.current = originalSettings.theme;
    selectedCrtLevelRef.current = originalSettings.crtEffectLevel;
    
    // Reset preview to current active theme
    updatePreviewColorsFromTheme(activeTheme);
    
    setHasUnsavedChanges(false);
    setIsPreviewActive(false);
  }, [originalSettings, activeTheme, updatePreviewColorsFromTheme]);

  // Available themes with name and color
  const availableThemes = [
    { value: "win95", label: "Windows 95", color: getGenreColor("win95") },
    ...genreThemes.map(genre => ({
      value: genre,
      label: genre.charAt(0).toUpperCase() + genre.slice(1),
      color: getGenreColor(genre)
    }))
  ];

  // Calculate the effective theme name for display
  const effectiveTheme = isPreviewActive ? selectedThemeRef.current : (currentTheme === "win95" && currentGenre ? currentGenre : currentTheme);

  // Determine if CRT effect is disabled from accessibility settings
  const isCrtDisabled = settings.accessibility.disableCrtEffect;

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
              disabled={isCrtDisabled}
            />
            <SliderValue>
              {Math.round(localSettings.crtEffectLevel * 100)}%
            </SliderValue>
          </SliderRow>
          <HelperText>
            {isCrtDisabled
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

      {/* Preview section - enhanced with local styling */}
      <SettingsSection>
        <SectionTitle>Preview</SectionTitle>
        
        <PreviewSection>
          <PreviewTitle>Theme Preview</PreviewTitle>
          
          {/* Desktop background preview with inline styles */}
          <DesktopPreview $bgColor={isPreviewActive ? previewColors.desktop : undefined}>
            <Text color="white" bold textShadow="1px 1px 2px rgba(0,0,0,0.7)">
              Desktop Background
            </Text>
          </DesktopPreview>
          
          {/* Window preview with inline styles */}
          <PreviewWindow $bgColor={isPreviewActive ? previewColors.window : undefined}>
            <ThemePreviewHeader $bgColor={isPreviewActive ? previewColors.windowHeader : undefined}>
              <img 
                src={placeholderIcons.windows} 
                alt="Window" 
                style={{ width: "16px", height: "16px", marginRight: "5px" }} 
              />
              Sample Window
            </ThemePreviewHeader>
            
            <ThemePreviewContent 
              $bgColor={isPreviewActive ? previewColors.window : undefined}
              $textColor={isPreviewActive ? previewColors.text : undefined}
            >
              <Text>This is how your windows will appear with the selected theme.</Text>
              <Text>Try adjusting the CRT effect to see how it changes the appearance.</Text>
              
              {/* CRT Effect layer with inline styling */}
              <CRTOverlay 
                $intensity={isPreviewActive ? previewColors.crtEffectLevel : crtEffectLevel} 
                $disabled={isCrtDisabled}
              />
            </ThemePreviewContent>
          </PreviewWindow>
          
          <Text size="11px" color="#666">
            Theme: {isPreviewActive ? selectedThemeRef.current : effectiveTheme}
            {" | "}
            CRT Effect: {isCrtDisabled ? "Disabled" : 
              (isPreviewActive ? 
                `${Math.round(previewColors.crtEffectLevel * 100)}%` : 
                `${Math.round(crtEffectLevel * 100)}%`)}
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