import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useGameFlow } from '../../contexts/GameFlowContext';
import { useGameData } from '../../contexts/GameDataContext';
import Button from '../../../../components/common/Button';
import { win95Border } from '../../../../utils/styleUtils';
import { placeholderIcons } from '../../../../utils/iconUtils';
import GameItem from './GameItem';
import GameFilters from './GameFilters';

const BrowserContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--win95-window-bg);
  padding: 20px;
  overflow: hidden;
`;

const Title = styled.h2`
  font-size: 18px;
  margin-bottom: 20px;
  text-align: center;
  border-bottom: 2px solid var(--win95-border-dark);
  padding-bottom: 10px;
`;

const FiltersSection = styled.div`
  margin-bottom: 15px;
`;

const GameListContainer = styled.div`
  ${win95Border('inset')}
  flex-grow: 1;
  overflow-y: auto;
  background-color: white;
  margin-bottom: 15px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
  color: #808080;
`;

const EmptyIcon = styled.div`
  font-size: 32px;
  margin-bottom: 10px;
`;

const EmptyText = styled.p`
  font-size: 14px;
  margin-bottom: 5px;
`;

const EmptySubtext = styled.p`
  font-size: 12px;
  margin-bottom: 15px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

/**
 * Game browser component - displays list of saved games
 */
const GameBrowser = () => {
  const { goToLauncher, goToCreator, goToPlayer } = useGameFlow();
  const { gameList, fetchGames, loadGame, startGame, apiKey } = useGameData();
  
  // Filter state
  const [filters, setFilters] = useState({
    status: 'ALL',
    genre: 'ALL',
  });
  
  // Filtered game list
  const [filteredGames, setFilteredGames] = useState([]);
  
  // Refresh games on mount
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);
  
  // Update filtered games when filters or game list changes
  useEffect(() => {
    const filtered = gameList.filter(game => {
      // Status filter
      if (filters.status !== 'ALL' && game.status !== filters.status) {
        return false;
      }
      
      // Genre filter
      if (filters.genre !== 'ALL' && game.genre !== filters.genre) {
        return false;
      }
      
      return true;
    });
    
    // Sort by last played date, newest first
    filtered.sort((a, b) => {
      const dateA = new Date(a.lastPlayedAt || a.createdAt || 0);
      const dateB = new Date(b.lastPlayedAt || b.createdAt || 0);
      return dateB - dateA;
    });
    
    setFilteredGames(filtered);
  }, [gameList, filters]);
  
  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value,
    });
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchGames(true); // Force refresh
  };
  
  // Handle game selection
  const handleGameSelect = async (gameId) => {
    const game = await loadGame(gameId);
    
    if (game) {
      // Check if game has content already
      if (
        game.storySegments && 
        game.storySegments.length > 0
      ) {
        goToPlayer();
      } else {
        // Start the game to generate initial content
        await startGame(gameId);
      }
    }
  };
  
  // Check if we need API key
  const needsApiKey = !apiKey && gameList.length > 0;
  
  return (
    <BrowserContainer>
      <Title>Saved Adventures</Title>
      
      <FiltersSection>
        <GameFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onRefresh={handleRefresh}
        />
      </FiltersSection>
      
      <GameListContainer>
        {filteredGames.length === 0 ? (
          <EmptyState>
            <EmptyIcon>{gameList.length === 0 ? '📂' : '🔍'}</EmptyIcon>
            <EmptyText>
              {gameList.length === 0
                ? 'No adventures found'
                : 'No adventures match your filters'}
            </EmptyText>
            <EmptySubtext>
              {gameList.length === 0
                ? 'Create a new adventure to get started'
                : 'Try adjusting your filters'}
            </EmptySubtext>
            
            {gameList.length === 0 && (
              <Button onClick={goToCreator}>Create New Adventure</Button>
            )}
          </EmptyState>
        ) : (
          filteredGames.map(game => (
            <GameItem
              key={game.id}
              game={game}
              onSelect={() => handleGameSelect(game.id)}
              disabled={needsApiKey}
            />
          ))
        )}
      </GameListContainer>
      
      <ButtonContainer>
        <Button onClick={goToLauncher}>
          <img
            src={placeholderIcons.windows}
            alt=""
            style={{ width: '16px', height: '16px', marginRight: '4px' }}
          />
          Back
        </Button>
        
        <Button primary onClick={goToCreator}>
          <img
            src={placeholderIcons.adventure}
            alt=""
            style={{ width: '16px', height: '16px', marginRight: '4px' }}
          />
          New Adventure
        </Button>
      </ButtonContainer>
      
      {needsApiKey && (
        <div style={{ marginTop: '10px', color: '#aa0000', fontSize: '12px', textAlign: 'center' }}>
          Please enter your API key in settings to continue adventures.
        </div>
      )}
    </BrowserContainer>
  );
};

export default GameBrowser;