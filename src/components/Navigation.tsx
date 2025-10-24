import { useState } from 'react';
import { Database, Bookmark, Box, FileText, Cloud } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'checkpoint', label: 'Checkpoints', icon: Database },
    { id: 'savepoint', label: 'Savepoints', icon: Bookmark },
    { id: 'buffer', label: 'Buffer', icon: Box },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'backup', label: 'Backup', icon: Cloud },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg border-b-2 border-cyan-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Database className="h-8 w-8 text-cyan-400" />
            <span className="ml-3 text-xl font-bold text-white">
              College Results Recovery Portal
            </span>
          </div>

          <div className="hidden md:flex space-x-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                  currentPage === id
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-700">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                onNavigate(id);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 border-b border-slate-800 ${
                currentPage === id
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
