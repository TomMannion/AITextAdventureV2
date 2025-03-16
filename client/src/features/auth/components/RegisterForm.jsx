// src/features/auth/components/RegisterForm.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import Button from "../../../components/common/Button";
import Text from "../../../components/common/Text";
import { useAuth } from "../../../contexts/AuthContext";
import { win95Border } from "../../../utils/styleUtils";

const RegisterContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  justify-content: center;
  align-items: center;
  background-color: var(--win95-bg);
`;

const RegisterWindow = styled.div`
  width: 400px;
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
  max-height: 70vh;
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

const Fieldset = styled.fieldset`
  ${win95Border("outset")}
  padding: 10px;
  margin-bottom: 20px;
  margin-top: 10px;

  legend {
    padding: 0 5px;
  }
`;

/**
 * Registration form component
 */
const RegisterForm = ({ onLoginClick }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    preferredProvider: "",
    preferredModel: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const { register, error } = useAuth();
  const navigate = useNavigate();

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
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (formData.username.length < 3 || formData.username.length > 50) {
      setFormError("Username must be between 3 and 50 characters.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    // Password validation
    if (formData.password.length < 8) {
      setFormError("Password must be at least 8 characters long.");
      return;
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      // Remove confirmPassword from data sent to API
      const { confirmPassword, ...registerData } = formData;

      console.log("Submitting registration data:", registerData);
      await register(registerData);
      // Navigate to desktop on successful registration
      navigate("/desktop");
    } catch (err) {
      console.error("Registration error:", err);
      setFormError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle "Already have an account" click
   */
  const handleLoginClick = () => {
    navigate("/login");
  };

  // LLM provider options
  const providerOptions = [
    { value: "", label: "Select provider (optional)" },
    { value: "groq", label: "Groq" },
    { value: "anthropic", label: "Anthropic" },
    { value: "openai", label: "OpenAI" },
    { value: "gemini", label: "Gemini" },
  ];

  // Get model options based on provider
  const getModelOptions = () => {
    if (!formData.preferredProvider)
      return [{ value: "", label: "Select provider first" }];

    switch (formData.preferredProvider) {
      case "groq":
        return [
          { value: "", label: "Select model (optional)" },
          { value: "llama-3.1-8b-instant", label: "LLaMA 3.1 8B Instant" },
          { value: "llama-3.1-70b-instant", label: "LLaMA 3.1 70B Instant" },
        ];
      case "anthropic":
        return [
          { value: "", label: "Select model (optional)" },
          { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
          { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
          { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
        ];
      case "openai":
        return [
          { value: "", label: "Select model (optional)" },
          { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
          { value: "gpt-4", label: "GPT-4" },
          { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
        ];
      case "gemini":
        return [
          { value: "", label: "Select model" },
          { value: "gemini-2.0-flash", label: "gemini-2.0-flash" },
        ];
      default:
        return [{ value: "", label: "Select provider first" }];
    }
  };

  // Handle provider selection
  const handleProviderChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      preferredProvider: value,
      // Reset model when provider changes
      preferredModel: "",
    }));
  };

  return (
    <RegisterContainer>
      <Win95Logo>Windows 95 Text Adventure</Win95Logo>

      <RegisterWindow>
        <WindowHeader>
          <Text color="white" size="12px" bold>
            Register - New User Setup
          </Text>
        </WindowHeader>

        <WindowContent>
          <form onSubmit={handleSubmit}>
            {(formError || error) && (
              <ErrorMessage>{formError || error}</ErrorMessage>
            )}

            <FormGroup>
              <Label htmlFor="username">Username:</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                disabled={isSubmitting}
                autoFocus
                placeholder="Choose a username"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">Email:</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="your@email.com"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">Password:</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="********"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="confirmPassword">Confirm Password:</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="********"
              />
            </FormGroup>

            <Fieldset>
              <legend>LLM Preferences (Optional)</legend>

              <FormGroup>
                <Label htmlFor="preferredProvider">Preferred Provider:</Label>
                <select
                  id="preferredProvider"
                  name="preferredProvider"
                  value={formData.preferredProvider}
                  onChange={handleProviderChange}
                  disabled={isSubmitting}
                  style={{ width: "100%" }}
                >
                  {providerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="preferredModel">Preferred Model:</Label>
                <select
                  id="preferredModel"
                  name="preferredModel"
                  value={formData.preferredModel}
                  onChange={handleChange}
                  disabled={isSubmitting || !formData.preferredProvider}
                  style={{ width: "100%" }}
                >
                  {getModelOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormGroup>
            </Fieldset>

            <ButtonContainer>
              <Button primary type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating Account..." : "Register"}
              </Button>

              <Button onClick={handleLoginClick} disabled={isSubmitting}>
                Back to Login
              </Button>
            </ButtonContainer>

            <LinkText onClick={handleLoginClick}>
              Already have an account? Login
            </LinkText>
          </form>
        </WindowContent>
      </RegisterWindow>
    </RegisterContainer>
  );
};

export default RegisterForm;
