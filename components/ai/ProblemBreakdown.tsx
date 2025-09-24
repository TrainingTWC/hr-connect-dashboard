import React from 'react';

interface ProblemBreakdownProps {
  problems: Array<{
    category: string;
    count: number;
    percentage: number;
    color: string;
  }>;
}

const ProblemBreakdown: React.FC<ProblemBreakdownProps> = ({ problems }) => {
  // Mock data if empty
  const mockProblems = problems.length > 0 ? problems : [
    { category: 'Work Pressure', count: 15, percentage: 35, color: '#ef4444' },
    { category: 'System Issues', count: 12, percentage: 28, color: '#f97316' },
    { category: 'Training Gaps', count: 10, percentage: 23, color: '#eab308' },
    { category: 'Feedback', count: 6, percentage: 14, color: '#22c55e' }
  ];

  const total = mockProblems.reduce((sum, p) => sum + p.count, 0);

  // Calculate angles for donut chart
  let currentAngle = 0;
  const segments = mockProblems.map((problem) => {
    const angle = (problem.count / total) * 360;
    const segment = {
      ...problem,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      angle
    };
    currentAngle += angle;
    return segment;
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          🔍 Problem Breakdown
        </h3>
        <span className="text-xs text-gray-500 dark:text-slate-400">
          {total} total issues
        </span>
      </div>

      <div className="flex items-center space-x-6">
        {/* Donut Chart */}
        <div className="relative">
          <svg width="120" height="120" className="transform -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="currentColor"
              strokeWidth="20"
              className="text-gray-200 dark:text-slate-700"
            />
            {segments.map((segment, index) => {
              const circumference = 2 * Math.PI * 50;
              const strokeDasharray = `${(segment.angle / 360) * circumference} ${circumference}`;
              const strokeDashoffset = -((segment.startAngle / 360) * circumference);
              
              return (
                <circle
                  key={index}
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 hover:stroke-width-[22]"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{total}</div>
              <div className="text-xs text-gray-500 dark:text-slate-500">Issues</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {mockProblems.map((problem, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: problem.color }}
                ></div>
                <span className="text-sm text-gray-700 dark:text-slate-300">
                  {problem.category}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  {problem.count}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-500">
                  {problem.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-slate-400">
          <strong>Most Critical:</strong> {mockProblems[0]?.category} accounts for {mockProblems[0]?.percentage}% of all identified issues.
        </p>
      </div>
    </div>
  );
};

export default ProblemBreakdown;