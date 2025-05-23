import React from "react";
import styled from "styled-components";
import Text from "../common/Text";
import { placeholderIcons } from "../../utils/iconUtils";

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) =>
    props.$isActive ? "var(--win95-window-header, #000080)" : "#808080"};
  padding: 3px 5px;
  cursor: ${(props) => (props.$isMaximized ? "default" : "move")};
  user-select: none;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const WindowIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 4px;
`;

/**
 * Window header component for Windows 95 style windows
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Window title
 * @param {string} props.icon - Window icon URL
 * @param {boolean} props.isActive - Whether the window is currently active
 * @param {boolean} props.isMaximized - Whether the window is maximized
 * @param {Function} props.onMouseDown - Handler for mouse down events (for window dragging)
 * @param {Function} props.onDoubleClick - Handler for double click events (for window maximize/restore)
 * @param {React.ReactNode} props.children - Additional content, typically window controls
 */
const WindowHeader = ({
  title,
  icon,
  isActive = true,
  isMaximized = false,
  onMouseDown,
  onDoubleClick,
  children,
  ...restProps
}) => {
  // Resolve the icon URL
  const iconUrl = icon || placeholderIcons.windows;

  return (
    <HeaderContainer
      $isActive={isActive}
      $isMaximized={isMaximized}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      {...restProps}
    >
      <TitleContainer>
        <WindowIcon src={iconUrl} alt="" />
        <Text color="white" size="12px" bold nowrap ellipsis>
          {title}
        </Text>
      </TitleContainer>
      {children}
    </HeaderContainer>
  );
};

export default WindowHeader;
