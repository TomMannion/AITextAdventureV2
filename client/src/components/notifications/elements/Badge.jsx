// src/components/notifications/elements/Badge.jsx
import React from "react";
import styled from "styled-components";

const BadgeContainer = styled.div`
  position: absolute;
  background-color: ${(props) => props.$backgroundColor || "red"};
  color: ${(props) => props.$textColor || "white"};
  font-size: ${(props) => (props.$size === "small" ? "9px" : "10px")};
  font-weight: bold;
  min-width: ${(props) => (props.$size === "small" ? "14px" : "18px")};
  height: ${(props) => (props.$size === "small" ? "14px" : "18px")};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  top: ${(props) => props.$position?.top || "-5px"};
  right: ${(props) => props.$position?.right || "-5px"};
  border: 1px solid white;
  padding: 0 3px;
  z-index: ${(props) => props.$zIndex || 1};
  pointer-events: none;
`;

/**
 * Reusable notification badge component
 *
 * @param {Object} props Component props
 * @param {number} props.count Number to display in badge
 * @param {string} props.size Size of badge ("small" or "normal")
 * @param {string} props.backgroundColor Background color of badge
 * @param {string} props.textColor Text color of badge
 * @param {Object} props.position {top, right} position values
 * @param {number} props.zIndex z-index value
 * @param {number} props.max Maximum number to display before showing "+"
 * @param {React.ReactNode} props.children Optional children to display instead of count
 */
const Badge = ({
  count = 0,
  size = "normal",
  backgroundColor,
  textColor,
  position,
  zIndex,
  max = 99,
  children,
}) => {
  // Don't render if count is 0
  if (count === 0 && !children) return null;

  // Format the displayed value
  const displayValue = children || (count > max ? `${max}+` : count);

  return (
    <BadgeContainer
      $size={size}
      $backgroundColor={backgroundColor}
      $textColor={textColor}
      $position={position}
      $zIndex={zIndex}
    >
      {displayValue}
    </BadgeContainer>
  );
};

export default Badge;
