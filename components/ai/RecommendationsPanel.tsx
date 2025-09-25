import React from 'react';

interface RecommendationsPanelProps {
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    timeframe: string;
    category: string;
  }>;
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ recommendations = [] }) => {
  const safeRecommendations = Array.isArray(recommendations) ? recommendations : [];
  
  // Mock data if empty
  const mockRecommendations = safeRecommendations.length > 0 ? safeRecommendations : [
    {
      id: '1',
      title: 'Implement Daily Stand-ups',
      description: 'Introduce brief daily team meetings to improve communication and reduce work pressure',
      impact: 'high' as const,
      effort: 'low' as const,
      timeframe: '1 week',
      category: 'operational'
    },
    {
      id: '2',
      title: 'Manager Feedback Training',
      description: 'Train all managers on structured feedback delivery and regular check-in protocols',
      impact: 'high' as const,
      effort: 'medium' as const,
      timeframe: '3 weeks',
      category: 'hr'
    },
    {
      id: '3',
      title: 'System Reliability Audit',
      description: 'Conduct comprehensive audit of Zing, Jify, and Meal Benefit apps to identify failure points',
      impact: 'medium' as const,
      effort: 'high' as const,
      timeframe: '2 months',
      category: 'operational'
    },
    {
      id: '4',
      title: 'Peer Learning Program',
      description: 'Create buddy system for new employees to accelerate training completion',
      impact: 'medium' as const,
      effort: 'low' as const,
      timeframe: '2 weeks',
      category: 'training'
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/20';
      case 'low': return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/20';
      default: return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/20';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/20';
      case 'high': return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/20';
      default: return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'operational': return '⚙️';
      case 'hr': return '👥';
      case 'training': return '📚';
      case 'satisfaction': return '😊';
      default: return '💡';
    }
  };

  const getPriorityScore = (rec: any) => {
    const impactScore = { high: 3, medium: 2, low: 1 };
    const effortScore = { low: 3, medium: 2, high: 1 }; // Lower effort = higher score
    return impactScore[rec.impact] + effortScore[rec.effort];
  };

  const sortedRecommendations = [...mockRecommendations].sort((a, b) => getPriorityScore(b) - getPriorityScore(a));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">
          💡 AI Recommendations
        </h3>
        <span className="text-sm text-gray-500 dark:text-slate-400">
          Prioritized by impact vs effort
        </span>
      </div>

      <div className="space-y-4">
        {sortedRecommendations.map((rec, index) => (
          <div
            key={rec.id}
            className="group relative bg-gradient-to-r from-gray-50 to-white dark:from-slate-700 dark:to-slate-600 rounded-lg p-4 border border-gray-200 dark:border-slate-600 hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            {/* Priority badge */}
            <div className="absolute top-3 right-3">
              <div className="flex items-center space-x-1">
                {index === 0 && <span className="text-xs font-bold text-yellow-600">🏆 TOP</span>}
                <span className="text-2xl">{getCategoryIcon(rec.category)}</span>
              </div>
            </div>

            <div className="pr-16">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {rec.title}
              </h4>
              
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                {rec.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(rec.impact)}`}>
                    {rec.impact.toUpperCase()} IMPACT
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEffortColor(rec.effort)}`}>
                    {rec.effort.toUpperCase()} EFFORT
                  </span>
                </div>
                
                <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-slate-500">
                  <span className="flex items-center space-x-1">
                    <span>⏱️</span>
                    <span>{rec.timeframe}</span>
                  </span>
                  <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                    Implement →
                  </button>
                </div>
              </div>
            </div>
            
            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Impact vs Effort Matrix */}
      <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-2">
          📊 Quick Wins Matrix
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded text-center">
            <div className="font-medium text-green-800 dark:text-green-300">High Impact, Low Effort</div>
            <div className="text-green-600 dark:text-green-400">
              {sortedRecommendations.filter(r => r.impact === 'high' && r.effort === 'low').length} items
            </div>
          </div>
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-center">
            <div className="font-medium text-yellow-800 dark:text-yellow-300">High Impact, High Effort</div>
            <div className="text-yellow-600 dark:text-yellow-400">
              {sortedRecommendations.filter(r => r.impact === 'high' && r.effort === 'high').length} items
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPanel;