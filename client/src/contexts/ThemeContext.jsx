// src/contexts/ThemeContext.jsx - Updated with improved CRT effect and theme handling

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

// Base Windows 95 theme - classic colors ensured
const baseTheme = {
  name: "win95",
  desktop: "#008080", // Classic teal Windows 95 background
  window: "#c0c0c0", // Light grey window background
  windowHeader: "#000080", // Classic Windows 95 blue header
  text: "#000000", // Black text
  textLight: "#ffffff", // White text
  borderLight: "#ffffff", // White borders
  borderDark: "#808080", // Grey borders
  borderDarker: "#000000", // Black borders
  button: "#c0c0c0", // Grey buttons
  scrollbar: "#c0c0c0", // Grey scrollbars
  scrollbarThumb: "#a0a0a0", // Slightly darker grey scrollbar thumb
  startMenu: "#c0c0c0", // Grey start menu
  taskbar: "#c0c0c0", // Grey taskbar
  icon: "#000080", // Blue icon
  crtEffectLevel: 0.5, // Default CRT effect level
};

// Genre-specific themes that override base theme properties
const genreThemes = {
  fantasy: {
    name: "fantasy",
    desktop: "#1a472a", // Forest green
    windowHeader: "#5d0000", // Dark red
    scrollbarThumb: "#5d0000",
    icon: "#5d0000",
  },
  scifi: {
    name: "scifi",
    desktop: "#000435", // Deep space blue
    windowHeader: "#0c64c0", // Bright blue
    scrollbarThumb: "#0c64c0",
    icon: "#0c64c0",
  },
  horror: {
    name: "horror",
    desktop: "#121212", // Almost black
    windowHeader: "#350000", // Blood red
    scrollbarThumb: "#350000",
    icon: "#350000",
    // Apply slightly higher CRT effect for horror games
    crtEffectLevel: 0.7,
  },
  mystery: {
    name: "mystery",
    desktop: "#2f2c3d", // Dark purple/blue
    windowHeader: "#4b2b45", // Dark mauve
    scrollbarThumb: "#4b2b45",
    icon: "#4b2b45",
  },
  western: {
    name: "western",
    desktop: "#8b5a2b", // Sandy brown
    windowHeader: "#542900", // Dark brown
    scrollbarThumb: "#542900",
    icon: "#542900",
  },
  win95: {
    name: "win95",
    desktop: "#008080", // Classic teal Windows 95 background
    windowHeader: "#000080", // Classic Windows 95 blue header
    scrollbarThumb: "#a0a0a0",
    icon: "#000080",
  }
};

// Additional accessibility themes
const accessibilityThemes = {
  highContrast: {
    name: "highContrast",
    desktop: "#000000",
    window: "#ffffff",
    windowHeader: "#000000",
    text: "#000000",
    textLight: "#ffffff",
    borderLight: "#ffffff",
    borderDark: "#000000",
    borderDarker: "#000000",
    button: "#ffffff",
    scrollbar: "#ffffff",
    scrollbarThumb: "#000000",
    startMenu: "#ffffff",
    taskbar: "#000000",
    icon: "#000000",
    crtEffectLevel: 0, // Disable CRT effect for accessibility
  },
};

// Create the theme context
const ThemeContext = createContext(null);

