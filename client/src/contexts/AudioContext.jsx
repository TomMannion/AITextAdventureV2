// src/contexts/AudioContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

// Create the context
const AudioContext = createContext();

// Default audio settings
const defaultSettings = {
  masterVolume: 0.8, // 0 to 1
  uiSounds: true,
  gameSounds: true,
  backgroundMusic: true,
};

// Sound effects mapping
const soundEffects = {
  click: "/sounds/click.mp3", // Standard UI click
  notification: "/sounds/notification.mp3", // Notification sound
  error: "/sounds/error.mp3", // Error sound
  startup: "/sounds/startup.mp3", // System startup sound
  shutdown: "/sounds/shutdown.mp3", // System shutdown sound
  maximize: "/sounds/maximize.mp3", // Window maximize
  minimize: "/sounds/minimize.mp3", // Window minimize
  warning: "/sounds/error.mp3", // Warning sound (same as error)
};

/**
 * Audio Provider component
 */
export const AudioProvider = ({ children }) => {
  // Load saved settings or use defaults
  const [audioSettings, setAudioSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem("audio_settings");
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    } catch (error) {
      console.error("Error loading audio settings:", error);
      return defaultSettings;
    }
  });

  // Audio elements cache
  const audioElements = {};

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem("audio_settings", JSON.stringify(audioSettings));
  }, [audioSettings]);

  // Play UI sound effect
  const playUISound = (soundName) => {
    if (!audioSettings.uiSounds || audioSettings.masterVolume <= 0) return;

    // Get sound URL
    const soundUrl = soundEffects[soundName];
    if (!soundUrl) {
      console.warn(`Sound "${soundName}" not found`);
      return;
    }

    try {
      // Use cached audio element or create a new one
      if (!audioElements[soundName]) {
        const audio = new Audio(soundUrl);
        audioElements[soundName] = audio;
      }

      // Set volume and play
      const audio = audioElements[soundName];
      audio.volume = audioSettings.masterVolume;
      audio.currentTime = 0;

      // Handle common play errors gracefully
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch((error) => {
          // Common error in browsers that block autoplay
          console.warn(`Sound play error (${soundName}):`, error.message);
        });
      }
    } catch (error) {
      console.error(`Error playing sound "${soundName}":`, error);
    }
  };

  // Play game sound effect
  const playGameSound = (soundName, options = {}) => {
    if (!audioSettings.gameSounds || audioSettings.masterVolume <= 0) return;

    try {
      const soundUrl = options.url || soundEffects[soundName] || soundName;
      const volume =
        options.volume !== undefined
          ? options.volume * audioSettings.masterVolume
          : audioSettings.masterVolume;

      const audio = new Audio(soundUrl);
      audio.volume = volume;

      // Set loop if requested
      if (options.loop) {
        audio.loop = true;
      }

      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch((error) => {
          console.warn(`Game sound play error (${soundName}):`, error.message);
        });
      }

      // Return audio element for control (stop, pause)
      return audio;
    } catch (error) {
      console.error(`Error playing game sound "${soundName}":`, error);
      return null;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setAudioSettings((prev) => ({
      ...prev,
      masterVolume: prev.masterVolume > 0 ? 0 : defaultSettings.masterVolume,
    }));
  };

  // Update audio settings
  const updateAudioSettings = (newSettings) => {
    setAudioSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  // Context value
  const value = {
    audioSettings,
    updateAudioSettings,
    toggleMute,
    playUISound,
    playGameSound,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};

// Custom hook for using the audio context
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};

export default AudioContext;
