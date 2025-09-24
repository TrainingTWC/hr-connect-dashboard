import React, { useMemo } from 'react';
import { Submission, Question } from '../types';
import InfographicCard from './InfographicCard';

interface QuestionScoresProps {
  submissions: Submission[];
  questions: Question[];
}

const QuestionScoresInfographic: React.FC<QuestionScoresProps> = ({ submissions, questions }) => {
    const questionScores = useMemo(() => {
        const scorableQuestions = questions.filter(q => q.choices && q.choices.length > 0);
        
        if (submissions.length === 0) {
            return scorableQuestions.map(q => ({
                id: q.id,
                title: q.title,
                averageScore: 0,
            }));
        }

        const scores = scorableQuestions.map(q => {
            let totalScore = 0;
            const choiceMap = new Map(q.choices?.map(c => [c.label, c.score]));

            submissions.forEach(s => {
                const answer = (s as any)[q.id];
                const score = choiceMap.get(answer);
                if (typeof score === 'number') {
                    totalScore += score;
                }
            });

            return {
                id: q.id,
                title: q.title,
                averageScore: totalScore / submissions.length,
            };
        });
        
        return scores;

    }, [submissions, questions]);

    return (
        <InfographicCard title="Question Score Analysis">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {questionScores.map(item => (
                    <div key={item.id}>
                        <div className="grid grid-cols-[1fr_auto] items-start gap-x-2 mb-1.5">
                            <p className="text-sm text-gray-700 dark:text-slate-300 truncate" title={item.title}>
                                {item.title}
                            </p>
                            <div className="flex flex-col items-end leading-tight">
                                <span className="font-semibold text-sky-600 dark:text-sky-300">{item.averageScore.toFixed(1)}</span>
                                <span className="text-xs text-gray-600 dark:text-slate-400">/ 5</span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-300 dark:bg-slate-600 rounded-full h-2">
                            <div 
                                className={`${item.averageScore < 3.0 ? 'bg-amber-500' : 'bg-yellow-400'} h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${(item.averageScore / 5) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </InfographicCard>
    );
};

export default QuestionScoresInfographic;