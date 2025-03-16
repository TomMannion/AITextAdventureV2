import React from "react";
import styled from "styled-components";
import Text from "../../../components/common/Text";
import Icon from "../../../components/common/Icon";

const IconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
  height: 90px;
  margin: 5px;
  padding: 5px;
  position: relative;
  cursor: default;

  &:hover .icon-label {
    background-color: rgba(0, 0, 128, 0.1);
  }

  ${(props) =>
    props.$isSelected &&
    `
    .icon-label {
      background-color: #000080;
      color: white;
    }
  `}
`;

const IconContainer = styled.div`
  margin-bottom: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LabelContainer = styled.div`
  width: 100%;
  text-align: center;
  padding: 2px;
  background-color: ${(props) =>
    props.$isSelected ? "#000080" : "transparent"};
  color: ${(props) => (props.$isSelected ? "white" : "white")};
`;

/**
 * Desktop icon component
 *
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the icon
 * @param {string} props.name - Display name for the icon
 * @param {string} props.icon - Icon image URL
 * @param {boolean} props.isSelected - Whether the icon is currently selected
 * @param {Function} props.onClick - Click handler
 * @param {Function} props.onDoubleClick - Double click handler
 */
const DesktopIcon = ({
  id,
  name,
  icon,
  isSelected = false,
  onClick,
  onDoubleClick,
  ...restProps
}) => {
  // Handle single click
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick(id);
  };

  // Handle double click
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (onDoubleClick) onDoubleClick(id);
  };

  return (
    <IconWrapper
      $isSelected={isSelected}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      {...restProps}
    >
      <IconContainer>
        <Icon src={icon} alt={name} size="32px" />
      </IconContainer>

      <LabelContainer $isSelected={isSelected} className="icon-label">
        <Text
          color={isSelected ? "white" : "white"}
          size="11px"
          align="center"
          textShadow="1px 1px 1px rgba(0, 0, 0, 0.8)"
        >
          {name}
        </Text>
      </LabelContainer>
    </IconWrapper>
  );
};

export default DesktopIcon;
