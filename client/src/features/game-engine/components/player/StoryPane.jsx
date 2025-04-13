import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { win95Border } from '../../../../utils/styleUtils';
import { placeholderIcons } from '../../../../utils/iconUtils';
import { useGameStore } from '../../../../contexts/GameStoreContext';

// Container for the entire story view
const StoryContainer = styled.div`
  flex-grow: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

// Story header with title and controls
const StoryHeader = styled.div`
  padding: 5px 10px;
  background-color: var(--win95-window-header);
  color: white;
  font-weight: bold;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 10px;
  font-size: 10px;
`;

const HeaderButton = styled.button`
  background-color: #c0c0c0;
  ${win95Border('outset')}
  padding: 1px 5px;
  font-size: 10px;
  cursor: pointer;
  
  &:active {
    ${win95Border('inset')}
    padding: 2px 4px 0 6px;
  }
`;

// Container for the story content with scrolling
const StoryContent = styled.div`
  ${win95Border('inset')}
  flex-grow: 1;
  padding: 10px;
  overflow-y: auto;
  background-color: #f5f5f5; /* Slightly off-white for better readability */
  font-size: 14px;
  position: relative;
`;

// Timeline navigation container
const Timeline = styled.div`
  position: absolute;
  right: 5px;
  top: 10px;
  bottom: 10px;
  width: 15px;
  ${win95Border('inset')}
  background-color: #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2px 0;
  z-index: 5;
`;

// Timeline marker for each segment
const TimelineMarker = styled.div`
  width: 9px;
  height: 9px;
  background-color: ${props => props.$active ? 'var(--win95-window-header)' : '#a0a0a0'};
  border: 1px solid #808080;
  margin: 1px 0;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.$active ? 'var(--win95-window-header)' : '#c0c0c0'};
  }
`;

// Empty message styled as Win95 dialog
const EmptyMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #808080;
  text-align: center;
  
  & > div:first-child {
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  & > div:last-child {
    font-size: 12px;
  }
`;

// Story segment styled as a Windows 95 dialog
const SegmentDialog = styled.div`
  ${win95Border('outset')}
  margin-bottom: 16px;
  background-color: #ececec;
  position: relative;
  max-width: ${props => props.$isNarration ? '95%' : '85%'};
  margin-left: ${props => props.$isNarration ? '0' : 'auto'};
  
  &:last-child {
    margin-bottom: 5px;
  }
  
  // Add slight glow to the latest segment
  ${props => props.$isLatest ? `
    box-shadow: 0 0 5px rgba(0, 0, 128, 0.2);
  ` : ''}
`;

// Dialog header with turn number and collapse control
const DialogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background-color: ${props => props.$isChoice ? '#d9d9ff' : '#d0d0d0'};
  border-bottom: 1px solid #808080;
  font-size: 11px;
  color: #000080;
`;

// Dialog content - contains the actual story text
const DialogContent = styled.div`
  padding: 10px 12px;
  font-family: 'Times New Roman', serif; /* Better for reading long text */
  font-size: ${props => props.$isChoice ? '13px' : '14px'};
  line-height: 1.6;
  white-space: pre-line;
  color: #000000;
  
  ${props => props.$collapsed ? `
    display: none;
  ` : ''}
`;

// Player choice container
const PlayerChoiceContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
  padding-left: 16px;
  
  // Highlight player's choice when it's part of the current turn
  ${props => props.$isCurrent ? `
    animation: pulseHighlight 2s ease-in-out;
    @keyframes pulseHighlight {
      0%, 100% { background-color: transparent; }
      50% { background-color: rgba(0, 0, 128, 0.1); }
    }
  ` : ''}
`;

// Player choice icon
const ChoiceIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 8px;
  
  img {
    width: 16px;
    height: 16px;
  }
`;

// The actual choice text
const ChoiceText = styled.div`
  ${win95Border('inset')}
  padding: 6px 10px;
  background-color: #e6e6ff; /* Light blue for player choices */
  font-size: 13px;
  color: #000080; /* Dark blue */
  border-radius: 0;
  font-style: italic;
  max-width: 85%;
`;

// Segment timestamp/turn indicator
const TurnIndicator = styled.div`
  font-size: 10px;
  color: #808080;
`;

// Collapse toggle button
const CollapseToggle = styled.button`
  background: none;
  border: none;
  font-size: 11px;
  color: #000080;
  cursor: pointer;
  padding: 0 3px;
  margin-left: 5px;
  
  &:hover {
    text-decoration: underline;
  }
