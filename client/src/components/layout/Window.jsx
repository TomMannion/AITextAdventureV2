import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import WindowHeader from "./WindowHeader";
import WindowContent from "./WindowContent";
import WindowControls from "./WindowControls";

// Styled components
const WindowContainer = styled.div`
  position: absolute;
  min-width: 200px;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  background-color: var(--win95-window-bg, #c0c0c0);
  border: 2px solid #000000;
  border-width: ${(props) => (props.$isMaximized ? "2px 2px 0 2px" : "2px")};
  box-shadow: ${(props) =>
    props.$isMaximized
      ? "none"
      : props.$isActive
      ? "5px 5px 5px rgba(0, 0, 0, 0.3)"
      : "2px 2px 3px rgba(0, 0, 0, 0.2)"};
  z-index: ${(props) => props.$zIndex || 1};
  left: ${(props) => (props.$isMaximized ? "0" : props.$left)}px;
  top: ${(props) => (props.$isMaximized ? "0" : props.$top)}px;
  width: ${(props) => (props.$isMaximized ? "100%" : props.$width + "px")};
  height: ${(props) =>
    props.$isMaximized ? "calc(100vh - 28px)" : props.$height + "px"};
  transition: ${(props) => (props.$animate ? "box-shadow 0.2s ease" : "none")};
`;

const ResizeHandle = styled.div`
  position: absolute;
  width: 15px;
  height: 15px;
  bottom: 0;
  right: 0;
  cursor: nwse-resize;
  z-index: 10;

  &::after {
    content: "";
    display: block;
    position: absolute;
    right: 3px;
    bottom: 3px;
    width: 8px;
    height: 8px;
    border-right: 2px solid #808080;
    border-bottom: 2px solid #808080;
    opacity: 0.7;
  }
`;

/**
 * Window component for Windows 95 style windows
 */
const Window = ({
  id,
  title,
  children,
  width = 400,
  height = 300,
  x = 50,
  y = 50,
  isActive = false,
  isMaximized = false,
  zIndex = 1,
  resizable = true,
  animate = true,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onResize,
  onMove,
  ...restProps
}) => {
  // State for window position and size
  const [position, setPosition] = useState({ x, y });
  const [size, setSize] = useState({ width, height });

  // State for tracking dragging and resizing
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Refs to store drag and resize info
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    startWindowX: 0,
    startWindowY: 0,
  });
  const resizeRef = useRef({
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
  });

  // Update position and size when props change
  useEffect(() => {
    if (!isDragging && !isMaximized) {
      setPosition({ x, y });
    }
  }, [x, y, isDragging, isMaximized]);

  useEffect(() => {
    if (!isResizing && !isMaximized) {
      setSize({ width, height });
    }
  }, [width, height, isResizing, isMaximized]);

  // Handle window focus
  const handleFocus = () => {
    if (onFocus) onFocus(id);
  };

  // Handle header mouse down for dragging
  const handleHeaderMouseDown = (e) => {
    if (isMaximized) return;

    // Only handle left mouse button
    if (e.button !== 0) return;

    // Prevent text selection
    e.preventDefault();

    console.log("Starting window drag");

    // Focus the window
    handleFocus();

    // Set up drag data
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWindowX: position.x,
      startWindowY: position.y,
    };

    setIsDragging(true);
    document.body.classList.add("dragging");
  };

  // Handle header double click (maximize/restore)
  const handleHeaderDoubleClick = () => {
    if (onMaximize) {
      onMaximize(id, !isMaximized);
    }
  };

  // Handle window resize start
  const handleResizeStart = (e) => {
    if (isMaximized) return;

    e.stopPropagation();
    e.preventDefault();

    // Focus the window
    handleFocus();

    // Set up resize data
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    };

    setIsResizing(true);
    document.body.classList.add("resizing");
  };

  // Set up drag and resize event handlers
  useEffect(() => {
    // Mouse move handler for dragging
    const handleMouseMove = (e) => {
      // Handle dragging
      if (isDragging) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;

        const newX = Math.max(0, dragRef.current.startWindowX + dx);
        const newY = Math.max(0, dragRef.current.startWindowY + dy);

        console.log(`Dragging to: x=${newX}, y=${newY}`);
        setPosition({ x: newX, y: newY });
      }

      // Handle resizing
      if (isResizing) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;

        const newWidth = Math.max(200, resizeRef.current.startWidth + dx);
        const newHeight = Math.max(150, resizeRef.current.startHeight + dy);

        setSize({ width: newWidth, height: newHeight });
      }
    };

    // Mouse up handler for ending drag/resize
    const handleMouseUp = () => {
      console.log("Mouse up detected");

      // End dragging
      if (isDragging) {
        console.log("Ending drag operation");
        setIsDragging(false);
        document.body.classList.remove("dragging");

        // Notify parent of position change
        if (onMove) {
          onMove(id, position.x, position.y);
        }
      }

      // End resizing
      if (isResizing) {
        setIsResizing(false);
        document.body.classList.remove("resizing");

        // Notify parent of size change
        if (onResize) {
          onResize(id, size.width, size.height);
        }
      }
    };

    // Only add event listeners if dragging or resizing
    if (isDragging || isResizing) {
      console.log("Adding drag/resize event listeners");
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    // Clean up event listeners
    return () => {
      console.log("Removing drag/resize event listeners");
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    id,
    isDragging,
    isResizing,
    onMove,
    onResize,
    position.x,
    position.y,
    size.width,
    size.height,
  ]);

  return (
    <WindowContainer
      $left={position.x}
      $top={position.y}
      $width={size.width}
      $height={size.height}
      $isActive={isActive}
      $isMaximized={isMaximized}
      $zIndex={zIndex}
      $animate={animate}
      onClick={handleFocus}
      {...restProps}
    >
      <WindowHeader
        title={title}
        isActive={isActive}
        isMaximized={isMaximized}
        onMouseDown={handleHeaderMouseDown}
        onDoubleClick={handleHeaderDoubleClick}
      >
        <WindowControls
          onMinimize={() => onMinimize && onMinimize(id)}
          onMaximize={() => onMaximize && onMaximize(id, !isMaximized)}
          onClose={() => onClose && onClose(id)}
          isMaximized={isMaximized}
        />
      </WindowHeader>

      <WindowContent>{children}</WindowContent>

      {resizable && !isMaximized && (
        <ResizeHandle onMouseDown={handleResizeStart} aria-label="Resize" />
      )}
    </WindowContainer>
  );
};

export default Window;
