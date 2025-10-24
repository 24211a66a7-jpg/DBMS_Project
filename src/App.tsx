import { useState } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import CheckpointPage from './pages/CheckpointPage';
import SavepointPage from './pages/SavepointPage';
import BufferPage from './pages/BufferPage';
import LogsPage from './pages/LogsPage';
import BackupPage from './pages/BackupPage';

function App() {
  const [currentPage, setCurrentPage] = useState('checkpoint');

  const renderPage = () => {
    switch (currentPage) {
      case 'checkpoint':
        return <CheckpointPage />;
      case 'savepoint':
        return <SavepointPage />;
      case 'buffer':
        return <BufferPage />;
      case 'logs':
        return <LogsPage />;
      case 'backup':
        return <BackupPage />;
      default:
        return <CheckpointPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <main>{renderPage()}</main>
      <Footer />
    </div>
  );
}

export default App;
