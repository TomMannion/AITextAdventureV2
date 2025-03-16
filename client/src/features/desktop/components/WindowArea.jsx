import React from "react";
import styled from "styled-components";
import { useWindowContext } from "../../../contexts/WindowContext";
import Window from "../../../components/layout/Window";

const WindowContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 28px; /* Account for taskbar height */
  overflow: hidden;
  z-index: 1;
`;

/**
 * Window area component
 * Renders all open windows and handles window management
 */
const WindowArea = () => {
  const {
    visibleWindows,
    activeWindowId,
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    moveWindow,
    resizeWindow,
  } = useWindowContext();

  /**
   * Handle window focus (bring to front)
   */
  const handleWindowFocus = (windowId) => {
    focusWindow(windowId);
  };

  /**
   * Handle window close
   */
  const handleWindowClose = (windowId) => {
    closeWindow(windowId);
  };

  /**
   * Handle window minimize
   */
  const handleWindowMinimize = (windowId) => {
    minimizeWindow(windowId);
  };

  /**
   * Handle window maximize/restore
   */
  const handleWindowMaximize = (windowId, isMaximized) => {
    maximizeWindow(windowId, isMaximized);
  };

  /**
   * Handle window move
   */
  const handleWindowMove = (windowId, x, y) => {
    moveWindow(windowId, x, y);
  };

  /**
   * Handle window resize
   */
  const handleWindowResize = (windowId, width, height) => {
    resizeWindow(windowId, width, height);
  };

  return (
    <WindowContainer>
      {visibleWindows.map((window) => {
        const isActive = window.id === activeWindowId;

        return (
          <Window
            key={window.id}
            id={window.id}
            title={window.title}
            width={window.width}
            height={window.height}
            x={window.x}
            y={window.y}
            zIndex={window.zIndex}
            isActive={isActive}
            isMaximized={window.isMaximized}
            onFocus={handleWindowFocus}
            onClose={handleWindowClose}
            onMinimize={handleWindowMinimize}
            onMaximize={handleWindowMaximize}
            onMove={handleWindowMove}
            onResize={handleWindowResize}
          >
            {/* Render the window content */}
            {window.component && (
              <window.component {...window.componentProps} />
            )}
          </Window>
        );
      })}
    </WindowContainer>
  );
};

export default WindowArea;
