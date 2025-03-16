import React from "react";
import styled from "styled-components";

/**
 * Windows 95 styled button component
 */
const StyledButton = styled.button`
  background-color: #c0c0c0;
  border-top: ${(props) =>
    props.$isPressed ? "1px solid #808080" : "1px solid #ffffff"};
  border-left: ${(props) =>
    props.$isPressed ? "1px solid #808080" : "1px solid #ffffff"};
  border-right: ${(props) =>
    props.$isPressed ? "1px solid #ffffff" : "1px solid #808080"};
  border-bottom: ${(props) =>
    props.$isPressed ? "1px solid #ffffff" : "1px solid #808080"};
  padding: ${(props) => (props.$isPressed ? "2px 2px 0 4px" : "1px 3px")};
  font-family: "ms_sans_serif", sans-serif;
  font-size: ${(props) => (props.$small ? "9px" : "11px")};
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: ${(props) => (props.$square ? "18px" : "auto")};
  height: ${(props) => (props.$square ? "18px" : "auto")};
  ${(props) => props.$primary && "font-weight: bold;"}

  &:focus {
    outline: 1px dotted #000000;
    outline-offset: -4px;
  }

  &:active {
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    border-right: 1px solid #ffffff;
    border-bottom: 1px solid #ffffff;
    padding: 2px 2px 0 4px;
  }
`;

/**
 * Button component in Windows 95 style
 *
 * @param {Object} props - Component props
 * @param {boolean} props.primary - Makes the button visually prominent
 * @param {boolean} props.small - Makes the button smaller
 * @param {boolean} props.square - Makes the button square shaped
 * @param {boolean} props.isPressed - Renders the button in pressed state
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Button content
 */
const Button = ({
  primary = false,
  small = false,
  square = false,
  isPressed = false,
  onClick,
  children,
  ...restProps
}) => {
  return (
    <StyledButton
      $primary={primary}
      $small={small}
      $square={square}
      $isPressed={isPressed}
      onClick={onClick}
      type={restProps.type || "button"} // Default to 'button' to avoid accidental form submissions
      {...restProps}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
