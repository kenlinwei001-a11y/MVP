import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import OntologyStudio from './pages/OntologyStudio';
import AgentEditor from './pages/AgentEditor';

type PageType = 'dashboard' | 'chat' | 'settings' | 'database' | 'ontology-studio' | 'agent-editor';

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
      {currentPage === 'database' && <Dashboard onNavigate={handleNavigate} />}
      {currentPage === 'ontology-studio' && <OntologyStudio onNavigate={handleNavigate} />}
    </div>
  );
}

export default App;
