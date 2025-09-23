import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface InfographicCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const InfographicCard: React.FC<InfographicCardProps> = ({ title, children, className = '' }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`${
      theme === 'dark' 
        ? 'bg-slate-800/50 border-slate-700' 
        : 'bg-white/70 border-gray-200'
    } backdrop-blur-sm p-5 rounded-xl shadow-lg border h-full flex flex-col ${className}`}>
      <h3 className={`text-lg font-semibold mb-4 flex-shrink-0 ${
        theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
      }`}>{title}</h3>
      <div className="flex-1">
          {children}
      </div>
    </div>
  );
};

export default InfographicCard;