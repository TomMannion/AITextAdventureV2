import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { win95Border } from "../../../utils/styleUtils";
import Text from "../../../components/common/Text";
import Button from "../../../components/common/Button";
import { useSettings } from "../../../contexts/SettingsContext";
import { useThemeContext } from "../../../contexts/ThemeContext";
import { getTheme, getAvailableThemes, getThemePreview } from "../../../styles/themes";
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
  margin-left: ${props => props.$noIndent ? "0" : "24px"};
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

// Desktop preview container
const DesktopPreview = styled.div`
  width: 100%;
  height: 80px;
  background-color: ${props => props.$bgColor || "#008080"};
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// Window preview
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

// Window header
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

// CRT effect overlay for preview
const CRTPreviewOverlay = styled.div`
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
`;

/**
 * Display Settings Component
 */
const DisplaySettings = () => {
  const { settings, updateSettings } = useSettings();
  const { 
    currentThemeId, 
    applyTheme, 
    crtEffect,
    updateCrtEffect
  } = useThemeContext();
  
  // Get all available themes
  const availableThemes = getAvailableThemes();
  
  // Local state with original values
  const [originalSettings, setOriginalSettings] = useState({
    themeId: currentThemeId,
    crtIntensity: crtEffect.intensity,
    crtEnabled: crtEffect.enabled,
    showStatusBar: settings.display.showStatusBar
  });
  
  // Current settings for editing
  const [localSettings, setLocalSettings] = useState({
    themeId: currentThemeId,
    crtIntensity: crtEffect.intensity,
    crtEnabled: crtEffect.enabled,
    showStatusBar: settings.display.showStatusBar
  });
  
  // Preview mode
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  
  // Preview colors based on selected theme
  const [previewColors, setPreviewColors] = useState(() => {
    const theme = getTheme(currentThemeId);
    return {
      desktop: theme.colors.desktop,
      window: theme.colors.window,
      windowHeader: theme.colors.windowHeader,
      text: theme.colors.text,
      textLight: theme.colors.textLight
    };
  });
  
  // Has unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Track CRT disabled from accessibility settings
  const isCrtDisabled = settings.accessibility.disableCrtEffect;
  
  // Update local state when settings change
  useEffect(() => {
    // Only update if not already editing
    if (!hasUnsavedChanges) {
      setLocalSettings({
        themeId: currentThemeId,
        crtIntensity: crtEffect.intensity,
        crtEnabled: crtEffect.enabled,
        showStatusBar: settings.display.showStatusBar
      });
      
      setOriginalSettings({
        themeId: currentThemeId,
        crtIntensity: crtEffect.intensity,
        crtEnabled: crtEffect.enabled,
        showStatusBar: settings.display.showStatusBar
      });
      
      // Update preview colors
      const theme = getTheme(currentThemeId);
      setPreviewColors({
        desktop: theme.colors.desktop,
        window: theme.colors.window,
        windowHeader: theme.colors.windowHeader,
        text: theme.colors.text,
        textLight: theme.colors.textLight
      });
    }
  }, [currentThemeId, crtEffect, settings.display.showStatusBar, hasUnsavedChanges]);
  
  // Helper to get the background color for a theme
  const getThemeColor = useCallback((themeId) => {
    const theme = getTheme(themeId);
    return theme.colors.desktop;
  }, []);
  
  // Handle theme selection
  const handleThemeSelect = useCallback((themeId) => {
    setLocalSettings(prev => ({
      ...prev,
      themeId
    }));
    
    // Update preview colors
    const previewTheme = getTheme(themeId);
    setPreviewColors({
      desktop: previewTheme.colors.desktop,
      window: previewTheme.colors.window,
      windowHeader: previewTheme.colors.windowHeader,
      text: previewTheme.colors.text,
      textLight: previewTheme.colors.textLight
    });
    
    setHasUnsavedChanges(true);
  }, []);
  
  // Handle CRT intensity change
  const handleCrtIntensityChange = useCallback((e) => {
    const intensity = parseFloat(e.target.value);
    
    setLocalSettings(prev => ({
      ...prev,
      crtIntensity: intensity
    }));
    
    setHasUnsavedChanges(true);
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
  
  // Apply preview
  const handlePreview = useCallback(() => {
    setIsPreviewActive(true);
    
    // Update preview colors with current theme
    const previewTheme = getTheme(localSettings.themeId);
    
    setPreviewColors({
      desktop: previewTheme.colors.desktop,
      window: previewTheme.colors.window,
      windowHeader: previewTheme.colors.windowHeader,
      text: previewTheme.colors.text,
      textLight: previewTheme.colors.textLight
    });
  }, [localSettings.themeId]);
  
  // Save changes
  const handleSave = useCallback(() => {
    // Apply theme
    applyTheme(localSettings.themeId);
    
    // Update CRT effect
    updateCrtEffect({
      intensity: localSettings.crtIntensity,
      enabled: localSettings.crtEnabled
    });
    
    // Update settings context
    updateSettings("display", {
      ...settings.display,
      theme: localSettings.themeId,
      crtEffectLevel: localSettings.crtIntensity,
      showStatusBar: localSettings.showStatusBar
    });
    
    // Reset state
    setIsPreviewActive(false);
    setHasUnsavedChanges(false);
    
    // Update original settings
    setOriginalSettings({
      themeId: localSettings.themeId,
      crtIntensity: localSettings.crtIntensity,
      crtEnabled: localSettings.crtEnabled,
      showStatusBar: localSettings.showStatusBar
    });
  }, [localSettings, applyTheme, updateCrtEffect, updateSettings, settings.display]);
  
  // Cancel changes
  const handleCancel = useCallback(() => {
    // Reset to original settings
    setLocalSettings(originalSettings);
    
    // Update preview colors with original theme
    const originalTheme = getTheme(originalSettings.themeId);
    setPreviewColors({
      desktop: originalTheme.colors.desktop,
      window: originalTheme.colors.window,
      windowHeader: originalTheme.colors.windowHeader,
      text: originalTheme.colors.text,
      textLight: originalTheme.colors.textLight
    });
    
    setIsPreviewActive(false);
    setHasUnsavedChanges(false);
  }, [originalSettings]);

  return (
    <div>
      <Text size="16px" bold margin="0 0 15px 0">
        Display Settings
      </Text>

      <SettingsSection>
        <SectionTitle>Theme Selection</SectionTitle>

        <Label>Desktop Theme:</Label>
        <Select
          name="themeId"
          value={localSettings.themeId}
          onChange={(e) => handleThemeSelect(e.target.value)}
        >
          {availableThemes.map(theme => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </Select>

        <HelperText $noIndent>
          Select a theme or background style for the desktop environment
        </HelperText>

        <ThemePreviewGrid>
          {availableThemes.map(theme => (
            <ThemePreviewItem
              key={theme.id}
              $color={getThemeColor(theme.id)}
              $selected={localSettings.themeId === theme.id}
              onClick={() => handleThemeSelect(theme.id)}
              title={theme.name}
            >
              <Text
                size="10px"
                color={
                  theme.id === 'horror' || theme.id === 'scifi'
                    ? "white"
                    : "black"
                }
                bold
              >
                {theme.name}
              </Text>
            </ThemePreviewItem>
          ))}
        </ThemePreviewGrid>

        <Text size="11px" color="#666" margin="10px 0 0 0">
          Note: High Contrast Mode has been moved to the Accessibility tab
        </Text>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>Visual Effects</SectionTitle>

        <OptionContainer>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="crtEnabled"
              checked={localSettings.crtEnabled}
              onChange={handleCheckboxChange}
              disabled={isCrtDisabled}
            />
            Enable CRT Screen Effect
          </CheckboxLabel>
          <HelperText>
            {isCrtDisabled
              ? "CRT effect is disabled in Accessibility settings"
              : "Apply a retro CRT screen effect to the interface"}
          </HelperText>
        </OptionContainer>

        <SliderContainer>
          <SliderLabel>CRT Effect Intensity:</SliderLabel>
          <SliderRow>
            <Slider
              type="range"
              name="crtIntensity"
              min="0"
              max="1"
              step="0.1"
              value={localSettings.crtIntensity}
              onChange={handleCrtIntensityChange}
              disabled={isCrtDisabled || !localSettings.crtEnabled}
            />
            <SliderValue>
              {Math.round(localSettings.crtIntensity * 100)}%
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

      {/* Preview section */}
      <SettingsSection>
        <SectionTitle>Preview</SectionTitle>
        
        <PreviewSection>
          <PreviewTitle>Theme Preview</PreviewTitle>
          
          {/* Desktop background preview */}
          <DesktopPreview $bgColor={isPreviewActive ? previewColors.desktop : undefined}>
            <Text color="white" bold textShadow="1px 1px 2px rgba(0,0,0,0.7)">
              Desktop Background
            </Text>
          </DesktopPreview>
          
          {/* Window preview */}
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
              
              {/* CRT Effect preview */}
              {(isPreviewActive || !isCrtDisabled) && (
                <CRTPreviewOverlay 
                  $intensity={isPreviewActive 
                    ? (localSettings.crtEnabled ? localSettings.crtIntensity : 0) 
                    : (crtEffect.enabled ? crtEffect.intensity : 0)
                  } 
                  $disabled={isCrtDisabled || (isPreviewActive && !localSettings.crtEnabled)}
                />
              )}
            </ThemePreviewContent>
          </PreviewWindow>
          
          <Text size="11px" color="#666">
            Theme: {isPreviewActive ? localSettings.themeId : currentThemeId}
            {" | "}
            CRT Effect: {isCrtDisabled ? "Disabled" : 
              (isPreviewActive 
                ? (localSettings.crtEnabled ? `${Math.round(localSettings.crtIntensity * 100)}%` : "Off")
                : (crtEffect.enabled ? `${Math.round(crtEffect.intensity * 100)}%` : "Off")
              )}
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
            Apply Changes
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