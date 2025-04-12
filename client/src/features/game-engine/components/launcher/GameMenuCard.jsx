import React from 'react';
import styled from 'styled-components';
import { win95Border } from '../../../../utils/styleUtils';
import Badge from '../../../../components/notifications/elements/Badge';

const CardContainer = styled.div`
  ${win95Border('outset')}
  background-color: var(--win95-window-bg);
  padding: 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  transition: transform 0.1s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
    ${win95Border('inset')}
    padding: 16px 14px 14px 16px;
  }
`;

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  position: relative;
`;

const Icon = styled.img`
  width: 32px;
  height: 32px;
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: 14px;
  margin-bottom: 5px;
  color: var(--win95-window-header);
`;

const Description = styled.p`
  font-size: 12px;
  color: #333333;
`;

/**
 * Game menu card component for launcher
 * 
 * @param {Object} props Component props
 * @param {string} props.title Card title
 * @param {string} props.description Card description
 * @param {string} props.icon Card icon URL
 * @param {Function} props.onClick Click handler
 * @param {number} props.badge Optional badge count
 */
const GameMenuCard = ({ 
  title, 
  description, 
  icon, 
  onClick,
  badge = null
}) => {
  return (
    <CardContainer onClick={onClick}>
      <IconContainer>
        <Icon src={icon} alt={title} />
        {badge !== null && (
          <Badge 
            count={badge} 
            backgroundColor="#ff0000" 
            position={{ top: "-5px", right: "-5px" }}
            zIndex={2}
          />
        )}
      </IconContainer>
      
      <Content>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </Content>
    </CardContainer>
  );
};

export default GameMenuCard;