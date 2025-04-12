import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getTheme, applyThemeColors } from '../styles/themes';
import CRTEffect from '../components/effects/CRTEffect';

// Create the context
const ThemeContext = createContext(null);

/**
 * Theme Provider component
 * Manages application theming and effects
 */
export const ThemeProvider = ({ children }) => {
  // Get initial values from localStorage
  const [currentThemeId, setCurrentThemeId] = useState(
    localStorage.getItem('win95_theme') || 'win95'
  );
  
  // CRT effect settings
  const [crtEffect, setCrtEffect] = useState({
    enabled: localStorage.getItem('win95_crt_effect_enabled') !== 'false',
    intensity: parseFloat(localStorage.getItem('win95_crt_effect_level') || '0.5')
  });
  
  // Track app context for theme restoration
  const [applicationContext, setApplicationContext] = useState({
    activeApp: null, // ID of active app ('textAdventure', etc.)
    previousTheme: null // Theme to restore when app closes
  });
  
  // Compute the full theme object
  const currentTheme = useMemo(() => getTheme(currentThemeId), [currentThemeId]);
  
  // Apply theme to DOM
  const applyTheme = useCallback((themeId) => {
    // Get the full theme with inheritance
    const theme = getTheme(themeId);
    
    // Apply theme colors to CSS variables
    applyThemeColors(theme);
    
    // Update state
    setCurrentThemeId(themeId);
    
    // Save to localStorage
    localStorage.setItem('win95_theme', themeId);
    
    console.log(`Applied theme: ${theme.name} (${theme.id})`);
  }, []);
  
  // Update CRT effect settings
  const updateCrtEffect = useCallback((settings) => {
    setCrtEffect(prev => {
      const newSettings = { ...prev, ...settings };
      
      // Save to localStorage
      localStorage.setItem('win95_crt_effect_enabled', String(newSettings.enabled));
      localStorage.setItem('win95_crt_effect_level', String(newSettings.intensity));
      
      return newSettings;
    });
  }, []);
  
  // Set theme for an application (stores previous theme for restoration)
  const setApplicationTheme = useCallback((appId, themeId) => {
    // Store previous theme for restoration later
    setApplicationContext(prev => ({
      ...prev,
      activeApp: appId,
      previousTheme: currentThemeId !== themeId ? currentThemeId : prev.previousTheme
    }));
    
    // Apply the theme
    applyTheme(themeId);
    
    console.log(`Applied theme ${themeId} for app ${appId}`);
  }, [applyTheme, currentThemeId]);
  
  // Restore the default theme or previous theme
  const restoreDefaultTheme = useCallback(() => {
    // Only restore if an app is active
    if (applicationContext.activeApp) {
      // Get theme to restore (previous or default)
      const themeToRestore = applicationContext.previousTheme || 'win95';
      
      // Apply the theme
      applyTheme(themeToRestore);
      
      // Clear application context
      setApplicationContext({
        activeApp: null,
        previousTheme: null
      });
      
      console.log(`Restored theme: ${themeToRestore}`);
    }
  }, [applicationContext, applyTheme]);
  
  // Initial theme application
  useEffect(() => {
    // Apply the theme on mount
    applyTheme(currentThemeId);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount
  
  // Define context value
  const contextValue = {
    // Theme state
    currentThemeId,
    currentTheme,
    
    // Effect state
    crtEffect,
    
    // App context
    applicationContext,
    
    // Actions
    applyTheme,
    setApplicationTheme,
    restoreDefaultTheme,
    updateCrtEffect,
    
    // Helpers
    getTheme: (id) => getTheme(id),
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {/* Apply CRT effect with current settings */}
      <CRTEffect 
        enabled={crtEffect.enabled} 
        intensity={crtEffect.intensity} 
      />
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Theme hook for component use
 * @returns {Object} Theme context
 */
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;