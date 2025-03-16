// src/features/game-engine/components/EmptyGameState.jsx
import React from "react";
import styled from "styled-components";
import { win95Border } from "../../../utils/styleUtils";
import Button from "../../../components/common/Button";
import Text from "../../../components/common/Text";

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
`;

const EmptyStateBox = styled.div`
  ${win95Border("outset")}
  background-color: var(--win95-window-bg);
  padding: 30px;
  max-width: 500px;
  width: 100%;
`;

const IconContainer = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 15px;
`;

/**
 * Empty game state component displayed when no games are found
 *
 * @param {Object} props Component props
 * @param {Function} props.onCreateNew Handler for creating a new game
 * @param {Function} props.onRefresh Handler for refreshing the game list
 * @param {boolean} props.isLoading Whether the component is in loading state
 * @param {string} props.message Custom message to display
 */
const EmptyGameState = ({
  onCreateNew,
  onRefresh,
  isLoading = false,
  message = "You don't have any adventures yet",
}) => {
  return (
    <EmptyStateContainer>
      <EmptyStateBox>
        <IconContainer>{isLoading ? "⏳" : "🧙‍♂️"}</IconContainer>

        <Text size="18px" bold margin="0 0 10px 0">
          {isLoading ? "Loading Adventures..." : "No Adventures Found"}
        </Text>

        <Text size="14px" margin="0 0 20px 0">
          {isLoading
            ? "Please wait while we search for your adventures..."
            : message}
        </Text>

        {!isLoading && (
          <>
            <Text size="12px" margin="0 0 5px 0">
              Start your journey by creating a new adventure in your favorite
              genre.
            </Text>

            <ButtonContainer>
              <Button primary onClick={onCreateNew} disabled={isLoading}>
                Create New Adventure
              </Button>

              <Button onClick={onRefresh} disabled={isLoading}>
                Refresh
              </Button>
            </ButtonContainer>
          </>
        )}
      </EmptyStateBox>
    </EmptyStateContainer>
  );
};

export default EmptyGameState;
