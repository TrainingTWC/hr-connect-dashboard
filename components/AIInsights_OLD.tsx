import React, { useState, useEffect, useMemo } from 'react';
import { Submission } from '../types';
import { fetchSubmissions } from '../services/dataService';
import { UserRole } from '../roleMapping';
import Loader from './Loader';
import InfographicCard from './InfographicCard';

interface AIInsightsProps {
  userRole: UserRole | null;
}

interface AIQuestion {
  id: string;
  question: string;
  insight: string;
  priority: 'high' | 'medium' | 'low';
  category: 'operational' | 'hr' | 'training' | 'satisfaction' | 'collaboration';
  suggestedActions: string[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ userRole }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const data = await fetchSubmissions();
        setSubmissions(data);
      } catch (err) {
        console.error('Error fetching submissions for AI Insights:', err);
        setError('Failed to load data for AI analysis');
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  // AI-generated insights based on survey data
  const aiInsights = useMemo(() => {
    if (submissions.length === 0) return [];

    const insights: AIQuestion[] = [];

    // Analyze work pressure patterns
    const workPressureResponses = submissions.map(s => (s as any).q1).filter(Boolean);
    const highPressureCount = workPressureResponses.filter(r => 
      r === 'Every time' || r === 'Most of the time'
    ).length;
    const pressurePercentage = Math.round((highPressureCount / workPressureResponses.length) * 100);

    if (pressurePercentage > 60) {
      insights.push({
        id: 'pressure_analysis',
        question: `${pressurePercentage}% of employees report frequent work pressure. Which specific peak hours or situations create the most stress?`,
        insight: `High work pressure detected across ${pressurePercentage}% of responses. This indicates systemic workload management issues.`,
        priority: 'high',
        category: 'operational',
        suggestedActions: [
          'Conduct time-motion study during peak hours',
          'Implement staff rotation during busy periods',
          'Review current staffing levels vs customer demand',
          'Introduce stress management training for employees'
        ]
      });
    }

    // Analyze empowerment levels
    const empowermentResponses = submissions.map(s => (s as any).q2).filter(Boolean);
    const lowEmpowermentCount = empowermentResponses.filter(r => 
      r === 'Never' || r === 'At Time'
    ).length;
    const empowermentIssuePercentage = Math.round((lowEmpowermentCount / empowermentResponses.length) * 100);

    if (empowermentIssuePercentage > 40) {
      insights.push({
        id: 'empowerment_analysis',
        question: `${empowermentIssuePercentage}% of staff feel they cannot make spot decisions. What specific customer scenarios require manager approval that could be delegated?`,
        insight: `Decision-making bottlenecks are limiting customer service quality and employee confidence.`,
        priority: 'high',
        category: 'operational',
        suggestedActions: [
          'Create clear decision-making authority matrix',
          'Empower staff with specific dollar limits for customer service',
          'Develop quick-reference guides for common customer issues',
          'Train managers on effective delegation techniques'
        ]
      });
    }

    // Analyze feedback frequency
    const feedbackResponses = submissions.map(s => (s as any).q3).filter(Boolean);
    const noFeedbackCount = feedbackResponses.filter(r => 
      r === 'Never' || r === 'At Time'
    ).length;
    const feedbackGapPercentage = Math.round((noFeedbackCount / feedbackResponses.length) * 100);

    if (feedbackGapPercentage > 50) {
      insights.push({
        id: 'feedback_analysis',
        question: `${feedbackGapPercentage}% of employees receive infrequent feedback. Are managers conducting monthly one-on-ones, and what prevents regular feedback sessions?`,
        insight: `Significant feedback gaps may be hindering employee development and engagement.`,
        priority: 'medium',
        category: 'hr',
        suggestedActions: [
          'Implement mandatory monthly one-on-one meetings',
          'Train managers on effective feedback delivery',
          'Create structured feedback templates',
          'Set up feedback tracking system for accountability'
        ]
      });
    }

    // Analyze training gaps
    const trainingResponses = submissions.map(s => (s as any).q5).filter(Boolean);
    const inadequateTrainingCount = trainingResponses.filter(r => 
      r === 'Never' || r === 'At Time' || r === 'Sometime'
    ).length;
    const trainingGapPercentage = Math.round((inadequateTrainingCount / trainingResponses.length) * 100);

    if (trainingGapPercentage > 45) {
      insights.push({
        id: 'training_analysis',
        question: `${trainingGapPercentage}% report inadequate Wings program training. Which specific modules are being skipped, and what's preventing completion?`,
        insight: `Training inconsistencies may be impacting service quality and employee confidence.`,
        priority: 'high',
        category: 'training',
        suggestedActions: [
          'Audit current Wings program completion rates by store',
          'Identify training bottlenecks and resource constraints',
          'Create mobile-friendly micro-learning modules',
          'Implement peer-to-peer training buddy system'
        ]
      });
    }

    // Analyze system issues
    const systemIssuesResponses = submissions.map(s => (s as any).q6).filter(Boolean);
    const frequentIssuesCount = systemIssuesResponses.filter(r => 
      r === 'Every time' || r === 'Most of the time'
    ).length;
    const systemIssuePercentage = Math.round((frequentIssuesCount / systemIssuesResponses.length) * 100);

    if (systemIssuePercentage > 30) {
      insights.push({
        id: 'system_analysis',
        question: `${systemIssuePercentage}% face frequent system issues. Which specific apps (Zing/Jify/Meal Benefit) have the most problems, and during what times?`,
        insight: `System reliability issues are affecting operational efficiency and employee satisfaction.`,
        priority: 'high',
        category: 'operational',
        suggestedActions: [
          'Conduct detailed system performance audit',
          'Identify peak usage times causing system overload',
          'Create offline backup procedures for critical operations',
          'Establish direct IT support channel for stores'
        ]
      });
    }

    // Analyze collaboration effectiveness
    const collaborationResponses = submissions.map(s => (s as any).q9).filter(Boolean);
    const poorCollaborationCount = collaborationResponses.filter(r => 
      r === 'Poor' || r === 'Average'
    ).length;
    const collaborationIssuePercentage = Math.round((poorCollaborationCount / collaborationResponses.length) * 100);

    if (collaborationIssuePercentage > 35) {
      insights.push({
        id: 'collaboration_analysis',
        question: `${collaborationIssuePercentage}% report poor team collaboration. What specific communication gaps or role conflicts are causing friction?`,
        insight: `Team dynamics issues may be affecting productivity and workplace atmosphere.`,
        priority: 'medium',
        category: 'collaboration',
        suggestedActions: [
          'Conduct team dynamic assessment workshops',
          'Implement clear role and responsibility matrices',
          'Create cross-functional team building activities',
          'Establish regular team communication protocols'
        ]
      });
    }

    // Sort by priority
    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [submissions]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'operational': return '⚙️';
      case 'hr': return '👥';
      case 'training': return '📚';
      case 'satisfaction': return '😊';
      case 'collaboration': return '🤝';
      default: return '💡';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 p-8">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">
          🤖 AI Insights
        </h1>
        <p className="text-lg text-gray-600 dark:text-slate-400">
          AI-powered analysis of survey responses with targeted questions and actionable recommendations
        </p>
        <div className="mt-4 text-sm text-gray-500 dark:text-slate-500">
          Based on {submissions.length} survey responses
        </div>
      </div>

      {aiInsights.length === 0 ? (
        <InfographicCard title="No Critical Issues Detected">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-lg text-gray-600 dark:text-slate-400">
              AI analysis shows no major concerns in current survey responses.
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-500 mt-2">
              Continue monitoring for emerging patterns.
            </p>
          </div>
        </InfographicCard>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {aiInsights.map((insight, index) => (
            <InfographicCard key={insight.id} title={`AI Insight #${index + 1}`}>
              <div className="space-y-4">
                {/* Header with priority and category */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(insight.category)}</span>
                    <span className="capitalize font-medium text-gray-700 dark:text-slate-300">
                      {insight.category}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                    {insight.priority.toUpperCase()} PRIORITY
                  </span>
                </div>

                {/* AI-generated question */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-400">
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">
                    🎯 Targeted Question:
                  </h3>
                  <p className="text-gray-700 dark:text-slate-300">
                    {insight.question}
                  </p>
                </div>

                {/* AI insight */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">
                    🧠 AI Analysis:
                  </h3>
                  <p className="text-gray-700 dark:text-slate-300">
                    {insight.insight}
                  </p>
                </div>

                {/* Suggested actions */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">
                    ⚡ Recommended Actions:
                  </h3>
                  <ul className="space-y-2">
                    {insight.suggestedActions.map((action, actionIndex) => (
                      <li key={actionIndex} className="flex items-start gap-2">
                        <span className="text-green-500 text-sm mt-0.5">•</span>
                        <span className="text-gray-700 dark:text-slate-300 text-sm">
                          {action}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </InfographicCard>
          ))}
        </div>
      )}

      {/* Summary statistics */}
      <InfographicCard title="AI Analysis Summary">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {aiInsights.filter(i => i.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-400">High Priority Issues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {aiInsights.filter(i => i.priority === 'medium').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-400">Medium Priority Issues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {aiInsights.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-400">Total AI Insights</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {submissions.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-400">Responses Analyzed</div>
          </div>
        </div>
      </InfographicCard>
    </div>
  );
};

export default AIInsights;