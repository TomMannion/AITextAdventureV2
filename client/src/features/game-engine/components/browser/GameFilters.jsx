import React, { useState } from 'react';
import styled from 'styled-components';
import { win95Border } from '../../../../utils/styleUtils';

const FiltersContainer = styled.div`
  ${win95Border('outset')}
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f0f0f0;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const FilterItem = styled.div`
  display: flex;
  align-items: center;
`;

const FilterLabel = styled.label`
  font-size: 12px;
  margin-right: 5px;
  white-space: nowrap;
`;

const FilterSelect = styled.select`
  font-size: 12px;
  padding: 2px 5px;
  ${win95Border('inset')}
  background-color: white;
`;

const RefreshButton = styled.button`
  ${win95Border('outset')}
  padding: 3px 8px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  
  &:active {
    ${win95Border('inset')}
    padding: 4px 7px 2px 9px;
  }
`;

const RefreshIcon = styled.span`
  display: inline-block;
  margin-right: 5px;
  transform: ${props => props.$isRefreshing ? 'rotate(360deg)' : 'none'};
  transition: transform 0.5s ease;
`;

/**
 * Game filters component for the browser
 * 
 * @param {Object} props Component props
 * @param {Object} props.filters Current filter values
 * @param {Function} props.onFilterChange Filter change handler
 * @param {Function} props.onRefresh Refresh handler
 */
const GameFilters = ({ 
  filters = { status: 'ALL', genre: 'ALL' }, 
  onFilterChange,
  onRefresh
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };
  
  // Handle refresh button click
  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    
    // Reset refreshing state after animation
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };
  
  return (
    <FiltersContainer>
      <FilterGroup>
        <FilterItem>
          <FilterLabel htmlFor="status">Status:</FilterLabel>
          <FilterSelect
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </FilterSelect>
        </FilterItem>
        
        <FilterItem>
          <FilterLabel htmlFor="genre">Genre:</FilterLabel>
          <FilterSelect
            id="genre"
            name="genre"
            value={filters.genre}
            onChange={handleFilterChange}
          >
            <option value="ALL">All</option>
            <option value="fantasy">Fantasy</option>
            <option value="scifi">Science Fiction</option>
            <option value="horror">Horror</option>
            <option value="mystery">Mystery</option>
            <option value="western">Western</option>
          </FilterSelect>
        </FilterItem>
      </FilterGroup>
      
      <RefreshButton onClick={handleRefreshClick}>
        <RefreshIcon $isRefreshing={isRefreshing}>↻</RefreshIcon>
        Refresh
      </RefreshButton>
    </FiltersContainer>
  );
};

export default GameFilters;