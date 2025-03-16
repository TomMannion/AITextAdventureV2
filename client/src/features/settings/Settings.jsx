// src/features/settings/Settings.jsx
import React, { useState } from "react";
import styled from "styled-components";
import { win95Border } from "../../utils/styleUtils";
import Button from "../../components/common/Button";
import Text from "../../components/common/Text";

// Import settings tabs
import LLMSettings from "./tabs/LLMSettings";
import AccessibilitySettings from "./tabs/AccessibilitySettings";
import NotificationSettings from "./tabs/NotificationSettings";
import DisplaySettings from "./tabs/DisplaySettings";
import GameSettings from "./tabs/GameSettings";
import { useSettings } from "../../contexts/SettingsContext";

// Styled components
const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--win95-window-bg);
  overflow: hidden;
`;

const SettingsHeader = styled.div`
  padding: 10px 15px;
  border-bottom: 1px solid var(--win95-border-darker);
`;

const SettingsContent = styled.div`
  display: flex;
  flex-grow: 1;
  overflow: hidden;
`;

const TabNavigator = styled.div`
  width: 200px;
  border-right: 1px solid var(--win95-border-darker);
  background-color: var(--win95-window-bg);
  overflow-y: auto;
`;

const TabButton = styled.button`
  width: 100%;
  padding: 10px 15px;
  text-align: left;
  background-color: ${(props) => (props.$active ? "#e0e0e0" : "transparent")};
  border: none;
  border-bottom: 1px solid var(--win95-border-dark);
  cursor: pointer;

  ${(props) =>
    props.$active &&
    `
    ${win95Border("inset")}
    font-weight: bold;
  `}

  &:hover {
    background-color: ${(props) => (props.$active ? "#e0e0e0" : "#f0f0f0")};
  }
`;

const TabContent = styled.div`
  flex-grow: 1;
  padding: 15px;
  overflow-y: auto;
`;

const FooterButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 15px;
  border-top: 1px solid var(--win95-border-darker);
  background-color: var(--win95-window-bg);
`;

/**
 * Settings component with tabbed interface
 */
const Settings = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("llm");
  const { resetAllSettings, resetCategorySettings } = useSettings();

  // Tab definitions with their components and labels
  const tabs = [
    { id: "llm", label: "LLM Provider", component: LLMSettings },
    {
      id: "accessibility",
      label: "Accessibility",
      component: AccessibilitySettings,
    },
    {
      id: "notifications",
      label: "Notifications",
      component: NotificationSettings,
    },
    { id: "display", label: "Display", component: DisplaySettings },
    { id: "game", label: "Game Settings", component: GameSettings },
  ];

  // Determine the active tab component
  const ActiveTabComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || tabs[0].component;

  // Handle tab selection
  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
  };

  // Handle reset current tab settings
  const handleResetCurrentTab = () => {
    resetCategorySettings(activeTab);
  };

  // Handle reset all settings
  const handleResetAll = () => {
    if (
      window.confirm("Are you sure you want to reset all settings to defaults?")
    ) {
      resetAllSettings();
    }
  };

  return (
    <SettingsContainer>
      <SettingsHeader>
        <Text size="16px" bold>
          Settings
        </Text>
      </SettingsHeader>

      <SettingsContent>
        <TabNavigator>
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              $active={activeTab === tab.id}
              onClick={() => handleTabSelect(tab.id)}
            >
              {tab.label}
            </TabButton>
          ))}
        </TabNavigator>

        <TabContent>
          <ActiveTabComponent />
        </TabContent>
      </SettingsContent>

      <FooterButtons>
        <Button onClick={handleResetCurrentTab}>Reset Tab</Button>
        <Button onClick={handleResetAll}>Reset All</Button>
        <Button primary onClick={onClose}>
          OK
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </FooterButtons>
    </SettingsContainer>
  );
};

export default Settings;
