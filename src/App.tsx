import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GlobalStateProvider } from './contexts/GlobalStateContext';
import { AdProvider, useAdContext } from './contexts/AdContext';
import { Navigation } from './components/common';
import { ChineseStudy } from './components/study';
import { Home, SettingsPage } from './pages';
import './styles/index.css';

const AppContent: React.FC = () => {
  const { showBanner } = useAdContext();

  // 앱 시작 시 배너 광고 표시
  useEffect(() => {
    console.log('[App] Calling showBanner()');
    showBanner();
  }, [showBanner]);

  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/study/*" element={<ChineseStudy />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <GlobalStateProvider>
      <AdProvider>
        <AppContent />
      </AdProvider>
    </GlobalStateProvider>
  );
};

export default App;
