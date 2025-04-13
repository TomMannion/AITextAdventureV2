import React from 'react';
import styled from 'styled-components';
import { win95Border } from '../../../../utils/styleUtils';
import Button from '../../../../components/common/Button';
import { useGameStore } from '../../../../contexts/GameStoreContext';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: var(--win95-window-bg);
  padding: 20px;
`;

const ErrorBox = styled.div`
  ${win95Border('outset')}
  padding: 20px;
  background-color: var(--win95-window-bg);
  max-width: 450px;
  width: 100%;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 32px;
  margin-bottom: 10px;
  color: red;
`;

const ErrorTitle = styled.h3`
  font-size: 14px;
  margin-bottom: 10px;
  font-weight: bold;
  color: #aa0000;
`;

const ErrorMessage = styled.div`
  ${win95Border('inset')}
  padding: 15px;
  margin: 10px 0 20px;
  font-size: 12px;
  background-color: white;
  text-align: left;
  overflow: auto;
  max-height: 150px;
  color: #000000;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
`;

/**
 * Windows 95 style error display
 * 
 * @param {Object} props Component props
 * @param {string} props.message Error message
 * @param {string} props.title Error title
 */
const ErrorDisplay = ({ 
  message = 'An unexpected error occurred',
  title = 'Error'
}) => {
  const { goToLauncher, clearError } = useGameStore();
  
  const handleRetry = () => {
    clearError();
  };
  
  const handleBack = () => {
    clearError();
    goToLauncher();
  };
  
  return (
    <ErrorContainer>
      <ErrorBox>
        <ErrorIcon>❌</ErrorIcon>
        <ErrorTitle>{title}</ErrorTitle>
        
        <ErrorMessage>
          {message}
        </ErrorMessage>
        
        <ButtonContainer>
          <Button onClick={handleRetry}>Retry</Button>
          <Button onClick={handleBack}>Back to Main Menu</Button>
        </ButtonContainer>
      </ErrorBox>
    </ErrorContainer>
  );
};

export default ErrorDisplay;