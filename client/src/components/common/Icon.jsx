import React from "react";
import styled from "styled-components";

/**
 * Styled icon container with optional effects
 */
const IconContainer = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => props.$size || "16px"};
  height: ${(props) => props.$size || "16px"};
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};

  ${(props) =>
    props.$withHover &&
    `
    &:hover {
      filter: brightness(1.2);
    }
  `}
`;

const IconImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

/**
 * SVG placeholder for missing icons
 */
const SVGPlaceholder = styled.svg`
  width: 100%;
  height: 100%;
`;

/**
 * Icon component that handles various icon types and fallbacks
 *
 * @param {Object} props - Component props
 * @param {string} props.src - Icon source URL
 * @param {string} props.alt - Alternative text for the icon
 * @param {string} props.size - Icon size (default: 16px)
 * @param {boolean} props.disabled - Whether the icon should appear disabled
 * @param {boolean} props.withHover - Whether to show hover effects
 * @param {string} props.name - Icon name for placeholder if src is missing
 * @param {string} props.color - Background color for placeholder
 */
const Icon = ({
  src,
  alt = "",
  size = "16px",
  disabled = false,
  withHover = false,
  name = "",
  color = "#c0c0c0",
  ...restProps
}) => {
  // Create a placeholder with the first character of the name
  const renderPlaceholder = () => (
    <SVGPlaceholder viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="16" height="16" fill={color} />
      <text
        x="8"
        y="11"
        fontSize="10"
        textAnchor="middle"
        fill="white"
        fontFamily="sans-serif"
      >
        {name.charAt(0).toUpperCase()}
      </text>
    </SVGPlaceholder>
  );

  return (
    <IconContainer
      $size={size}
      $disabled={disabled}
      $withHover={withHover}
      {...restProps}
    >
      {src ? <IconImage src={src} alt={alt} /> : renderPlaceholder()}
    </IconContainer>
  );
};

export default Icon;
