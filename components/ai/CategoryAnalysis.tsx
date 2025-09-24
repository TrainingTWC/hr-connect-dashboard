import React from 'react';

interface CategoryAnalysisProps {
  categories: Array<{
    name: string;
    score: number;
    maxScore: number;
    trend: 'up' | 'down' | 'stable';
    issues: number;
  }>;
}

const CategoryAnalysis: React.FC<CategoryAnalysisProps> = ({ categories }) => {
  // Mock data if empty
  const mockCategories = categories.length > 0 ? categories : [
    { name: 'Operational', score: 65, maxScore: 100, trend: 'down' as const, issues: 8 },
    { name: 'HR Process', score: 78, maxScore: 100, trend: 'up' as const, issues: 3 },
    { name: 'Training', score: 45, maxScore: 100, trend: 'down' as const, issues: 12 },
    { name: 'Satisfaction', score: 82, maxScore: 100, trend: 'stable' as const, issues: 2 },
    { name: 'Collaboration', score: 71, maxScore: 100, trend: 'up' as const, issues: 5 }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600 dark:text-green-400';
      case 'down': return 'text-red-600 dark:text-red-400';
      case 'stable': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          📈 Category Analysis
        </h3>
        <span className="text-xs text-gray-500 dark:text-slate-400">
          Performance by area
        </span>
      </div>

      <div className="space-y-4">
        {mockCategories.map((category, index) => {
          const percentage = Math.round((category.score / category.maxScore) * 100);
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {category.name}
                  </span>
                  <span className={`text-sm ${getTrendColor(category.trend)}`}>
                    {getTrendIcon(category.trend)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-slate-400">
                    {category.score}/{category.maxScore}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-500">
                    ({category.issues} issues)
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${getScoreColor(percentage)} transition-all duration-500 relative overflow-hidden`}
                    style={{ width: `${percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                  </div>
                </div>
                <span className="absolute right-2 top-0 text-xs font-medium text-white mix-blend-difference">
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Best/Worst performers */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <div className="text-xs font-medium text-green-800 dark:text-green-300 mb-1">
            Best Performer
          </div>
          <div className="text-sm font-semibold text-green-900 dark:text-green-100">
            {mockCategories.reduce((best, cat) => cat.score > best.score ? cat : best).name}
          </div>
        </div>
        
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
          <div className="text-xs font-medium text-red-800 dark:text-red-300 mb-1">
            Needs Attention
          </div>
          <div className="text-sm font-semibold text-red-900 dark:text-red-100">
            {mockCategories.reduce((worst, cat) => cat.score < worst.score ? cat : worst).name}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryAnalysis;