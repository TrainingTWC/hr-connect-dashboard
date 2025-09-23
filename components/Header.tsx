
import React from 'react';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  return (
    <header className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-wide text-gray-800 dark:text-slate-200">
            Third Wave Coffee
          </h1>
          <span className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-400 dark:text-slate-500">|</span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-500 dark:text-sky-400">
            HR Connect
          </h2>
        </div>
        <div className="self-start sm:self-auto">
          <ThemeToggle />
        </div>
      </div>
      <p className="mt-1 text-gray-500 dark:text-slate-400 text-sm">Employee data, insights, and task management.</p>
    </header>
  );
};

export default Header;
