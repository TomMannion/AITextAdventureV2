/**
 * Theme definitions and utilities
 * This file defines all available themes and provides utilities for working with them
 */

// All available themes
export const themes = {
  // Standard Windows 95
  win95: {
    id: 'win95',
    name: 'Windows 95',
    category: 'system',
    colors: {
      desktop: '#008080', // Classic teal background
      window: '#c0c0c0', // Light grey window background
      windowHeader: '#000080', // Classic blue header
      text: '#000000', // Black text
      textLight: '#ffffff', // White text
      borderLight: '#ffffff', // White borders
      borderDark: '#808080', // Grey borders
      borderDarker: '#000000', // Black borders
      button: '#c0c0c0', // Grey buttons
      scrollbar: '#c0c0c0', // Grey scrollbars
      scrollbarThumb: '#a0a0a0', // Slightly darker grey scrollbar thumb
      startMenu: '#c0c0c0', // Grey start menu
      taskbar: '#c0c0c0', // Grey taskbar
      icon: '#000080', // Blue icon
    }
  },
  
  // Genre themes
  fantasy: {
    id: 'fantasy',
    name: 'Fantasy',
    category: 'genre',
    extends: 'win95',
    colors: {
      desktop: '#1a472a', // Forest green
      windowHeader: '#5d0000', // Dark red
      scrollbarThumb: '#5d0000',
      icon: '#5d0000',
    }
  },
  
  scifi: {
    id: 'scifi',
    name: 'Science Fiction',
    category: 'genre',
    extends: 'win95',
    colors: {
      desktop: '#000435', // Deep space blue
      windowHeader: '#0c64c0', // Bright blue
      scrollbarThumb: '#0c64c0',
      icon: '#0c64c0',
    }
  },
  
  horror: {
    id: 'horror',
    name: 'Horror',
    category: 'genre',
    extends: 'win95',
    colors: {
      desktop: '#121212', // Almost black
      windowHeader: '#350000', // Blood red
      scrollbarThumb: '#350000',
      icon: '#350000',
    }
  },
  
  mystery: {
    id: 'mystery',
    name: 'Mystery',
    category: 'genre',
    extends: 'win95',
    colors: {
      desktop: '#2f2c3d', // Dark purple/blue
      windowHeader: '#4b2b45', // Dark mauve
      scrollbarThumb: '#4b2b45',
      icon: '#4b2b45',
    }
  },
  
  western: {
    id: 'western',
    name: 'Western',
    category: 'genre',
    extends: 'win95',
    colors: {
      desktop: '#8b5a2b', // Sandy brown
      windowHeader: '#542900', // Dark brown
      scrollbarThumb: '#542900',
      icon: '#542900',
    }
  },
  
  // Accessibility themes
  highContrast: {
    id: 'highContrast',
    name: 'High Contrast',
    category: 'accessibility',
    colors: {
      desktop: '#000000', // Black background
      window: '#ffffff', // White windows
      windowHeader: '#000000', // Black headers
      text: '#000000', // Black text
      textLight: '#ffffff', // White text
      borderLight: '#ffffff', // White borders
      borderDark: '#000000', // Black borders
      borderDarker: '#000000', // Black borders
      button: '#ffffff', // White buttons
      scrollbar: '#ffffff', // White scrollbars
      scrollbarThumb: '#000000', // Black scrollbar thumb
      startMenu: '#ffffff', // White start menu
      taskbar: '#000000', // Black taskbar
      icon: '#000000', // Black icon
    }
  }
};

/**
 * Get a complete theme object with inheritance resolved
 * @param {string} themeId - The ID of the theme to retrieve
 * @returns {Object} Complete theme object with all colors
 */
export function getTheme(themeId) {
  const theme = themes[themeId];
  if (!theme) return themes.win95; // Default to Windows 95 if theme not found
  
  // If theme extends another theme, merge with parent
  if (theme.extends && themes[theme.extends]) {
    // Create a new object with parent theme colors and override with current theme colors
    return {
      ...theme,
      colors: {
        ...themes[theme.extends].colors,
        ...theme.colors
      }
    };
  }
  
  return theme; // Return theme as is if it doesn't extend another
}

/**
 * Get a preview of theme colors
 * @param {string} themeId - The ID of the theme to preview
 * @returns {Object} Object with preview colors
 */
export function getThemePreview(themeId) {
  const theme = getTheme(themeId);
  
  return {
    desktop: theme.colors.desktop,
    window: theme.colors.window,
    windowHeader: theme.colors.windowHeader,
    text: theme.colors.text,
    textLight: theme.colors.textLight,
  };
}

/**
 * Apply theme colors to CSS variables
 * @param {Object} theme - The theme object
 */
export function applyThemeColors(theme) {
  const root = document.documentElement;
  
  // Create a mapping between theme colors and CSS variables
  const cssVarMap = {
    // Map theme properties to CSS variable names
    desktop: '--win95-bg',          // Map to original variable
    window: '--win95-window-bg',    // Map to original variable
    windowHeader: '--win95-window-header',
    text: '--win95-text',
    textLight: '--win95-text-light',
    borderLight: '--win95-border-light',
    borderDark: '--win95-border-dark',
    borderDarker: '--win95-border-darker',
    button: '--win95-button-face',
    scrollbar: '--win95-scrollbar',
    scrollbarThumb: '--win95-scrollbar-thumb',
    icon: '--win95-icon',
    startMenu: '--win95-startMenu',
    taskbar: '--win95-taskbar'
  };
  
  // Apply each color to the appropriate CSS variable
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVar = cssVarMap[key];
    if (cssVar) {
      root.style.setProperty(cssVar, value);
    }
    
    // Also set the "new style" variable for future compatibility
    // This ensures we maintain both naming conventions during transition
    root.style.setProperty(`--win95-${key}`, value);
  });
  
  console.log(`Applied theme: ${theme.name} with desktop color: ${theme.colors.desktop}`);
}

/**
 * Get an array of all available themes
 * @returns {Array} Array of theme objects with id and name
 */
export function getAvailableThemes() {
  return Object.values(themes).map(theme => ({
    id: theme.id,
    name: theme.name,
    category: theme.category
  }));
}

/**
 * Get themes by category
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered array of themes
 */
export function getThemesByCategory(category) {
  return Object.values(themes)
    .filter(theme => theme.category === category)
    .map(theme => ({
      id: theme.id,
      name: theme.name
    }));
}