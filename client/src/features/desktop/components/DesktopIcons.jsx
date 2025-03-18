import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import DesktopIcon from "./DesktopIcon";
import useDesktopIcons from "../hooks/useDesktopIcons";
import { placeholderIcons } from "../../../utils/iconUtils";

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
    selectIcon,
    clearSelection,
    updateIconPosition,
    startDragging,
    endDragging,
  } = useDesktopIcons();

  // State to track viewport dimensions
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight - 28, // Subtract taskbar height
  });

  // Use a ref to track drag state
  const dragRef = useRef({
    isDragging: false,
    iconId: null,
    startX: 0,
    startY: 0,
    iconStartX: 0,
    iconStartY: 0,
  });

  // Get icon URL from icon path, fallback to placeholder icons when needed
  const getIconUrl = (iconPath) => {
    // If the iconPath is already a URL or path, return it
    if (
      typeof iconPath === "string" &&
      (iconPath.startsWith("/") || iconPath.startsWith("http"))
    ) {
      return iconPath;
    }

    // For emoji icons, map to appropriate placeholder icons
    if (typeof iconPath === "string") {
      if (iconPath === "🧙") return placeholderIcons.adventure;
      if (iconPath === "⚙️" || iconPath === "🔧")
        return placeholderIcons.settings;
      if (iconPath === "📁") return placeholderIcons.folder;
      if (iconPath === "📄") return placeholderIcons.document;
      if (iconPath === "🗑️") return placeholderIcons.recycle;
    }

    // Default icons by ID
    switch (iconPath) {
      case "text-adventure":
        return placeholderIcons.adventure;
      case "settings":
        return placeholderIcons.settings;
      case "my-documents":
        return placeholderIcons.myDocuments;
      case "recycle-bin":
        return placeholderIcons.recycle;
      default:
        return placeholderIcons.document;
    }
  };

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

  // Handle window resize to update viewport dimensions
  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight - 28, // Subtract taskbar height
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ensure icons stay within viewport boundaries when screen size changes
  useEffect(() => {
    if (icons && icons.length > 0) {
      icons.forEach((icon) => {
        // Check if icon is outside the viewport
        const iconWidth = 80; // Approximate width of icon
        const iconHeight = 90; // Approximate height of icon
        let newX = icon.position.x;
        let newY = icon.position.y;
        let needsUpdate = false;

        // Check if off right side of screen
        if (newX + iconWidth > viewport.width - 20) {
          newX = viewport.width - iconWidth - 20;
          needsUpdate = true;
        }

        // Check if off bottom of screen
        if (newY + iconHeight > viewport.height - 20) {
          newY = viewport.height - iconHeight - 20;
          needsUpdate = true;
        }

        // Update if needed
        if (needsUpdate) {
          updateIconPosition(icon.id, newX, newY);
        }
      });
    }
  }, [viewport, icons, updateIconPosition]);

  // Handle icon mouse down for dragging
  const handleIconMouseDown = (e, iconId) => {
    e.preventDefault();
    e.stopPropagation();

    // Find the icon
    const icon = icons.find((i) => i.id === iconId);
    if (!icon) return;

    // Set up drag data
    dragRef.current = {
      isDragging: true,
      iconId: iconId,
      startX: e.clientX,
      startY: e.clientY,
      iconStartX: icon.position.x,
      iconStartY: icon.position.y,
    };

    // Select the icon and start dragging
    selectIcon(iconId);
    startDragging(iconId);

    // Add dragging class to body
    document.body.classList.add("dragging");

    // Add document-level event listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e) => {
    const drag = dragRef.current;
    if (!drag.isDragging) return;

    // Calculate new position
    const deltaX = e.clientX - drag.startX;
    const deltaY = e.clientY - drag.startY;

    const newX = Math.max(0, drag.iconStartX + deltaX);
    const newY = Math.max(0, drag.iconStartY + deltaY);

    // Constrain to viewport boundaries
    const iconWidth = 80;
    const iconHeight = 90;
    const maxX = viewport.width - iconWidth - 20;
    const maxY = viewport.height - iconHeight - 20;
    const constrainedX = Math.min(newX, maxX);
    const constrainedY = Math.min(newY, maxY);

    // Update the icon position
    updateIconPosition(drag.iconId, constrainedX, constrainedY);
  };

  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    const drag = dragRef.current;
    if (!drag.isDragging) return;

    // Reset drag state
    dragRef.current.isDragging = false;

    // End the dragging operation
    endDragging();

    // Remove dragging class
    document.body.classList.remove("dragging");

    // Remove event listeners
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
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
            icon={getIconUrl(icon.icon)}
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
