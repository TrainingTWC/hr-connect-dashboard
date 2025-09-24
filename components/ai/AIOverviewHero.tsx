import React from 'react';

interface AIOverviewHeroProps {
  totalInsights: number;
  highPriority: number;
  mediumPriority: number;
  responsesAnalyzed: number;
  isAnalyzing: boolean;
}

const AIOverviewHero: React.FC<AIOverviewHeroProps> = ({
  totalInsights,
  highPriority,
  mediumPriority,
  responsesAnalyzed,
  isAnalyzing
}) => {
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
            {isAnalyzing && (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span className="text-blue-100">Analyzing...</span>
              </>
            )}
            {!isAnalyzing && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-200">Analysis Complete</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-3xl font-bold text-white">{totalInsights}</div>
            <div className="text-blue-100 text-sm">Total Insights</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-3xl font-bold text-red-300">{highPriority}</div>
            <div className="text-blue-100 text-sm">High Priority</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-3xl font-bold text-yellow-300">{mediumPriority}</div>
            <div className="text-blue-100 text-sm">Medium Priority</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-3xl font-bold text-white">{responsesAnalyzed}</div>
            <div className="text-blue-100 text-sm">Responses</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIOverviewHero;