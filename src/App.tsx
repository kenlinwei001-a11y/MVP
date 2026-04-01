import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Configuration from './pages/Configuration';

type PageType = 'dashboard' | 'chat' | 'settings' | 'configuration';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
  };

  return (
    <div className="min-h-screen bg-white">
      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {currentPage === 'chat' && <Chat onNavigate={handleNavigate} />}
      {currentPage === 'settings' && <Settings onNavigate={handleNavigate} />}
      {currentPage === 'configuration' && <Configuration onNavigate={handleNavigate} />}
    </div>
  );
}

export default App;
