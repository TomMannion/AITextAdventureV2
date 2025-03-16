// src/components/notifications/elements/FilterPill.jsx
import React from "react";
import styled from "styled-components";

const PillContainer = styled.div`
  padding: ${(props) => (props.$size === "small" ? "1px 6px" : "2px 8px")};
  font-size: ${(props) => (props.$size === "small" ? "9px" : "10px")};
  border: 1px solid ${(props) => props.$borderColor || "#808080"};
  background-color: ${(props) =>
    props.$active ? props.$activeColor || "#000080" : "#d4d0c8"};
  color: ${(props) => (props.$active ? "white" : props.$textColor || "black")};
  cursor: ${(props) => (props.$disabled ? "default" : "pointer")};
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  user-select: none;

  &:hover {
    ${(props) =>
      !props.$disabled &&
      `
      border-color: ${props.$hoverBorderColor || "#000080"};
    `}
  }

  &:active {
    ${(props) =>
      !props.$disabled &&
      `
      border-color: #000000;
      background-color: ${props.$activeColor || "#000080"};
      color: white;
    `}
  }
`;

const PillIcon = styled.img`
  width: 12px;
  height: 12px;
  margin-right: 4px;
`;

/**
 * Windows 95 style filter pill component
 *
 * @param {Object} props Component props
 * @param {boolean} props.active Whether pill is active
 * @param {function} props.onClick Click handler
 * @param {React.ReactNode} props.children Content of the pill
 * @param {string} props.size Size of pill ("small" or "normal")
 * @param {boolean} props.disabled Whether pill is disabled
 * @param {string} props.activeColor Background color when active
 * @param {string} props.borderColor Border color
 * @param {string} props.hoverBorderColor Border color on hover
 * @param {string} props.textColor Text color when inactive
 * @param {string} props.icon Optional icon URL
 */
const FilterPill = ({
  active = false,
  onClick,
  children,
  size = "normal",
  disabled = false,
  activeColor,
  borderColor,
  hoverBorderColor,
  textColor,
  icon,
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <PillContainer
      $active={active}
      $size={size}
      $disabled={disabled}
      $activeColor={activeColor}
      $borderColor={borderColor}
      $hoverBorderColor={hoverBorderColor}
      $textColor={textColor}
      onClick={handleClick}
    >
      {icon && <PillIcon src={icon} alt="" />}
      {children}
    </PillContainer>
  );
};

export default FilterPill;
