import React from 'react';
import styled from 'styled-components';
import Button from '../../../../components/common/Button';
import { placeholderIcons } from '../../../../utils/iconUtils';

const ControlsContainer = styled.div`
  display: flex;
  padding: 5px;
  border-bottom: 1px solid var(--win95-border-darker);
  background-color: var(--win95-window-bg);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 5px;
`;

const Separator = styled.div`
  width: 1px;
  margin: 0 5px;
  background-color: var(--win95-border-darker);
`;

const TitleSection = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  margin-left: 10px;
  font-weight: bold;
  color: var(--win95-window-header);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TitleIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 5px;
`;

/**
 * Game controls component - toolbar for the game player
 * 
 * @param {Object} props Component props
 * @param {Function} props.onExit Exit handler
 * @param {Function} props.onSave Save handler
 * @param {string} props.title Game title
 */
const GameControls = ({ onExit, onSave, title = 'Text Adventure' }) => {
  return (
    <ControlsContainer>
      <ButtonGroup>
        <Button onClick={onExit} small>
          <img
            src={placeholderIcons.windows}
            alt=""
            style={{ width: '14px', height: '14px', marginRight: '3px' }}
          />
          Exit
        </Button>
        
        <Button onClick={onSave} small>
          <img
            src={placeholderIcons.save}
            alt=""
            style={{ width: '14px', height: '14px', marginRight: '3px' }}
          />
          Save
        </Button>
      </ButtonGroup>
      
      <Separator />
      
      <TitleSection>
        <TitleIcon src={placeholderIcons.adventure} alt="" />
        {title}
      </TitleSection>
    </ControlsContainer>
  );
};

export default GameControls;