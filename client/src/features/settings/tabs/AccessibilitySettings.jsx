import React, { useState, useEffect, useCallback } from "react";
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

const PreviewArea = styled.div`
  ${win95Border("inset")}
  padding: 15px;
  margin-top: 20px;
  background-color: ${(props) => (props.$highContrast ? "black" : "white")};
  color: ${(props) => (props.$highContrast ? "white" : "black")};
  font-size: ${(props) => (props.$largeText ? "16px" : "12px")};
`;

// Theme preview
const ThemePreview = styled.div`
  ${win95Border("outset")}
  padding: 15px;
  margin-top: 15px;
  background-color: ${props => props.$bgColor || "black"};
  color: ${props => props.$textColor || "white"};
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
`;

/**
 * Accessibility Settings Component
 */
const AccessibilitySettings = () => {
  const { settings, updateSettings } = useSettings();
  const { applyTheme, updateCrtEffect } = useThemeContext();
  
  // Local settings
  const [localSettings, setLocalSettings] = useState(settings.accessibility);
  
  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Preview state
  const [previewHighContrast, setPreviewHighContrast] = useState(false);

  // Update local state when settings change
  useEffect(() => {
    if (!hasUnsavedChanges) {
      setLocalSettings(settings.accessibility);
    }
  }, [settings.accessibility, hasUnsavedChanges]);

  // Handle checkbox change
  const handleChange = useCallback((e) => {
    const { name, checked } = e.target;

    setLocalSettings(prev => {
      const newSettings = {
        ...prev,
        [name]: checked
      };
      
      // Preview high contrast immediately
      if (name === "highContrast") {
        setPreviewHighContrast(checked);
      }
      
      return newSettings;
    });
    
    setHasUnsavedChanges(true);
  }, []);
  
  // Apply changes
  const handleApply = useCallback(() => {
    // Update settings context
    updateSettings("accessibility", localSettings);
    
    // Apply high contrast theme if enabled
    if (localSettings.highContrast) {
      applyTheme("highContrast");
    } else if (settings.accessibility.highContrast) {
      // Only switch back if it was previously enabled
      applyTheme("win95");
    }
    
    // Update CRT effect based on disableCrtEffect setting
    if (localSettings.disableCrtEffect) {
      updateCrtEffect({ enabled: false, intensity: 0 });
    } else if (settings.accessibility.disableCrtEffect) {
      // Only enable if it was previously disabled
      updateCrtEffect({ enabled: true, intensity: 0.5 });
    }
    
    setHasUnsavedChanges(false);
  }, [localSettings, updateSettings, applyTheme, updateCrtEffect, settings.accessibility.highContrast, settings.accessibility.disableCrtEffect]);
  
  // Reset changes
  const handleCancel = useCallback(() => {
    setLocalSettings(settings.accessibility);
    setPreviewHighContrast(settings.accessibility.highContrast);
    setHasUnsavedChanges(false);
  }, [settings.accessibility]);

  return (
    <div>
      <Text size="16px" bold margin="0 0 15px 0">
        Accessibility Settings
      </Text>

      <SettingsSection>
        <SectionTitle>Display Accommodations</SectionTitle>

        <OptionContainer>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="highContrast"
              checked={localSettings.highContrast}
              onChange={handleChange}
            />
            High Contrast Mode
          </CheckboxLabel>
          <HelperText>
            Use high contrast colors for better visibility and readability
          </HelperText>
        </OptionContainer>

        {/* High contrast theme preview */}
        <ThemePreview 
          $bgColor={previewHighContrast ? "black" : "#f0f0f0"} 
          $textColor={previewHighContrast ? "white" : "black"}
        >
          <Text 
            size="14px" 
            bold 
            color={previewHighContrast ? "white" : "black"}
          >
            High Contrast Preview
          </Text>
          <Text 
            size="12px" 
            margin="10px 0 0 0" 
            color={previewHighContrast ? "white" : "black"}
          >
            This is how text and UI elements will appear with high contrast {previewHighContrast ? "enabled" : "disabled"}.
          </Text>
        </ThemePreview>

        <OptionContainer>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="largeText"
              checked={localSettings.largeText}
              onChange={handleChange}
            />
            Large Text
          </CheckboxLabel>
          <HelperText>
            Increases font size throughout the application
          </HelperText>
        </OptionContainer>

        <OptionContainer>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="disableCrtEffect"
              checked={localSettings.disableCrtEffect}
              onChange={handleChange}
            />
            Disable CRT Screen Effect
          </CheckboxLabel>
          <HelperText>
            Turns off the retro CRT screen effect for reduced visual stimulation
          </HelperText>
        </OptionContainer>

        <OptionContainer>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="reducedMotion"
              checked={localSettings.reducedMotion}
              onChange={handleChange}
            />
            Reduced Motion
          </CheckboxLabel>
          <HelperText>
            Minimizes animations and motion effects throughout the application
          </HelperText>
        </OptionContainer>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>Keyboard Navigation</SectionTitle>

        <OptionContainer>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="keyboardFocus"
              checked={localSettings.keyboardFocus || false}
              onChange={handleChange}
            />
            Enhanced Keyboard Focus
          </CheckboxLabel>
          <HelperText>
            Provides more visible focus indicators when navigating with keyboard
          </HelperText>
        </OptionContainer>

        <OptionContainer>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="tabNavigation"
              checked={localSettings.tabNavigation || false}
              onChange={handleChange}
            />
            Improved Tab Navigation
          </CheckboxLabel>
          <HelperText>
            Makes all interactive elements accessible via tab navigation
          </HelperText>
        </OptionContainer>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>Reading Aids</SectionTitle>

        <OptionContainer>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="improvedLineSpacing"
              checked={localSettings.improvedLineSpacing || false}
              onChange={handleChange}
            />
            Improved Line Spacing
          </CheckboxLabel>
          <HelperText>
            Increases space between lines of text for easier reading
          </HelperText>
        </OptionContainer>

        <OptionContainer>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="readableFont"
              checked={localSettings.readableFont || false}
              onChange={handleChange}
            />
            Use More Readable Font
          </CheckboxLabel>
          <HelperText>
            Replaces the default Windows 95 font with a more readable
            alternative
          </HelperText>
        </OptionContainer>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>Preview</SectionTitle>
        <PreviewArea
          $highContrast={localSettings.highContrast}
          $largeText={localSettings.largeText}
        >
          <p>
            This is a preview of how text will appear with your current
            settings.
          </p>
          <p>
            You can see the effects of high contrast mode and text size changes
            here.
          </p>
          <p>
            Different settings will affect how content is displayed throughout
            the application.
          </p>
        </PreviewArea>
        <HelperText style={{ marginLeft: 0, marginTop: 10 }}>
          The preview reflects your current accessibility settings
        </HelperText>
        
        {hasUnsavedChanges && (
          <ActionButtons>
            <button 
              onClick={handleApply}
              style={{
                backgroundColor: "#c0c0c0",
                border: "2px solid #000",
                borderTopColor: "#ffffff",
                borderLeftColor: "#ffffff",
                padding: "3px 10px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Apply Changes
            </button>
            <button 
              onClick={handleCancel}
              style={{
                backgroundColor: "#c0c0c0",
                border: "2px solid #000",
                borderTopColor: "#ffffff",
                borderLeftColor: "#ffffff",
                padding: "3px 10px",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </ActionButtons>
        )}
      </SettingsSection>
    </div>
  );
};

export default AccessibilitySettings;