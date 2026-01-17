import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GlobalStateProvider } from './contexts/GlobalStateContext';
import { Navigation } from './components/common';
import { ChineseStudy } from './components/study';
import LegacyApp from './components/LegacyApp';
import { Home, SettingsPage } from './pages';
import './styles/index.css';

const App: React.FC = () => {
  return (
    <GlobalStateProvider>
      <BrowserRouter>
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/study/*" element={<ChineseStudy />} />
              <Route path="/legacy" element={<LegacyApp />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
          <Navigation />
        </div>
      </BrowserRouter>
    </GlobalStateProvider>
  );
};

export default App;
