
import React from 'react';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
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
        <div className="flex-shrink-0">
          <ThemeToggle />
        </div>
      </div>
      <p className="mt-1 text-gray-500 dark:text-slate-400 text-sm">Employee data, insights, and task management.</p>
    </header>
  );
};

export default Header;
