// src/features/auth/components/UserProfile.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "../../../components/common/Button";
import Text from "../../../components/common/Text";
import { useAuth } from "../../../contexts/AuthContext";
import { win95Border } from "../../../utils/styleUtils";
import { placeholderIcons } from "../../../utils/iconUtils";

// Styled components
const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: var(--win95-window-bg);
  height: 100%;
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--win95-border-dark);
`;

const ProfileAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 0;
  ${win95Border("inset")}
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  position: relative;
`;

const AvatarImage = styled.img`
  width: 32px;
  height: 32px;
`;

const AvatarInitials = styled.span`
  font-size: 32px;
  font-weight: bold;
`;

const ProfileTabs = styled.div`
  display: flex;
  border-bottom: 1px solid var(--win95-border-dark);
  margin-bottom: 15px;
`;

const Tab = styled.div`
  padding: 5px 15px;
  cursor: pointer;
  ${(props) => (props.$active ? win95Border("inset") : "")}
  background-color: ${(props) => (props.$active ? "#f0f0f0" : "transparent")};
  display: flex;
  align-items: center;

  &:hover {
    background-color: ${(props) => (props.$active ? "#f0f0f0" : "#e0e0e0")};
  }
`;

const TabIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 5px;
`;

const TabContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 5px;
  ${win95Border("inset")}
  background-color: white;
  font-family: "ms_sans_serif", sans-serif;
  font-size: 14px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const ErrorMessage = styled.div`
  color: #ff0000;
  padding: 8px;
  margin-bottom: 16px;
  ${win95Border("inset")}
  background-color: white;
`;

const SuccessMessage = styled.div`
  color: #008000;
  padding: 8px;
  margin-bottom: 16px;
  ${win95Border("inset")}
  background-color: white;
`;

/**
 * User profile component
 */
const UserProfile = ({ onClose }) => {
  const { currentUser, updateProfile, updatePreferences, logout, error } =
    useAuth();

  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || "",
    email: currentUser?.email || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Update form data when user changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || "",
        email: currentUser.email || "",
      });
    }
  }, [currentUser]);

  /**
   * Handle form field changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle profile update
   */
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!formData.email.trim()) {
      setLocalError("Email is required");
      return;
    }

    setLocalError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await updateProfile({
        displayName: formData.displayName,
        email: formData.email,
      });
      setSuccessMessage("Profile updated successfully");
    } catch (err) {
      setLocalError(err.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await logout();
      if (onClose) onClose();
    } catch (err) {
      setLocalError(err.message || "Failed to logout");
      setIsSubmitting(false);
    }
  };

  const getInitials = () => {
    if (!currentUser) return "?";

    if (currentUser.displayName) {
      return currentUser.displayName
        .split(" ")
        .map((name) => name.charAt(0))
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }

    return currentUser.username?.charAt(0).toUpperCase() || "?";
  };

  return (
    <ProfileContainer>
      <ProfileHeader>
        <ProfileAvatar>
          <AvatarInitials>{getInitials()}</AvatarInitials>
        </ProfileAvatar>
        <Text size="18px" bold>
          {currentUser?.displayName || currentUser?.username || "User"}
        </Text>
      </ProfileHeader>

      <ProfileTabs>
        <Tab
          $active={activeTab === "profile"}
          onClick={() => setActiveTab("profile")}
        >
          <TabIcon src={placeholderIcons.user} alt="Profile" />
          Profile
        </Tab>
        <Tab
          $active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
        >
          <TabIcon src={placeholderIcons.settings} alt="Settings" />
          Settings
        </Tab>
      </ProfileTabs>

      <TabContent>
        {activeTab === "profile" && (
          <form onSubmit={handleProfileUpdate}>
            {localError && <ErrorMessage>{localError}</ErrorMessage>}
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {successMessage && (
              <SuccessMessage>{successMessage}</SuccessMessage>
            )}

            <FormGroup>
              <Label htmlFor="displayName">Display Name:</Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">Email Address:</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </FormGroup>

            <FormGroup>
              <Label>Username:</Label>
              <Input
                type="text"
                value={currentUser?.username || ""}
                disabled={true}
              />
              <Text size="11px" margin="5px 0 0 0" color="#666666">
                Username cannot be changed
              </Text>
            </FormGroup>

            <ButtonContainer>
              <Button type="submit" primary disabled={isSubmitting}>
                <img
                  src={placeholderIcons.save}
                  alt=""
                  style={{ width: "16px", height: "16px", marginRight: "5px" }}
                />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </ButtonContainer>
          </form>
        )}

        {activeTab === "settings" && (
          <div>
            <Text size="14px" margin="0 0 15px 0">
              Account Options
            </Text>

            <ButtonContainer>
              <Button onClick={handleLogout} disabled={isSubmitting}>
                <img
                  src={placeholderIcons.shutdown}
                  alt=""
                  style={{ width: "16px", height: "16px", marginRight: "5px" }}
                />
                {isSubmitting ? "Logging out..." : "Log Out"}
              </Button>
            </ButtonContainer>
          </div>
        )}
      </TabContent>
    </ProfileContainer>
  );
};

export default UserProfile;
