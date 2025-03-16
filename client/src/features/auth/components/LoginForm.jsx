// src/features/auth/components/LoginForm.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import Button from "../../../components/common/Button";
import Text from "../../../components/common/Text";
import { useAuth } from "../../../contexts/AuthContext";
import { win95Border } from "../../../utils/styleUtils";

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  justify-content: center;
  align-items: center;
  background-color: var(--win95-bg);
`;

const LoginWindow = styled.div`
  width: 350px;
  ${win95Border("outset")}
  background-color: var(--win95-window-bg);
`;

const WindowHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 3px 5px;
  background-color: var(--win95-window-header);
  color: white;
`;

const WindowContent = styled.div`
  padding: 20px;
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

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;

  input {
    margin-right: 8px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
`;

const Win95Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const ErrorMessage = styled.div`
  color: #ff0000;
  padding: 8px;
  margin-bottom: 16px;
  ${win95Border("inset")}
  background-color: white;
`;

const LinkText = styled.span`
  color: blue;
  text-decoration: underline;
  cursor: pointer;
  margin-top: 10px;
  display: block;
  text-align: center;

  &:hover {
    color: purple;
  }
`;

/**
 * Login form component
 */
const LoginForm = ({ onRegisterClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const { login, error } = useAuth();
  const navigate = useNavigate();

  // Important: Call hooks at the top level, outside of any handlers
  const gameNotifications = useGameNotifications();

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!email.trim()) {
      setFormError("Email is required");
      return;
    }

    if (!password) {
      setFormError("Password is required");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      console.log("Attempting login with:", { email, password });
      const user = await login({ email, password });

      // Show welcome notification - using the pre-initialized hook
      try {
        // Since we already initialized the hook at the top level,
        // we can safely use its methods here
        const { showWelcomeNotification } = gameNotifications;

        // Check if this is first login of the day
        const lastLogin = localStorage.getItem("last_login_date");
        const today = new Date().toDateString();
        const isFirstLoginOfDay = lastLogin !== today;

        // Save today's date as last login
        localStorage.setItem("last_login_date", today);

        // Show welcome notification
        showWelcomeNotification({
          username: user.username || user.displayName || "User",
          isFirstLoginOfDay,
          // You might need to fetch unfinished games from your API
          unfinishedGames: [],
          openGameCallback: (gameId) => {
            // This would be handled by your game service
            console.log("Opening game:", gameId);
          },
        });
      } catch (err) {
        console.error("Failed to display welcome notification:", err);
        // Continue with normal flow even if notification fails
      }

      // Navigate to desktop on successful login
      navigate("/desktop");
    } catch (err) {
      console.error("Login error:", err);
      setFormError(
        err.message || "Login failed. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle "Create new account" click
   */
  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <LoginContainer>
      <Win95Logo>Windows 95 Text Adventure</Win95Logo>

      <LoginWindow>
        <WindowHeader>
          <Text color="white" size="12px" bold>
            Login - Microsoft Network
          </Text>
        </WindowHeader>

        <WindowContent>
          <form onSubmit={handleSubmit}>
            {(formError || error) && (
              <ErrorMessage>{formError || error}</ErrorMessage>
            )}

            <FormGroup>
              <Label htmlFor="email">Email:</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                autoFocus
                placeholder="user@example.com"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">Password:</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                placeholder="********"
              />

              <Checkbox>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  disabled={isSubmitting}
                />
                <label htmlFor="rememberMe">Remember me on this computer</label>
              </Checkbox>
            </FormGroup>

            <ButtonContainer>
              <Button primary type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "OK"}
              </Button>

              <Button onClick={handleRegisterClick} disabled={isSubmitting}>
                Register
              </Button>
            </ButtonContainer>

            <LinkText onClick={handleRegisterClick}>
              Create a new account
            </LinkText>
          </form>
        </WindowContent>
      </LoginWindow>
    </LoginContainer>
  );
};

export default LoginForm;