/**
 * ThemeProvider component that manages the application theme
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const ThemeProvider = ({ children }) => {
  // Try to load theme preference from localStorage
  const savedTheme = localStorage.getItem("win95_theme") || "win95";
  const savedGenre = localStorage.getItem("win95_current_genre");
  const savedCrtLevel = localStorage.getItem("win95_crt_effect_level");

  // Initialize state
  const [currentTheme, setCurrentTheme] = useState(savedTheme);
  const [currentGenre, setCurrentGenre] = useState(savedGenre || null);
  const [previousGenre, setPreviousGenre] = useState(null); // Track previous genre for restoration
  const [crtEffectLevel, setCrtEffectLevel] = useState(
    savedCrtLevel !== null ? parseFloat(savedCrtLevel) : 0.5
  );
  const [textAdventureOpen, setTextAdventureOpen] = useState(false); // Track if text adventure is open

  // Track the last applied theme for comparison
  const [lastAppliedTheme, setLastAppliedTheme] = useState(null);
  
  // Use ref to track theme application in flight
  const themeApplicationInProgress = useRef(false);

  // Generate the active theme by combining base theme with genre theme if applicable
  const getActiveTheme = useCallback(() => {
    // Start with the base theme
    let theme = { ...baseTheme };

    // For Windows 95 theme, we shouldn't have any genre overrides
    if (currentTheme === "win95") {
      // Ensure no genre overrides are applied
      // Keep only base theme + CRT effect level
      theme.crtEffectLevel = crtEffectLevel;
      return theme;
    }

    // If there's a genre override, merge those properties
    if (currentGenre && genreThemes[currentGenre]) {
      theme = { ...theme, ...genreThemes[currentGenre] };
    }

    // If a special theme is selected (like highContrast), use that instead
    if (currentTheme !== "win95" && accessibilityThemes[currentTheme]) {
      theme = { ...accessibilityThemes[currentTheme] };
    } else if (currentTheme !== "win95" && genreThemes[currentTheme]) {
      // If theme is a genre name but not set as currentGenre
      theme = { ...theme, ...genreThemes[currentTheme] };
    }

    // Apply user CRT effect preference
    theme.crtEffectLevel = crtEffectLevel;

    return theme;
  }, [currentTheme, currentGenre, crtEffectLevel]);

  // Force a reapplication of the theme (for fixing issues)
  const forceThemeReapplication = useCallback(() => {
    // Prevent multiple rapid theme applications
    if (themeApplicationInProgress.current) {
      return;
    }
    
    themeApplicationInProgress.current = true;
    
    const theme = getActiveTheme();
    applyThemeToDOM(theme);
    setLastAppliedTheme(JSON.stringify(theme));
    console.log("Theme forcibly reapplied:", theme.name);
    
    // Release lock after a short delay
    setTimeout(() => {
      themeApplicationInProgress.current = false;
    }, 100);
  }, [getActiveTheme]);

  // Apply the theme to CSS variables
  const applyThemeToDOM = useCallback((theme) => {
    const root = document.documentElement;

    // Log for debugging
    console.log("Applying theme:", theme.name);

    // Set CSS variables
    root.style.setProperty("--win95-bg", theme.desktop);
    root.style.setProperty("--win95-window-bg", theme.window);
    root.style.setProperty("--win95-window-header", theme.windowHeader);
    root.style.setProperty("--win95-text", theme.text);
    root.style.setProperty("--win95-text-light", theme.textLight);
    root.style.setProperty("--win95-border-light", theme.borderLight);
    root.style.setProperty("--win95-border-dark", theme.borderDark);
    root.style.setProperty("--win95-border-darker", theme.borderDarker);
    root.style.setProperty("--win95-button-face", theme.button);
    root.style.setProperty("--win95-scrollbar", theme.scrollbar);
    root.style.setProperty("--win95-scrollbar-thumb", theme.scrollbarThumb);
    root.style.setProperty("--win95-icon", theme.icon);

    // Apply CRT effect level
    root.style.setProperty("--crt-effect-level", theme.crtEffectLevel);

    // Apply appropriate CRT effect class
    if (theme.crtEffectLevel <= 0) {
      root.classList.add("crt-effect-disabled");
    } else {
      root.classList.remove("crt-effect-disabled");
      applyCRTEffect(theme.crtEffectLevel);
    }
  }, []);

// Updated applyCRTEffect function with extremely high z-index
const applyCRTEffect = useCallback((level) => {
  const root = document.documentElement;
  
  // Remove any existing CRT effect styles
  const existingStyle = document.getElementById('crt-effect-style');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Remove existing overlay element if it exists
  const existingOverlay = document.getElementById('crt-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }
  
  // Skip if level is 0
  if (level <= 0) {
    root.classList.add("crt-effect-disabled");
    return;
  }
  
  // Remove disabled class
  root.classList.remove("crt-effect-disabled");
  
  // Create global overlay element for CRT effect
  const overlay = document.createElement('div');
  overlay.id = 'crt-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 99999999;
  `;
  document.body.appendChild(overlay);
  
  // Create and apply CRT effect styles
  const style = document.createElement('style');
  style.id = 'crt-effect-style';
  
  // Scale effect intensity based on level
  const scanlineOpacity = 0.15 * level;
  const glowRadius = 6 * level;
  const glowOpacity = 0.15 * level;
  
  style.textContent = `
    /* CRT Overlay styling */
    #crt-overlay {
      background: linear-gradient(
        rgba(18, 16, 16, 0) 50%, 
        rgba(0, 0, 0, ${scanlineOpacity}) 50%
      );
      background-size: 100% 4px;
      
      /* Add subtle bloom/glow */
      box-shadow: 
        inset 0 0 ${glowRadius}px rgba(0, 30, 255, ${glowOpacity}),
        inset 0 0 ${glowRadius/2}px rgba(0, 30, 255, ${glowOpacity});
    }
    
    /* Add RGB effect */
    #crt-overlay::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        to right,
        rgba(255, 0, 0, 0.03),
        rgba(0, 255, 0, 0.03),
        rgba(0, 0, 255, 0.03)
      );
      pointer-events: none;
      z-index: 1;
    }
    
    /* Optional vignette effect */
    #crt-overlay::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(
        circle at center,
        rgba(18, 16, 16, 0) 0%,
        rgba(0, 0, 0, ${0.2 * level}) 100%
      );
      pointer-events: none;
      z-index: 2;
    }
  `;
  
  document.head.appendChild(style);
  
  // Store effect level in CSS variable for other components to use
  root.style.setProperty('--crt-effect-level', level);
  
}, []);

  // Apply the theme to CSS variables whenever theme components change
  useEffect(() => {
    const theme = getActiveTheme();
    const themeString = JSON.stringify(theme);

    // Only apply if theme has changed
    if (themeString !== lastAppliedTheme) {
      applyThemeToDOM(theme);
      setLastAppliedTheme(themeString);
    }

    // Save preferences to localStorage
    localStorage.setItem("win95_theme", currentTheme);
    if (currentGenre) {
      localStorage.setItem("win95_current_genre", currentGenre);
    } else {
      localStorage.removeItem("win95_current_genre");
    }
    localStorage.setItem("win95_crt_effect_level", crtEffectLevel.toString());
  }, [
    currentTheme,
    currentGenre,
    crtEffectLevel,
    getActiveTheme,
    applyThemeToDOM,
    lastAppliedTheme,
  ]);

  // Initial application of theme after component mount
  useEffect(() => {
    // Force theme application on first render
    const theme = getActiveTheme();
    const themeString = JSON.stringify(theme);

    setTimeout(() => {
      applyThemeToDOM(theme);
      setLastAppliedTheme(themeString);
      console.log("Initial theme applied");
    }, 100);

    // Cleanup on unmount - remove CRT effects
    return () => {
      const existingStyle = document.getElementById("crt-effect-style");
      if (existingStyle) {
        existingStyle.remove();
      }

      const crtOverlay = document.getElementById("crt-overlay");
      if (crtOverlay) {
        crtOverlay.remove();
      }
    };
  }, []); // Empty dependency array for initial run only

  // IMPROVED: Apply a specific theme (like win95 or highContrast)
  const applySpecificTheme = useCallback(
    (themeName) => {
      // If applying Windows 95 theme, explicitly clear currentGenre
      if (themeName === "win95") {
        setCurrentTheme("win95");
        setCurrentGenre(null); // Important: clear the genre when applying win95 theme
        console.log("Explicitly applying Windows 95 theme and clearing genre");
      } else {
        setCurrentTheme(themeName);
      }

      // Force immediate theme application
      setTimeout(() => {
        const theme = getActiveTheme();
        applyThemeToDOM(theme);
        setLastAppliedTheme(JSON.stringify(theme));
        
        console.log(`Applied specific theme: ${themeName}, current genre: ${currentGenre}`);
      }, 50);
    },
    [currentGenre, getActiveTheme, applyThemeToDOM]
  );

  // IMPROVED: Apply genre themes are applied correctly by setting both currentTheme and currentGenre
  const applyGenreTheme = useCallback(
    (genre) => {
      if (genre === "win95") {
        // Handle "win95" as a special case to make it selectable like any genre
        setCurrentTheme("win95");
        setCurrentGenre(null); // Clear genre for Windows 95
        
        console.log("Applying Windows 95 theme (treated as genre selection)");
        
        // Force immediate theme application
        setTimeout(() => {
          const theme = getActiveTheme();
          applyThemeToDOM(theme);
          setLastAppliedTheme(JSON.stringify(theme));
        }, 50);
        
        return;
      }
      
      if (genreThemes[genre]) {
        // Store current genre before changing (for restoration)
        setPreviousGenre(currentGenre);
        
        // Set both the current genre and current theme for consistency
        setCurrentGenre(genre);
        setCurrentTheme(genre);
        
        // Mark text adventure as open when a genre theme is applied
        setTextAdventureOpen(true);

        console.log(`Applying genre theme: ${genre}`);

        // Force immediate theme application
        setTimeout(() => {
          const theme = getActiveTheme();
          applyThemeToDOM(theme);
          setLastAppliedTheme(JSON.stringify(theme));
        }, 50);
      } else {
        // Default to base theme if genre not found
        setCurrentGenre(null);
        setCurrentTheme("win95");
        console.log("Genre not found, using default Windows 95 theme");
        
        // Apply default theme
        setTimeout(() => {
          const theme = getActiveTheme();
          applyThemeToDOM(theme);
          setLastAppliedTheme(JSON.stringify(theme));
        }, 50);
      }
    },
    [currentGenre, getActiveTheme, applyThemeToDOM]
  );

  // IMPROVED: Restore default Windows 95 theme
  const restoreDefaultTheme = useCallback(() => {
    // Only reset if text adventure was open
    if (textAdventureOpen) {
      // Reset to Windows 95 theme
      setCurrentTheme("win95");
      setCurrentGenre(null); // Explicitly clear genre
      setTextAdventureOpen(false);

      // Apply the classic Windows 95 theme colors immediately
      const root = document.documentElement;
      root.style.setProperty("--win95-bg", "#008080"); // Classic teal background
      root.style.setProperty("--win95-window-bg", "#c0c0c0"); // Grey windows
      root.style.setProperty("--win95-window-header", "#000080"); // Blue headers

      console.log("Theme restored to default Windows 95");

      // Force a reapplication of the full theme after a short delay
      setTimeout(() => {
        const theme = getActiveTheme();
        applyThemeToDOM(theme);
        setLastAppliedTheme(JSON.stringify(theme));
        console.log("Default theme forcibly reapplied");
      }, 50);
    }
  }, [textAdventureOpen, getActiveTheme, applyThemeToDOM]);

  // Update CRT effect level
  const updateCrtEffectLevel = useCallback(
    (level) => {
      // Ensure level is between 0 and 1
      const normalizedLevel = Math.max(0, Math.min(1, level));
      setCrtEffectLevel(normalizedLevel);

      // Apply effect immediately
      applyCRTEffect(normalizedLevel);
    },
    [applyCRTEffect]
  );

  // Toggle CRT effect on/off
  const toggleCrtEffect = useCallback(() => {
    setCrtEffectLevel((prevLevel) => {
      const newLevel = prevLevel > 0 ? 0 : 0.5;
      applyCRTEffect(newLevel);
      return newLevel;
    });
  }, [applyCRTEffect]);

  // Reset to default theme
  const resetTheme = useCallback(() => {
    setCurrentTheme("win95");
    setCurrentGenre(null);
    setCrtEffectLevel(0.5);

    // Force application of default theme
    setTimeout(() => {
      const theme = getActiveTheme();
      applyThemeToDOM(theme);
      console.log("Theme reset to default");
    }, 50);
  }, [getActiveTheme, applyThemeToDOM]);

  // Context value
  const value = {
    theme: getActiveTheme(),
    applyGenreTheme,
    restoreDefaultTheme,
    applySpecificTheme,
    updateCrtEffectLevel,
    toggleCrtEffect,
    resetTheme,
    forceThemeReapplication,
    currentTheme,
    currentGenre,
    crtEffectLevel,
    textAdventureOpen,
    setTextAdventureOpen,
    genreThemes: Object.keys(genreThemes),
    accessibilityThemes: Object.keys(accessibilityThemes),
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

/**
 * Hook for accessing the theme context
 * @returns {Object} Theme context
 */
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;