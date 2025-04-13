import React from 'react';
import styled from 'styled-components';
import { win95Border } from '../../../../utils/styleUtils';
import Button from '../../../../components/common/Button';
import { placeholderIcons } from '../../../../utils/iconUtils';
import { useGameStore } from '../../../../contexts/GameStoreContext';

const SelectorContainer = styled.div`
  border-top: 1px solid var(--win95-border-darker);
  background-color: var(--win95-window-bg);
  padding: 10px;
`;

const SelectorHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 12px;
  color: var(--win95-window-header);
`;

const HeaderIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 8px;
`;

const OptionsContainer = styled.div`
  ${win95Border('inset')}
  background-color: white;
  padding: 5px;
  max-height: 180px;
  overflow-y: auto;
  margin-bottom: 12px;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const OptionButton = styled.button`
  text-align: left;
  padding: 8px 10px;
  ${props => props.$selected ? win95Border('inset') : win95Border('outset')}
  background-color: ${props => props.$selected ? '#e0e0ff' : '#f0f0f0'};
  cursor: pointer;
  font-size: 13px;
  line-height: 1.4;
  color: #000080;
  position: relative;
  padding-left: ${props => props.$hasBullet ? '24px' : '10px'};
  
  &:hover {
    background-color: ${props => props.$selected ? '#e0e0ff' : '#f0f7ff'};
  }
  
  &:before {
    content: ${props => props.$hasBullet ? '"•"' : '""'};
    position: ${props => props.$hasBullet ? 'absolute' : 'static'};
    left: ${props => props.$hasBullet ? '10px' : '0'};
    color: #000080;
    font-weight: bold;
  }
`;

const EmptyOptionsMessage = styled.div`
  padding: 10px;
  color: #808080;
  text-align: center;
  font-size: 12px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
`;

/**
 * Improved choice selector component - displays available options
 * 
 * @param {Object} props Component props
 * @param {Array} props.options Available options
 * @param {string|number} props.selectedOption Selected option ID
 * @param {Function} props.onSelectOption Handler for option selection
 * @param {Function} props.onSubmit Handler for submit button
 */
const ChoiceSelector = ({
  options = [],
  selectedOption,
  onSelectOption,
  onSubmit,
}) => {
  // Handle option click
  const handleOptionClick = (optionId) => {
    onSelectOption(optionId);
  };
  
  // Check if submit is enabled
  const isSubmitEnabled = !!selectedOption;
  
  return (
    <SelectorContainer>
      <SelectorHeader>
        <HeaderIcon src={placeholderIcons.adventure} alt="" />
        What would you like to do?
      </SelectorHeader>
      
      {options.length > 0 ? (
        <OptionsContainer>
          <OptionsList>
            {options.map(option => (
              <OptionButton
                key={option.id}
                $selected={selectedOption === option.id}
                $hasBullet={true}
                onClick={() => handleOptionClick(option.id)}
              >
                {option.text}
              </OptionButton>
            ))}
          </OptionsList>
        </OptionsContainer>
      ) : (
        <OptionsContainer>
          <EmptyOptionsMessage>
            Waiting for options to appear...
          </EmptyOptionsMessage>
        </OptionsContainer>
      )}
      
      <ButtonContainer>
        <Button 
          primary
          onClick={onSubmit}
          disabled={!isSubmitEnabled}
        >
          <img 
            src={placeholderIcons.adventure}
            alt=""
            style={{ width: '14px', height: '14px', marginRight: '5px' }}
          />
          Continue Adventure
        </Button>
      </ButtonContainer>
    </SelectorContainer>
  );
};

export default ChoiceSelector;