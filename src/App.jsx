import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PageContainer from './components/layout/PageContainer';
import NavigationObserver from './components/layout/NavigationObserver';
import Dashboard from './pages/Dashboard';
import Session from './pages/Session';
import Memory from './pages/Memory';
import Insights from './pages/Insights';
import Observations from './pages/Observations';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <BrowserRouter>
      <NavigationObserver />
      <PageContainer>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/session" element={<Session />} />
          <Route path="/memory" element={<Memory />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/observations" element={<Observations />} />
          
          {/* Upcoming Module Placeholders */}
          <Route 
            path="/tasks" 
            element={
              <PlaceholderPage 
                title="Tasks Overview" 
                description="Manage daily tasks and focus targets" 
                icon="✓" 
              />
            } 
          />
          <Route 
            path="/goals" 
            element={
              <PlaceholderPage 
                title="Goal Progress" 
                description="Long-term goal and milestone tracking" 
                icon="◎" 
              />
            } 
          />
          <Route 
            path="/experiments" 
            element={
              <PlaceholderPage 
                title="Behavioral Experiments" 
                description="Active productivity and recovery experiments" 
                icon="⚡" 
              />
            } 
          />
          <Route 
            path="/recovery" 
            element={
              <PlaceholderPage 
                title="Recovery Engine" 
                description="Rest cycles, energy tracking, and recovery recommendations" 
                icon="◒" 
              />
            } 
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </PageContainer>
    </BrowserRouter>
  );
}
