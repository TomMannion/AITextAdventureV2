// src/components/notifications/NotificationCenter.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "../common/Button";
import { useNotification } from "../../contexts/NotificationContext";
import { placeholderIcons } from "../../utils/iconUtils";
import { formatRelativeTime } from "../../utils/dateUtils";
import {
  filterNotifications,
  sortNotifications,
  markAllAsRead,
} from "../../utils/notificationUtils";

// Import reusable components
import Badge from "./elements/Badge";
import FilterPill from "./elements/FilterPill";
import NotificationItem from "./elements/NotificationItem";

// Styled components
const CenterContainer = styled.div`
  position: absolute;
  width: 320px;
  height: 400px;
  background-color: #c0c0c0;
  border: 2px solid #000000;
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  bottom: ${(props) => (props.$isMobile ? "0" : "30px")};
  right: ${(props) => (props.$isMobile ? "0" : "10px")};
  z-index: 9999;
`;

const CenterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #000080;
  color: white;
  padding: 4px 6px;
  font-weight: bold;
  font-size: 12px;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 8px;
`;

const CenterTabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #808080;
`;

const CenterTab = styled.div`
  padding: 4px 12px;
  border: 1px solid #808080;
  border-bottom: ${(props) => (props.$active ? "none" : "1px solid #808080")};
  background-color: ${(props) => (props.$active ? "#c0c0c0" : "#d4d0c8")};
  font-size: 12px;
  cursor: pointer;
  position: relative;
  top: ${(props) => (props.$active ? "1px" : "0")};
  margin-right: 2px;
`;

const CenterContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 0;
  background-color: white;
  border: 1px solid #808080;
  border-top: none;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #808080;
  padding: 20px;
`;

const EmptyIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-bottom: 10px;
  opacity: 0.7;
`;

const CenterFooter = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border-top: 1px solid #808080;
`;

const FilterContainer = styled.div`
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

/**
 * Windows 95 style Notification Center
 */
