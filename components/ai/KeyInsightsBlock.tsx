import React from 'react';

interface KeyInsightsBlockProps {
  insights: Array<{
    id: string;
    question: string;
    insight: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    percentage?: number;
  }>;
}

const KeyInsightsBlock: React.FC<KeyInsightsBlockProps> = ({ insights = [] }) => {
  const safeInsights = Array.isArray(insights) ? insights : [];
  const topInsights = safeInsights.slice(0, 3);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return '📝';
      default: return '💡';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-red-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      case 'low': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">
          ⭐ Key Insights
        </h3>
        <span className="text-sm text-gray-500 dark:text-slate-400">
          Top {topInsights.length} Critical Issues
        </span>
      </div>

      <div className="space-y-4">
        {topInsights.map((insight, index) => (
          <div
            key={insight.id}
            className="group relative overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-lg p-4 border border-gray-200 dark:border-slate-600 hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            {/* Priority stripe */}
            <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${getPriorityColor(insight.priority)}`}></div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="text-2xl">{getPriorityIcon(insight.priority)}</div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                    {insight.category}
                  </span>
                  {insight.percentage && (
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                      {insight.percentage}%
                    </span>
                  )}
                </div>
                
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-2 line-clamp-2">
                  {insight.insight}
                </p>
                
                <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2">
                  {insight.question}
                </p>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              </div>
            </div>
            
            {/* Ranking badge */}
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {index + 1}
              </div>
            </div>
          </div>
        ))}
      </div>

      {insights.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-gray-600 dark:text-slate-400">No critical issues detected</p>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">Everything looks good!</p>
        </div>
      )}
    </div>
  );
};

export default KeyInsightsBlock;