// src/App.jsx - Updated with router-based authentication and notification support
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WindowProvider } from "./contexts/WindowContext";
import { GameProvider } from "./contexts/GameContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AudioProvider } from "./contexts/AudioContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import NotificationContainer from "./components/notifications/NotificationContainer";
import DesktopContent from "./features/desktop/Desktop";
import LoginForm from "./features/auth/components/LoginForm";
import RegisterForm from "./features/auth/components/RegisterForm";
import ProtectedRoute from "./components/common/ProtectedRoute";

// App component using React Router
const App = () => {
  return (
    <AudioProvider>
      <ThemeProvider>
        <NotificationProvider>
          <WindowProvider>
            <AuthProvider>
              <GameProvider>
                {/* Global notification container */}
                <NotificationContainer />

                <Router>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegisterForm />} />

                    {/* Protected routes */}
                    <Route
                      path="/desktop"
                      element={
                        <ProtectedRoute>
                          <DesktopContent />
                        </ProtectedRoute>
                      }
                    />

                    {/* Default route redirects to login */}
                    <Route
                      path="/"
                      element={<Navigate to="/login" replace />}
                    />
                    <Route
                      path="*"
                      element={<Navigate to="/login" replace />}
                    />
                  </Routes>
                </Router>
              </GameProvider>
            </AuthProvider>
          </WindowProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AudioProvider>
  );
};

export default App;
