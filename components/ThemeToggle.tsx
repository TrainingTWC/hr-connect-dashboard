import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import lightIconUrl from '@/assets/light mode.svg';
import darkIconUrl from '@/assets/dark mode.svg';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const handleClick = () => {
    toggleTheme();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 shadow-lg hover:shadow-xl flex items-center justify-center"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <img
        src={theme === 'dark' ? darkIconUrl : lightIconUrl}
        alt=""
        aria-hidden="true"
        className="w-6 h-6 transition-opacity duration-200"
      />
    </button>
  );
};

export default ThemeToggle;