// src/components/notifications/elements/Win95Tooltip.jsx
import React from "react";
import styled from "styled-components";

const TooltipContainer = styled.div`
  position: absolute;
  background-color: #ffffcc;
  border: 1px solid #000000;
  padding: 3px 5px;
  font-size: 11px;
  z-index: ${(props) => props.$zIndex || 1000};
  display: ${(props) => (props.$show ? "block" : "none")};
  pointer-events: none;
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  white-space: ${(props) => (props.$wrap ? "normal" : "nowrap")};
  max-width: ${(props) => props.$maxWidth || "none"};

  /* Position based on position prop */
  ${(props) => {
    const pos = props.$position || "bottom";
    switch (pos) {
      case "top":
        return `
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 5px;
        `;
      case "bottom":
        return `
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 5px;
        `;
      case "left":
        return `
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-right: 5px;
        `;
      case "right":
        return `
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: 5px;
        `;
      case "custom":
        return `
          top: ${props.$customPosition?.top || "auto"};
          left: ${props.$customPosition?.left || "auto"};
          right: ${props.$customPosition?.right || "auto"};
          bottom: ${props.$customPosition?.bottom || "auto"};
          transform: ${props.$customPosition?.transform || "none"};
        `;
      default:
        return `
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 5px;
        `;
    }
  }}

  /* Optional arrow */
  ${(props) => {
    if (!props.$showArrow) return "";

    const pos = props.$position || "bottom";
    let arrowStyles = `
      &::after {
        content: "";
        position: absolute;
        border: 5px solid transparent;
    `;

    switch (pos) {
      case "top":
        arrowStyles += `
          border-top-color: #ffffcc;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
        `;
        break;
      case "bottom":
        arrowStyles += `
          border-bottom-color: #ffffcc;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
        `;
        break;
      case "left":
        arrowStyles += `
          border-left-color: #ffffcc;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
        `;
        break;
      case "right":
        arrowStyles += `
          border-right-color: #ffffcc;
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
        `;
        break;
      default:
        arrowStyles += `
          border-top-color: #ffffcc;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
        `;
    }

    arrowStyles += "}";
    return arrowStyles;
  }}
`;

/**
 * Windows 95 style tooltip component
 *
 * @param {Object} props Component props
 * @param {boolean} props.show Whether to show the tooltip
 * @param {React.ReactNode} props.children Content of the tooltip
 * @param {string} props.position Position of tooltip relative to target ("top", "bottom", "left", "right", "custom")
 * @param {Object} props.customPosition Custom positioning values if position="custom"
 * @param {boolean} props.showArrow Whether to show a directional arrow
 * @param {boolean} props.wrap Whether to allow text wrapping
 * @param {string} props.maxWidth Maximum width for the tooltip
 * @param {number} props.zIndex z-index value
 */
const Win95Tooltip = ({
  show,
  children,
  position = "top",
  customPosition,
  showArrow = false,
  wrap = false,
  maxWidth,
  zIndex = 1000,
}) => {
  return (
    <TooltipContainer
      $show={show}
      $position={position}
      $customPosition={customPosition}
      $showArrow={showArrow}
      $wrap={wrap}
      $maxWidth={maxWidth}
      $zIndex={zIndex}
    >
      {children}
    </TooltipContainer>
  );
};

export default Win95Tooltip;
