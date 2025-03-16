import React from "react";
import styled from "styled-components";

/**
 * Styled text component with Windows 95 font styling
 */
const StyledText = styled.div`
  font-family: "ms_sans_serif", sans-serif;
  color: ${(props) => props.$color || "inherit"};
  font-size: ${(props) => props.$size || "inherit"};
  font-weight: ${(props) => (props.$bold ? "bold" : "normal")};
  white-space: ${(props) => (props.$nowrap ? "nowrap" : "normal")};
  text-align: ${(props) => props.$align || "left"};
  margin: ${(props) => props.$margin || "0"};
  padding: ${(props) => props.$padding || "0"};

  /* Optional text overflow with ellipsis */
  ${(props) =>
    props.$ellipsis
      ? `
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  `
      : ""}

  /* Optional shadow for desktop text */
  ${(props) =>
    props.$textShadow
      ? `
    text-shadow: ${props.$textShadow};
  `
      : ""}
`;

/**
 * Text component with Windows 95 styling
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Text content
 * @param {string} props.color - Text color
 * @param {string} props.size - Font size (e.g., '12px')
 * @param {boolean} props.bold - Whether text should be bold
 * @param {boolean} props.nowrap - Whether text should avoid wrapping
 * @param {string} props.align - Text alignment
 * @param {string} props.margin - Margin CSS value
 * @param {string} props.padding - Padding CSS value
 * @param {boolean} props.ellipsis - Whether to add ellipsis for overflow
 * @param {string} props.textShadow - Optional text shadow CSS value
 * @param {string} props.as - HTML element to render as
 */
const Text = ({
  children,
  color,
  size,
  bold = false,
  nowrap = false,
  align,
  margin,
  padding,
  ellipsis = false,
  textShadow,
  as = "div",
  ...restProps
}) => {
  return (
    <StyledText
      as={as}
      $color={color}
      $size={size}
      $bold={bold}
      $nowrap={nowrap}
      $align={align}
      $margin={margin}
      $padding={padding}
      $ellipsis={ellipsis}
      $textShadow={textShadow}
      {...restProps}
    >
      {children}
    </StyledText>
  );
};

export default Text;
