import React from 'react';
import styled from 'styled-components';
import { getGenreIcon } from '../../../../utils/iconUtils';
import { formatDate } from '../../../../utils/dateUtils';

const Item = styled.div`
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  background-color: ${props => props.$disabled ? '#f0f0f0' : 'white'};
  opacity: ${props => props.$disabled ? 0.7 : 1};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${props => props.$disabled ? '#f0f0f0' : '#f0f7ff'};
  }
  
  &:active {
    background-color: ${props => props.$disabled ? '#f0f0f0' : '#e0e0ff'};
  }
`;

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
  
  img {
    width: 32px;
    height: 32px;
  }
`;

const Content = styled.div`
  flex-grow: 1;
  overflow: hidden;
`;

const Title = styled.h3`
  font-size: 14px;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${props => props.$completed ? '#666666' : 'var(--win95-window-header)'};
  
  ${props => props.$completed && `
    text-decoration: line-through;
  `}
`;

const Details = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 12px;
  color: #666666;
`;

const Detail = styled.div`
  display: flex;
  align-items: center;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 2px 5px;
  border-radius: 2px;
  font-size: 10px;
  font-weight: bold;
  color: white;
  background-color: ${props => {
    switch (props.$status) {
      case 'COMPLETED':
        return '#4CAF50';
      case 'ACTIVE':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  }};
`;

/**
 * Game item component for the browser
 * 
 * @param {Object} props Component props
 * @param {Object} props.game Game data
 * @param {Function} props.onSelect Handler for game selection
 * @param {boolean} props.disabled Whether the item is disabled
 */
const GameItem = ({ game, onSelect, disabled = false }) => {
  // Format genre name
  const formatGenre = (genre) => {
    if (!genre) return 'Unknown';
    return genre.charAt(0).toUpperCase() + genre.slice(1);
  };
  
  // Format turn info
  const formatTurns = (current, total) => {
    if (current === undefined || total === undefined) {
      return 'Unknown';
    }
    
    return `${current}/${total} turns`;
  };
  
  // Calculate completion percentage
  const getCompletionPercent = () => {
    if (!game.turnCount || !game.totalTurns) return 0;
    return Math.round((game.turnCount / game.totalTurns) * 100);
  };
  
  // Check if game is completed
  const isCompleted = game.status === 'COMPLETED';
  
  // Handle click
  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect();
    }
  };
  
  return (
    <Item 
      onClick={handleClick}
      $disabled={disabled}
    >
      <IconContainer>
        <img 
          src={getGenreIcon(game.genre)} 
          alt={game.genre || 'Unknown'}
        />
      </IconContainer>
      
      <Content>
        <Title $completed={isCompleted}>
          {game.title || 'Untitled Adventure'}
        </Title>
        
        <Details>
          <Detail>
            <span title="Genre">📚 {formatGenre(game.genre)}</span>
          </Detail>
          
          <Detail>
            <span title="Progress">📏 {formatTurns(game.turnCount, game.totalTurns)}</span>
          </Detail>
          
          <Detail>
            <span title="Completion">
              🏆 {getCompletionPercent()}%
            </span>
          </Detail>
          
          <Detail>
            <span title="Last played">
              🕒 {formatDate(game.lastPlayedAt || game.createdAt)}
            </span>
          </Detail>
        </Details>
      </Content>
      
      <StatusBadge $status={game.status}>
        {game.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
      </StatusBadge>
    </Item>
  );
};

export default GameItem;