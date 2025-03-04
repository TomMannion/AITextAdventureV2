// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import "./App.css";

// Lazy load components
const AuthPage = lazy(() => import("./pages/AuthPage"));
const GameListPage = lazy(() => import("./pages/GameListPage"));
const GamePage = lazy(() => import("./pages/GamePage"));

// Character pages
const CharactersPage = lazy(() => import("./pages/CharactersPage"));
const CharacterDetailPage = lazy(() => import("./pages/CharacterDetailPage"));
const CharacterCreatePage = lazy(() => import("./pages/CharacterCreatePage"));
const CharacterEditPage = lazy(() => import("./pages/CharacterEditPage"));

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// Auth wrapper component
const AuthWrapper = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="content">
            <Suspense
              fallback={<div className="loading-screen">Loading...</div>}
            >
              <Routes>
                {/* Auth route */}
                <Route
                  path="/auth"
                  element={
                    <AuthWrapper>
                      <AuthPage />
                    </AuthWrapper>
                  }
                />

                {/* Game routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <GameListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/games/:id"
                  element={
                    <ProtectedRoute>
                      <GamePage />
                    </ProtectedRoute>
                  }
                />

                {/* Character routes */}
                <Route
                  path="/characters"
                  element={
                    <ProtectedRoute>
                      <CharactersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/characters/new"
                  element={
                    <ProtectedRoute>
                      <CharacterCreatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/characters/:id"
                  element={
                    <ProtectedRoute>
                      <CharacterDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/characters/:id/edit"
                  element={
                    <ProtectedRoute>
                      <CharacterEditPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
