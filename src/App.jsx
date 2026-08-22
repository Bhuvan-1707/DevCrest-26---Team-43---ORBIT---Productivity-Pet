import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PageContainer from './components/layout/PageContainer';
import NavigationObserver from './components/layout/NavigationObserver';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Session from './pages/Session';
import Memory from './pages/Memory';
import Insights from './pages/Insights';
import Observations from './pages/Observations';
import PlaceholderPage from './pages/PlaceholderPage';

import Goals from './pages/Goals';
import Recovery from './pages/Recovery';
import Experiments from './pages/Experiments';
import Tasks from './pages/Tasks';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavigationObserver />
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <PageContainer>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/session" element={<Session />} />
                    <Route path="/memory" element={<Memory />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/observations" element={<Observations />} />
                    <Route path="/goals" element={<Goals />} />
                    <Route path="/recovery" element={<Recovery />} />
                    <Route path="/experiments" element={<Experiments />} />
                    <Route path="/tasks" element={<Tasks />} />

                    {/* Catch-all redirect */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </PageContainer>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
