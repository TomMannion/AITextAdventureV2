import React, { useState } from "react";
import styled from "styled-components";
import Button from "../../../components/common/Button";
import Text from "../../../components/common/Text";

const AppContainer = styled.div`
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ContentSection = styled.div`
  flex-grow: 1;
  border: 1px solid #808080;
  background-color: white;
  padding: 10px;
  margin: 10px 0;
  overflow: auto;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
`;

/**
 * Sample application component
 * Demonstrates a simple application that can be loaded in a window
 */
const AppSample = ({ name = "User", onClose }) => {
  const [counter, setCounter] = useState(0);
  const [messages, setMessages] = useState([
    `Welcome to the Sample App, ${name}!`,
  ]);

  // Increment counter
  const handleIncrement = () => {
    setCounter((prev) => prev + 1);
    addMessage(`Counter incremented to ${counter + 1}`);
  };

  // Decrement counter
  const handleDecrement = () => {
    setCounter((prev) => Math.max(0, prev - 1));
    addMessage(`Counter decremented to ${Math.max(0, counter - 1)}`);
  };

  // Reset counter
  const handleReset = () => {
    setCounter(0);
    addMessage("Counter reset to 0");
  };

  // Add message to log
  const addMessage = (message) => {
    setMessages((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

  return (
    <AppContainer>
      <Text size="14px" bold>
        Sample Windows 95 Application
      </Text>

      <Text size="12px" margin="10px 0">
        Current count: <strong>{counter}</strong>
      </Text>

      <ButtonRow>
        <Button onClick={handleIncrement}>Increment</Button>
        <Button onClick={handleDecrement}>Decrement</Button>
        <Button onClick={handleReset}>Reset</Button>
      </ButtonRow>

      <Text size="12px" margin="10px 0 5px">
        Message Log:
      </Text>

      <ContentSection>
        {messages.map((message, index) => (
          <Text key={index} size="12px" margin="0 0 5px">
            {message}
          </Text>
        ))}
      </ContentSection>

      <ButtonRow>
        <Button onClick={onClose}>Close</Button>
      </ButtonRow>
    </AppContainer>
  );
};

export default AppSample;
