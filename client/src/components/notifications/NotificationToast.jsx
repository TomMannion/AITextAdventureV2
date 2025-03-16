// src/components/notifications/NotificationToast.jsx
import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import Button from "../../components/common/Button";
import { placeholderIcons } from "../../utils/iconUtils";

// Styled Components
const ToastContainer = styled.div`
  position: relative;
  width: 320px;
  background-color: #c0c0c0;
  border: 2px solid #000000;
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5);
  margin-bottom: 10px;
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform: ${(props) => (props.$show ? "translateX(0)" : "translateX(110%)")};
  opacity: ${(props) => (props.$show ? "1" : "0")};
  overflow: hidden;
`;

const ToastHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => {
    switch (props.$type) {
      case "error":
        return "#AA0000";
      case "warning":
        return "#FF9900";
      case "success":
        return "#008000";
      case "achievement":
        return "#9400D3";
      case "system":
        return "#000080";
      case "info":
      default:
        return "#000080";
    }
  }};
  color: white;
  padding: 4px 6px;
  font-weight: bold;
  font-size: 12px;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
`;

const ToastIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 8px;
`;

const ToastContent = styled.div`
  padding: 10px;
  font-size: 12px;
  color: #000000;
  white-space: pre-wrap;
`;

const ToastActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 5px;
  padding: 0 10px 10px 10px;
`;

const ProgressBar = styled.div`
  height: 2px;
  background-color: ${(props) => {
    switch (props.$type) {
      case "error":
        return "#AA0000";
      case "warning":
        return "#FF9900";
      case "success":
        return "#008000";
      case "achievement":
        return "#9400D3";
      case "system":
        return "#000080";
      case "info":
      default:
        return "#000080";
    }
  }};
  width: ${(props) => props.$progress}%;
  transition: width linear;
  position: absolute;
  bottom: 0;
  left: 0;
`;

/**
 * Windows 95 style toast notification component
 */
const NotificationToast = ({
  id,
  title,
  message,
  type = "info",
  icon,
  timeout = 5000,
  actions = [],
  onClose,
  animate = true,
  style = {},
}) => {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(timeout);
  const animationFrameRef = useRef(null);

  // Get appropriate icon for the notification type
  const iconSrc =
    icon || (type && placeholderIcons[type]) || placeholderIcons.info;

  // Handle animation entry
  useEffect(() => {
    // Enter animation
    const showTimer = setTimeout(() => {
      setShow(true);
    }, 50);

    return () => clearTimeout(showTimer);
  }, []);

  // Handle progress bar countdown
  useEffect(() => {
    if (timeout <= 0 || !animate) return;

    startTimeRef.current = Date.now();
    remainingTimeRef.current = timeout;

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, timeout - elapsed);
      const progressPercent = (remaining / timeout) * 100;

      setProgress(progressPercent);
      remainingTimeRef.current = remaining;

      if (remaining <= 0 && onClose) {
        onClose(id);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(updateProgress);
    };

    // Start the animation
    animationFrameRef.current = requestAnimationFrame(updateProgress);

    // Create a timeout for the notification duration
    const dismissTimeout = setTimeout(() => {
      if (onClose) onClose(id);
    }, timeout);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearTimeout(dismissTimeout);
    };
  }, [id, timeout, onClose, animate]);

  // Handle exit animation
  const handleClose = () => {
    setShow(false);
    // Wait for exit animation before calling onClose
    setTimeout(() => {
      if (onClose) onClose(id);
    }, 300);
  };

  // Handle an action button click
  const handleAction = (action) => {
    if (action.onClick) {
      action.onClick();
    }
    if (action.closeOnClick !== false) {
      handleClose();
    }
  };

  // Apply custom styling if provided
  const headerStyle = style?.header || {};
  const contentStyle = style?.content || {};
  const containerStyle = {
    border: style?.border,
    boxShadow: style?.boxShadow,
  };

  return (
    <ToastContainer $show={show} style={containerStyle}>
      <ToastHeader $type={type} style={headerStyle}>
        <HeaderContent>
          <ToastIcon src={iconSrc} alt={type} />
          <span>{title}</span>
        </HeaderContent>
        <Button square small onClick={handleClose}>
          <span>✕</span>
        </Button>
      </ToastHeader>

      <ToastContent style={contentStyle}>{message}</ToastContent>

      {actions.length > 0 && (
        <ToastActions>
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={() => handleAction(action)}
              primary={action.primary}
            >
              {action.label}
            </Button>
          ))}
        </ToastActions>
      )}

      {timeout > 0 && animate && (
        <ProgressBar $type={type} $progress={progress} />
      )}
    </ToastContainer>
  );
};

export default NotificationToast;
