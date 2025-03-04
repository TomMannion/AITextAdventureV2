// src/components/Navbar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ApiSettingsPanel from "./ApiSettingsPanel";

const Navbar = () => {
  const { user, logout, isAuthenticated, apiSettings } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const location = useLocation();

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Helper to determine if a path is active
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">AI Text Adventure</Link>
      </div>

      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            <Link
              to="/"
              className={`nav-link ${
                isActive("/") && !isActive("/characters") ? "active" : ""
              }`}
            >
              Games
            </Link>

            <Link
              to="/characters"
              className={`nav-link ${isActive("/characters") ? "active" : ""}`}
            >
              Characters
            </Link>

            <button
              className={`api-settings-btn ${
                !apiSettings.apiKey ? "warning" : ""
              }`}
              onClick={toggleSettings}
              title={apiSettings.apiKey ? "API Settings" : "API Key Required"}
            >
              {apiSettings.apiKey ? "API Settings" : "⚠️ API Key Required"}
            </button>

            <span className="username">{user?.username}</span>

            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth" className="nav-link">
            Login
          </Link>
        )}
      </div>

      {showSettings && (
        <div className="modal-overlay">
          <ApiSettingsPanel onClose={() => setShowSettings(false)} />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
