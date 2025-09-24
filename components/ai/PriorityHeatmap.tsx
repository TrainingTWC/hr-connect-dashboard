import React from 'react';

interface PriorityHeatmapProps {
  insights: Array<{
    category: string;
    priority: 'high' | 'medium' | 'low';
    count: number;
  }>;
}

const PriorityHeatmap: React.FC<PriorityHeatmapProps> = ({ insights }) => {
  const getPriorityColor = (priority: string, intensity: number) => {
    const opacity = Math.max(0.3, intensity / 10);
    switch (priority) {
      case 'high': return `rgba(239, 68, 68, ${opacity})`;
      case 'medium': return `rgba(245, 158, 11, ${opacity})`;
      case 'low': return `rgba(34, 197, 94, ${opacity})`;
      default: return `rgba(156, 163, 175, ${opacity})`;
    }
  };

  const categories = ['operational', 'hr', 'training', 'satisfaction', 'collaboration'];
  const priorities = ['high', 'medium', 'low'];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          🔥 Priority Heatmap
        </h3>
      </div>
      
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category} className="flex items-center space-x-2">
            <div className="w-20 text-xs font-medium text-gray-600 dark:text-slate-400 capitalize">
              {category}
            </div>
            <div className="flex space-x-1 flex-1">
              {priorities.map((priority) => {
                const insight = insights.find(i => i.category === category && i.priority === priority);
                const count = insight?.count || 0;
                return (
                  <div
                    key={`${category}-${priority}`}
                    className="flex-1 h-8 rounded-md border border-gray-200 dark:border-slate-600 flex items-center justify-center text-xs font-medium transition-all hover:scale-105 cursor-pointer"
                    style={{ backgroundColor: getPriorityColor(priority, count) }}
                    title={`${category} - ${priority} priority: ${count} issues`}
                  >
                    {count > 0 && count}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-red-500 opacity-70"></div>
              <span>High</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-yellow-500 opacity-70"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-green-500 opacity-70"></div>
              <span>Low</span>
            </div>
          </div>
          <span>Intensity: Darker = More Issues</span>
        </div>
      </div>
    </div>
  );
};

export default PriorityHeatmap;