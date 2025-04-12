import React, { useEffect, useState, useRef } from 'react';

/**
 * Simple, reliable CRT Screen Effect component
 */
const CRTEffect = ({ enabled = true, intensity = 0.5 }) => {
  const overlayRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Skip if not mounted or effect disabled
    if (!mounted || !enabled || intensity <= 0) {
      if (overlayRef.current) {
        document.body.removeChild(overlayRef.current);
        overlayRef.current = null;
      }
      return;
    }
    
    // Create overlay if it doesn't exist
    if (!overlayRef.current) {
      const overlay = document.createElement('div');
      overlay.id = 'crt-overlay';
      
      // IMPORTANT: Fixed positioning and very high z-index
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '2147483647'; // Maximum z-index value
      
      // Directly apply scanlines and vignette
      overlay.style.backgroundImage = `linear-gradient(
        transparent 50%, 
        rgba(0, 0, 0, ${0.1 * intensity}) 50%
      )`;
      overlay.style.backgroundSize = '100% 4px';
      overlay.style.boxShadow = `inset 0 0 ${10 * intensity}px rgba(0, 0, 0, ${0.2 * intensity})`;
      
      document.body.appendChild(overlay);
      overlayRef.current = overlay;
    } else {
      // Update existing overlay
      const overlay = overlayRef.current;
      overlay.style.backgroundImage = `linear-gradient(
        transparent 50%, 
        rgba(0, 0, 0, ${0.1 * intensity}) 50%
      )`;
      overlay.style.backgroundSize = '100% 4px';
      overlay.style.boxShadow = `inset 0 0 ${10 * intensity}px rgba(0, 0, 0, ${0.2 * intensity})`;
    }
    
    return () => {
      if (overlayRef.current) {
        document.body.removeChild(overlayRef.current);
        overlayRef.current = null;
      }
    };
  }, [enabled, intensity, mounted]);
  
  // Set mounted after first render
  useEffect(() => {
    setMounted(true);
    return () => {
      if (overlayRef.current) {
        document.body.removeChild(overlayRef.current);
      }
    };
  }, []);
  
  return null;
};

export default CRTEffect;