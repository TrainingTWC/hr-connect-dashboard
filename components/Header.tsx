
import React from 'react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  return (
    <header className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center flex-wrap flex-1 min-w-0 pr-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-wide text-gray-800 dark:text-slate-200">
            Third Wave Coffee
          </h1>
          <span className="mx-2 sm:mx-3 text-xl sm:text-2xl lg:text-3xl font-black text-gray-400 dark:text-slate-500">|</span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-500 dark:text-sky-400">
            HR Connect
          </h2>
        </div>
        <div className="flex-shrink-0 flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
            title="Sign out"
          >
            <span className="text-lg">🚪</span>
            <span className="hidden sm:inline">Sign Out</span>
          </button>
          <ThemeToggle />
        </div>
      </div>
      <p className="mt-1 text-gray-500 dark:text-slate-400 text-sm">Employee data, insights, and task management.</p>
    </header>
  );
};

export default Header;
