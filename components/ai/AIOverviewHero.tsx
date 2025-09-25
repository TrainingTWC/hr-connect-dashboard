import React from 'react';

interface AIOverviewHeroProps {
  data?: {
    totalResponses: number;
    avgSatisfaction: number;
    criticalIssues: number;
    improvementAreas: number;
  };
}

const AIOverviewHero: React.FC<AIOverviewHeroProps> = ({ data }) => {
  const safeData = data || {
    totalResponses: 0,
    avgSatisfaction: 0,
    criticalIssues: 0,
    improvementAreas: 0
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white shadow-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-full -translate-x-12 -translate-y-12"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">🤖 AI Insights</h1>
            <p className="text-blue-100 text-lg">Intelligent analysis of your HR data</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-200">Analysis Complete</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-3xl font-bold text-white">{safeData.totalResponses}</div>
            <div className="text-blue-100 text-sm">Total Responses</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-3xl font-bold text-red-300">{safeData.criticalIssues}</div>
            <div className="text-blue-100 text-sm">Critical Issues</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-3xl font-bold text-yellow-300">{safeData.improvementAreas}</div>
            <div className="text-blue-100 text-sm">Improvement Areas</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-3xl font-bold text-white">{Math.round(safeData.avgSatisfaction)}%</div>
            <div className="text-blue-100 text-sm">Avg Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIOverviewHero;