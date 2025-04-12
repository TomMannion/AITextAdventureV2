import React from 'react';
import styled from 'styled-components';
import { win95Border } from '../../../../utils/styleUtils';
import Button from '../../../../components/common/Button';

const SelectorContainer = styled.div`
  border-top: 1px solid var(--win95-border-darker);
  background-color: var(--win95-window-bg);
  padding: 10px;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 15px;
`;

const OptionButton = styled.button`
  text-align: left;
  padding: 8px 10px;
  ${props => props.$selected ? win95Border('inset') : win95Border('outset')}
  background-color: ${props => props.$selected ? '#e0e0e0' : 'white'};
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background-color: ${props => props.$selected ? '#e0e0e0' : '#f0f7ff'};
  }
`;

const CustomInputContainer = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed var(--win95-border-darker);
`;

const CustomInputLabel = styled.div`
  font-size: 12px;
  margin-bottom: 5px;
`;

const CustomInput = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
  ${win95Border('inset')}
  background-color: white;
  font-size: 12px;
  font-family: 'ms_sans_serif', sans-serif;
`;

const SubmitButton = styled(Button)`
  margin-top: 5px;
  width: 100%;
`;

const EmptyOptionsMessage = styled.div`
  ${win95Border('inset')}
  padding: 10px;
  background-color: white;
  font-size: 12px;
  color: #808080;
  text-align: center;
  margin-bottom: 15px;
`;

/**
 * Choice selector component - displays available options and custom input
 * 
 * @param {Object} props Component props
 * @param {Array} props.options Available options
 * @param {string|number} props.selectedOption Selected option ID
 * @param {string} props.customOption Custom option text
 * @param {Function} props.onSelectOption Handler for option selection
 * @param {Function} props.onCustomOptionChange Handler for custom option changes
 * @param {Function} props.onSubmit Handler for submit button
 */
const ChoiceSelector = ({
  options = [],
  selectedOption,
  customOption = '',
  onSelectOption,
  onCustomOptionChange,
  onSubmit,
}) => {
  // Handle option click
  const handleOptionClick = (optionId) => {
    onSelectOption(optionId);
  };
  
  // Handle custom input change
  const handleCustomInputChange = (e) => {
    onCustomOptionChange(e.target.value);
  };
  
  // Check if submit is enabled
  const isSubmitEnabled = selectedOption || customOption.trim().length > 0;
  
  return (
    <SelectorContainer>
      {options.length === 0 ? (
        <EmptyOptionsMessage>
          Waiting for options to appear...
        </EmptyOptionsMessage>
      ) : (
        <OptionsContainer>
          {options.map(option => (
            <OptionButton
              key={option.id}
              $selected={selectedOption === option.id}
              onClick={() => handleOptionClick(option.id)}
            >
              {option.text}
            </OptionButton>
          ))}
        </OptionsContainer>
      )}
      
      <CustomInputContainer>
        <CustomInputLabel>Or enter your own action:</CustomInputLabel>
        <CustomInput
          type="text"
          value={customOption}
          onChange={handleCustomInputChange}
          placeholder="Type what you want to do..."
        />
        
        <SubmitButton 
          primary
          onClick={onSubmit}
          disabled={!isSubmitEnabled}
        >
          Continue
        </SubmitButton>
      </CustomInputContainer>
    </SelectorContainer>
  );
};

export default ChoiceSelector;