const NotificationCenter = ({ isOpen, onClose, isMobile = false }) => {
  // Get notification functions and state
  const {
    notifications,
    removeNotification,
    clearNotifications,
    NOTIFICATION_TYPES,
  } = useNotification();

  // State for tracking what the user has already seen
  const [readNotifications, setReadNotifications] = useState(() => {
    // Try to load from localStorage
    try {
      const savedRead = localStorage.getItem("read_notifications");
      return savedRead ? JSON.parse(savedRead) : {};
    } catch (error) {
      console.error("Error loading read notifications:", error);
      return {};
    }
  });

  // Track notification history - keep more than just active notifications
  const [notificationHistory, setNotificationHistory] = useState(() => {
    // Try to load from localStorage
    try {
      const savedHistory = localStorage.getItem("notification_history");
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error("Error loading notification history:", error);
      return [];
    }
  });

  // Active tab - "all" or "unread"
  const [activeTab, setActiveTab] = useState("all");

  // Active filters - which notification types to show
  const [activeFilters, setActiveFilters] = useState(
    Object.values(NOTIFICATION_TYPES).reduce((acc, type) => {
      acc[type] = true;
      return acc;
    }, {})
  );

  // When component opens, mark active notifications as read
  useEffect(() => {
    if (isOpen && notifications.length > 0) {
      const newReadState = { ...readNotifications };

      notifications.forEach((notification) => {
        newReadState[notification.id] = true;
      });

      setReadNotifications(newReadState);
    }
  }, [isOpen, notifications]);

  // Save read state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(
      "read_notifications",
      JSON.stringify(readNotifications)
    );
  }, [readNotifications]);

  // Update notification history when notifications change
  useEffect(() => {
    // Add any new notifications to history
    const updatedHistory = [...notificationHistory];

    notifications.forEach((notification) => {
      // Check if this notification is already in history
      const existingIndex = updatedHistory.findIndex(
        (item) => item.id === notification.id
      );

      if (existingIndex === -1) {
        // New notification, add to history with timestamp
        updatedHistory.push({
          ...notification,
          receivedAt: notification.timestamp || new Date(),
        });
      }
    });

    // Sort by timestamp, newest first
    const sortedHistory = sortNotifications(updatedHistory, "time", false);

    // Keep only the 50 most recent notifications
    const trimmedHistory = sortedHistory.slice(0, 50);

    setNotificationHistory(trimmedHistory);
    localStorage.setItem(
      "notification_history",
      JSON.stringify(trimmedHistory)
    );
  }, [notifications]);

  // Save notification history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "notification_history",
      JSON.stringify(notificationHistory)
    );
  }, [notificationHistory]);

  // Get filtered notifications using utility function
  const getFilteredNotifications = () => {
    return filterNotifications(
      notificationHistory,
      {
        typeFilters: activeFilters,
        unreadOnly: activeTab === "unread",
      },
      readNotifications
    );
  };

  // Handle marking a notification as read
  const markAsRead = (notificationId) => {
    setReadNotifications((prev) => ({
      ...prev,
      [notificationId]: true,
    }));
  };

  // Get unread count
  const getUnreadCount = () => {
    return notificationHistory.filter(
      (notification) => !readNotifications[notification.id]
    ).length;
  };

  // Handle filter toggle
  const toggleFilter = (type) => {
    setActiveFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Handle marking all as read
  const handleMarkAllAsRead = () => {
    const allRead = markAllAsRead(notificationHistory, readNotifications);
    setReadNotifications(allRead);
    // Ensure localStorage is updated immediately
    localStorage.setItem("read_notifications", JSON.stringify(allRead));
  };

  // If not open, return null
  if (!isOpen) return null;

  // Get filtered notifications for display
  const filteredNotifications = getFilteredNotifications();
  const unreadCount = getUnreadCount();

  return (
    <CenterContainer $isMobile={isMobile}>
      <CenterHeader>
        <HeaderTitle>
          <HeaderIcon src={placeholderIcons.notification} alt="Notifications" />
          <span>Notification Center</span>
        </HeaderTitle>
        <Button square small onClick={onClose}>
          <span>✕</span>
        </Button>
      </CenterHeader>

      <CenterTabsContainer>
        <CenterTab
          $active={activeTab === "all"}
          onClick={() => setActiveTab("all")}
        >
          All
        </CenterTab>
        <CenterTab
          $active={activeTab === "unread"}
          onClick={() => setActiveTab("unread")}
        >
          Unread
          <Badge
            count={unreadCount}
            position={{ top: "-5px", right: "-5px" }}
          />
        </CenterTab>
      </CenterTabsContainer>

      <FilterContainer>
        <span style={{ fontSize: "11px", marginRight: "5px" }}>Show:</span>
        {Object.values(NOTIFICATION_TYPES).map((type) => (
          <FilterPill
            key={type}
            active={activeFilters[type]}
            onClick={() => toggleFilter(type)}
            size="small"
            icon={placeholderIcons[type]}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </FilterPill>
        ))}
      </FilterContainer>

      <CenterContent>
        {filteredNotifications.length === 0 ? (
          <EmptyState>
            <EmptyIcon src={placeholderIcons.mail} alt="No notifications" />
            <div>No notifications to display</div>
            <div style={{ fontSize: "11px", marginTop: "5px" }}>
              {activeTab === "unread"
                ? "You're all caught up!"
                : "Notifications will appear here"}
            </div>
          </EmptyState>
        ) : (
          filteredNotifications.map((notification) => {
            const isUnread = !readNotifications[notification.id];

            return (
              <NotificationItem
                key={notification.id}
                notification={notification}
                unread={isUnread}
                onClick={() => markAsRead(notification.id)}
                timeDisplay={formatRelativeTime(
                  notification.receivedAt || notification.timestamp
                )}
                onActionClick={(action) => {
                  if (action.closeOnClick !== false) {
                    markAsRead(notification.id);
                  }
                }}
              />
            );
          })
        )}
      </CenterContent>

      <CenterFooter>
        <Button
          small
          onClick={() => {
            setNotificationHistory([]);
            localStorage.setItem("notification_history", JSON.stringify([]));
          }}
        >
          Clear All
        </Button>

        <Button small onClick={handleMarkAllAsRead}>
          Mark All Read
        </Button>
      </CenterFooter>
    </CenterContainer>
  );
};

export default NotificationCenter;
