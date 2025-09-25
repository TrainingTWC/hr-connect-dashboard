import React from 'react';

interface TrendAnalysisProps {
  data?: any[];
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ data = [] }) => {
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

  // Generate mock trends for visualization
  const generateMockTrends = () => {
    return [
      {
        category: 'Communication',
        trend: 'improving' as const,
        change: 12,
        insight: 'Feedback frequency has improved significantly'
      },
      {
        category: 'System Reliability',
        trend: 'declining' as const,
        change: -8,
        insight: 'Multiple system failures reported this quarter'
      },
      {
        category: 'Training Completion',
        trend: 'stable' as const,
        change: 2,
        insight: 'Consistent training performance across departments'
      },
      {
        category: 'Job Satisfaction',
        trend: 'improving' as const,
        change: 15,
        insight: 'Employee satisfaction trending upward'
      }
    ];
  };

  const trends = data.length > 0 ? generateMockTrends() : [];

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
        {trends.map((trend, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="text-xl">{getTrendIcon(trend.trend)}</div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  {trend.category}
                </h4>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${getTrendColor(trend.trend)}`}>
                  {trend.change > 0 ? '+' : ''}{trend.change}%
                </span>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-slate-400">
                {trend.insight}
              </p>
              
              {/* Progress bar */}
              <div className="mt-2 w-full bg-gray-200 dark:bg-slate-600 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-500 ${
                    trend.trend === 'improving' ? 'bg-green-500' :
                    trend.trend === 'declining' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}
                  style={{ width: `${Math.abs(trend.change) * 2}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-600">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm font-bold text-green-600 dark:text-green-400">
              {trends.filter(t => t.trend === 'improving').length}
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Improving</div>
          </div>
          <div>
            <div className="text-sm font-bold text-red-600 dark:text-red-400">
              {trends.filter(t => t.trend === 'declining').length}
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Declining</div>
          </div>
          <div>
            <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
              {trends.filter(t => t.trend === 'stable').length}
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Stable</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysis;