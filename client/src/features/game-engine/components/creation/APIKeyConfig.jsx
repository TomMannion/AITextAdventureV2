import React, { useState } from 'react';
import styled from 'styled-components';
import { win95Border } from '../../../../utils/styleUtils';
import Text from '../../../../components/common/Text';

const Container = styled.div`
  margin-top: 15px;
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 5px;
  ${win95Border('inset')}
  background-color: white;
  font-family: 'ms_sans_serif', sans-serif;
  font-size: 12px;
`;

const ToggleVisibility = styled.button`
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #666;
  padding: 2px 5px;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
  
  input {
    margin-right: 5px;
  }
  
  label {
    font-size: 12px;
  }
`;

const InfoText = styled.div`
  margin-top: 5px;
  font-size: 11px;
  color: #666;
`;

/**
 * API Key configuration component
 * 
 * @param {Object} props Component props
 * @param {string} props.apiKey Current API key
 * @param {boolean} props.saveApiKey Whether to save API key
 * @param {Function} props.onApiKeyChange Handler for API key changes
 * @param {Function} props.onSaveApiKeyChange Handler for save API key changes
 */
const APIKeyConfig = ({
  apiKey = '',
  saveApiKey = false,
  onApiKeyChange,
  onSaveApiKeyChange,
}) => {
  const [showKey, setShowKey] = useState(false);
  
  const toggleShowKey = () => {
    setShowKey(!showKey);
  };
  
  const handleApiKeyChange = (e) => {
    onApiKeyChange(e.target.value);
  };
  
  const handleSaveApiKeyChange = (e) => {
    onSaveApiKeyChange(e.target.checked);
  };
  
  return (
    <Container>
      <Text as="label" htmlFor="apiKey" size="12px" bold marginBottom="5px" display="block">
        LLM API Key:
      </Text>
      
      <InputContainer>
        <Input
          id="apiKey"
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={handleApiKeyChange}
          placeholder="Enter your API key"
        />
        <ToggleVisibility onClick={toggleShowKey} type="button">
          {showKey ? '🙈 Hide' : '👁️ Show'}
        </ToggleVisibility>
      </InputContainer>
      
      <Checkbox>
        <input
          type="checkbox"
          id="saveApiKey"
          checked={saveApiKey}
          onChange={handleSaveApiKeyChange}
        />
        <label htmlFor="saveApiKey">Remember my API key</label>
      </Checkbox>
      
      <InfoText>
        Your API key is used to generate the story content with AI. 
        The key is only stored locally in your browser if "Remember" is checked.
      </InfoText>
    </Container>
  );
};

export default APIKeyConfig;