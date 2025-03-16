// src/components/notifications/NotificationContainer.jsx
import React from "react";
import styled from "styled-components";
import { useNotification } from "../../contexts/NotificationContext";
import NotificationToast from "./NotificationToast";

// Styled Container
const Container = styled.div`
  position: fixed;
  z-index: 10000; /* Ensure it's above everything else */
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  max-height: 90vh;
  overflow: hidden;
  pointer-events: none; /* Allow clicks to pass through container, but not notifications */

  /* Position based on props */
  ${({ $position }) => {
    switch ($position) {
      case "top-right":
        return `
          top: 10px;
          right: 10px;
        `;
      case "top-left":
        return `
          top: 10px;
          left: 10px;
        `;
      case "bottom-right":
        return `
          bottom: 40px; /* Avoid taskbar */
          right: 10px;
          flex-direction: column-reverse;
        `;
      case "bottom-left":
        return `
          bottom: 40px; /* Avoid taskbar */
          left: 10px;
          flex-direction: column-reverse;
        `;
      case "top-center":
        return `
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          align-items: center;
        `;
      case "bottom-center":
        return `
          bottom: 40px; /* Avoid taskbar */
          left: 50%;
          transform: translateX(-50%);
          flex-direction: column-reverse;
          align-items: center;
        `;
      default:
        return `
          bottom: 40px;
          right: 10px;
          flex-direction: column-reverse;
        `;
    }
  }}
`;

const ToastWrapper = styled.div`
  pointer-events: auto; /* Make the actual notifications clickable */
`;

const CollapsedNotification = styled.div`
  background-color: #c0c0c0;
  border: 2px solid #000000;
  padding: 8px 12px;
  margin-bottom: 8px;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5);

  &:hover {
    background-color: #d0d0d0;
  }
`;

/**
 * Container component that displays all active notifications
 */
const NotificationContainer = () => {
  const {
    notifications,
    removeNotification,
    clearNotifications,
    showInfo,
    config,
  } = useNotification();

  // Get settings from context
  const position = config.position;
  const maxVisible = config.maxVisible;

  // Limit the number of visible notifications
  const visibleNotifications = notifications.slice(0, maxVisible);

  // Calculate if there are hidden notifications
  const hiddenCount = notifications.length - maxVisible;

  // Handle click on collapsed notification count
  const handleCollapsedClick = () => {
    showInfo(
      `You have ${hiddenCount} more notification${hiddenCount > 1 ? "s" : ""}.`,
      {
        title: "Hidden Notifications",
        actions: [
          {
            label: "View All",
            primary: true,
            onClick: () => {
              // This could open a notification center or temporarily show all notifications
              console.log("Show all notifications");
            },
          },
          {
            label: "Clear All",
            onClick: () => {
              clearNotifications();
            },
          },
        ],
      }
    );
  };

  return (
    <Container $position={position}>
      {/* Show collapsed indicator for hidden notifications */}
      {hiddenCount > 0 && (
        <ToastWrapper>
          <CollapsedNotification onClick={handleCollapsedClick}>
            +{hiddenCount} more notification{hiddenCount > 1 ? "s" : ""}
          </CollapsedNotification>
        </ToastWrapper>
      )}

      {visibleNotifications.map((notification) => (
        <ToastWrapper key={notification.id}>
          <NotificationToast
            id={notification.id}
            title={notification.title}
            message={notification.message}
            type={notification.type}
            icon={notification.icon}
            timeout={notification.timeout}
            actions={notification.actions}
            onClose={removeNotification}
            animate={notification.animate !== false}
            style={notification.style}
          />
        </ToastWrapper>
      ))}
    </Container>
  );
};

export default NotificationContainer;
