// src/components/common/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Protected route component that redirects to login if not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading, isAuthenticated } = useAuth();

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "var(--win95-bg)",
        }}
      >
        <div
          style={{
            padding: "20px",
            backgroundColor: "var(--win95-window-bg)",
            border: "2px solid var(--win95-border-darker)",
            borderRight: "2px solid var(--win95-border-light)",
            borderBottom: "2px solid var(--win95-border-light)",
          }}
        >
          <h3
            style={{
              fontFamily: "ms_sans_serif, sans-serif",
              fontSize: "14px",
            }}
          >
            Windows 95 is loading...
          </h3>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;
