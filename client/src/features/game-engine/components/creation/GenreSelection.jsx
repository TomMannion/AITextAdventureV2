import React from 'react';
import styled from 'styled-components';
import { win95Border } from '../../../../utils/styleUtils';
import { getGenreIcon } from '../../../../utils/iconUtils';

// Genre card container
const GenreContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
`;

// Individual genre card
const GenreCard = styled.div`
  ${props => props.$selected ? win95Border('inset') : win95Border('outset')}
  padding: ${props => props.$selected ? '11px 9px 9px 11px' : '10px'};
  background-color: ${props => props.$selected ? props.$bgColor || '#e0e0e0' : '#f0f0f0'};
  cursor: pointer;
  width: calc(33.333% - 7px);
  text-align: center;
  transition: transform 0.1s ease;
  
  &:hover {
    background-color: ${props => props.$bgColor || '#e0e0e0'};
    transform: ${props => props.$selected ? 'none' : 'translateY(-2px)'};
  }
`;

// Genre icon
const GenreIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-bottom: 5px;
`;

// Genre name
const GenreName = styled.div`
  font-size: 12px;
  font-weight: ${props => props.$selected ? 'bold' : 'normal'};
`;

// Genre preview container
const GenrePreview = styled.div`
  ${win95Border('inset')}
  padding: 15px;
  background-color: ${props => props.$bgColor || '#f0f0f0'};
  margin-bottom: 15px;
`;

// Preview title
const PreviewTitle = styled.h4`
  font-size: 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  color: var(--win95-window-header);
`;

// Preview title icon
const TitleIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 8px;
`;

// Preview description
const PreviewDescription = styled.p`
  font-size: 12px;
  margin-bottom: 10px;
`;

// Example text
const ExampleText = styled.p`
  font-style: italic;
  font-size: 12px;
  border-left: 3px solid var(--win95-border-dark);
  padding-left: 8px;
  margin-top: 10px;
`;

// Genre data
const genreData = {
  fantasy: {
    name: 'Fantasy',
    description: 'A magical world of dragons, wizards, and epic quests. Perfect for heroic adventures and magical exploration.',
    bgColor: '#e6f7ff',
    example: 'You stand at the gates of the ancient elven city of Eladrin, your sword glimmering in the moonlight...',
  },
  scifi: {
    name: 'Science Fiction',
    description: 'Explore distant galaxies, encounter alien species, and discover advanced technology.',
    bgColor: '#e6fff7',
    example: 'The space station\'s emergency sirens blare as you rush to your assigned escape pod...',
  },
  horror: {
    name: 'Horror',
    description: 'Face your deepest fears in a world filled with supernatural threats and psychological terror.',
    bgColor: '#ffe6e6',
    example: 'The old mansion creaks and groans as you cautiously step inside, your flashlight flickering...',
  },
  mystery: {
    name: 'Mystery',
    description: 'Solve intricate puzzles and uncover hidden secrets in a world of intrigue and suspense.',
    bgColor: '#f7e6ff',
    example: 'The detective\'s office is dimly lit as you examine the cryptic note left at the crime scene...',
  },
  weird_west: {
    name: 'Weird West',
    description: 'Experience the supernatural frontier where cowboys battle eldritch horrors, shamans wield mysterious powers, and strange phenomena lurk in ghost towns.',
    bgColor: '#8a795d',
    example: 'The saloon falls silent as you enter, your silver revolver the only defense against the shapeshifter stalking the town...',
  },
};

/**
 * Genre selection component for game creation
 * 
 * @param {Object} props Component props
 * @param {string} props.selectedGenre Currently selected genre
 * @param {Function} props.onSelectGenre Callback when genre is selected
 */
const GenreSelection = ({ selectedGenre = 'fantasy', onSelectGenre }) => {
  // Get selected genre data
  const selectedGenreData = genreData[selectedGenre] || genreData.fantasy;
  
  return (
    <>
      <GenreContainer>
        {Object.entries(genreData).map(([id, data]) => (
          <GenreCard
            key={id}
            $selected={selectedGenre === id}
            $bgColor={data.bgColor}
            onClick={() => onSelectGenre(id)}
          >
            <GenreIcon src={getGenreIcon(id)} alt={data.name} />
            <GenreName $selected={selectedGenre === id}>{data.name}</GenreName>
          </GenreCard>
        ))}
      </GenreContainer>
      
      <GenrePreview $bgColor={selectedGenreData.bgColor}>
        <PreviewTitle>
          <TitleIcon src={getGenreIcon(selectedGenre)} alt={selectedGenreData.name} />
          {selectedGenreData.name}
        </PreviewTitle>
        
        <PreviewDescription>
          {selectedGenreData.description}
        </PreviewDescription>
        
        <ExampleText>
          "{selectedGenreData.example}"
        </ExampleText>
      </GenrePreview>
    </>
  );
};

export default GenreSelection;