import { useState, useEffect } from "react";
import { placeholderIcons } from "../../../utils/iconUtils";

// Default icons that will always be available on the desktop
const DEFAULT_ICONS = [
  {
    id: "text-adventure",
    name: "Text Adventure",
    icon: placeholderIcons.adventure,
    position: { x: 20, y: 20 },
  },
  {
    id: "my-documents",
    name: "My Documents",
    icon: placeholderIcons.folder,
    position: { x: 20, y: 120 },
  },
  {
    id: "settings",
    name: "Settings",
    icon: placeholderIcons.settings,
    position: { x: 20, y: 220 },
  },
  {
    id: "recycle-bin",
    name: "Recycle Bin",
    icon: placeholderIcons.recycle,
    position: { x: 20, y: 320 },
  },
];

/**
 * Custom hook to manage desktop icons
 * Handles saving/loading icon positions and selections
 *
 * @returns {Object} Icon management functions and state
 */
const useDesktopIcons = () => {
  // State for icon list
  const [icons, setIcons] = useState(DEFAULT_ICONS);
  // State for selected icon
  const [selectedIconId, setSelectedIconId] = useState(null);
  // State for drag operation
  const [draggedIconId, setDraggedIconId] = useState(null);

  // Load saved icon positions from localStorage on mount
  useEffect(() => {
    try {
      const savedPositions = localStorage.getItem("desktopIconPositions");

      if (savedPositions) {
        const positions = JSON.parse(savedPositions);

        // Update icon positions
        setIcons((prevIcons) =>
          prevIcons.map((icon) => ({
            ...icon,
            position: positions[icon.id] || icon.position,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading icon positions:", error);
    }
  }, []);

  // Save icon positions to localStorage when they change
  const saveIconPositions = () => {
    try {
      const positions = {};

      icons.forEach((icon) => {
        positions[icon.id] = icon.position;
      });

      localStorage.setItem("desktopIconPositions", JSON.stringify(positions));
    } catch (error) {
      console.error("Error saving icon positions:", error);
    }
  };

  // Select an icon
  const selectIcon = (iconId) => {
    setSelectedIconId(iconId);
  };

  // Clear icon selection
  const clearSelection = () => {
    setSelectedIconId(null);
  };

  // Start dragging an icon
  const startDragging = (iconId) => {
    setDraggedIconId(iconId);
    // Also select the icon being dragged
    selectIcon(iconId);
  };

  // End icon dragging and save position
  const endDragging = () => {
    if (draggedIconId) {
      saveIconPositions();
      setDraggedIconId(null);
    }
  };

  // Update icon position during drag
  const updateIconPosition = (iconId, x, y) => {
    setIcons((prevIcons) =>
      prevIcons.map((icon) => {
        if (icon.id === iconId) {
          return {
            ...icon,
            position: { x, y },
          };
        }
        return icon;
      })
    );
  };

  // Get icon by ID
  const getIconById = (iconId) => {
    return icons.find((icon) => icon.id === iconId);
  };

  return {
    icons,
    selectedIconId,
    draggedIconId,
    selectIcon,
    clearSelection,
    startDragging,
    endDragging,
    updateIconPosition,
    getIconById,
  };
};

export default useDesktopIcons;
