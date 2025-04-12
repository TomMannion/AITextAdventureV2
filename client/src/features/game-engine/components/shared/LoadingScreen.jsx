import React from 'react';
import styled from 'styled-components';
import { win95Border } from '../../../../utils/styleUtils';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: var(--win95-window-bg);
  padding: 20px;
`;

const LoadingBox = styled.div`
  ${win95Border('outset')}
  padding: 20px;
  background-color: var(--win95-window-bg);
  width: 300px;
  text-align: center;
`;

const LoadingTitle = styled.h3`
  font-size: 14px;
  margin-bottom: 15px;
  font-weight: bold;
  color: var(--win95-window-header);
`;

const LoadingMessage = styled.p`
  font-size: 12px;
  margin-bottom: 15px;
`;

const ProgressBarContainer = styled.div`
  ${win95Border('inset')}
  width: 100%;
  height: 20px;
  background-color: white;
  overflow: hidden;
  position: relative;
`;

const ProgressBarFill = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: ${props => props.$progress || '0%'};
  background-color: var(--win95-window-header);
  transition: width 0.3s ease;
`;

const AnimatedHourGlass = styled.div`
  font-size: 24px;
  margin: 10px 0;
  animation: spin 1.5s infinite linear;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(90deg); }
    50% { transform: rotate(180deg); }
    75% { transform: rotate(270deg); }
    100% { transform: rotate(360deg); }
  }
`;

/**
 * Windows 95 style loading screen
 * 
 * @param {Object} props Component props
 * @param {string} props.message Loading message
 * @param {number} props.progress Progress percentage (0-100)
 */
const LoadingScreen = ({ message = 'Loading...', progress = 0 }) => {
  return (
    <LoadingContainer>
      <LoadingBox>
        <LoadingTitle>Windows 95 Text Adventure</LoadingTitle>
        
        <AnimatedHourGlass>⌛</AnimatedHourGlass>
        
        <LoadingMessage>{message}</LoadingMessage>
        
        <ProgressBarContainer>
          <ProgressBarFill $progress={`${progress}%`} />
        </ProgressBarContainer>
      </LoadingBox>
    </LoadingContainer>
  );
};

export default LoadingScreen;