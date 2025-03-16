// src/features/settings/tabs/GameSettings.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { win95Border } from "../../../utils/styleUtils";
import Text from "../../../components/common/Text";
import { useSettings } from "../../../contexts/SettingsContext";

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

const GenreDescription = styled.div`
  margin-top: 10px;
  padding: 8px;
  background-color: white;
  ${win95Border("inset")}
  font-size: 11px;
  height: 80px;
  overflow-y: auto;
`;

/**
 * Game Settings Component
 */
const GameSettings = () => {
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings.game);

  // Update local state when settings change
  useEffect(() => {
    setLocalSettings(settings.game);
  }, [settings.game]);

  // Save changes to context
  const saveChanges = () => {
    updateSettings("game", localSettings);
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
  };

  // Handle slider change
  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings((prev) => ({
      ...prev,
      [name]: parseInt(value, 10),
    }));
  };

  // Automatically save changes when fields change
  useEffect(() => {
    saveChanges();
  }, [localSettings]);

  // Get description for the selected genre
  const getGenreDescription = (genre) => {
    const descriptions = {
      fantasy:
        "A magical world of dragons, wizards, and epic quests. Perfect for heroic adventures and magical exploration.",
      scifi:
        "Explore distant galaxies, encounter alien species, and discover advanced technology.",
      horror:
        "Face your deepest fears in a world filled with supernatural threats and psychological terror.",
      mystery:
        "Solve intricate puzzles and uncover hidden secrets in a world of intrigue and suspense.",
      western:
        "Experience the rugged frontier of the Wild West with gunslinging, gold mining, and outlaw chasing.",
    };

    return descriptions[genre] || "No description available for this genre.";
  };

  return (
    <div>
      <Text size="16px" bold margin="0 0 15px 0">
        Game Settings
      </Text>

      <SettingsSection>
        <SectionTitle>Default Game Preferences</SectionTitle>

        <FormGroup>
          <Label htmlFor="defaultGenre">Default Genre:</Label>
          <Select
            id="defaultGenre"
            name="defaultGenre"
            value={localSettings.defaultGenre}
            onChange={handleSelectChange}
          >
            <option value="fantasy">Fantasy</option>
            <option value="scifi">Science Fiction</option>
            <option value="horror">Horror</option>
            <option value="mystery">Mystery</option>
            <option value="western">Western</option>
          </Select>

          <GenreDescription>
            {getGenreDescription(localSettings.defaultGenre)}
          </GenreDescription>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="defaultLength">Default Game Length:</Label>
          <Select
            id="defaultLength"
            name="defaultLength"
            value={localSettings.defaultLength}
            onChange={handleSelectChange}
          >
            <option value="8">Short (8 turns)</option>
            <option value="16">Medium (16 turns)</option>
            <option value="24">Long (24 turns)</option>
            <option value="32">Epic (32 turns)</option>
          </Select>
          <HelperText style={{ marginLeft: 0 }}>
            Choose the default length for new adventures
          </HelperText>
        </FormGroup>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>Auto-Save Settings</SectionTitle>

        <OptionContainer>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="autoSave"
              checked={localSettings.autoSave}
              onChange={handleCheckboxChange}
            />
            Enable Auto-Save
          </CheckboxLabel>
          <HelperText>
            Automatically save your game progress at regular intervals
          </HelperText>
        </OptionContainer>

        <SliderContainer>
          <SliderLabel>Auto-Save Interval (minutes):</SliderLabel>
          <SliderRow>
            <Slider
              type="range"
              name="autoSaveInterval"
              min="1"
              max="30"
              step="1"
              value={localSettings.autoSaveInterval}
              onChange={handleSliderChange}
              disabled={!localSettings.autoSave}
            />
            <SliderValue>{localSettings.autoSaveInterval} min</SliderValue>
          </SliderRow>
          <HelperText>
            How often should the game automatically save your progress
          </HelperText>
        </SliderContainer>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>Game Data Management</SectionTitle>

        <Text size="12px" margin="0 0 10px 0">
          Manage game data and saved progress. These actions cannot be undone.
        </Text>

        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
          <button
            style={{
              padding: "6px 12px",
              background: "#c0c0c0",
              border: "2px solid #000",
              borderTopColor: "#fff",
              borderLeftColor: "#fff",
              cursor: "pointer",
            }}
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to delete all completed games? This cannot be undone."
                )
              ) {
                // This would connect to your actual game data services
                alert("Completed games deleted (demo only)");
              }
            }}
          >
            Clear Completed Games
          </button>

          <button
            style={{
              padding: "6px 12px",
              background: "#c0c0c0",
              border: "2px solid #000",
              borderTopColor: "#fff",
              borderLeftColor: "#fff",
              cursor: "pointer",
            }}
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to reset all game statistics? This cannot be undone."
                )
              ) {
                // This would connect to your actual game data services
                alert("Game statistics reset (demo only)");
              }
            }}
          >
            Reset Statistics
          </button>
        </div>
      </SettingsSection>
    </div>
  );
};

export default GameSettings;
