/**
 * Utility functions for styling
 */

/**
 * Creates a Windows 95 border style (3D effect)
 * @param {string} type - 'inset' or 'outset'
 * @returns {string} CSS border style
 */
export const win95Border = (type = "outset") => {
  if (type === "inset") {
    return `
      border-top: 1px solid var(--win95-border-dark, #808080);
      border-left: 1px solid var(--win95-border-dark, #808080);
      border-right: 1px solid var(--win95-border-light, #ffffff);
      border-bottom: 1px solid var(--win95-border-light, #ffffff);
    `;
  }

  // Default is outset
  return `
    border-top: 1px solid var(--win95-border-light, #ffffff);
    border-left: 1px solid var(--win95-border-light, #ffffff);
    border-right: 1px solid var(--win95-border-dark, #808080);
    border-bottom: 1px solid var(--win95-border-dark, #808080);
  `;
};

/**
 * Creates a Windows 95 deep border style (deeper 3D effect)
 * @param {string} type - 'inset' or 'outset'
 * @returns {string} CSS border style
 */
export const win95DeepBorder = (type = "outset") => {
  if (type === "inset") {
    return `
      border-top: 2px solid var(--win95-border-dark, #808080);
      border-left: 2px solid var(--win95-border-dark, #808080);
      border-right: 2px solid var(--win95-border-light, #ffffff);
      border-bottom: 2px solid var(--win95-border-light, #ffffff);
    `;
  }

  // Default is outset
  return `
    border-top: 2px solid var(--win95-border-light, #ffffff);
    border-left: 2px solid var(--win95-border-light, #ffffff);
    border-right: 2px solid var(--win95-border-dark, #808080);
    border-bottom: 2px solid var(--win95-border-dark, #808080);
  `;
};

/**
 * Creates Windows 95 window border style
 * @returns {string} CSS border style
 */
export const win95WindowBorder = () => `
  border: 2px solid var(--win95-border-darker, #000000);
`;

/**
 * Creates a pixel-based shadow
 * @returns {string} CSS shadow style
 */
export const pixelShadow = () => `
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5);
`;

/**
 * Creates an inset (pressed) effect
 * @returns {string} CSS styles for inset effect
 */
export const pressedEffect = () => `
  ${win95Border("inset")}
  transform: translateY(1px);
`;

/**
 * Disables text selection
 * @returns {string} CSS styles to disable text selection
 */
export const noSelect = () => `
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;

/**
 * Applies Windows 95 font styling
 * @returns {string} CSS font styling
 */
export const win95Font = () => `
  font-family: 'ms_sans_serif', sans-serif;
  -webkit-font-smoothing: none;
  font-smooth: never;
`;

/**
 * Creates Windows 95 scrollbar styling
 * @returns {string} CSS scrollbar styling
 */
export const win95Scrollbar = () => `
  &::-webkit-scrollbar {
    width: 16px;
    height: 16px;
    background-color: var(--win95-scrollbar, #c0c0c0);
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: var(--win95-scrollbar, #c0c0c0);
    border: 1px solid var(--win95-border-darker, #000000);
    border-right-color: var(--win95-border-light, #ffffff);
    border-bottom-color: var(--win95-border-light, #ffffff);
  }
  
  &::-webkit-scrollbar-button {
    background-color: var(--win95-scrollbar, #c0c0c0);
    border: 1px solid var(--win95-border-darker, #000000);
    border-right-color: var(--win95-border-light, #ffffff);
    border-bottom-color: var(--win95-border-light, #ffffff);
    width: 16px;
    height: 16px;
  }
  
  &::-webkit-scrollbar-corner {
    background-color: var(--win95-scrollbar, #c0c0c0);
  }
`;
