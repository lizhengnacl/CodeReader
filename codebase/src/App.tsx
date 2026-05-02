import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './lib/ThemeContext';
import { SettingsProvider } from './lib/SettingsContext';
import ProjectList from './pages/ProjectList';
import Workspace from './pages/Workspace';
import CodeViewer from './pages/CodeViewer';

const App = () => {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/workspace/:projectId" element={<Workspace />} />
            <Route path="/workspace/:projectId/code" element={<CodeViewer />} />
            <Route path="*" element={<Navigate to="/projects" replace />} />
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default App;
