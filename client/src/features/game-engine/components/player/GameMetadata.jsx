import React from 'react';
import styled from 'styled-components';
import { win95Border } from '../../../../utils/styleUtils';
import { getGenreIcon } from '../../../../utils/iconUtils';
import { formatDate } from '../../../../utils/dateUtils';

const MetadataContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const Section = styled.div`
  border-bottom: 1px solid var(--win95-border-darker);
  background-color: var(--win95-window-bg);
`;

const SectionHeader = styled.div`
  padding: 5px 10px;
  background-color: var(--win95-window-header);
  color: white;
  font-weight: bold;
  font-size: 12px;
`;

const SectionContent = styled.div`
  padding: 10px;
`;

const GameInfoSection = styled(Section)`
  flex-shrink: 0;
`;

const GameInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const GameDetail = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  padding: 3px 0;
`;

const DetailLabel = styled.div`
  flex: 1;
  color: #666;
`;

const DetailValue = styled.div`
  flex: 2;
  font-weight: ${props => props.$bold ? 'bold' : 'normal'};
  color: ${props => props.$color || 'inherit'};
`;

const ProgressSection = styled(Section)`
  flex-shrink: 0;
`;

const ProgressBar = styled.div`
  ${win95Border('inset')}
  height: 15px;
  background-color: white;
  margin-top: 5px;
  position: relative;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: ${props => props.$progress || '0%'};
  background-color: var(--win95-window-header);
`;

const LogSection = styled(Section)`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const LogContent = styled.div`
  ${win95Border('inset')}
  flex-grow: 1;
  margin: 10px;
  padding: 5px;
  background-color: white;
  font-size: 11px;
  overflow-y: auto;
`;

const LogEntry = styled.div`
  margin-bottom: 5px;
  padding-bottom: 5px;
  border-bottom: 1px dotted #ccc;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const LogTime = styled.span`
  color: #666;
  margin-right: 5px;
`;

const LogMessage = styled.span`
  color: ${props => props.$color || 'inherit'};
`;

/**
 * Game metadata component - displays game information and logs
 * 
 * @param {Object} props Component props
 * @param {Object} props.game Game data
 */
const GameMetadata = ({ game }) => {
  if (!game) {
    return (
      <MetadataContainer>
        <SectionHeader>Game Info</SectionHeader>
        <SectionContent>
          <div style={{ fontSize: '12px', color: '#666' }}>
            No game data available
          </div>
        </SectionContent>
      </MetadataContainer>
    );
  }
  
  // Format genre name
  const formatGenre = (genre) => {
    if (!genre) return 'Unknown';
    return genre.charAt(0).toUpperCase() + genre.slice(1);
  };
  
  // Calculate progress percentage
  const getProgressPercent = () => {
    if (!game.turnCount || !game.totalTurns) return 0;
    return Math.round((game.turnCount / game.totalTurns) * 100);
  };
  
  // Generate event log entries
  const getLogEntries = () => {
    const entries = [];
    
    // Add game creation entry
    if (game.createdAt) {
      entries.push({
        time: new Date(game.createdAt),
        message: 'Adventure created',
        type: 'system',
      });
    }
    
    // Add last played entry
    if (game.lastPlayedAt && game.lastPlayedAt !== game.createdAt) {
      entries.push({
        time: new Date(game.lastPlayedAt),
        message: 'Last played',
        type: 'system',
      });
    }
    
    // Add entries for each turn if we have segments
    if (game.storySegments && game.storySegments.length > 0) {
      game.storySegments.forEach((segment, index) => {
        if (index === 0) {
          entries.push({
            time: new Date(segment.createdAt),
            message: 'Story begins',
            type: 'story',
          });
        } else {
          entries.push({
            time: new Date(segment.createdAt),
            message: `Turn ${index} completed`,
            type: 'turn',
          });
        }
      });
    }
    
    // Sort by time
    return entries.sort((a, b) => b.time - a.time);
  };
  
  // Get icon for game type
  const gameIcon = getGenreIcon(game.genre);
  
  // Log entries
  const logEntries = getLogEntries();
  
  return (
    <MetadataContainer>
      <GameInfoSection>
        <SectionHeader>Game Info</SectionHeader>
        <SectionContent>
          <GameInfo>
            <GameDetail>
              <DetailLabel>Genre:</DetailLabel>
              <DetailValue $bold>
                <img 
                  src={gameIcon} 
                  alt="" 
                  style={{ width: '12px', height: '12px', marginRight: '5px', verticalAlign: 'middle' }}
                />
                {formatGenre(game.genre)}
              </DetailValue>
            </GameDetail>
            
            <GameDetail>
              <DetailLabel>Status:</DetailLabel>
              <DetailValue
                $color={game.status === 'COMPLETED' ? '#008000' : '#0000FF'}
                $bold
              >
                {game.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
              </DetailValue>
            </GameDetail>
            
            <GameDetail>
              <DetailLabel>Created:</DetailLabel>
              <DetailValue>
                {formatDate(game.createdAt)}
              </DetailValue>
            </GameDetail>
          </GameInfo>
        </SectionContent>
      </GameInfoSection>
      
      <ProgressSection>
        <SectionHeader>Progress</SectionHeader>
        <SectionContent>
          <GameDetail>
            <DetailLabel>Turns:</DetailLabel>
            <DetailValue>
              {game.turnCount || 0} / {game.totalTurns || 16}
            </DetailValue>
          </GameDetail>
          
          <ProgressBar>
            <ProgressFill $progress={`${getProgressPercent()}%`} />
          </ProgressBar>
          
          <div style={{ fontSize: '10px', textAlign: 'center', marginTop: '3px' }}>
            {getProgressPercent()}% Complete
          </div>
        </SectionContent>
      </ProgressSection>
      
      <LogSection>
        <SectionHeader>Event Log</SectionHeader>
        <LogContent>
          {logEntries.length === 0 ? (
            <div style={{ fontSize: '11px', color: '#666', textAlign: 'center' }}>
              No events recorded yet
            </div>
          ) : (
            logEntries.map((entry, index) => (
              <LogEntry key={index}>
                <LogTime>{formatDate(entry.time)}</LogTime>
                <LogMessage
                  $color={
                    entry.type === 'system'
                      ? '#666666'
                      : entry.type === 'story'
                      ? '#000080'
                      : '#000000'
                  }
                >
                  {entry.message}
                </LogMessage>
              </LogEntry>
            ))
          )}
        </LogContent>
      </LogSection>
    </MetadataContainer>
  );
};

export default GameMetadata;