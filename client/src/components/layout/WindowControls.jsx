import React from "react";
import styled from "styled-components";
import Button from "../common/Button";

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

/**
 * Window control buttons component for Windows 95 style windows
 */
const WindowControls = ({
  onMinimize,
  onMaximize,
  onClose,
  isMaximized = false,
  showMinimize = true,
  showMaximize = true,
  showClose = true,
  ...restProps
}) => {
  return (
    <ControlsContainer {...restProps}>
      {showMinimize && (
        <Button square small onClick={onMinimize} aria-label="Minimize">
          <span
            style={{ fontSize: "9px", display: "block", marginBottom: "2px" }}
          >
            _
          </span>
        </Button>
      )}

      {showMaximize && (
        <Button
          square
          small
          onClick={onMaximize} // Simply pass the event to the parent handler
          aria-label={isMaximized ? "Restore" : "Maximize"}
        >
          <span style={{ fontSize: "9px" }}>{isMaximized ? "❐" : "□"}</span>
        </Button>
      )}

      {showClose && (
        <Button square small onClick={onClose} aria-label="Close">
          <span style={{ fontSize: "9px", fontWeight: "bold" }}>×</span>
        </Button>
      )}
    </ControlsContainer>
  );
};

export default WindowControls;
