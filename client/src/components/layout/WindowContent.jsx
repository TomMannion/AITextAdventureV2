import React from "react";
import styled from "styled-components";

const Content = styled.div`
  flex-grow: 1;
  overflow: ${(props) => props.$overflow || "auto"};
  padding: ${(props) => props.$padding || "10px"};
  background-color: ${(props) =>
    props.$backgroundColor || "var(--win95-window-bg, #c0c0c0)"};
`;

/**
 * Window content component for Windows 95 style windows
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The content to render inside the window
 * @param {string} props.padding - CSS padding value
 * @param {string} props.overflow - CSS overflow value
 * @param {string} props.backgroundColor - Background color
 */
const WindowContent = ({
  children,
  padding,
  overflow,
  backgroundColor,
  ...restProps
}) => {
  return (
    <Content
      $padding={padding}
      $overflow={overflow}
      $backgroundColor={backgroundColor}
      {...restProps}
    >
      {children}
    </Content>
  );
};

export default WindowContent;
