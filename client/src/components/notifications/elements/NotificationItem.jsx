// src/components/notifications/elements/NotificationItem.jsx
import React from "react";
import styled from "styled-components";
import Button from "../../common/Button";
import { placeholderIcons } from "../../../utils/iconUtils";

// Styled components
const ItemContainer = styled.div`
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
  background-color: ${(props) => (props.$unread ? "#f0f7ff" : "white")};
  cursor: ${(props) => (props.$clickable ? "pointer" : "default")};

  &:hover {
    background-color: ${(props) =>
      props.$clickable ? "#f0f0f0" : props.$unread ? "#f0f7ff" : "white"};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ItemHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`;

const ItemIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 8px;
`;

const ItemTitle = styled.div`
  font-weight: ${(props) => (props.$unread ? "bold" : "normal")};
  font-size: 12px;
  flex-grow: 1;
`;

const ItemTime = styled.div`
  font-size: 10px;
  color: #808080;
`;

const ItemContent = styled.div`
  font-size: 12px;
  margin-left: 24px;
  white-space: pre-wrap;
`;

const ItemActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 5px;
  margin-top: 8px;
  margin-left: 24px;
`;

/**
 * Notification item component for lists and notification center
 *
 * @param {Object} props Component props
 * @param {Object} props.notification Notification object
 * @param {boolean} props.unread Whether notification is unread
 * @param {function} props.onClick Click handler
 * @param {function} props.onActionClick Action button click handler
 * @param {string} props.timeDisplay Formatted time string
 * @param {boolean} props.clickable Whether the item is clickable
 */
const NotificationItem = ({
  notification,
  unread = false,
  onClick,
  onActionClick,
  timeDisplay,
  clickable = true,
}) => {
  // Get appropriate icon
  const icon =
    notification.icon ||
    (notification.type && placeholderIcons[notification.type]) ||
    placeholderIcons.info;

  // Handle action button click
  const handleActionClick = (e, action) => {
    e.stopPropagation(); // Prevent triggering container click

    if (action.onClick) {
      action.onClick();
    }

    if (onActionClick) {
      onActionClick(action);
    }
  };

  return (
    <ItemContainer
      $unread={unread}
      $clickable={clickable}
      onClick={clickable && onClick ? onClick : undefined}
    >
      <ItemHeader>
        <ItemIcon src={icon} alt={notification.type || ""} />
        <ItemTitle $unread={unread}>{notification.title}</ItemTitle>
        {timeDisplay && <ItemTime>{timeDisplay}</ItemTime>}
      </ItemHeader>

      <ItemContent>{notification.message}</ItemContent>

      {notification.actions && notification.actions.length > 0 && (
        <ItemActions>
          {notification.actions.map((action, index) => (
            <Button
              key={index}
              primary={action.primary}
              small
              onClick={(e) => handleActionClick(e, action)}
            >
              {action.label}
            </Button>
          ))}
        </ItemActions>
      )}
    </ItemContainer>
  );
};

export default NotificationItem;
