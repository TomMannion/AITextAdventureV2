// src/components/notifications/NotificationIcon.jsx
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useNotification } from "../../contexts/NotificationContext";
import { placeholderIcons } from "../../utils/iconUtils";
import { getUnreadCount, markAllAsRead } from "../../utils/notificationUtils";
import NotificationCenter from "./NotificationCenter";
import Badge from "./elements/Badge";
import Win95Tooltip from "./elements/Win95Tooltip";

// Flat icon styling (no borders) for system tray
const IconContainer = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  /* Remove the button-like borders */
  background-color: transparent;
  border: none;
`;

const IconImage = styled.img`
  width: 16px;
  height: 16px;
  animation: ${(props) =>
    props.$hasNew ? "blink 1s ease-in-out infinite alternate" : "none"};

  @keyframes blink {
    from {
      opacity: 1;
    }
    to {
      opacity: 0.5;
    }
  }
`;

/**
 * Windows 95 style notification icon component for the taskbar
 */
const NotificationIcon = () => {
  // State for showing/hiding the notification center
  const [isOpen, setIsOpen] = useState(false);
  // State for showing/hiding the tooltip
  const [showTooltip, setShowTooltip] = useState(false);
  // Reference to the icon container for positioning
  const iconRef = useRef(null);
  // Track read state for notifications
  const [readState, setReadState] = useState(() => {
    // Load saved read state from localStorage
    const savedReadState = localStorage.getItem("notification_read_state");
    return savedReadState ? JSON.parse(savedReadState) : {};
  });

  // Get notifications from context
  const { notifications } = useNotification();

  // Calculate unread count using utility function
  const unreadCount = getUnreadCount(notifications, readState);

  // When notifications change, update read state
  useEffect(() => {
    // Update with new notifications
    const newReadState = { ...readState };
    let hasNewNotifications = false;

    notifications.forEach((notification) => {
      // If we haven't seen this notification before, mark it as unread
      if (newReadState[notification.id] === undefined) {
        newReadState[notification.id] = false;
        hasNewNotifications = true;
      }
    });

    // If there are new notifications, we could trigger a sound here

    // Update read state
    setReadState(newReadState);

    // Save to localStorage
    localStorage.setItem(
      "notification_read_state",
      JSON.stringify(newReadState)
    );
  }, [notifications]);

  // Close notification center when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        iconRef.current &&
        !iconRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle open/close of notification center
  const handleToggleNotificationCenter = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (newIsOpen) {
      // Opening the center, mark all as read
      const updatedReadState = markAllAsRead(notifications, readState);
      setReadState(updatedReadState);
      localStorage.setItem(
        "notification_read_state",
        JSON.stringify(updatedReadState)
      );
    }
  };

  // Generate tooltip text based on unread count
  const tooltipText =
    unreadCount > 0
      ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
      : "Notification Center";

  return (
    <div ref={iconRef}>
      <IconContainer
        onClick={handleToggleNotificationCenter}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <IconImage
          $hasNew={unreadCount > 0}
          src={placeholderIcons.notification}
          alt="Notifications"
        />

        {/* Use Badge component */}
        <Badge count={unreadCount} size="small" />

        {/* Use Win95Tooltip component */}
        <Win95Tooltip show={showTooltip} position="top">
          {tooltipText}
        </Win95Tooltip>
      </IconContainer>

      <NotificationCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default NotificationIcon;
