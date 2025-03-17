// src/features/settings/tabs/NotificationSettings.jsx
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { win95Border } from "../../../utils/styleUtils";
import Text from "../../../components/common/Text";
import { useSettings } from "../../../contexts/SettingsContext";
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

/**
 * Notification Settings Component
 */
const NotificationSettings = () => {
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings.notifications);

  // Update local state when settings change
  useEffect(() => {
    setLocalSettings(settings.notifications);
  }, [settings.notifications]);

  // Handle checkbox change
  const handleCheckboxChange = useCallback(
    (e) => {
      const { name, checked } = e.target;

      setLocalSettings((prev) => {
        const newSettings = {
          ...prev,
          [name]: checked,
        };

        // Update context after a slight delay
        setTimeout(() => {
          updateSettings("notifications", newSettings);
        }, 0);

        return newSettings;
      });
    },
    [updateSettings]
  );

  // Handle slider change
  const handleSliderChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setLocalSettings((prev) => {
        const newSettings = {
          ...prev,
          [name]: parseInt(value, 10),
        };

        // Update context after a slight delay
        setTimeout(() => {
          updateSettings("notifications", newSettings);
        }, 0);

        return newSettings;
      });
    },
    [updateSettings]
  );

  // Format duration for display
  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Determine if notifications are completely disabled
  const notificationsDisabled = !localSettings.enabled;

  return (
    <div>
      <Text size="16px" bold margin="0 0 15px 0">
        Notification Settings
      </Text>

      <SettingsSection>
        <SectionTitle>General Settings</SectionTitle>

        <OptionContainer>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="enabled"
              checked={localSettings.enabled}
              onChange={handleCheckboxChange}
            />
            Enable Notifications
          </CheckboxLabel>
          <HelperText>
            Show toast notifications for events in the application
          </HelperText>
        </OptionContainer>

        <OptionContainer>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="sound"
              checked={localSettings.sound}
              onChange={handleCheckboxChange}
              disabled={notificationsDisabled}
            />
            Play Sounds
          </CheckboxLabel>
          <HelperText>Play a sound effect when notifications appear</HelperText>
        </OptionContainer>

        <SliderContainer>
          <SliderLabel>Notification Duration:</SliderLabel>
          <SliderRow>
            <Slider
              type="range"
              name="duration"
              min="1000"
              max="10000"
              step="500"
              value={localSettings.duration}
              onChange={handleSliderChange}
              disabled={notificationsDisabled}
            />
            <SliderValue>{formatDuration(localSettings.duration)}</SliderValue>
          </SliderRow>
          <HelperText>
            How long notifications remain visible before automatically
            disappearing
          </HelperText>
        </SliderContainer>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>Notification Types</SectionTitle>

        <OptionContainer>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="achievementNotifications"
              checked={localSettings.achievementNotifications}
              onChange={handleCheckboxChange}
              disabled={notificationsDisabled}
            />
            Achievement Notifications
          </CheckboxLabel>
          <HelperText>
            Show notifications for game achievements and milestones
          </HelperText>
        </OptionContainer>

        <OptionContainer>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="saveNotifications"
              checked={localSettings.saveNotifications}
              onChange={handleCheckboxChange}
              disabled={notificationsDisabled}
            />
            Save Notifications
          </CheckboxLabel>
          <HelperText>
            Show notifications when game progress is saved
          </HelperText>
        </OptionContainer>

        <OptionContainer>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="errorNotifications"
              checked={localSettings.errorNotifications}
              onChange={handleCheckboxChange}
              disabled={notificationsDisabled}
            />
            Error Notifications
          </CheckboxLabel>
          <HelperText>Show notifications for errors and warnings</HelperText>
        </OptionContainer>

        <OptionContainer>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="systemMessages"
              checked={localSettings.systemMessages}
              onChange={handleCheckboxChange}
              disabled={notificationsDisabled}
            />
            System Messages
          </CheckboxLabel>
          <HelperText>
            Show notifications for system events (welcome messages, etc.)
          </HelperText>
        </OptionContainer>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>Preview</SectionTitle>

        {notificationsDisabled ? (
          <Text size="12px" color="#666">
            Enable notifications to see a preview
          </Text>
        ) : (
          <NotificationPreview>
            <PreviewHeader>
              <PreviewHeaderContent>
                <PreviewIcon
                  src={placeholderIcons.achievement}
                  alt="Achievement"
                />
                <span>Achievement Unlocked</span>
              </PreviewHeaderContent>
              <span>✕</span>
            </PreviewHeader>
            <PreviewContent>
              You've discovered a hidden setting! Your notification settings
              have been saved.
            </PreviewContent>
          </NotificationPreview>
        )}

        <HelperText>
          This is how notifications will appear with your current settings
        </HelperText>
      </SettingsSection>
    </div>
  );
};

export default NotificationSettings;
