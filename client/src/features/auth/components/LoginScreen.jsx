// src/features/auth/components/LoginScreen.jsx
import React, { useState } from "react";
import styled from "styled-components";
import Button from "../../../components/common/Button";
import Text from "../../../components/common/Text";
import { useAuth } from "../../../contexts/AuthContext";
import { win95Border } from "../../../utils/styleUtils";
import { useWindowSystem } from "../../../features/window-system/WindowSystem";

const ScreenContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--win95-bg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10000; /* Ensure it's above everything else */
`;

const LoginBox = styled.div`
  width: 350px;
  ${win95Border("outset")}
  background-color: var(--win95-window-bg);
  padding: 10px;
  display: flex;
  flex-direction: column;
`;

const LoginHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--win95-border-dark);
`;

const WindowsLogo = styled.div`
  font-size: 28px;
  margin-right: 10px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
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
  justify-content: space-between;
  gap: 10px;
  margin-top: 20px;
`;

const ErrorMessage = styled.div`
  color: #ff0000;
  margin-bottom: 15px;
  font-size: 12px;
`;

const RegisterLink = styled.div`
  margin-top: 10px;
  text-align: center;
  font-size: 12px;

  span {
    color: blue;
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      color: purple;
    }
  }
`;

/**
 * Windows 95 style login screen
 * Shown at application startup if user is not logged in
 */
const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const { login, error } = useAuth();
  const { openWindow } = useWindowSystem();

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!email.trim()) {
      setLocalError("Email is required");
      return;
    }

    if (!password) {
      setLocalError("Password is required");
      return;
    }

    setLocalError("");
    setIsSubmitting(true);

    try {
      const result = await login({ email, password });
      console.log("Login successful:", result);
      // Login is successful, the AuthContext will update and App.jsx will handle redirection
    } catch (err) {
      console.error("Login error:", err);
      setLocalError(
        err.message || "Login failed. Please check your credentials."
      );
      setIsSubmitting(false);
    }
  };

  /**
   * Handle register click
   */
  const handleRegisterClick = () => {
    openWindow("register-window");
  };

  return (
    <ScreenContainer>
      <LoginBox>
        <LoginHeader>
          <WindowsLogo>🪟</WindowsLogo>
          <Text size="20px" bold>
            Windows 95
          </Text>
        </LoginHeader>

        <Text size="12px" align="center" margin="0 0 20px 0">
          Welcome to Windows 95. Please log in.
        </Text>

        <form onSubmit={handleSubmit}>
          {(localError || error) && (
            <ErrorMessage>{localError || error}</ErrorMessage>
          )}

          <FormGroup>
            <Label htmlFor="login-email">Email:</Label>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="login-password">Password:</Label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </FormGroup>

          <ButtonContainer>
            <Button primary type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "OK"}
            </Button>

            <Button disabled={isSubmitting}>Cancel</Button>
          </ButtonContainer>
        </form>

        <RegisterLink>
          <span onClick={handleRegisterClick}>Create a new account</span>
        </RegisterLink>
      </LoginBox>
    </ScreenContainer>
  );
};

export default LoginScreen;
