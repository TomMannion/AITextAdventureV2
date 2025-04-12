import React from 'react';
import styled from 'styled-components';
import { win95Border } from '../../../../utils/styleUtils';

const StoryContainer = styled.div`
  flex-grow: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const StoryHeader = styled.div`
  padding: 5px 10px;
  background-color: var(--win95-window-header);
  color: white;
  font-weight: bold;
  font-size: 12px;
`;

const StoryContent = styled.div`
  ${win95Border('inset')}
  flex-grow: 1;
  padding: 15px;
  overflow-y: auto;
  background-color: white;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-line;
`;

const EmptyMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #808080;
  text-align: center;
`;

const Segment = styled.div`
  margin-bottom: 20px;
  padding-bottom: ${props => props.$isLatest ? '0' : '15px'};
  border-bottom: ${props => props.$isLatest ? 'none' : '1px dashed #ccc'};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

/**
 * Story pane component - displays story content
 * 
 * @param {Object} props Component props
 * @param {Array} props.segments Story segments
 * @param {React.RefObject} props.scrollRef Ref for scrolling
 */
const StoryPane = ({ segments = [], scrollRef }) => {
  // Check if we have content
  const hasContent = segments && segments.length > 0;
  
  return (
    <StoryContainer>
      <StoryHeader>Story</StoryHeader>
      
      <StoryContent ref={scrollRef}>
        {!hasContent ? (
          <EmptyMessage>
            <div>Your adventure will begin soon...</div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>
              Select an option or enter your own action to continue
            </div>
          </EmptyMessage>
        ) : (
          segments.map((segment, index) => (
            <Segment
              key={segment.id || index}
              $isLatest={index === segments.length - 1}
            >
              {segment.content}
            </Segment>
          ))
        )}
      </StoryContent>
    </StoryContainer>
  );
};

export default StoryPane;