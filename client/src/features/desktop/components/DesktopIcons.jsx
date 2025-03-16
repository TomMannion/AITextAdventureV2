import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import DesktopIcon from "./DesktopIcon";
import useDesktopIcons from "../hooks/useDesktopIcons";

const IconsContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 20px;
  pointer-events: none; /* Allow clicks to pass through to background */
  z-index: 1;
`;

const DraggableIcon = styled.div`
  position: absolute;
  top: ${(props) => props.$position.y}px;
  left: ${(props) => props.$position.x}px;
  pointer-events: auto; /* Make icon clickable */
  user-select: none;
`;

/**
 * Desktop icons component
 * Renders and manages the icons on the desktop
 *
 * @param {Object} props - Component props
 * @param {Function} props.onIconOpen - Handler for when an icon is opened (double-clicked)
 */
const DesktopIcons = ({ onIconOpen }) => {
  const {
    icons,
    selectedIconId,
    draggedIconId,
    selectIcon,
    clearSelection,
    startDragging,
    endDragging,
    updateIconPosition,
  } = useDesktopIcons();

  // Reference to track mouse position during drag
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    iconStartX: 0,
    iconStartY: 0,
    isDragging: false,
  });

  // Handle background click to clear selection
  const handleBackgroundClick = (e) => {
    // Only clear if clicking the container itself, not a child
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  };

  // Handle icon click
  const handleIconClick = (iconId) => {
    selectIcon(iconId);
  };

  // Handle icon double-click (open)
  const handleIconDoubleClick = (iconId) => {
    if (onIconOpen) {
      onIconOpen(iconId);
    }
  };

  // Setup mouse event handlers for dragging
  useEffect(() => {
    const handleMouseDown = (e) => {
      // Only process if we're dragging an icon
      if (!draggedIconId) return;

      const icon = icons.find((icon) => icon.id === draggedIconId);
      if (!icon) return;

      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        iconStartX: icon.position.x,
        iconStartY: icon.position.y,
        isDragging: true,
      };

      // Add dragging class to document
      document.body.classList.add("dragging");
    };

    const handleMouseMove = (e) => {
      if (!dragRef.current.isDragging) return;

      // Calculate new position
      const newX = Math.max(
        0,
        dragRef.current.iconStartX + (e.clientX - dragRef.current.startX)
      );
      const newY = Math.max(
        0,
        dragRef.current.iconStartY + (e.clientY - dragRef.current.startY)
      );

      // Update icon position
      updateIconPosition(draggedIconId, newX, newY);
    };

    const handleMouseUp = () => {
      if (dragRef.current.isDragging) {
        dragRef.current.isDragging = false;
        endDragging();

        // Remove dragging class
        document.body.classList.remove("dragging");
      }
    };

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      // Remove event listeners
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedIconId, icons, endDragging, updateIconPosition]);

  // Handle icon mouse down for dragging
  const handleIconMouseDown = (e, iconId) => {
    // Prevent default behavior
    e.preventDefault();

    // Start dragging
    startDragging(iconId);

    // Initial drag state is set in the handleMouseDown effect
  };

  return (
    <IconsContainer onClick={handleBackgroundClick}>
      {icons.map((icon) => (
        <DraggableIcon
          key={icon.id}
          $position={icon.position}
          onMouseDown={(e) => handleIconMouseDown(e, icon.id)}
        >
          <DesktopIcon
            id={icon.id}
            name={icon.name}
            icon={icon.icon}
            isSelected={selectedIconId === icon.id}
            onClick={handleIconClick}
            onDoubleClick={handleIconDoubleClick}
          />
        </DraggableIcon>
      ))}
    </IconsContainer>
  );
};

export default DesktopIcons;
