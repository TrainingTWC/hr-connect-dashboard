import React from 'react';

interface TrendAnalysisProps {
  trends: Array<{
    category: string;
    trend: 'improving' | 'declining' | 'stable';
    change: number;
    insight: string;
  }>;
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ trends }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'declining': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'stable': return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
    }
  };

  // Mock trend data if empty
  const mockTrends = trends.length > 0 ? trends : [
    { category: 'Work Pressure', trend: 'declining' as const, change: -15, insight: 'Pressure levels decreasing over time' },
    { category: 'Training', trend: 'improving' as const, change: 23, insight: 'Training completion rates improving' },
    { category: 'Satisfaction', trend: 'stable' as const, change: 2, insight: 'Satisfaction levels remain consistent' }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          📊 Trend Analysis
        </h3>
        <span className="text-xs text-gray-500 dark:text-slate-400">
          Last 30 days
        </span>
      </div>

      <div className="space-y-4">
        {mockTrends.map((trend, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="text-xl">{getTrendIcon(trend.trend)}</div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  {trend.category}
                </span>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(trend.trend)}`}>
                  {trend.change > 0 ? '+' : ''}{trend.change}%
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-slate-400">
                {trend.insight}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Prediction Box */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-lg">🔮</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
            AI Prediction
          </span>
        </div>
        <p className="text-xs text-gray-700 dark:text-slate-300">
          Based on current trends, expect 12% improvement in overall satisfaction scores within the next quarter.
        </p>
      </div>
    </div>
  );
};

export default TrendAnalysis;