`;

/**
 * Enhanced story pane component - displays story content with improved readability and navigation
 * 
 * @param {Object} props Component props
 * @param {Array} props.segments Story segments
 * @param {Array} props.playerChoices Player's previous choices
 * @param {React.RefObject} props.scrollRef Ref for scrolling
 * @param {number} props.currentTurn Current turn/segment being viewed
 */
const StoryPane = ({ 
  segments = [], 
  playerChoices = [], // Array of player's previous choices matching segments
  scrollRef,
  currentTurn = 0
}) => {
  // Track which segments are collapsed
  const [collapsedSegments, setCollapsedSegments] = useState({});
  
  // Track active segment for timeline
  const [activeSegment, setActiveSegment] = useState(null);
  
  // Segment refs for scrolling
  const segmentRefs = useRef({});
  
  // Check if we have content
  const hasContent = segments && segments.length > 0;
  
  // Handle scroll events
  const handleScroll = (e) => {
    const { scrollTop, clientHeight } = e.target;
    
    // Determine which segment is currently in view
    if (segments.length > 0) {
      let activeFound = false;
      
      // Check each segment from the bottom up
      for (let i = segments.length - 1; i >= 0; i--) {
        const segment = segments[i];
        const id = segment.id || i;
        const ref = segmentRefs.current[id];
        
        if (ref && ref.offsetTop < scrollTop + (clientHeight / 2)) {
          setActiveSegment(id);
          activeFound = true;
          break;
        }
      }
      
      // If no segment is active, set the first one
      if (!activeFound) {
        const firstId = segments[0]?.id || 0;
        setActiveSegment(firstId);
      }
    }
  };
  
  // Jump to a specific segment
  const jumpToSegment = (id) => {
    const ref = segmentRefs.current[id];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  // Jump to latest segment
  const jumpToLatest = () => {
    if (segments.length > 0) {
      const lastId = segments[segments.length - 1]?.id || segments.length - 1;
      jumpToSegment(lastId);
    }
  };
  
  // Toggle segment collapse
  const toggleCollapse = (id) => {
    setCollapsedSegments(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Collapse all segments except the latest few
  const collapseOldSegments = () => {
    if (!segments || segments.length <= 3) return;
    
    const newCollapsed = {};
    
    // Keep the latest 3 segments expanded, collapse all others
    segments.forEach((segment, index) => {
      const id = segment.id || index;
      // Collapse all except the latest 3
      newCollapsed[id] = index < segments.length - 3;
    });
    
    setCollapsedSegments(newCollapsed);
  };
  
  // Set up scroll listener
  useEffect(() => {
    const currentRef = scrollRef.current;
    
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
      
      return () => {
        currentRef.removeEventListener('scroll', handleScroll);
      };
    }
  }, [scrollRef, segments]);
  
  // Scroll to bottom when new content is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    
    // Set the latest segment as active
    if (segments.length > 0) {
      const lastId = segments[segments.length - 1]?.id || segments.length - 1;
      setActiveSegment(lastId);
    }
  }, [segments]);
  
  return (
    <StoryContainer>
      <StoryHeader>
        <div>Story</div>
        {hasContent && (
          <HeaderControls>
            <HeaderButton onClick={collapseOldSegments}>Collapse Old</HeaderButton>
            <HeaderButton onClick={() => setCollapsedSegments({})}>Expand All</HeaderButton>
            <HeaderButton onClick={jumpToLatest}>Jump to Latest</HeaderButton>
          </HeaderControls>
        )}
      </StoryHeader>
      
      <StoryContent ref={scrollRef} onScroll={handleScroll}>
        {!hasContent ? (
          <EmptyMessage>
            <div>Your adventure will begin soon...</div>
            <div>Select an option to continue</div>
          </EmptyMessage>
        ) : (
          <>
            {/* Timeline navigation */}
            {segments.length > 3 && (
              <Timeline>
                {segments.map((segment, index) => {
                  console.log(segment);
                  const id = segment.id || index;
                  return (
                    <TimelineMarker 
                      key={id}
                      $active={activeSegment === id}
                      onClick={() => jumpToSegment(id)}
                      title={`Turn ${index + 1}`}
                    />
                  );
                })}
              </Timeline>
            )}
            
            {/* Story segments */}
            {segments.map((segment, index) => {
              const isLatest = index === segments.length - 1;
              const id = segment.id || index;
              const isCollapsed = collapsedSegments[id];
              
              // Get the corresponding player choice (if any)
              const playerChoice = index > 0 ? playerChoices[index - 1] : null;
              
              return (
                <React.Fragment key={id}>
                  {/* Show player choice above each segment (except the first) */}
                  {playerChoice && (
                    <PlayerChoiceContainer $isCurrent={currentTurn === index}>
                      <ChoiceIcon>
                        <img src={placeholderIcons.user} alt="Player" />
                      </ChoiceIcon>
                      <ChoiceText>
                        {playerChoice.text || playerChoice}
                      </ChoiceText>
                    </PlayerChoiceContainer>
                  )}
                  
                  {/* Story segment */}
                  <SegmentDialog
                    ref={el => segmentRefs.current[id] = el}
                    $isNarration={true}
                    $isLatest={isLatest}
                    data-segment-id={index}
                  >
                    <DialogHeader>
                      <TurnIndicator>Turn {index + 1}</TurnIndicator>
                      <CollapseToggle onClick={() => toggleCollapse(id)}>
                        {isCollapsed ? 'Expand' : 'Collapse'}
                      </CollapseToggle>
                    </DialogHeader>
                    <DialogContent $collapsed={isCollapsed}>
                      {segment.content}
                    </DialogContent>
                  </SegmentDialog>
                </React.Fragment>
              );
            })}
          </>
        )}
      </StoryContent>
    </StoryContainer>
  );
};

export default StoryPane;