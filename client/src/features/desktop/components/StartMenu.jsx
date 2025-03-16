// src/features/desktop/components/StartMenu.jsx
import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import Text from "../../../components/common/Text";
import { win95Border } from "../../../utils/styleUtils";
import { useAuth } from "../../../contexts/AuthContext";

const MenuContainer = styled.div`
  position: absolute;
  bottom: 28px; /* Position above taskbar */
  left: 0;
  background-color: var(--win95-button-face, #c0c0c0);
  ${win95Border("outset")}
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  z-index: 10001; /* Above taskbar */
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
`;

const MenuSidebar = styled.div`
  width: 30px;
  background-color: #808080;
  padding: 2px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
`;

const SidebarText = styled.div`
  transform: rotate(-90deg);
  transform-origin: bottom left;
  white-space: nowrap;
  color: white;
  font-weight: bold;
  font-size: 16px;
  position: absolute;
  bottom: 10px;
  left: 24px;
`;

const MenuItems = styled.div`
  display: flex;
  flex-direction: column;
  width: 180px;
`;

const MenuItem = styled.div`
  padding: 8px 16px;
  display: flex;
  align-items: center;
  position: relative;
  cursor: default;

  &:hover {
    background-color: var(--win95-window-header, #000080);
    color: white;
  }
`;

const MenuItemIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 8px;
`;

const Divider = styled.div`
  height: 1px;
  margin: 2px 0;
  background-color: var(--win95-border-dark, #808080);
  border-bottom: 1px solid var(--win95-border-light, #ffffff);
`;

const SubMenuContainer = styled.div`
  position: absolute;
  left: 100%;
  top: ${(props) => props.$top || "0px"};
  background-color: var(--win95-button-face, #c0c0c0);
  ${win95Border("outset")}
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  z-index: 10002; /* Above main menu */
  display: ${(props) => (props.$isOpen ? "block" : "none")};
  width: 180px;
`;

const ArrowIndicator = styled.span`
  margin-left: auto;
`;

/**
 * Start Menu component - Windows 95 style Start Menu
 */
const StartMenu = ({ isOpen, username = "User", onMenuItemClick }) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0 });
  const { logout } = useAuth();

  // Refs for measuring elements
  const menuRef = useRef(null);
  const submenuRef = useRef({});

  // Close submenu when menu closes
  useEffect(() => {
    if (!isOpen) {
      setActiveSubmenu(null);
    }
  }, [isOpen]);

  // Menu item definitions with submenu items
  const menuItems = [
    {
      id: "user",
      label: username,
      icon: "/icons/user.ico",
      isStatic: true,
    },
    { id: "divider-1", isDivider: true },
    {
      id: "programs",
      label: "Programs",
      icon: "/icons/programs.ico",
      hasSubmenu: true,
      submenuItems: [
        {
          id: "text-adventure",
          label: "Text Adventure",
          icon: "/icons/adventure.ico",
        },
        {
          id: "story-editor",
          label: "Story Editor",
          icon: "/icons/editor.ico",
        },
      ],
    },
    {
      id: "documents",
      label: "Documents",
      icon: "/icons/documents.ico",
      hasSubmenu: true,
      submenuItems: [
        {
          id: "my-documents",
          label: "My Adventures",
          icon: "/icons/documents.ico",
        },
        {
          id: "completed-stories",
          label: "Completed Stories",
          icon: "/icons/documents.ico",
        },
      ],
    },
    { id: "settings", label: "Settings", icon: "/icons/settings.ico" },
    { id: "find", label: "Find", icon: "/icons/find.ico" },
    { id: "help", label: "Help", icon: "/icons/help.ico" },
    { id: "run", label: "Run...", icon: "/icons/run.ico" },
    { id: "divider-2", isDivider: true },
    { id: "user-profile", label: "User Profile", icon: "/icons/user.ico" },
    { id: "divider-3", isDivider: true },
    { id: "shutdown", label: "Shut Down...", icon: "/icons/shutdown.ico" },
  ];

  // Find menu item by ID
  const getMenuItem = (id) => {
    return menuItems.find((item) => item.id === id);
  };

  // Handle mouse enter on menu item with submenu
  const handleMenuItemEnter = (itemId, e) => {
    const item = getMenuItem(itemId);

    if (item?.hasSubmenu) {
      setActiveSubmenu(itemId);

      // Get the position of the menu item
      const rect = e.currentTarget.getBoundingClientRect();

      // Get window dimensions
      const windowHeight = window.innerHeight;

      // If we have a reference to the submenu element
      if (submenuRef.current[itemId]) {
        const submenuHeight = submenuRef.current[itemId].clientHeight;

        // Calculate best position for submenu
        let top = 0;

        // If submenu would extend below the window, adjust position
        if (rect.top + submenuHeight > windowHeight) {
          top = Math.max(0, windowHeight - submenuHeight - rect.top);
        }

        setSubmenuPosition({ top: `${top}px` });
      } else {
        // Default to starting at the top of the parent menu item
        setSubmenuPosition({ top: "0px" });
      }
    } else {
      setActiveSubmenu(null);
    }
  };

  // Handle menu item click
  const handleMenuItemClick = (itemId) => {
    const item = getMenuItem(itemId);

    // Don't do anything for static items or items with submenus
    if (item?.isStatic || item?.hasSubmenu) {
      return;
    }

    // Handle shutdown button (logout)
    if (itemId === "shutdown") {
      handleShutdown();
      return;
    }

    // Call the parent handler
    if (onMenuItemClick) {
      onMenuItemClick(itemId);
    }
  };

  // Handle submenu item click
  const handleSubmenuItemClick = (itemId) => {
    // Call the parent handler
    if (onMenuItemClick) {
      onMenuItemClick(itemId);
    }
  };

  // Handle shutdown (logout)
  const handleShutdown = async () => {
    try {
      await logout();
      // The auth context will handle redirecting to the login screen
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Save a reference to submenu elements when they mount
  const setSubmenuRef = (itemId, element) => {
    if (element) {
      submenuRef.current[itemId] = element;
    }
  };

  return (
    <MenuContainer $isOpen={isOpen} id="start-menu" ref={menuRef}>
      <MenuSidebar>
        <SidebarText>Windows 95</SidebarText>
      </MenuSidebar>

      <MenuItems>
        {menuItems.map((item) => {
          if (item.isDivider) {
            return <Divider key={item.id} />;
          }

          return (
            <MenuItem
              key={item.id}
              onMouseEnter={(e) => handleMenuItemEnter(item.id, e)}
              onClick={() => handleMenuItemClick(item.id)}
            >
              {item.icon && <MenuItemIcon src={item.icon} alt="" />}
              <Text>{item.label}</Text>

              {item.hasSubmenu && <ArrowIndicator>&#9654;</ArrowIndicator>}

              {/* Render submenu if this item has one and it's active */}
              {item.hasSubmenu && activeSubmenu === item.id && (
                <SubMenuContainer
                  $isOpen={true}
                  $top={submenuPosition.top}
                  ref={(el) => setSubmenuRef(item.id, el)}
                >
                  {item.submenuItems.map((subItem) => (
                    <MenuItem
                      key={subItem.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubmenuItemClick(subItem.id);
                      }}
                    >
                      {subItem.icon && (
                        <MenuItemIcon src={subItem.icon} alt="" />
                      )}
                      <Text>{subItem.label}</Text>
                    </MenuItem>
                  ))}
                </SubMenuContainer>
              )}
            </MenuItem>
          );
        })}
      </MenuItems>
    </MenuContainer>
  );
};

export default StartMenu;
