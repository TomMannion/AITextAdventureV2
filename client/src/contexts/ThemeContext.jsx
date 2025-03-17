// src/contexts/ThemeContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// Base Windows 95 theme - this is the default we'll return to
const baseTheme = {
  name: "win95",
  desktop: "#008080", // Classic teal Windows 95 background
  window: "#c0c0c0",
  windowHeader: "#000080", // Windows 95 blue header
  text: "#000000",
  textLight: "#ffffff",
  borderLight: "#ffffff",
  borderDark: "#808080",
  borderDarker: "#000000",
  button: "#c0c0c0",
  scrollbar: "#c0c0c0",
  scrollbarThumb: "#a0a0a0",
  startMenu: "#c0c0c0",
  taskbar: "#c0c0c0",
  icon: "#000080",
  crtEffectLevel: 0.5,
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
  const savedTheme = localStorage.getItem("win95_theme");
  const savedGenre = localStorage.getItem("win95_current_genre");
  const savedCrtLevel = localStorage.getItem("win95_crt_effect_level");

  // Initialize state
  const [currentTheme, setCurrentTheme] = useState(savedTheme || "win95");
  const [currentGenre, setCurrentGenre] = useState(savedGenre || null);
  const [previousGenre, setPreviousGenre] = useState(null); // Track previous genre for restoration
  const [crtEffectLevel, setCrtEffectLevel] = useState(
    savedCrtLevel !== null ? parseFloat(savedCrtLevel) : 0.5
  );
  const [textAdventureOpen, setTextAdventureOpen] = useState(false); // Track if text adventure is open

  // Generate the active theme by combining base theme with genre theme if applicable
  const getActiveTheme = () => {
    // Start with the base theme
    let theme = { ...baseTheme };

    // If there's a genre override, merge those properties
    if (currentGenre && genreThemes[currentGenre]) {
      theme = { ...theme, ...genreThemes[currentGenre] };
    }

    // If a special theme is selected (like highContrast), use that instead
    if (currentTheme !== "win95" && accessibilityThemes[currentTheme]) {
      theme = { ...accessibilityThemes[currentTheme] };
    }

    // Apply user CRT effect preference
    theme.crtEffectLevel = crtEffectLevel;

    return theme;
  };

  // Force a reapplication of the theme (for fixing issues)
  const forceThemeReapplication = useCallback(() => {
    const theme = getActiveTheme();
    applyThemeToDOM(theme);
    console.log("Theme forcibly reapplied:", theme.name);
  }, [getActiveTheme]);

  // Apply the theme to CSS variables
  const applyThemeToDOM = (theme) => {
    const root = document.documentElement;

    // Log for debugging
    console.log("Applying theme:", theme.name);
    console.log("Desktop color:", theme.desktop);
    console.log("Window header color:", theme.windowHeader);

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

    // Apply CRT effect level class
    if (theme.crtEffectLevel <= 0) {
      root.classList.add("crt-effect-disabled");
    } else {
      root.classList.remove("crt-effect-disabled");
      root.style.setProperty("--crt-effect-level", theme.crtEffectLevel);
    }
  };

  // Apply the theme to CSS variables
  useEffect(() => {
    const theme = getActiveTheme();
    applyThemeToDOM(theme);

    // Save preferences to localStorage
    localStorage.setItem("win95_theme", currentTheme);
    if (currentGenre) {
      localStorage.setItem("win95_current_genre", currentGenre);
    } else {
      localStorage.removeItem("win95_current_genre");
    }
    localStorage.setItem("win95_crt_effect_level", crtEffectLevel.toString());
  }, [currentTheme, currentGenre, crtEffectLevel]);

  // Initial application of theme after component mount
  useEffect(() => {
    // Force theme application on first render
    const theme = getActiveTheme();
    setTimeout(() => {
      applyThemeToDOM(theme);
      console.log("Initial theme applied");
    }, 100);
  }, []); // Empty dependency array for initial run only

  // Change theme based on game genre
  const applyGenreTheme = useCallback(
    (genre) => {
      if (genreThemes[genre]) {
        // Store current genre before changing (for restoration)
        setPreviousGenre(currentGenre);
        setCurrentGenre(genre);
        // Mark text adventure as open when a genre theme is applied
        setTextAdventureOpen(true);

        console.log(`Applying genre theme: ${genre}`);
      } else {
        // Default to base theme if genre not found
        setCurrentGenre(null);
        console.log("Genre not found, using default theme");
      }
    },
    [currentGenre]
  );

  // Restore previous theme when text adventure closes
  const restoreDefaultTheme = useCallback(() => {
    // Only reset if text adventure was open
    if (textAdventureOpen) {
      setCurrentGenre(null);
      setTextAdventureOpen(false);
      console.log("Theme restored to default Windows 95");

      // Force a reapplication after a short delay
      setTimeout(() => {
        const theme = getActiveTheme();
        applyThemeToDOM(theme);
        console.log("Default theme forcibly reapplied");
      }, 50);
    }
  }, [textAdventureOpen]);

  // Change to a specific theme (like highContrast)
  const applySpecificTheme = useCallback((themeName) => {
    setCurrentTheme(themeName);
    console.log(`Applying specific theme: ${themeName}`);

    // Force a reapplication after a short delay
    setTimeout(() => {
      const theme = getActiveTheme();
      applyThemeToDOM(theme);
      console.log("Specific theme forcibly reapplied");
    }, 50);
  }, []);

  // Update CRT effect level
  const updateCrtEffectLevel = useCallback((level) => {
    // Ensure level is between 0 and 1
    const normalizedLevel = Math.max(0, Math.min(1, level));
    setCrtEffectLevel(normalizedLevel);
  }, []);

  // Toggle CRT effect on/off
  const toggleCrtEffect = useCallback(() => {
    setCrtEffectLevel((prevLevel) => (prevLevel > 0 ? 0 : 0.5));
  }, []);

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
  }, []);

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
